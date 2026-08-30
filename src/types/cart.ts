import type { Product } from "@/types/menu";
export type MenuOptionGroup={id:string;product_id:string;nome:string;min_select:number;max_select:number;obrigatorio:boolean;ordem:number};
export type MenuOption={id:string;group_id:string;nome:string;preco_extra:number;ordem:number;ativo:boolean};
export type MenuAddon={id:string;nome:string;preco:number;ativo:boolean};
export type CartSelection={optionId:string;groupId:string;nome:string;precoExtra:number};
export type CartAddon={addonId:string;nome:string;preco:number};
export type CartItem={id:string;product:Product;options:CartSelection[];addons:CartAddon[];observation:string;quantity:number;unitPrice:number};
