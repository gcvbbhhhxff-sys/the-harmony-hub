"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateCreateOrderInput } from "@/domains/order/validation";
import type { AddressInput, CreateOrderInput, DraftOrderItem } from "@/domains/order/types";

export type { AddressInput, CreateOrderInput, DraftOrderItem } from "@/domains/order/types";

type OptionRow = {
  id: string;
  nome: string;
  preco_extra: number;
  group_id: string;
  option_groups: { product_id: string } | { product_id: string }[] | null;
};

type AddonRow = {
  id: string;
  nome: string;
  preco: number;
  ativo: boolean;
};

type ValidatedItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
  options: OptionRow[];
  addons: AddonRow[];
  observation: string;
};

async function rollbackOrder(orderId: string) {
  try {
    const adminDb = createAdminClient();
    await adminDb.from("order_status_history").delete().eq("order_id", orderId);
    await adminDb.from("order_items").delete().eq("order_id", orderId);
    await adminDb.from("orders").delete().eq("id", orderId);
  } catch (error) {
    console.error("[rollbackOrder]", error);
  }
}

async function cleanupCreatedCustomer(customerId: string, created: boolean) {
  if (!created) return;
  try {
    const adminDb = createAdminClient();
    await adminDb.from("addresses").delete().eq("customer_id", customerId);
    await adminDb.from("customers").delete().eq("id", customerId);
  } catch (error) {
    console.error("[cleanupCreatedCustomer]", error);
  }
}

async function cleanupCreatedAddress(db: Awaited<ReturnType<typeof createClient>>, addressId: string | undefined, created: boolean) {
  if (!addressId || !created) return;
  try {
    const { error } = await db.from("addresses").delete().eq("id", addressId);
    if (error) {
      const adminDb = createAdminClient();
      await adminDb.from("addresses").delete().eq("id", addressId);
    }
  } catch (error) {
    console.error("[cleanupCreatedAddress]", error);
  }
}

