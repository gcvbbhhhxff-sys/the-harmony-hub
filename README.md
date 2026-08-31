# The Harmony Hub — Sistema de Delivery

## O que é?

O **The Harmony Hub** é um sistema completo de delivery desenvolvido com:

- **Next.js 14** (App Router + Server Actions)
- **TypeScript** (type-safe)
- **Tailwind CSS** (responsive design)
- **Supabase** (banco de dados + autenticação)
- **Zustand** (gerenciamento de carrinho)
- **ShadCN UI** (componentes base)

## Começar Rápido

### 1. Clonar e Instalar

```bash
git clone <repo-url>
cd the-harmony-hub
npm install
```

### 2. Configurar Ambiente

```bash
cp .env.example .env.local
```

Preencher em `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
```

### 3. Executar Migration

No Supabase Console ou via CLI:

```bash
supabase db push
```

Isso remove dados DEMO e deixa o banco vazio.

### 4. Criar Admin

No Supabase:

1. Autenticação → Criar usuário
2. SQL → Executar:

```sql
INSERT INTO admin_users (user_id, papel) 
VALUES ('<user-id>', 'admin');
```

### 5. Rodar Localmente

```bash
npm run dev
```

- Cliente: http://localhost:3000
- Admin: http://localhost:3000/admin/login

### 6. Configurar Restaurante

1. Login em `/admin/login`
2. Ir para `/admin/configuracoes`
3. Preencher dados do restaurante
4. Upload de logo e imagem de fundo

### 7. Criar Cardápio

1. `/admin/cardapio`
2. Criar categorias
3. Criar produtos com imagens
4. Criar adicionais e vincular

## Estrutura de Pastas

```
src/
├── app/                 # Páginas e rotas
├── components/          # Componentes React
│   ├── cliente/        # Páginas públicas
│   ├── admin/          # Páginas administrativas
│   └── ui/             # Componentes base
├── lib/                 # Utilitários
│   ├── supabase/       # Cliente Supabase
│   └── cart/           # Zustand store
├── server/              # Server-only
│   ├── menu.ts         # Fetch do cardápio
│   ├── admin.ts        # Validação de admin
│   └── actions/        # Server Actions
└── types/               # TypeScript types
```

## Fluxo de Desenvolvimento

### Arquitetura

```
Cliente (Public)          Admin (Autenticado)
    ↓                           ↓
[Menu Browser] ← [getPublicMenu] → [Supabase DB]
[Cart (Zustand)]                ↓
[Checkout]     → [createOrder]  [admin_users]
    ↓                           ↓
[Order Tracker] ← [getOrder]    [RLS Policies]
```

### Fluxo de Pedido

1. **Cliente vê o cardápio**
   - `getPublicMenu()` busca dados
   - Fallbacks seguros se vazio

2. **Cliente adiciona ao carrinho**
   - Zustand store (localStorage)
   - Persiste entre abas

3. **Cliente faz checkout**
   - `createOrder()` valida e cria pedido
   - Sem validação de pagamento
   - Cria endereço se novo

4. **Admin gerencia pedidos**
   - `/admin/pedidos` lista tudo
   - `updateOrderStatus()` altera status
   - Histórico de mudanças

## Comandos Importantes

```bash
# Desenvolvimento
npm run dev              # Rodar em localhost:3000

# Validação
npm run lint            # ESLint
npm run typecheck       # TypeScript

# Build
npm run build           # Compilar para produção
npm start               # Rodar build

# Migrations
supabase db push        # Executar migrations
supabase db pull        # Baixar schema
```

## Funcionalidades Implementadas

### ✅ Cliente

- [x] Visualizar cardápio
- [x] Adicionar ao carrinho
- [x] Editar itens do carrinho
- [x] Aplicar cupom
- [x] Finalizar pedido
- [x] Rastrear pedido
- [x] Endereço salvo
- [x] Responsivo mobile

### ✅ Admin

- [x] Configurações do restaurante
- [x] Upload de logo e fundo
- [x] Gerenciador de categorias
- [x] Gerenciador de produtos
- [x] Upload de imagens de produtos
- [x] Gerenciador de adicionais
- [x] Gerenciador de opções
- [x] Gerenciador de cupons
- [x] Gerenciador de zonas de entrega
- [x] Dashboard de pedidos
- [x] Alteração de status de pedido

### ❌ Não Implementado (Futuro)

- [ ] Pagamento online (PIX/Cartão)
- [ ] SMS de notificação
- [ ] Webhook de pagamento
- [ ] Analytics
- [ ] App mobile

## Dados Esperados no Banco

### restaurant_settings

```json
{
  "nome": "Seu Restaurante",
  "logo_url": "https://...",
  "background_url": "https://...",
  "whatsapp": "+55 11 99999-9999",
  "tempo_estimado": "30–45 minutos",
  "taxa_base_entrega": 5.00,
  "valor_minimo_pedido": 25.00,
  "chave_pix": "seu@email.com",
  "horario_funcionamento": {
    "segunda": { "abertura": "11:00", "fechamento": "23:00", "ativo": true },
    "terça": { ... },
    ...
  }
}
```

### products

```json
{
  "nome": "X-Tudo",
  "descricao": "Pão, carne, queijo, alface...",
  "preco": 25.90,
  "imagem_url": "https://storage.../burger.jpg",
  "category_id": "uuid-categoria",
  "ativo": true,
  "destaque": true
}
```

### orders

```json
{
  "customer_id": "uuid",
  "address_id": "uuid",
  "subtotal": 100.00,
  "taxa_entrega": 5.00,
  "desconto": 0,
  "total": 105.00,
  "status": "recebido",
  "status_pagamento": "pendente",
  "forma_pagamento": "pix",
  "observacoes": "Sem cebola"
}
```

## Troubleshooting

### Erro: "Supabase não configurado"

```bash
# Verificar .env.local
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

# Deve ter valor, não estar vazio
```

### Erro: "Não autorizado"

```sql
-- Verificar se admin existe
SELECT * FROM admin_users WHERE user_id = 'seu-user-id';

-- Se não existe, inserir:
INSERT INTO admin_users (user_id, papel) 
VALUES ('seu-user-id', 'admin');
```

### Erro: "Imagem não carrega"

```sql
-- Verificar RLS do bucket
SELECT * FROM storage.buckets WHERE name = 'product-images';

-- Deve ter public: true ou RLS permitindo leitura
```

### Build falha com TypeScript

```bash
# Verificar tipos
npm run typecheck

# Limpar cache
rm -rf .next node_modules
npm install
npm run build
```

## Contato e Suporte

Para dúvidas ou problemas:

1. Verificar `DEPLOYMENT_GUIDE.md`
2. Verificar `AUDIT_REPORT.md`
3. Rodar `npm run typecheck && npm run lint`
4. Consultar logs do Supabase

---

**Versão:** 1.0.0 (Beta)
**Última atualização:** 31 de agosto de 2026
