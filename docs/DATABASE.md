# Musique — banco de dados (Supabase)

Projeto: **workshop** · `bduokkiyvplwivikeikw` · PostgreSQL 17 · região `sa-east-1`
URL da API: `https://bduokkiyvplwivikeikw.supabase.co`

---

## Migrações aplicadas

| # | Nome | O que faz |
|---|------|-----------|
| 01 | `01_core_users_follows_interests` | enums, `users`, `follows`, `interests`, `user_interests` |
| 02 | `02_groups` | `groups`, `group_members`, `group_interests` |
| 03 | `03_media_posts_stories` | `media`, `posts` (+ satélites), `stories`, `comments`, `likes`, `reactions`, `bookmarks` |
| 04 | `04_messaging_notifications_settings` | conversas, mensagens, notificações, preferências, histórico de busca |
| 05 | `05_helper_functions_and_triggers` | predicados de autorização, `updated_at`, provisionamento de conta, notificações automáticas |
| 06 | `06_row_level_security` | RLS habilitado + policies em todas as 26 tabelas |
| 07 | `07_application_rpcs` | 20 funções consumidas pelo front |
| 08 | `08_seed_users_and_interests` | 12 contas + perfis + catálogo de interesses |
| 09 | `09_seed_social_graph_and_groups` | 27 follows, 10 grupos, 37 participações |
| 10 | `10_seed_posts_stories_messages` | 10 posts, 8 comentários, 20 curtidas, 10 stories, 6 conversas |
| 11 | `11_lock_down_function_grants` | revoga `EXECUTE` público das funções; `anon` sem acesso |

---

## Decisões que divergem do `schema.prisma`

O schema enviado descreve o **Gooday** (domínio fitness). A estrutura foi mantida;
o conteúdo é do **Musique**. Quatro ajustes deliberados:

**1. `Account` não existe.** O Prisma guardava `passwordHash` numa tabela própria.
No Supabase quem faz isso é `auth.users`, e `auth.uid()` é a base de todo o RLS.
Criar uma tabela de senhas paralela desativaria o Supabase Auth e seria inseguro.
Agora `public.users.id` referencia `auth.users(id)`, e o gatilho `handle_new_user`
cria perfil + settings + preferências no momento do cadastro.

**2. `GroupPost` virou uma view.** O vínculo post↔grupo já vive em `posts.group_id`.
Manter uma tabela espelho criaria duas fontes de verdade para o mesmo fato.
A view `group_posts` preserva o nome para quem já consultava por ele.

**3. O `@@unique` do `Like` foi refeito.** No Postgres, `UNIQUE (user_id, post_id)`
não impede duplicatas quando `post_id` é `NULL` — `NULL` nunca conflita. Então a
mesma pessoa poderia curtir o mesmo comentário várias vezes. Trocado por um
`CHECK (num_nonnulls(post_id, comment_id) = 1)` mais dois índices únicos parciais.

**4. `cuid` → `uuid`.** `gen_random_uuid()` é nativo e é o que o Supabase espera.

---

## Segurança

RLS ligado nas 26 tabelas, com policy explícita por operação. Todas miram o papel
`authenticated` — `anon` não lê nada, porque o app exige login.

Regras que valem a pena saber:

- **Salvos são privados.** Ninguém vê o que você guardou, nem o autor do post.
- **Notificações não têm policy de INSERT.** Só os gatilhos (`SECURITY DEFINER`)
  criam notificação. Nenhum cliente consegue forjar uma.
- **Grupo privado some da listagem** para quem não é membro ativo.
- **Post em grupo** só aparece para membro, ou se o grupo for público.
- **Perfil privado** esconde posts e stories, não o perfil em si — senão a busca quebraria.
- Os predicados de RLS (`is_group_member`, `can_view_post`…) são `SECURITY DEFINER`
  para não cair em recursão infinita de policy, com `search_path` fixo.

