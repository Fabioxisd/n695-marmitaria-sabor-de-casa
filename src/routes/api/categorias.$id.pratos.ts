import { createFileRoute } from "@tanstack/react-router";
import { lerCorpoJson, respostaJson, tratarRequisicao } from "@/server/http";
import { servicoPratos } from "@/server/servicos";
import { validarId } from "@/server/validacao";

/** GET /api/categorias/:id/pratos — lista · POST — cria prato na categoria */
export const Route = createFileRoute("/api/categorias/$id/pratos")({
  server: {
    handlers: {
      GET: ({ params }) =>
        tratarRequisicao(async () =>
          respostaJson(await servicoPratos.listarPorCategoria(validarId(params.id, "categoria"))),
        ),
      POST: ({ params, request }) =>
        tratarRequisicao(async () => {
          const categoriaId = validarId(params.id, "categoria");
          const prato = await servicoPratos.criar(categoriaId, await lerCorpoJson(request));
          return respostaJson(prato, 201);
        }),
    },
  },
});
