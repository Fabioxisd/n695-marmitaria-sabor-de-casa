<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Arquitetura do projeto (Sabor de Casa — N695)

- Camadas: interface (`src/routes/*.tsx`, `src/components`) → serviço Web REST (`src/routes/api/*`) → serviços de regra (`src/server/servicos`) → repositórios (`src/server/dados`). A interface só fala com o banco através de `/api`, porque o trabalho exige uma interface consumindo serviço próprio.
- Schemas Zod em `src/shared/dominio.ts` são a única fonte das regras de validação, usados no navegador e no servidor, para não duplicar regras.
- Serviços recebem repositórios por parâmetro (`criarServico*`), para que as regras sejam testadas com repositórios em memória em `src/test`.
- Tabelas têm RLS ligado sem políticas públicas; só o servidor acessa o banco (cliente admin carregado dentro dos repositórios), para que nenhuma escrita escape da validação da API.
- Rotas de tela que buscam dados usam `ssr: false` + loader com `ensureQueryData`, porque as consultas usam URLs relativas de `/api` que só existem no navegador.
- Erros da API seguem o formato `{ erro: { codigo, mensagem, campos? } }` (`src/server/http.ts`), que a interface converte em mensagens por campo ou avisos.
