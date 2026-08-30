# Pendências para colocar em produção

## Código
- [x] Build de produção aprovado no CI: install, typecheck, lint e build.
- [x] Metadados, favicon, manifest, robots e sitemap implementados.
- [x] Acessibilidade dos controles de quantidade revisada.
- [x] Tipagem administrativa revisada sem `any` explícito.
- [x] Refatoração visual mobile-first alinhada à identidade da Tabajara's.

## Supabase dedicado
- [x] Novo projeto criado: `TABAJARAS-DELIVERY`.
- [x] Região: `sa-east-1`.
- [x] Estrutura dedicada de delivery criada.
- [x] RLS habilitada nas tabelas da aplicação.
- [x] Políticas de cliente/admin criadas.
- [x] Proteção de alteração de status pelo cliente criada no banco.
- [x] Funções de cupom criadas; consumo restrito ao `service_role`.
- [x] Bucket `product-images` criado com políticas administrativas.
- [x] Realtime habilitado para `orders` e `order_status_history`.
- [x] Índice para endereço padrão por cliente criado.
- [x] URL do novo Supabase registrada em `.env.example`.
- [ ] Configurar provedor de telefone/OTP no Supabase Auth.
- [ ] Criar o primeiro usuário real em `admin_users` após ele existir no Auth.
- [ ] Preencher `SUPABASE_SERVICE_ROLE_KEY` somente no ambiente do servidor.

## Mercado Pago
- [ ] Criar/configurar aplicação no Mercado Pago Developers.
- [ ] Preencher `MERCADO_PAGO_ACCESS_TOKEN` no servidor.
- [ ] Preencher `MERCADO_PAGO_WEBHOOK_SECRET`.
- [ ] Preencher `NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY` para cartão.
- [ ] Configurar `/api/webhooks/mercado-pago` no painel do Mercado Pago.
- [ ] Validar Pix real em ambiente de teste.
- [ ] Validar Checkout Transparente de cartão.

## Conteúdo/Assets
- [ ] Receber e substituir por fotos reais do cardápio.
- [ ] Gerar `public/og-image.jpg` definitivo (1200×630) com asset aprovado.
- [ ] Gerar `public/apple-touch-icon.png` definitivo (180×180) a partir da logo aprovada.
- [ ] Cadastrar categorias, produtos, preços, grupos/opções e adicionais reais.

## Operação
- [ ] Receber endereço definitivo.
- [ ] Definir zonas de entrega e respectivas taxas.
- [ ] Definir horários de funcionamento.
- [ ] Definir valor mínimo de pedido.
- [ ] Definir Pix e WhatsApp oficiais.
- [ ] Configurar domínio/HTTPS e publicação final.

## Observação de segurança
A única recomendação do linter ainda visível é o alerta sobre `validar_cupom` ser uma `SECURITY DEFINER` exposta via RPC. Isso é intencional para permitir validação server-side sem abrir leitura da tabela `coupons`; as funções administrativas e de consumo já tiveram o `EXECUTE` removido de `anon`/`authenticated`.
