# Auditoria de segurança

1. Dados de cliente são filtrados por `auth.uid()` nas políticas RLS.
2. Clientes não recebem a service role key.
3. Service role aparece apenas em código de servidor para tarefas administrativas/pagamento.
4. Rotas administrativas são protegidas por middleware e também por verificações server-side nas Server Actions.
5. Alteração de status de pedido por cliente é bloqueada por trigger no PostgreSQL.
6. Pedidos usam validação server-side de produto, opções, adicionais, preço, cupom e zona.
7. IDs de pedidos são verificados por RLS no acesso do cliente; trocar o ID na URL não autoriza acesso a outro pedido.
8. Carrinho usa Zustand + localStorage do navegador e não é mantido em estado global do servidor.
9. Rotas com dados dinâmicos foram marcadas como `force-dynamic`/`no-store` onde necessário.
10. O webhook do Mercado Pago possui validação HMAC antes de alterar dados.

## Limites conhecidos antes de produção
- As chaves externas não estão disponíveis neste ambiente.
- A execução do schema e o provisionamento do Auth/Realtime/Storage precisam ocorrer no projeto Supabase real.
- O Checkout Transparente de cartão permanece dependente da configuração do Mercado Pago.
