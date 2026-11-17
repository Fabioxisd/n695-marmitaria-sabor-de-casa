import { createFileRoute } from "@tanstack/react-router";
import { lerCorpoJson, respostaJson, tratarRequisicao } from "@/server/http";
import { servicoCategorias } from "@/server/servicos";

/** GET /api/categorias — lista · POST /api/categorias — cria */
export const Route = createFileRoute("/api/categorias")({
  server: {
    handlers: {
      GET: () => tratarRequisicao(async () => respostaJson(await servicoCategorias.listar())),
      POST: ({ request }) =>
        tratarRequisicao(async () => {
          const categoria = await servicoCategorias.criar(await lerCorpoJson(request));
          return respostaJson(categoria, 201);
        }),
    },
  },
});
