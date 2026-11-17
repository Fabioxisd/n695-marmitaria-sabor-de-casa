import { createFileRoute } from "@tanstack/react-router";
import { lerCorpoJson, respostaJson, tratarRequisicao } from "@/server/http";
import { servicoCategorias } from "@/server/servicos";
import { validarId } from "@/server/validacao";

/** GET, PUT e DELETE /api/categorias/:id */
export const Route = createFileRoute("/api/categorias/$id")({
  server: {
    handlers: {
      GET: ({ params }) =>
        tratarRequisicao(async () =>
          respostaJson(await servicoCategorias.obter(validarId(params.id, "categoria"))),
        ),
      PUT: ({ params, request }) =>
        tratarRequisicao(async () => {
          const id = validarId(params.id, "categoria");
          return respostaJson(await servicoCategorias.atualizar(id, await lerCorpoJson(request)));
        }),
      DELETE: ({ params }) =>
        tratarRequisicao(async () => {
          await servicoCategorias.excluir(validarId(params.id, "categoria"));
          return respostaJson({ mensagem: "Categoria excluída com sucesso." });
        }),
    },
  },
});
