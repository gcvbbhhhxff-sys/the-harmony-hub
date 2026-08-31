export type DraftOrderItem = {
  productId: string;
  quantity: number;
  optionIds: string[];
  addonIds: string[];
  observation: string;
};

export type AddressInput = {
  rotulo?: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  cep: string;
  referencia?: string;
};

export type CreateOrderInput = {
  items: DraftOrderItem[];
  customer: {
    nome: string;
    email: string;
  };
  addressId?: string;
  address?: AddressInput;
  formaPagamento: "pix" | "cartao" | "na_entrega";
  observacoes?: string;
  couponCode?: string;
  consentAccepted?: boolean;
};
