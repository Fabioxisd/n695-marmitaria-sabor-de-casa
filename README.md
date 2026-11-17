# Sabor de Casa — Cardápio digital

Trabalho da disciplina **N695 — Desenvolvimento de Plataformas Web** (Unifor), **Cenário 3: Marmitaria com cardápio digital**.

Sistema Web para a marmitaria Sabor de Casa manter o cardápio organizado por categorias. Entidades: **Categoria** (1) → (N) **Prato**.

## Funcionalidades

- Lista, cadastro, edição e exclusão de categorias
- Lista de pratos de uma categoria, com cadastro, edição (inclusive troca de categoria) e exclusão
- Cardápio público com os pratos disponíveis (`/cardapio`)

## Regras validadas

| Regra do cenário | Onde é garantida |
| --- | --- |
| Campos obrigatórios | `src/shared/dominio.ts` (navegador e servidor) e `NOT NULL` no banco |
| Preço maior que zero | `src/shared/dominio.ts` e `CHECK (preco > 0)` no banco |
| Nome de categoria sem repetição | `src/server/servicos/servico-categorias.ts` e índice único no banco |
| Não excluir categoria com pratos | `src/server/servicos/servico-categorias.ts` e `ON DELETE RESTRICT` no banco |

## Serviço Web (API REST)

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/categorias` | Lista categorias (com total de pratos) |
| POST | `/api/categorias` | Cria categoria |
| GET | `/api/categorias/:id` | Busca uma categoria |
| PUT | `/api/categorias/:id` | Atualiza categoria |
| DELETE | `/api/categorias/:id` | Exclui categoria (409 se tiver pratos) |
| GET | `/api/categorias/:id/pratos` | Lista pratos da categoria |
| POST | `/api/categorias/:id/pratos` | Cria prato na categoria |
| GET | `/api/pratos/:id` | Busca um prato |
| PUT | `/api/pratos/:id` | Atualiza prato |
| DELETE | `/api/pratos/:id` | Exclui prato |
| GET | `/api/cardapio` | Cardápio público (pratos disponíveis por categoria) |

Erros seguem o formato `{ "erro": { "codigo", "mensagem", "campos" } }` com status 400, 404, 409, 422 ou 500.

## Arquitetura

```text
Interface (src/routes/*.tsx, src/components)  ──fetch──>  Serviço Web (src/routes/api)
                                                              │
                                                Regras (src/server/servicos)
                                                              │
                                              Dados (src/server/dados) ──> PostgreSQL
```

## Stack

TypeScript, React 19, TanStack Start/Router/Query, Tailwind CSS, Zod, PostgreSQL (Lovable Cloud), Vitest.

## Como rodar

```bash
bun install
bun run dev      # http://localhost:8080
bunx vitest run  # testes das regras do cenário
```

## Equipe

Raimundo Bezerra Baima Neto · Rômulo da Silva Barros · Fabio Evangelista Martins · Vitor Marden Almeida Nunes · Nayra Raquel da Silva Ferreira
