import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import { ConfirmarExclusao } from "@/components/confirmar-exclusao";
import { CabecalhoPagina } from "@/components/layout/cabecalho-pagina";
import { Carregando } from "@/components/layout/carregando";
import { EstadoVazio } from "@/components/layout/estado-vazio";
import { TelaErro } from "@/components/layout/tela-erro";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useExcluirPrato } from "@/hooks/use-mutacoes-cardapio";
import { consultaCategoria, consultaPratosDaCategoria } from "@/lib/api/cardapio-api";
import { formatarPreco } from "@/lib/formatacao";
import type { Prato } from "@/shared/dominio";

export const Route = createFileRoute("/categorias/$categoriaId/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Pratos da categoria — Sabor de Casa" },
      {
        name: "description",
        content: "Veja, cadastre e edite os pratos de uma categoria do cardápio.",
      },
      { property: "og:title", content: "Pratos da categoria — Sabor de Casa" },
      {
        property: "og:description",
        content: "Veja, cadastre e edite os pratos de uma categoria do cardápio.",
      },
    ],
  }),
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(consultaCategoria(params.categoriaId)),
      context.queryClient.ensureQueryData(consultaPratosDaCategoria(params.categoriaId)),
    ]),
  pendingComponent: Carregando,
  errorComponent: TelaErro,
  component: PratosDaCategoria,
});

function PratosDaCategoria() {
  const { categoriaId } = Route.useParams();
  const { data: categoria } = useSuspenseQuery(consultaCategoria(categoriaId));
  const { data: pratos } = useSuspenseQuery(consultaPratosDaCategoria(categoriaId));

  const botaoNovo = (
    <Button asChild>
      <Link to="/categorias/$categoriaId/pratos/novo" params={{ categoriaId }}>
        <Plus /> Novo prato
      </Link>
    </Button>
  );

  return (
    <>
      <Button variant="link" asChild className="mb-4">
        <Link to="/">
          <ArrowLeft /> Todas as categorias
        </Link>
      </Button>
      <CabecalhoPagina
        sobretitulo="Pratos da categoria"
        titulo={categoria.nome}
        descricao={categoria.descricao}
        acoes={
          <>
            <Button variant="outline" asChild>
              <Link to="/categorias/$categoriaId/editar" params={{ categoriaId }}>
                <Pencil /> Editar categoria
              </Link>
            </Button>
            {botaoNovo}
          </>
        }
      />
      {pratos.length === 0 ? (
        <EstadoVazio
          titulo="Nenhum prato nesta categoria"
          descricao="Adicione o primeiro prato para ele aparecer no cardápio."
          acao={botaoNovo}
        />
      ) : (
        <ul className="divide-y rounded-2xl border bg-card shadow-card">
          {pratos.map((prato) => (
            <LinhaPrato key={prato.id} prato={prato} />
          ))}
        </ul>
      )}
    </>
  );
}

function LinhaPrato({ prato }: { prato: Prato }) {
  const excluir = useExcluirPrato();

  return (
    <li className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold">{prato.nome}</h2>
          <Badge variant={prato.disponivel ? "sucesso" : "inativo"}>
            {prato.disponivel ? "Disponível" : "Indisponível"}
          </Badge>
        </div>
        {prato.descricao && <p className="mt-1 text-sm text-muted-foreground">{prato.descricao}</p>}
      </div>
      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <span className="titulo-display text-2xl font-semibold text-primary">
          {formatarPreco(prato.preco)}
        </span>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" asChild aria-label={`Editar ${prato.nome}`}>
            <Link
              to="/categorias/$categoriaId/pratos/$pratoId/editar"
              params={{ categoriaId: prato.categoriaId, pratoId: prato.id }}
            >
              <Pencil />
            </Link>
          </Button>
          <ConfirmarExclusao
            rotuloAcessivel={`Excluir ${prato.nome}`}
            titulo={`Excluir "${prato.nome}"?`}
            descricao="O prato sai do cardápio e do cadastro. Essa ação não pode ser desfeita."
            aoConfirmar={() => excluir.mutate(prato.id)}
          />
        </div>
      </div>
    </li>
  );
}
