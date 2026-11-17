import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { FormularioPrato } from "@/components/formularios/formulario-prato";
import { CabecalhoPagina } from "@/components/layout/cabecalho-pagina";
import { Carregando } from "@/components/layout/carregando";
import { CartaoFormulario } from "@/components/layout/cartao-formulario";
import { TelaErro } from "@/components/layout/tela-erro";
import { useSalvarPrato } from "@/hooks/use-mutacoes-cardapio";
import { consultaCategoria } from "@/lib/api/cardapio-api";

export const Route = createFileRoute("/categorias/$categoriaId/pratos/novo")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Novo prato — Sabor de Casa" },
      { name: "description", content: "Cadastre um novo prato em uma categoria do cardápio." },
      { property: "og:title", content: "Novo prato — Sabor de Casa" },
      {
        property: "og:description",
        content: "Cadastre um novo prato em uma categoria do cardápio.",
      },
    ],
  }),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(consultaCategoria(params.categoriaId)),
  pendingComponent: Carregando,
  errorComponent: TelaErro,
  component: NovoPrato,
});

function NovoPrato() {
  const { categoriaId } = Route.useParams();
  const { data: categoria } = useSuspenseQuery(consultaCategoria(categoriaId));
  const salvar = useSalvarPrato(categoriaId);

  return (
    <>
      <CabecalhoPagina sobretitulo={categoria.nome} titulo="Novo prato" />
      <CartaoFormulario>
        <FormularioPrato
          valoresIniciais={{ nome: "", descricao: "", preco: "", disponivel: true, categoriaId }}
          rotuloSalvar="Adicionar prato"
          salvando={salvar.isPending}
          aoSalvar={salvar.mutateAsync}
        />
      </CartaoFormulario>
    </>
  );
}
