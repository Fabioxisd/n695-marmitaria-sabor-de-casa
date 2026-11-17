import type { ReactNode } from "react";

interface CabecalhoPaginaProps {
  sobretitulo?: ReactNode | undefined;
  titulo: string;
  descricao?: ReactNode | undefined;
  acoes?: ReactNode | undefined;
}

export function CabecalhoPagina({ sobretitulo, titulo, descricao, acoes }: CabecalhoPaginaProps) {
  return (
    <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl space-y-2">
        {sobretitulo && (
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            {sobretitulo}
          </div>
        )}
        <h1 className="titulo-display text-4xl font-semibold leading-tight sm:text-5xl">
          {titulo}
        </h1>
        {descricao && <p className="text-base text-muted-foreground">{descricao}</p>}
      </div>
      {acoes && <div className="flex shrink-0 flex-wrap gap-3">{acoes}</div>}
    </header>
  );
}
