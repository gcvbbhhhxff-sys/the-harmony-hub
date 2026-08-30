# Arquitetura do Sistema de Delivery

Este repositório implementa, em etapas controladas, a especificação do arquivo `arquitetura-prompts-delivery.md` fornecido para o projeto.

## Ordem de execução

1. Fundação Next.js/App Router/TypeScript/Tailwind/Supabase
2. Design system
3. Recalibração visual com a marca
4. Banco de dados e RLS
5. Cardápio público
6. Detalhe de produto e carrinho
7. Checkout
8. Pagamentos Mercado Pago
9. Acompanhamento do pedido
10. Painel administrativo
11. Gestão operacional de pedidos
12. Cardápio administrativo
13. Cupons, zonas e configurações
14. Auditoria final, segurança, QA mobile e revisão visual

Nenhuma etapa deve ser considerada concluída apenas pela presença dos arquivos. A etapa deve ser revisada contra a especificação, tipos devem ser verificados e a build deve ser validada quando a infraestrutura disponível permitir.

## Regra de isolamento

Dados de clientes, carrinhos, endereços e pedidos nunca podem ser compartilhados entre usuários. O cliente Supabase de servidor é criado por requisição; RLS será a barreira definitiva no banco; `service_role` jamais será exposta ao browser.
