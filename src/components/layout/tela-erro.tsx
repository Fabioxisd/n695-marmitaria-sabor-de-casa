import { Link, useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ErroApi, mensagemDeErro } from "@/lib/api/cliente-http";

/** Tela de erro das páginas que carregam dados do serviço Web. */
export function TelaErro({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  const naoEncontrado = error instanceof ErroApi && error.status === 404;

  return (
    <div className="mx-auto max-w-lg py-20 text-center">
      <h1 className="titulo-display text-4xl font-semibold">
        {naoEncontrado ? "Não encontramos isso" : "Não foi possível carregar"}
      </h1>
      <p className="mt-3 text-muted-foreground">{mensagemDeErro(error)}</p>
      <div className="mt-8 flex justify-center gap-3">
        {!naoEncontrado && (
          <Button
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            Tentar novamente
          </Button>
        )}
        <Button variant="outline" asChild>
          <Link to="/">Voltar às categorias</Link>
        </Button>
      </div>
    </div>
  );
}
