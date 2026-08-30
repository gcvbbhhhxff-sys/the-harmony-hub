"use client";

import { useState, useTransition } from "react";
import { deleteAddon, deleteCategory, deleteOption, deleteOptionGroup, deleteProduct, linkAddon, saveAddon, saveCategory, saveOption, saveOptionGroup, saveProduct, toggleProduct, unlinkAddon, uploadProductImage } from "@/server/actions/admin-menu";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

type Category = { id: string; nome: string; ordem: number; ativo: boolean };
type Product = { id: string; category_id: string; nome: string; descricao: string | null; preco: number; imagem_url: string | null; ativo: boolean; destaque: boolean };
type Group = { id: string; product_id: string; nome: string; min_select: number; max_select: number; obrigatorio: boolean; ordem: number };
type Option = { id: string; group_id: string; nome: string; preco_extra: number; ordem: number; ativo: boolean };
type Addon = { id: string; nome: string; preco: number; ativo: boolean };
type Link = { product_id: string; addon_id: string };

type Props = { initial: { categories: Category[]; products: Product[]; groups: Group[]; options: Option[]; addons: Addon[]; links: Link[] } };

type ProductForm = { id?: string; category_id: string; nome: string; descricao: string; preco: number; imagem_url: string; ativo: boolean; destaque: boolean };
type CategoryForm = { id?: string; nome: string; ordem: number; ativo: boolean };
type GroupForm = { id?: string; product_id: string; nome: string; min_select: number; max_select: number; obrigatorio: boolean; ordem: number };
type OptionForm = { id?: string; group_id: string; nome: string; preco_extra: number; ordem: number; ativo: boolean };
type AddonForm = { id?: string; nome: string; preco: number; ativo: boolean };

const emptyProduct = (categories: Category[]): ProductForm => ({ category_id: categories[0]?.id ?? "", nome: "", descricao: "", preco: 0, imagem_url: "", ativo: true, destaque: false });
const emptyGroup = (products: Product[]): GroupForm => ({ product_id: products[0]?.id ?? "", nome: "", min_select: 1, max_select: 1, obrigatorio: true, ordem: 0 });
const emptyOption = (groups: Group[]): OptionForm => ({ group_id: groups[0]?.id ?? "", nome: "", preco_extra: 0, ordem: 0, ativo: true });
const emptyAddon = (): AddonForm => ({ nome: "", preco: 0, ativo: true });
const emptyCategory = (): CategoryForm => ({ nome: "", ordem: 0, ativo: true });

