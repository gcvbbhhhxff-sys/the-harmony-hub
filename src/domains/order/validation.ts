import type { CreateOrderInput } from "@/domains/order/types";

const MAX_ITEMS = 50;
const MAX_OPTION_IDS = 20;
const MAX_ADDON_IDS = 20;
const MAX_TEXT = 1000;
const MAX_ITEM_OBSERVATION = 500;
const MAX_COUPON = 64;

function isString(value: unknown, max = MAX_TEXT): value is string {
  return typeof value === "string" && value.length <= max;
}

function isStringArray(value: unknown, maxLength: number): value is string[] {
  return Array.isArray(value) && value.length <= maxLength && value.every((item) => typeof item === "string" && item.length > 0);
}

function isPaymentMethod(value: unknown): value is CreateOrderInput["formaPagamento"] {
  return value === "pix" || value === "cartao" || value === "na_entrega";
}

export function validateCreateOrderInput(input: unknown): string | null {
  if (!input || typeof input !== "object") return "Dados do pedido inválidos.";
  const value = input as Record<string, unknown>;
  const items = value.items;
  const customer = value.customer;

  if (!Array.isArray(items) || items.length === 0 || items.length > MAX_ITEMS) return "Quantidade de itens inválida.";
  if (!customer || typeof customer !== "object") return "Dados do cliente inválidos.";
  const customerValue = customer as Record<string, unknown>;
  if (!isString(customerValue.nome, 120) || customerValue.nome.trim().length === 0) return "Nome do cliente inválido.";
  if (!isString(customerValue.email, 254) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerValue.email.trim())) return "E-mail do cliente inválido.";
  if (!isPaymentMethod(value.formaPagamento)) return "Forma de pagamento inválida.";
  if (value.consentAccepted !== true) return "O consentimento é obrigatório.";
  if (value.observacoes !== undefined && !isString(value.observacoes)) return "Observação do pedido inválida.";
  if (value.couponCode !== undefined && (!isString(value.couponCode, MAX_COUPON) || value.couponCode.trim().length === 0)) return "Cupom inválido.";

  for (const item of items) {
    if (!item || typeof item !== "object") return "Item do pedido inválido.";
    const row = item as Record<string, unknown>;
    if (typeof row.productId !== "string" || row.productId.length === 0) return "Produto inválido.";
    if (!Number.isInteger(row.quantity) || Number(row.quantity) < 1 || Number(row.quantity) > 99) return "Quantidade inválida.";
    if (!isStringArray(row.optionIds, MAX_OPTION_IDS) || !isStringArray(row.addonIds, MAX_ADDON_IDS)) return "Seleções inválidas.";
    if (!isString(row.observation, MAX_ITEM_OBSERVATION)) return "Observação do item inválida.";
  }

  const addressId = value.addressId;
  const address = value.address;
  if (addressId !== undefined && (typeof addressId !== "string" || addressId.length === 0)) return "Endereço inválido.";
  if (address === undefined && addressId === undefined) return "Informe um endereço.";
  if (address !== undefined) {
    if (!address || typeof address !== "object") return "Endereço inválido.";
    const a = address as Record<string, unknown>;
    const required = ["rua", "numero", "bairro", "cidade", "cep"] as const;
    for (const key of required) {
      if (!isString(a[key], 200) || a[key].trim().length === 0) return "Preencha os dados obrigatórios do endereço.";
    }
    for (const key of ["rotulo", "complemento", "referencia"] as const) {
      if (a[key] !== undefined && !isString(a[key], 200)) return "Dados do endereço inválidos.";
    }
  }

  return null;
}
