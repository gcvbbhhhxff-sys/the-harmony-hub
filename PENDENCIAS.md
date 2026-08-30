# Pendências para colocar em produção

## Código
- [x] Build de produção aprovado no CI.
- [x] TypeScript e lint aprovados.
- [x] Metadados, favicon, manifest, robots e sitemap implementados.
- [x] Acessibilidade dos controles de quantidade revisada.
- [x] Tipagem administrativa revisada sem `any` explícito.
- [x] Refatoração visual mobile-first alinhada à identidade da Tabajara's.

## Supabase dedicado
- [x] Novo projeto criado: `TABAJARAS-DELIVERY`.
- [x] Região: `sa-east-1`.
- [x] Estrutura dedicada de delivery criada do zero.
- [x] RLS habilitada nas 16 tabelas da aplicação.
- [x] Políticas de cliente/admin criadas.
- [x] Proteção de alteração de status pelo cliente criada no banco.
- [x] Funções de cupom criadas; validação e consumo executados somente por código server-side com `service_role`.
- [x] Função de limpeza de dados DEMO criada e restrita ao `service_role`.
- [x] Bucket `product-images` criado com políticas administrativas.
- [x] Realtime habilitado para `orders` e `order_status_history`.
- [x] Índices principais criados.
- [x] Dados de demonstração inseridos e marcados com `is_demo=true`.
- [x] URL do novo Supabase registrada no projeto.
- [ ] Configurar provedor de telefone/OTP real no Supabase Auth.
- [ ] Criar o primeiro usuário administrativo real no Auth e associá-lo a `admin_users`.
- [ ] Configurar `SUPABASE_SERVICE_ROLE_KEY` no ambiente de produção.

## Mercado Pago — fase posterior
- [ ] Criar/configurar aplicação no Mercado Pago Developers.
- [ ] Preencher `MERCADO_PAGO_ACCESS_TOKEN` no servidor.
- [ ] Preencher `MERCADO_PAGO_WEBHOOK_SECRET`.
- [ ] Preencher `NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY` para cartão.
- [ ] Configurar `/api/webhooks/mercado-pago`.
- [ ] Validar Pix real em ambiente de teste.
- [ ] Validar Checkout Transparente de cartão.

## Conteúdo real — será preenchido pelo cliente
- [ ] Substituir os dados DEMO pelos produtos, preços e fotos reais.
- [ ] Gerar `public/og-image.jpg` definitivo a partir de asset aprovado.
- [ ] Gerar `public/apple-touch-icon.png` definitivo a partir da logo aprovada.
- [ ] Cadastrar categorias, produtos, preços, grupos/opções, adicionais e demais informações reais.
- [ ] Definir endereço, zonas/taxas, horários, valor mínimo, Pix e WhatsApp oficiais.

## Operação/publicação
- [ ] Configurar variáveis reais no host.
- [ ] Configurar domínio/HTTPS.
- [ ] Fazer teste E2E em dispositivo móvel real.

## Dados DEMO
Os dados atuais são exclusivamente de teste. Eles têm `is_demo=true` e existe a função protegida `public.limpar_dados_demo()` para remoção controlada. Ao preparar um cliente final, os dados DEMO podem ser apagados e substituídos sem alterar a estrutura do banco.
