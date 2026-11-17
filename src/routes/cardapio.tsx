import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Carregando } from "@/components/layout/carregando";
import { EstadoVazio } from "@/components/layout/estado-vazio";
import { TelaErro } from "@/components/layout/tela-erro";
import { consultaCardapio } from "@/lib/api/cardapio-api";
import { formatarPreco } from "@/lib/formatacao";
import imagemMarmitas from "@/assets/marmitas-sabor-de-casa.jpg";

export const Route = createFileRoute("/cardapio")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Cardápio de hoje — Sabor de Casa" },
      {
        name: "description",
        content:
          "Veja os pratos disponíveis hoje na marmitaria Sabor de Casa, com preços atualizados.",
      },
      { property: "og:title", content: "Cardápio de hoje — Sabor de Casa" },
      {
        property: "og:description",
        content:
          "Veja os pratos disponíveis hoje na marmitaria Sabor de Casa, com preços atualizados.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(consultaCardapio()),
  pendingComponent: Carregando,
  errorComponent: TelaErro,
  component: Cardapio,
});

function Cardapio() {
  const { data: secoes } = useSuspenseQuery(consultaCardapio());

  return (
    <article className="mx-auto max-w-3xl">
      <div className="relative mb-12 overflow-hidden rounded-3xl shadow-raised">
        <img
          src={imagemMarmitas}
          alt="Marmitas caseiras com arroz, feijão, farofa e carnes"
          className="h-64 w-full object-cover sm:h-80"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 to-transparent p-6 pt-20 text-ink-foreground sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-highlight">
            Cardápio de hoje
          </p>
          <h1 className="titulo-display text-4xl font-semibold sm:text-5xl">Sabor de Casa</h1>
          <p className="mt-1 text-sm opacity-90">Preços sempre atualizados pela própria cozinha.</p>
        </div>
      </div>

      {secoes.length === 0 ? (
        <EstadoVazio titulo="Cardápio em preparo" descricao="Nenhum prato disponível no momento." />
      ) : (
        <div className="space-y-12">
          {secoes.map(({ categoria, pratos }) => (
            <section key={categoria.id} aria-labelledby={`secao-${categoria.id}`}>
              <h2 id={`secao-${categoria.id}`} className="titulo-display text-3xl font-semibold">
                {categoria.nome}
              </h2>
              {categoria.descricao && (
                <p className="mt-1 text-muted-foreground">{categoria.descricao}</p>
              )}
              <ul className="mt-5 space-y-5">
                {pratos.map((prato) => (
                  <li key={prato.id}>
                    <div className="flex items-baseline gap-3">
                      <span className="font-semibold">{prato.nome}</span>
                      <span className="linha-pontilhada flex-1 self-center pt-3" aria-hidden />
                      <span className="titulo-display text-xl font-semibold text-primary">
                        {formatarPreco(prato.preco)}
                      </span>
                    </div>
                    {prato.descricao && (
                      <p className="text-sm text-muted-foreground">{prato.descricao}</p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </article>
  );
}
