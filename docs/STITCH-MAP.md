# STITCH-MAP — Musique

**Projeto:** Musique — rede social de pessoas que tocam, gravam e ouvem junto.
Nome extraído dos próprios exports (`<h1>Musique</h1>` em `Main.dc.html`, rodapé
"Musique 1.0.0 · feito para ouvir junto" em `Configuracoes-Mobile.dc.html`).

**Árvore de telas:** este mapa foi levantado antes de existir um arquivo de
árvore, a partir da própria pasta de exports (`design/screens/*.dc.html` —
43 artboards) somada aos links `href` entre eles, que descrevem a navegação.

Uma árvore chegou depois, mas descrevendo o **Gooday** (domínio fitness, 37
superfícies). A estrutura foi aproveitada; o conteúdo continua sendo o do
Musique, que é o produto dos exports e o que está implementado.

**App:** `musique-app/` — React 19 + TypeScript + Vite 7 + Tailwind CSS v4.

---

## Navegação derivada dos exports

```
Login ─→ Cadastro
  └─→ Home ─┬─→ Story viewer (overlay)
            ├─→ Criar publicação ─→ Criar story
            ├─→ Buscar ─→ Perfil (outro) / Grupo
            ├─→ Grupos ─→ Grupo (Publicações · Membros · Sobre)
            ├─→ Mensagens ─→ Chat
            ├─→ Notificações
            ├─→ Perfil ─┬─→ Editar perfil
            │           └─→ Configurações ─→ Sair (diálogo)
            └─→ Publicação ─┬─→ Comentários (sheet)
                            ├─→ Compartilhar (sheet)
                            ├─→ Menu da publicação (sheet)
                            └─→ Reações (sheet)
```

---

## Mapa: artboard → implementação

| Superfície | Status | Exports usados | Onde está |
|---|---|---|---|
| Login | FOUND | `Main.dc.html`, `Login-Desktop` | `src/screens/Auth.tsx` → `Login` |
| Cadastro | FOUND | `Cadastro-Mobile/Desktop` | `src/screens/Auth.tsx` → `Cadastro` |
| Home | FOUND | `Home-Mobile/Desktop` | `src/screens/Home.tsx` |
| Home — carregando | FOUND | `Home-Loading-Mobile/Desktop` | `Home.tsx` → `FeedCarregando` |
| Home — vazia | FOUND | `Home-Vazio-Mobile` | `Home.tsx` → `FeedVazio` |
| Home — erro | FOUND | `Home-Erro-Mobile` | `Home.tsx` → `FeedErro` |
| Buscar | FOUND | `Buscar-Mobile/Desktop` | `src/screens/Buscar.tsx` |
| Buscar — sem resultado | FOUND | `Buscar-Vazio-Mobile` | `Buscar.tsx` (estado `semResultado`) |
| Criar publicação | FOUND | `Criar-Mobile/Desktop` | `src/screens/Criar.tsx` → `Criar` |
| Criar story | FOUND | `Criar-Story-Mobile` | `Criar.tsx` → `CriarStory` |
| Grupos | FOUND | `Grupos-Mobile/Desktop` | `src/screens/Grupos.tsx` → `Grupos` |
| Grupo aberto | FOUND | `Grupo-Mobile/Desktop` | `Grupos.tsx` → `GrupoDetalhe` |
| Grupo — aba Membros | FOUND | `Grupo-Desktop` (lista `membros`) | `GrupoDetalhe` |
| Grupo — aba Sobre | PARTIAL | só o header tinha texto | `GrupoDetalhe` (descrição + regras criadas) |
| Mensagens | FOUND | `Mensagens-Mobile/Desktop` | `src/screens/Mensagens.tsx` → `Mensagens` |
| Mensagens — vazia | FOUND | `Mensagens-Vazio-Mobile` | `Mensagens.tsx` (lista vazia) |
| Chat | FOUND | `Chat-Mobile`, `Mensagens-Desktop` | `Mensagens.tsx` → `Chat` |
| Notificações | FOUND | `Notificacoes-Mobile/Desktop` | `src/screens/Diversos.tsx` → `Notificacoes` |
| Perfil (eu) | FOUND | `Perfil-Mobile/Desktop` | `src/screens/Perfil.tsx` → `Perfil` |
| Perfil (outro) | FOUND | `Perfil-Outro-Mobile` | `Perfil.tsx` (mesma tela, `params.userId`) |
| Perfil — aba Salvos | PARTIAL | só a aba existia | `Perfil.tsx` (grade + estado vazio criados) |
| Perfil — aba Grupos | PARTIAL | só a aba existia | `Perfil.tsx` (lista criada) |
| Perfil — aba Sobre | PARTIAL | só a aba existia | `Perfil.tsx` (blocos criados) |
| Editar perfil | FOUND | `Editar-Perfil-Mobile` | `Perfil.tsx` → `EditarPerfil` |
| Configurações | FOUND | `Configuracoes-Mobile/Desktop` | `Diversos.tsx` → `Configuracoes` |
| Publicação (detalhe) | FOUND | `Post-Detalhe-Mobile/Desktop` | `Diversos.tsx` → `PostDetalhe` |
| Comentários (sheet) | FOUND | `Comentarios-Mobile` | `src/sheets/index.tsx` → `Comentarios` |
| Compartilhar (sheet) | FOUND | `Compartilhar-Mobile` | `sheets/index.tsx` → `Compartilhar` |
| Menu da publicação (sheet) | FOUND | `Menu-Post-Mobile` | `sheets/index.tsx` → `MenuPost` |
| Reações (sheet) | FOUND | `Reacoes-Mobile` | `sheets/index.tsx` → `Reacoes` |
| Sair (diálogo) | FOUND | `Sair-Mobile` | `sheets/index.tsx` → `Sair` |
| Story viewer | FOUND | `Story-Viewer-Mobile/Desktop` | `sheets/index.tsx` → `StoryViewer` |

