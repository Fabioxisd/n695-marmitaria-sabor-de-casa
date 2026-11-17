import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

interface CampoProps {
  id: string;
  rotulo: string;
  obrigatorio?: boolean | undefined;
  erro?: string | undefined;
  dica?: string | undefined;
  children: ReactNode;
}

/** Rótulo + controle + mensagem de erro, com ligação acessível entre eles. */
export function Campo({ id, rotulo, obrigatorio, erro, dica, children }: CampoProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-semibold">
        {rotulo}
        {obrigatorio && (
          <span className="ml-1 text-primary" aria-hidden>
            *
          </span>
        )}
      </Label>
      {children}
      {erro ? (
        <p id={`${id}-erro`} role="alert" className="text-sm font-medium text-destructive">
          {erro}
        </p>
      ) : (
        dica && <p className="text-xs text-muted-foreground">{dica}</p>
      )}
    </div>
  );
}

/** Props de acessibilidade/estilo comuns para inputs ligados a um Campo. */
export function propsDeErro(id: string, erro?: string | undefined) {
  return {
    id,
    "aria-invalid": erro ? true : undefined,
    "aria-describedby": erro ? `${id}-erro` : undefined,
    className: erro ? "border-destructive focus-visible:ring-destructive" : undefined,
  };
}