### Verificado na prática

| Teste | Resultado |
|---|---|
| Richard vê 8 de 10 grupos (2 privados ocultos) | ✅ |
| Richard vê 5 de 31 notificações (só as dele) | ✅ |
| Marina vê 0 salvos, 2 de 14 mensagens, 0 grupos privados | ✅ |
| `anon` lendo `/rest/v1/posts` | 401 ✅ |
| Login + `get_feed` autenticado | 3 posts ✅ |
| Inserir post em nome de outro autor | bloqueado ✅ |

### Pendência de segurança

O advisor do Supabase aponta **proteção contra senhas vazadas desativada**.
Ativar em Authentication › Policies. Não dá para ligar por SQL:
https://supabase.com/docs/guides/auth/password-security

---

## Banco limpo

As 12 contas de demonstração e todo o conteúdo que elas tinham foram
**removidos**. O banco está zerado para você criar a primeira conta pelo app:

| Tabela | Linhas |
|---|---|
| `auth.users` / `public.users` | 0 |
| posts, comentários, curtidas, grupos, stories, mensagens | 0 |
| `interests` (catálogo) | 12 — mantido, é dado de referência |

### Antes de criar sua conta

A confirmação por e-mail está **ligada** (`mailer_autoconfirm: false`), então um
cadastro novo pelo app não entra direto: espera o clique no link enviado. Duas saídas:

- **Workshop:** desligue em *Authentication › Sign In / Providers › Email › Confirm email*.
  O cadastro passa a entrar na hora.
- **Produção:** configure um SMTP próprio em *Authentication › Emails*. O SMTP
  embutido do Supabase tem limite baixo e não serve para uso real.

Não dá para mudar isso por SQL — é ajuste de painel.

---

## RPCs disponíveis

Leitura: `get_feed`, `get_explore`, `get_post`, `get_stories`, `get_profile`,
`get_conversations`, `search_all`

Escrita: `create_post`, `create_story`, `toggle_like`, `toggle_bookmark`,
`set_reaction`, `toggle_follow`, `toggle_group_membership`, `send_message`,
`get_or_create_dm`, `mark_story_seen`, `mark_conversation_read`,
`mark_notifications_read`

Manutenção (só `service_role`): `expire_stories` — marca stories vencidos.
Agende com `pg_cron` ou chame de uma Edge Function.

---

## Storage

Bucket **`media`** (migração 14): leitura pública, escrita só dentro de
`media/<seu-uid>/`. Limite de 5 MB por arquivo, apenas JPEG/PNG/WebP/GIF.
É de lá que saem avatares, capas e mídia de post.

---

## O front

`src/data/db.ts` **não existe mais** — o mock foi apagado. A ligação com o banco:

| Arquivo | Papel |
|---|---|
| `src/lib/supabase.ts` | client, lê as chaves do `.env` |
| `src/lib/api.ts` | uma função por RPC, converte JSON → tipos do app |
| `src/data/types.ts` | tipos e constantes de UI (sem dados) |
| `src/app/store.tsx` | sessão do Supabase Auth + carregamento das RPCs |

### Verificado de ponta a ponta

Criei uma conta temporária, usei o app e apaguei tudo em seguida:

| Passo | Resultado |
|---|---|
| Login real (`signInWithPassword`) | ✅ entrou e foi para a Home |
| Estado vazio do feed numa conta nova | ✅ |
| Publicar (texto + hashtags) | ✅ 1 post, 2 tags no Postgres |
| Curtir | ✅ 1 linha em `likes`, contador na tela |
| Comentar | ✅ 1 linha em `comments`, badge "autor" |
| Remoção em cascata ao apagar a conta | ✅ tudo zerado |

### O que ainda é mock

Nada de dado. O que não existe ainda é **tela de administração** — as RPCs
`admin_list_users` e `admin_stats` respondem para um admin logado, mas nenhuma
tela do app consome isso.