**Total:** 31 superfícies · 26 FOUND · 5 PARTIAL · 0 MISSING.
Nenhum artboard ficou de fora; as 43 arquivos são 31 superfícies × duas famílias
(mobile/desktop), unificadas em componentes responsivos únicos.

---

## Fluxos conectados (validados no browser)

1. Login → Home (com toast de boas-vindas)
2. Home → Story viewer → progresso automático → Escape → Home
3. Home → mídia do post → Publicação → Comentários (sheet) → comentar (5 → 6) → fechar
4. Criar → hashtags viram tags → Publicar → post aparece no topo do feed
5. Mensagens → Chat → enviar mensagem (entra na lista, hora real, input limpa) → voltar
6. Bottom nav (mobile) e rail (desktop) alcançam Início · Buscar · Criar · Mensagens · Grupos · Perfil
7. Buscar: digitar filtra pessoas, grupos e publicações ao vivo; chips de tipo e recentes
8. Perfil → abas Publicações/Salvos/Grupos/Sobre → Editar perfil → Salvar → volta
9. Configurações → trocar cor de destaque (muda `--accent` no app inteiro)
10. Configurações → estados do feed (normal / carregando / vazio / erro)
11. Sair (sheet) → volta para o Login

---

## Decisões de adaptação

**Imagens.** Os exports referenciam mídias por `/_blob/<id>` e só 9 dos ~24 blobs
vieram no pacote. Os 9 locais foram copiados para `musique-app/public/assets/`;
os que faltam foram mapeados, um a um, para fotos reais da Unsplash com o mesmo
assunto do `alt` original (`src/data/images.ts`). Toda `<Img>` tem `onError` que
cai num SVG embutido, então nada renderiza quebrado. Para trocar por imagens do
banco depois, basta mexer em `img()`.

**Altura e breakpoints.** Os artboards têm altura fixa (390×1700, 1440×1640…).
Isso foi descartado: o app usa `h-dvh`, colunas com rolagem própria, `safe-area-inset`
para notch/barra de gestos, e o breakpoint do produto (`dk` = 800px) separa a barra
inferior do rail lateral. Testado em 375×812 e 1440×900; a partir de 1280px entra
a terceira coluna (sugestões), como no `Home-Desktop`.

**Full-bleed.** Nada de card estreito centralizado: o conteúdo ocupa a largura do
device no mobile e usa `max-w-5xl/7xl` com rail fixo no desktop.

**Sheets.** Bottom sheet no mobile, diálogo centralizado no desktop; fecham no
backdrop e no Escape, travam o scroll do body enquanto abertos.

---

## O que ainda é mock

- Sem API, banco ou auth real: o estado vive em `src/app/store.tsx` e some no reload.
- Upload de foto/capa é simulado (a UI existe e dá feedback).
- Marcar pessoas, respostas aninhadas de comentário, criação de grupo, listas de
  seguidores/seguindo e compartilhamento externo mostram toast em vez de tela.
- As mensagens não têm resposta automática do outro lado.

A UI de todos esses pontos está ligada — nenhum botão das telas é inerte.
