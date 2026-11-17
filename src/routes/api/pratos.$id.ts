import { createFileRoute } from "@tanstack/react-router";
import { lerCorpoJson, respostaJson, tratarRequisicao } from "@/server/http";
import { servicoPratos } from "@/server/servicos";
import { validarId } from "@/server/validacao";

/** GET, PUT e DELETE /api/pratos/:id */
export const Route = createFileRoute("/api/pratos/$id")({
  server: {
    handlers: {
      GET: ({ params }) =>
        tratarRequisicao(async () =>
          respostaJson(await servicoPratos.obter(validarId(params.id, "prato"))),
        ),
      PUT: ({ params, request }) =>
        tratarRequisicao(async () => {
          const id = validarId(params.id, "prato");
          return respostaJson(await servicoPratos.atualizar(id, await lerCorpoJson(request)));
        }),
      DELETE: ({ params }) =>
        tratarRequisicao(async () => {
          await servicoPratos.excluir(validarId(params.id, "prato"));
          return respostaJson({ mensagem: "Prato excluído com sucesso." });
        }),
    },
  },
});