export default function MenuAdminClient({ initial }: Props) {
  const [data, setData] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(emptyCategory());
  const [productForm, setProductForm] = useState<ProductForm>(emptyProduct(initial.categories));
  const [groupForm, setGroupForm] = useState<GroupForm>(emptyGroup(initial.products));
  const [optionForm, setOptionForm] = useState<OptionForm>(emptyOption(initial.groups));
  const [addonForm, setAddonForm] = useState<AddonForm>(emptyAddon());

  const reload = () => window.setTimeout(() => window.location.reload(), 300);
  const run = (fn: () => Promise<{ ok: boolean; message?: string }>, refresh = false) => startTransition(async () => {
    try {
      const result = await fn();
      setMsg(result.ok ? "Alterações salvas." : result.message || "Não foi possível concluir.");
      if (result.ok && refresh) reload();
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "Erro inesperado.");
    }
  });

  const editCategory = (category: Category) => setCategoryForm({ id: category.id, nome: category.nome, ordem: category.ordem, ativo: category.ativo });
  const editProduct = (product: Product) => setProductForm({ id: product.id, category_id: product.category_id, nome: product.nome, descricao: product.descricao ?? "", preco: Number(product.preco), imagem_url: product.imagem_url ?? "", ativo: product.ativo, destaque: product.destaque });
  const editGroup = (group: Group) => setGroupForm({ id: group.id, product_id: group.product_id, nome: group.nome, min_select: group.min_select, max_select: group.max_select, obrigatorio: group.obrigatorio, ordem: group.ordem });
  const editOption = (option: Option) => setOptionForm({ id: option.id, group_id: option.group_id, nome: option.nome, preco_extra: Number(option.preco_extra), ordem: option.ordem, ativo: option.ativo });
  const editAddon = (addon: Addon) => setAddonForm({ id: addon.id, nome: addon.nome, preco: Number(addon.preco), ativo: addon.ativo });

  return (
    <main className="space-y-6 p-4 md:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-3xl font-black tracking-tight">Cardápio</h1><p className="mt-1 text-sm text-black/55">Edite nome, preço, descrição, imagem e disponibilidade sem sair do painel.</p></div>
        <span className="rounded-full bg-black px-3 py-1.5 text-xs font-bold text-white">{data.products.length} produtos</span>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="rounded-2xl border-black/8 p-5">
          <div className="flex items-center justify-between gap-3"><h2 className="font-black">Categorias</h2>{categoryForm.id && <Button size="sm" variant="ghost" onClick={() => setCategoryForm(emptyCategory())}>Nova categoria</Button>}</div>
          <div className="mt-4 grid gap-2">
            <Input placeholder="Nome da categoria" value={categoryForm.nome} onChange={(e) => setCategoryForm({ ...categoryForm, nome: e.target.value })} />
            <Input type="number" placeholder="Ordem" value={categoryForm.ordem} onChange={(e) => setCategoryForm({ ...categoryForm, ordem: Number(e.target.value) })} />
            <label className="flex items-center gap-2 text-sm"><Checkbox checked={categoryForm.ativo} onChange={(e) => setCategoryForm({ ...categoryForm, ativo: e.target.checked })} /> Categoria ativa</label>
            <Button disabled={pending} onClick={() => run(() => saveCategory(categoryForm), true)}>{categoryForm.id ? "Salvar categoria" : "Criar categoria"}</Button>
          </div>
          <div className="mt-5 grid gap-2">{data.categories.map((category) => <div key={category.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-black/8 bg-[#faf9f5] p-3"><div><p className="text-sm font-black">{category.nome}</p><p className="text-xs text-black/50">ordem {category.ordem} · {category.ativo ? "ativa" : "inativa"}</p></div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => editCategory(category)}>Editar</Button><Button size="sm" variant="outline" onClick={() => run(() => saveCategory({ ...category, ativo: !category.ativo }), true)}>{category.ativo ? "Desativar" : "Ativar"}</Button><Button size="sm" variant="destructive" onClick={() => window.confirm("Excluir categoria?") && run(() => deleteCategory(category.id), true)}>Excluir</Button></div></div>)}</div>
        </Card>

        <Card className="rounded-2xl border-black/8 p-5">
          <div className="flex items-center justify-between gap-3"><h2 className="font-black">{productForm.id ? "Editar produto" : "Novo produto"}</h2>{productForm.id && <Button size="sm" variant="ghost" onClick={() => setProductForm(emptyProduct(data.categories))}>Novo produto</Button>}</div>
          <div className="mt-4 grid gap-2">
            <select className="h-10 rounded-md border border-black/10 bg-white px-3" value={productForm.category_id} onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}>{data.categories.map((category) => <option key={category.id} value={category.id}>{category.nome}</option>)}</select>
            <Input placeholder="Nome do produto" value={productForm.nome} onChange={(e) => setProductForm({ ...productForm, nome: e.target.value })} />
            <textarea className="min-h-24 rounded-md border border-black/10 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-[#d3a328]" placeholder="Descrição" value={productForm.descricao} onChange={(e) => setProductForm({ ...productForm, descricao: e.target.value })} />
            <Input type="number" min="0" step="0.01" placeholder="Preço" value={productForm.preco} onChange={(e) => setProductForm({ ...productForm, preco: Number(e.target.value) })} />
            <Input placeholder="URL da imagem (opcional)" value={productForm.imagem_url} onChange={(e) => setProductForm({ ...productForm, imagem_url: e.target.value })} />
            {productForm.imagem_url && <div className="overflow-hidden rounded-xl border border-black/8 bg-black/5"><img src={productForm.imagem_url} alt="Pré-visualização" className="h-40 w-full object-cover" /></div>}
            <div className="flex flex-wrap gap-4 text-sm"><label className="flex items-center gap-2"><Checkbox checked={productForm.ativo} onChange={(e) => setProductForm({ ...productForm, ativo: e.target.checked })} /> Disponível</label><label className="flex items-center gap-2"><Checkbox checked={productForm.destaque} onChange={(e) => setProductForm({ ...productForm, destaque: e.target.checked })} /> Mais pedido</label></div>
            <Button disabled={pending} onClick={() => run(() => saveProduct({ ...productForm, imagem_url: productForm.imagem_url || null }), true)}>{productForm.id ? "Salvar alterações" : "Criar produto"}</Button>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="rounded-2xl border-black/8 p-5">
          <div className="flex items-center justify-between gap-3"><h2 className="font-black">Grupos de opções</h2>{groupForm.id && <Button size="sm" variant="ghost" onClick={() => setGroupForm(emptyGroup(data.products))}>Novo grupo</Button>}</div>
          <div className="mt-4 grid gap-2"><select className="h-10 rounded-md border border-black/10 bg-white px-3" value={groupForm.product_id} onChange={(e) => setGroupForm({ ...groupForm, product_id: e.target.value })}>{data.products.map((product) => <option key={product.id} value={product.id}>{product.nome}</option>)}</select><Input placeholder="Nome do grupo" value={groupForm.nome} onChange={(e) => setGroupForm({ ...groupForm, nome: e.target.value })} /><div className="grid grid-cols-2 gap-2"><Input type="number" min="0" value={groupForm.min_select} onChange={(e) => setGroupForm({ ...groupForm, min_select: Number(e.target.value) })} /><Input type="number" min="0" value={groupForm.max_select} onChange={(e) => setGroupForm({ ...groupForm, max_select: Number(e.target.value) })} /></div><label className="flex items-center gap-2 text-sm"><Checkbox checked={groupForm.obrigatorio} onChange={(e) => setGroupForm({ ...groupForm, obrigatorio: e.target.checked })} /> Obrigatório</label><Button disabled={pending} onClick={() => run(() => saveOptionGroup(groupForm), true)}>{groupForm.id ? "Salvar grupo" : "Criar grupo"}</Button></div>
          <div className="mt-5 grid gap-2">{data.groups.map((group) => <div key={group.id} className="rounded-xl border border-black/8 bg-[#faf9f5] p-3"><div className="flex items-center justify-between gap-2"><div><p className="text-sm font-black">{group.nome}</p><p className="text-xs text-black/50">{data.products.find((p) => p.id === group.product_id)?.nome ?? "Produto removido"}</p></div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => editGroup(group)}>Editar</Button><Button size="sm" variant="destructive" onClick={() => window.confirm("Excluir grupo e suas opções?") && run(() => deleteOptionGroup(group.id), true)}>Excluir</Button></div></div></div>)}</div>
        </Card>

        <Card className="rounded-2xl border-black/8 p-5">
          <div className="flex items-center justify-between gap-3"><h2 className="font-black">Opções</h2>{optionForm.id && <Button size="sm" variant="ghost" onClick={() => setOptionForm(emptyOption(data.groups))}>Nova opção</Button>}</div>
          <div className="mt-4 grid gap-2"><select className="h-10 rounded-md border border-black/10 bg-white px-3" value={optionForm.group_id} onChange={(e) => setOptionForm({ ...optionForm, group_id: e.target.value })}>{data.groups.map((group) => <option key={group.id} value={group.id}>{group.nome}</option>)}</select><Input placeholder="Nome" value={optionForm.nome} onChange={(e) => setOptionForm({ ...optionForm, nome: e.target.value })} /><Input type="number" min="0" step="0.01" placeholder="Acréscimo" value={optionForm.preco_extra} onChange={(e) => setOptionForm({ ...optionForm, preco_extra: Number(e.target.value) })} /><Input type="number" min="0" placeholder="Ordem" value={optionForm.ordem} onChange={(e) => setOptionForm({ ...optionForm, ordem: Number(e.target.value) })} /><label className="flex items-center gap-2 text-sm"><Checkbox checked={optionForm.ativo} onChange={(e) => setOptionForm({ ...optionForm, ativo: e.target.checked })} /> Ativa</label><Button disabled={pending} onClick={() => run(() => saveOption(optionForm), true)}>{optionForm.id ? "Salvar opção" : "Criar opção"}</Button></div>
          <div className="mt-5 grid gap-2">{data.options.map((option) => <div key={option.id} className="flex items-center justify-between gap-2 rounded-xl border border-black/8 bg-[#faf9f5] p-3"><div><p className="text-sm font-black">{option.nome}</p><p className="text-xs text-black/50">+ {Number(option.preco_extra).toFixed(2).replace(".", ",")} · {option.ativo ? "ativa" : "inativa"}</p></div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => editOption(option)}>Editar</Button><Button size="sm" variant="destructive" onClick={() => run(() => deleteOption(option.id), true)}>Excluir</Button></div></div>)}</div>
        </Card>
      </div>

      <Card className="rounded-2xl border-black/8 p-5">
        <div className="flex items-center justify-between gap-3"><h2 className="font-black">Adicionais</h2>{addonForm.id && <Button size="sm" variant="ghost" onClick={() => setAddonForm(emptyAddon())}>Novo adicional</Button>}</div>
        <div className="mt-4 grid gap-2 md:grid-cols-3"><Input placeholder="Nome" value={addonForm.nome} onChange={(e) => setAddonForm({ ...addonForm, nome: e.target.value })} /><Input type="number" min="0" step="0.01" placeholder="Preço" value={addonForm.preco} onChange={(e) => setAddonForm({ ...addonForm, preco: Number(e.target.value) })} /><Button disabled={pending} onClick={() => run(() => saveAddon(addonForm), true)}>{addonForm.id ? "Salvar adicional" : "Criar adicional"}</Button></div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">{data.addons.map((addon) => <div key={addon.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-black/8 bg-[#faf9f5] p-3"><div><p className="text-sm font-black">{addon.nome}</p><p className="text-xs text-black/50">{Number(addon.preco).toFixed(2).replace(".", ",")} · {addon.ativo ? "ativo" : "inativo"}</p></div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => editAddon(addon)}>Editar</Button><Button size="sm" variant="destructive" onClick={() => window.confirm("Excluir adicional?") && run(() => deleteAddon(addon.id), true)}>Excluir</Button></div></div>)}</div>
        <div className="mt-5 border-t border-black/8 pt-5"><p className="text-sm font-black">Associar adicional a produto</p><div className="mt-2 grid gap-2 md:grid-cols-2"><select className="h-10 rounded-md border border-black/10 bg-white px-3" defaultValue={data.products[0]?.id ?? ""} id="link-product">{data.products.map((product) => <option key={product.id} value={product.id}>{product.nome}</option>)}</select><select className="h-10 rounded-md border border-black/10 bg-white px-3" defaultValue={data.addons[0]?.id ?? ""} id="link-addon">{data.addons.map((addon) => <option key={addon.id} value={addon.id}>{addon.nome}</option>)}</select></div><Button className="mt-2" onClick={() => { const product = document.getElementById("link-product") as HTMLSelectElement | null; const addon = document.getElementById("link-addon") as HTMLSelectElement | null; if (product?.value && addon?.value) run(() => linkAddon(product.value, addon.value), true); }}>Associar adicional</Button></div>
      </Card>

      <section className="space-y-3"><div className="flex items-center justify-between"><h2 className="text-xl font-black">Produtos cadastrados</h2><span className="text-xs font-bold text-black/50">Imagem, preço e disponibilidade aparecem em tempo real no site.</span></div>{data.products.map((product) => <Card key={product.id} className="rounded-2xl border-black/8 p-4"><div className="flex flex-col gap-4 md:flex-row md:items-center"><div className="flex min-w-0 flex-1 gap-4"><div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-black/5">{product.imagem_url && <img src={product.imagem_url} alt={product.nome} className="h-full w-full object-cover" />}</div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-black">{product.nome}</p>{product.destaque && <span className="rounded-full bg-[#fff1c5] px-2 py-0.5 text-[10px] font-black text-[#8a6511]">Destaque</span>}</div><p className="mt-1 text-sm font-black text-[#aa7f18]">R$ {Number(product.preco).toFixed(2).replace(".", ",")}</p><p className="mt-1 line-clamp-2 text-xs text-black/50">{product.descricao || "Sem descrição"}</p></div></div><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => editProduct(product)}>Editar tudo</Button><Button size="sm" variant="outline" onClick={() => run(() => toggleProduct(product.id, !product.ativo), true)}>{product.ativo ? "Indisponível" : "Ativar"}</Button><label className="inline-flex min-h-9 cursor-pointer items-center rounded-md border border-black/10 px-3 text-sm font-medium">Trocar imagem<input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; const form = new FormData(); form.append("productId", product.id); form.append("file", file); run(() => uploadProductImage(form), true); }} /></label><Button size="sm" variant="destructive" onClick={() => window.confirm("Excluir produto?") && run(() => deleteProduct(product.id), true)}>Excluir</Button></div></div></Card>)}</section>

      {msg && <div className="fixed bottom-4 right-4 z-50 rounded-xl bg-[#0d1013] px-4 py-3 text-sm font-bold text-white shadow-2xl">{msg}</div>}
    </main>
  );
}
