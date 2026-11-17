import { createFileRoute } from "@tanstack/react-router";
import { FormularioCategoria } from "@/components/formularios/formulario-categoria";
import { CabecalhoPagina } from "@/components/layout/cabecalho-pagina";
import { CartaoFormulario } from "@/components/layout/cartao-formulario";
import { useSalvarCategoria } from "@/hooks/use-mutacoes-cardapio";

export const Route = createFileRoute("/categorias/nova")({
  head: () => ({
    meta: [
      { title: "Nova categoria — Sabor de Casa" },
      { name: "description", content: "Cadastre uma nova categoria no cardápio da Sabor de Casa." },
      { property: "og:title", content: "Nova categoria — Sabor de Casa" },
      {
        property: "og:description",
        content: "Cadastre uma nova categoria no cardápio da Sabor de Casa.",
      },
    ],
  }),
  component: NovaCategoria,
});

function NovaCategoria() {
  const salvar = useSalvarCategoria();
  return (
    <>
      <CabecalhoPagina sobretitulo="Categorias" titulo="Nova categoria" />
      <CartaoFormulario>
        <FormularioCategoria
          rotuloSalvar="Criar categoria"
          salvando={salvar.isPending}
          aoSalvar={salvar.mutateAsync}
        />
      </CartaoFormulario>
    </>
  );
}
