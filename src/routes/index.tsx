import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Pencil, Plus } from "lucide-react";
import { ConfirmarExclusao } from "@/components/confirmar-exclusao";
import { Carregando } from "@/components/layout/carregando";
import { CabecalhoPagina } from "@/components/layout/cabecalho-pagina";
import { EstadoVazio } from "@/components/layout/estado-vazio";
import { TelaErro } from "@/components/layout/tela-erro";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useExcluirCategoria } from "@/hooks/use-mutacoes-cardapio";
import { consultaCategorias } from "@/lib/api/cardapio-api";
import { contarPratos } from "@/lib/formatacao";
import type { Categoria } from "@/shared/dominio";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Categorias do cardápio — Sabor de Casa" },
      {
        name: "description",
        content: "Gerencie as categorias do cardápio da marmitaria Sabor de Casa.",
      },
      { property: "og:title", content: "Categorias do cardápio — Sabor de Casa" },
      {
        property: "og:description",
        content: "Gerencie as categorias do cardápio da marmitaria Sabor de Casa.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(consultaCategorias()),
  pendingComponent: Carregando,
  errorComponent: TelaErro,
  component: ListaCategorias,
});

function ListaCategorias() {
  const { data: categorias } = useSuspenseQuery(consultaCategorias());
  const botaoNova = (
    <Button asChild>
      <Link to="/categorias/nova">
        <Plus /> Nova categoria
      </Link>
    </Button>
  );

  return (
    <>
      <CabecalhoPagina
        sobretitulo="Cardápio organizado"
        titulo="Categorias"
        descricao="Cada categoria reúne os pratos do cardápio. Toque em uma categoria para ver e editar os pratos dela."
        acoes={botaoNova}
      />
      {categorias.length === 0 ? (
        <EstadoVazio
          titulo="Nenhuma categoria ainda"
          descricao="Comece criando uma categoria, como “Marmitas Tradicionais” ou “Bebidas”."
          acao={botaoNova}
        />
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2">
          {categorias.map((categoria) => (
            <CartaoCategoria key={categoria.id} categoria={categoria} />
          ))}
        </ul>
      )}
    </>
  );
}

function CartaoCategoria({ categoria }: { categoria: Categoria }) {
  const excluir = useExcluirCategoria();

  return (
    <li className="group flex flex-col rounded-2xl border bg-card p-6 shadow-card transition-shadow hover:shadow-raised">
      <div className="flex items-start justify-between gap-3">
        <h2 className="titulo-display text-2xl font-semibold">{categoria.nome}</h2>
        <Badge variant={categoria.totalPratos > 0 ? "destaque" : "inativo"}>
          {contarPratos(categoria.totalPratos)}
        </Badge>
      </div>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">
        {categoria.descricao || "Sem descrição."}
      </p>
      <div className="mt-6 flex items-center justify-between gap-2 border-t pt-4">
        <Button variant="link" asChild>
          <Link to="/categorias/$categoriaId" params={{ categoriaId: categoria.id }}>
            Ver pratos <ArrowRight />
          </Link>
        </Button>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" asChild aria-label={`Editar ${categoria.nome}`}>
            <Link to="/categorias/$categoriaId/editar" params={{ categoriaId: categoria.id }}>
              <Pencil />
            </Link>
          </Button>
          <ConfirmarExclusao
            rotuloAcessivel={`Excluir ${categoria.nome}`}
            titulo={`Excluir a categoria "${categoria.nome}"?`}
            descricao="Só é possível excluir categorias sem pratos. Essa ação não pode ser desfeita."
            aoConfirmar={() => excluir.mutate(categoria.id)}
          />
        </div>
      </div>
    </li>
  );
}
