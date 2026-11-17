import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { FormularioCategoria } from "@/components/formularios/formulario-categoria";
import { CabecalhoPagina } from "@/components/layout/cabecalho-pagina";
import { Carregando } from "@/components/layout/carregando";
import { CartaoFormulario } from "@/components/layout/cartao-formulario";
import { TelaErro } from "@/components/layout/tela-erro";
import { useSalvarCategoria } from "@/hooks/use-mutacoes-cardapio";
import { consultaCategoria } from "@/lib/api/cardapio-api";

export const Route = createFileRoute("/categorias/$categoriaId/editar")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Editar categoria — Sabor de Casa" },
      { name: "description", content: "Altere o nome e a descrição de uma categoria do cardápio." },
      { property: "og:title", content: "Editar categoria — Sabor de Casa" },
      {
        property: "og:description",
        content: "Altere o nome e a descrição de uma categoria do cardápio.",
      },
    ],
  }),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(consultaCategoria(params.categoriaId)),
  pendingComponent: Carregando,
  errorComponent: TelaErro,
  component: EditarCategoria,
});

function EditarCategoria() {
  const { categoriaId } = Route.useParams();
  const { data: categoria } = useSuspenseQuery(consultaCategoria(categoriaId));
  const salvar = useSalvarCategoria(categoriaId);

  return (
    <>
      <CabecalhoPagina sobretitulo="Editar categoria" titulo={categoria.nome} />
      <CartaoFormulario>
        <FormularioCategoria
          valoresIniciais={{ nome: categoria.nome, descricao: categoria.descricao ?? "" }}
          rotuloSalvar="Salvar alterações"
          salvando={salvar.isPending}
          aoSalvar={salvar.mutateAsync}
        />
      </CartaoFormulario>
    </>
  );
}
