export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
export interface Database { public:{ Tables: Record<string,unknown>; Functions:{ validar_cupom:{Args:{codigo:string;valor_pedido:number};Returns:{valido:boolean;tipo:string;valor:number;desconto:number}[]}; consumir_cupom:{Args:{codigo:string;valor_pedido:number};Returns:boolean} } } }
