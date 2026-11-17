import { createFileRoute } from "@tanstack/react-router";
import { respostaJson, tratarRequisicao } from "@/server/http";
import { servicoPratos } from "@/server/servicos";

/** GET /api/cardapio — cardápio público com os pratos disponíveis, agrupados por categoria */
export const Route = createFileRoute("/api/cardapio")({
  server: {
    handlers: {
      GET: () => tratarRequisicao(async () => respostaJson(await servicoPratos.montarCardapio())),
    },
  },
});
