import type { ReactNode } from "react";

interface EstadoVazioProps {
  titulo: string;
  descricao: string;
  acao?: ReactNode | undefined;
}

export function EstadoVazio({ titulo, descricao, acao }: EstadoVazioProps) {
  return (
    <div className="rounded-2xl border border-dashed bg-card/60 px-6 py-14 text-center">
      <h2 className="titulo-display text-2xl font-semibold">{titulo}</h2>
      <p className="mx-auto mt-2 max-w-md text-muted-foreground">{descricao}</p>
      {acao && <div className="mt-6">{acao}</div>}
    </div>
  );
}