export async function createOrder(input: CreateOrderInput) {
  const validationError = validateCreateOrderInput(input);
  if (validationError) return { ok: false as const, message: validationError };

  try {
    const db = await createClient();
    const { data: authData, error: authError } = await db.auth.getUser();
    const user = authData.user;

    if (authError || !user) return { ok: false as const, message: "Sua sessão expirou. Entre novamente." };

    const { data: settings, error: settingsError } = await db
      .from("restaurant_settings")
      .select("valor_minimo_pedido,taxa_base_entrega")
      .limit(1)
      .maybeSingle();

    if (settingsError) {
      console.error("[createOrder/settings]", settingsError);
      return { ok: false as const, message: "Não foi possível carregar as configurações do restaurante." };
    }

    const minimum = Number(settings?.valor_minimo_pedido ?? 0);
    const baseDelivery = Number(settings?.taxa_base_entrega ?? 0);
    let subtotal = 0;
    const validated: ValidatedItem[] = [];

    for (const item of input.items as DraftOrderItem[]) {
      const { data: product, error: productError } = await db
        .from("products")
        .select("id,preco,ativo")
        .eq("id", item.productId)
        .eq("ativo", true)
        .maybeSingle();

      if (productError || !product) return { ok: false as const, message: "Um produto não está mais disponível." };

      const optionResult = item.optionIds.length
        ? await db
            .from("options")
            .select("id,nome,preco_extra,group_id,option_groups!inner(product_id)")
            .eq("ativo", true)
            .in("id", item.optionIds)
        : { data: [] as OptionRow[], error: null };

      const options = (optionResult.data ?? []) as OptionRow[];
      if (
        optionResult.error ||
        options.length !== item.optionIds.length ||
        options.some((option) => {
          const group = Array.isArray(option.option_groups) ? option.option_groups[0] : option.option_groups;
          return !group || group.product_id !== product.id;
        })
      ) {
        return { ok: false as const, message: "Opção inválida." };
      }

      const { data: groups, error: groupsError } = await db
        .from("option_groups")
        .select("id,min_select,max_select")
        .eq("product_id", product.id);

      if (groupsError) return { ok: false as const, message: "Não foi possível validar as opções do produto." };

      for (const group of groups ?? []) {
        const count = options.filter((option) => option.group_id === group.id).length;
        if (count < group.min_select || count > group.max_select) return { ok: false as const, message: "Seleção de opções inválida." };
      }

      const addonResult = item.addonIds.length
        ? await db
            .from("addons")
            .select("id,nome,preco,ativo")
            .in("id", item.addonIds)
            .eq("ativo", true)
        : { data: [] as AddonRow[], error: null };

      const addons = (addonResult.data ?? []) as AddonRow[];
      if (addonResult.error || addons.length !== item.addonIds.length) return { ok: false as const, message: "Adicional inválido." };

      if (item.addonIds.length) {
        const { data: links, error: linksError } = await db
          .from("product_addons")
          .select("addon_id")
          .eq("product_id", product.id)
          .in("addon_id", item.addonIds);

        if (linksError || (links ?? []).length !== item.addonIds.length) return { ok: false as const, message: "Um adicional não se aplica a este produto." };
      }

      const unitPrice =
        Number(product.preco) +
        options.reduce((sum, option) => sum + Number(option.preco_extra), 0) +
        addons.reduce((sum, addon) => sum + Number(addon.preco), 0);

      subtotal += unitPrice * item.quantity;
      validated.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        options,
        addons,
        observation: item.observation || "",
      });
    }

    if (subtotal < minimum) {
      return { ok: false as const, message: `O pedido mínimo é R$ ${minimum.toFixed(2).replace(".", ",")}.` };
    }

    let desconto = 0;
    let couponId: string | null = null;
    let adminDb: ReturnType<typeof createAdminClient> | null = null;

    if (input.couponCode) {
      adminDb = createAdminClient();
      const { data, error: couponError } = await adminDb.rpc("validar_cupom", {
        codigo: input.couponCode.trim(),
        valor_pedido: subtotal,
      });

      if (couponError) {
        console.error("[createOrder/coupon-validation]", couponError);
        return { ok: false as const, message: "Não foi possível validar o cupom." };
      }

      const row = Array.isArray(data) ? data[0] : data;
      if (!row?.valido) return { ok: false as const, message: "Cupom inválido ou indisponível." };

      desconto = Number(row.desconto);
      const { data: coupon, error: couponLookupError } = await adminDb
        .from("coupons")
        .select("id")
        .ilike("codigo", input.couponCode.trim())
        .maybeSingle();

      if (couponLookupError) {
        console.error("[createOrder/coupon-lookup]", couponLookupError);
        return { ok: false as const, message: "Não foi possível confirmar o cupom." };
      }

      couponId = coupon?.id ?? null;
    }

    const customerResult = await db.from("customers").select("id").eq("user_id", user.id).maybeSingle();
    if (customerResult.error) {
      console.error("[createOrder/customer-lookup]", customerResult.error);
      return { ok: false as const, message: "Não foi possível carregar seu cadastro." };
    }

    let customerId = customerResult.data?.id;
    let createdCustomer = false;
    const phone = String(user.phone ?? "").slice(0, 30);

    if (!customerId) {
      const created = await db
        .from("customers")
        .insert({
          user_id: user.id,
          nome: input.customer.nome.trim(),
          telefone: phone,
          email: input.customer.email.trim(),
        })
        .select("id")
        .single();

      if (created.error || !created.data) {
        console.error("[createOrder/customer-create]", created.error);
        return { ok: false as const, message: "Não foi possível criar seu cadastro." };
      }

      customerId = created.data.id;
      createdCustomer = true;
    } else {
      const { error } = await db
        .from("customers")
        .update({
          nome: input.customer.nome.trim(),
          email: input.customer.email.trim(),
          telefone: phone,
        })
        .eq("id", customerId);

      if (error) {
        console.error("[createOrder/customer-update]", error);
        return { ok: false as const, message: "Não foi possível atualizar seu cadastro." };
      }
    }

    let addressId: string | undefined;
    let addressData: AddressInput;
    let createdAddress = false;

    if (input.addressId) {
      const { data, error } = await db
        .from("addresses")
        .select("id,rua,numero,complemento,bairro,cidade,cep,referencia,rotulo")
        .eq("id", input.addressId)
        .eq("customer_id", customerId)
        .maybeSingle();

      if (error || !data) {
        await cleanupCreatedCustomer(customerId, createdCustomer);
        return { ok: false as const, message: "Endereço inválido." };
      }

      addressId = data.id;
      addressData = data;
    } else if (input.address) {
      const { data, error } = await db
        .from("addresses")
        .insert({ customer_id: customerId, ...input.address, padrao: false })
        .select("id,rua,numero,complemento,bairro,cidade,cep,referencia,rotulo")
        .single();

      if (error || !data) {
        await cleanupCreatedCustomer(customerId, createdCustomer);
        return { ok: false as const, message: "Não foi possível salvar o endereço." };
      }

      addressId = data.id;
      addressData = data;
      createdAddress = true;
    } else {
      await cleanupCreatedCustomer(customerId, createdCustomer);
      return { ok: false as const, message: "Informe um endereço." };
    }

    const { data: zones, error: zonesError } = await db
      .from("delivery_zones")
      .select("taxa")
      .eq("ativo", true)
      .ilike("nome", addressData.bairro)
      .limit(1);

    if (zonesError) {
      await cleanupCreatedAddress(db, addressId, createdAddress);
      await cleanupCreatedCustomer(customerId, createdCustomer);
      return { ok: false as const, message: "Não foi possível calcular a entrega." };
    }

    const hasActiveZonesResult = await db.from("delivery_zones").select("id", { count: "exact", head: true }).eq("ativo", true);
    const hasActiveZones = hasActiveZonesResult.count ?? 0;
    const matchedZone = zones?.[0];

    if (!matchedZone && hasActiveZones > 0) {
      await cleanupCreatedAddress(db, addressId, createdAddress);
      await cleanupCreatedCustomer(customerId, createdCustomer);
      return { ok: false as const, message: "Fora da área de entrega no momento." };
    }

    const deliveryFee = matchedZone ? Number(matchedZone.taxa) : baseDelivery;
    const total = Math.max(0, subtotal + deliveryFee - desconto);

    const { data: order, error: orderError } = await db
      .from("orders")
      .insert({
        customer_id: customerId,
        address_id: addressId,
        subtotal,
        taxa_entrega: deliveryFee,
        desconto,
        total,
        forma_pagamento: input.formaPagamento,
        status_pagamento: input.formaPagamento === "na_entrega" ? "confirmado" : "pendente",
        coupon_id: couponId,
        observacoes: input.observacoes?.trim() || null,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("[createOrder/order-create]", orderError);
      await cleanupCreatedAddress(db, addressId, createdAddress);
      await cleanupCreatedCustomer(customerId, createdCustomer);
      return { ok: false as const, message: "Não foi possível criar o pedido." };
    }

    const { error: itemError } = await db.from("order_items").insert(
      validated.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        quantidade: item.quantity,
        preco_unitario: item.unitPrice,
        opcoes_selecionadas: item.options,
        adicionais_selecionados: item.addons,
        observacao_item: item.observation,
      }))
    );

    if (itemError) {
      console.error("[createOrder/item-create]", itemError);
      await rollbackOrder(order.id);
      await cleanupCreatedAddress(db, addressId, createdAddress);
      await cleanupCreatedCustomer(customerId, createdCustomer);
      return { ok: false as const, message: "Não foi possível gravar os itens do pedido." };
    }

    const { error: historyError } = await db.from("order_status_history").insert({ order_id: order.id, status: "recebido" });
    if (historyError) {
      console.error("[createOrder/history-create]", historyError);
      await rollbackOrder(order.id);
      await cleanupCreatedAddress(db, addressId, createdAddress);
      await cleanupCreatedCustomer(customerId, createdCustomer);
      return { ok: false as const, message: "Não foi possível registrar o histórico do pedido." };
    }

    if (input.couponCode && adminDb) {
      const { data: consumed, error: consumeError } = await adminDb.rpc("consumir_cupom", {
        codigo: input.couponCode.trim(),
        valor_pedido: subtotal,
      });

      if (consumeError || consumed !== true) {
        console.error("[createOrder/coupon-consume]", consumeError);
        await rollbackOrder(order.id);
        await cleanupCreatedAddress(db, addressId, createdAddress);
        await cleanupCreatedCustomer(customerId, createdCustomer);
        return { ok: false as const, message: "O cupom não pôde ser confirmado." };
      }
    }

    return { ok: true as const, orderId: order.id, total };
  } catch (error) {
    console.error("[createOrder]", error);
    return { ok: false as const, message: "Não foi possível concluir o pedido. Tente novamente." };
  }
}
