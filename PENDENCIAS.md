# Pendências para colocar em produção

## Código
- [x] Build de produção aprovado no CI: install, typecheck, lint e build.
- [x] Metadados, favicon, manifest e robots adicionados.
- [x] Sitemap `/sitemap.xml` implementado.
- [x] Acessibilidade dos controles de quantidade revisada.
- [x] Tipagem da página administrativa de pedidos revisada sem `any` explícito.

## Supabase
- Criar o projeto Supabase.
- Preencher `NEXT_PUBLIC_SUPABASE_URL`.
- Preencher `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Preencher `SUPABASE_SERVICE_ROLE_KEY` somente no ambiente do servidor.
- Executar `supabase/schema.sql` no banco.
- Configurar o provedor de telefone/OTP no Supabase Auth.
- Cadastrar o primeiro usuário em `admin_users` com papel `admin`.
- Confirmar a publicação das tabelas de pedidos no Realtime (`orders` e `order_status_history`) caso o projeto Supabase não aplique a configuração do SQL automaticamente.
- Criar/verificar o bucket `product-images`.

## Mercado Pago
- Criar a aplicação no Mercado Pago Developers.
- Preencher `MERCADO_PAGO_ACCESS_TOKEN` no servidor.
- Preencher `NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY` para o fluxo de cartão.
- Preencher `MERCADO_PAGO_WEBHOOK_SECRET`.
- Configurar o webhook para `/api/webhooks/mercado-pago`.
- Validar o fluxo real de Pix em ambiente de teste.
- Validar e, depois, habilitar o Checkout Transparente de cartão.

## Assets reais
- Criar `public/og-image.jpg` (1200×630) com uma foto real do restaurante/pratos, para pré-visualização ao compartilhar o link.
- Criar `public/apple-touch-icon.png` (180×180) a partir da logo real, para ícone em iOS.
- Substituir fotos e assets de demonstração por assets reais.

## Operação
- Cadastrar categorias, produtos, grupos de opções, adicionais e zonas de entrega no painel.
- Definir horários, valor mínimo, Pix e WhatsApp nas configurações.
- Publicar a aplicação em um host Node compatível e configurar domínio/HTTPS.
