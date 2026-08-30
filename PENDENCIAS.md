# Pendências para colocar em produção

## Supabase
- Criar o projeto Supabase.
- Preencher `NEXT_PUBLIC_SUPABASE_URL`.
- Preencher `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Preencher `SUPABASE_SERVICE_ROLE_KEY` somente no ambiente do servidor.
- Executar `supabase/schema.sql` no banco.
- Configurar o provedor de telefone/OTP no Supabase Auth.
- Cadastrar o primeiro usuário em `admin_users` com papel `admin`.
- Habilitar Realtime para `orders` e `order_status_history`.
- Criar/verificar o bucket `product-images`.

## Mercado Pago
- Criar a aplicação no Mercado Pago Developers.
- Preencher `MERCADO_PAGO_ACCESS_TOKEN` no servidor.
- Preencher `NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY` para a futura etapa de cartão.
- Preencher `MERCADO_PAGO_WEBHOOK_SECRET`.
- Configurar o webhook para `/api/webhooks/mercado-pago`.
- Validar o fluxo real de Pix e, depois, habilitar o Checkout Transparente de cartão.

## Operação
- Cadastrar categorias, produtos, grupos de opções, adicionais e zonas de entrega no painel.
- Definir horários, valor mínimo, Pix e WhatsApp nas configurações.
- Substituir fotos e assets de demonstração por assets reais.
- Publicar a aplicação em um host Node compatível e configurar domínio/HTTPS.
