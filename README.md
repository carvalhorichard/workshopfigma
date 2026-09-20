# Musique

Rede social para quem toca, grava e ouve música junto. Feed, stories, grupos,
mensagens e perfis — mobile-first, com layout próprio a partir de 800px.

React 19 · TypeScript · Vite 7 · Tailwind CSS v4 · Supabase (Postgres 17)

---

## Estrutura

```
.
├── musique-app/        aplicação React (é aqui que se trabalha)
│   ├── src/
│   │   ├── app/        estado global e navegação
│   │   ├── lib/        client do Supabase e camada de dados
│   │   ├── components/ primitivas de UI, layout e componentes de domínio
│   │   ├── screens/    as telas
│   │   ├── sheets/     modais e overlays
│   │   └── data/       tipos e constantes de interface
│   └── .env.example    modelo das variáveis de ambiente
│
├── design/             material de referência (não entra no build)
│   ├── screens/        43 artboards exportados do Claude Design
│   ├── assets/         imagens que vieram no export
│   ├── vendor/         runtime usado pelos artboards
│   └── README.md       instruções do exportador
│
└── docs/
    ├── DATABASE.md     schema, RLS, funções e o que foi verificado
    └── STITCH-MAP.md   de qual artboard veio cada tela
```

---

## Rodando local

Requisitos: Node.js 20+ e uma conta no Supabase.

```bash
cd musique-app
npm install
cp .env.example .env
```

Preencha o `.env` com a URL e a chave publicável do seu projeto
(Supabase › Project Settings › API Keys), e então:

```bash
npm run dev
```

O app sobe em http://localhost:5173.

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | verificação de tipos + build de produção |
| `npm run preview` | serve o build local |
| `npm run lint` | só a verificação de tipos |

---

## Banco de dados

O schema vive em migrações versionadas no Supabase: 26 tabelas, RLS ligado em
todas, mais de 30 funções e um bucket de Storage para as imagens.
Detalhes, decisões de modelagem e os testes de segurança estão em
[docs/DATABASE.md](docs/DATABASE.md).

Pontos que importam:

- A autenticação é do Supabase Auth. `public.users.id` referencia `auth.users(id)`,
  e um gatilho cria perfil, preferências e configurações a cada cadastro.
- Toda leitura e escrita passa por RLS com o JWT de quem está logado.
- Uploads vão para o bucket `media`, cada pessoa restrita à própria pasta.

---

## Variáveis de ambiente

Só valores públicos usam o prefixo `VITE_` — no Vite eles são compilados para
dentro do JavaScript entregue ao navegador.

```
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_ANON_KEY
VITE_SUPABASE_PROJECT_REF
```

A chave `service_role` **nunca** pode receber o prefixo `VITE_`: ela ignora todo
o RLS e, num bundle público, entregaria o banco inteiro. Se precisar dela em
alguma rota de servidor, cadastre direto no painel de deploy.

O `.env` não é versionado. Para o deploy, cadastre as mesmas variáveis em
Settings › Environment Variables.

---

## Sobre a pasta `design/`

Os 43 arquivos `.dc.html` são os artboards originais, mantidos como referência
visual — valores de cor, espaçamento e tipografia saíram dali. Eles não fazem
parte do build e não são servidos pelo app.
