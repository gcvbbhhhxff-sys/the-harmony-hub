export type Category={id:string;nome:string;ordem:number;ativo:boolean};
export type Product={id:string;category_id:string;nome:string;descricao:string|null;preco:number;imagem_url:string|null;ativo:boolean;destaque:boolean};
export type RestaurantSettings={nome:string;logo_url:string|null;background_url:string|null;valor_minimo_pedido:number;whatsapp:string|null;tempo_estimado:string|null;horario_funcionamento:Record<string,{abertura:string;fechamento:string;ativo?:boolean}>};
