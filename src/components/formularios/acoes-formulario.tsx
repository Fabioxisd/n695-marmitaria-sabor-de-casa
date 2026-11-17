import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AcoesFormularioProps {
  salvando: boolean;
  rotuloSalvar: string;
  voltarPara: { to: "/" } | { to: "/categorias/$categoriaId"; params: { categoriaId: string } };
}

export function AcoesFormulario({ salvando, rotuloSalvar, voltarPara }: AcoesFormularioProps) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
      <Button variant="ghost" asChild>
        <Link {...voltarPara}>Cancelar</Link>
      </Button>
      <Button type="submit" disabled={salvando}>
        {salvando && <Loader2 className="animate-spin" />}
        {salvando ? "Salvando..." : rotuloSalvar}
      </Button>
    </div>
  );
}
