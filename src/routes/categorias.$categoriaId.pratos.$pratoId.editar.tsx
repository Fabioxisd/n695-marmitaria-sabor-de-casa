import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { FormularioPrato } from "@/components/formularios/formulario-prato";
import { CabecalhoPagina } from "@/components/layout/cabecalho-pagina";
import { Carregando } from "@/components/layout/carregando";
import { CartaoFormulario } from "@/components/layout/cartao-formulario";
import { TelaErro } from "@/components/layout/tela-erro";
import { useSalvarPrato } from "@/hooks/use-mutacoes-cardapio";
import { consultaCategorias, consultaPrato } from "@/lib/api/cardapio-api";
import { precoParaCampo } from "@/lib/formatacao";

export const Route = createFileRoute("/categorias/$categoriaId/pratos/$pratoId/editar")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Editar prato — Sabor de Casa" },
      {
        name: "description",
        content: "Altere nome, preço, disponibilidade ou categoria de um prato.",
      },
      { property: "og:title", content: "Editar prato — Sabor de Casa" },
      {
        property: "og:description",
        content: "Altere nome, preço, disponibilidade ou categoria de um prato.",
      },
    ],
  }),
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(consultaPrato(params.pratoId)),
      context.queryClient.ensureQueryData(consultaCategorias()),
    ]),
  pendingComponent: Carregando,
  errorComponent: TelaErro,
  component: EditarPrato,
});

function EditarPrato() {
  const { categoriaId, pratoId } = Route.useParams();
  const { data: prato } = useSuspenseQuery(consultaPrato(pratoId));
  const { data: categorias } = useSuspenseQuery(consultaCategorias());
  const salvar = useSalvarPrato(categoriaId, pratoId);

  return (
    <>
      <CabecalhoPagina sobretitulo="Editar prato" titulo={prato.nome} />
      <CartaoFormulario>
        <FormularioPrato
          valoresIniciais={{
            nome: prato.nome,
            descricao: prato.descricao ?? "",
            preco: precoParaCampo(prato.preco),
            disponivel: prato.disponivel,
            categoriaId: prato.categoriaId,
          }}
          categorias={categorias}
          rotuloSalvar="Salvar alterações"
          salvando={salvar.isPending}
          aoSalvar={salvar.mutateAsync}
        />
      </CartaoFormulario>
    </>
  );
}
