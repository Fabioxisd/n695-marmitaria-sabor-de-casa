import { useState } from "react";
import type { z } from "zod";
import { errosPorCampo } from "@/shared/dominio";
import { ErroApi } from "@/lib/api/cliente-http";

export type ErrosDoFormulario<Valores> = Partial<Record<keyof Valores, string>>;

/**
 * Estado de formulário com validação pelo mesmo schema usado no servidor.
 * Reaproveitado pelos formulários de categoria e de prato.
 */
export function useFormulario<Valores extends Record<string, unknown>, Schema extends z.ZodTypeAny>(
  schema: Schema,
  valoresIniciais: Valores,
) {
  const [valores, setValores] = useState<Valores>(valoresIniciais);
  const [erros, setErros] = useState<ErrosDoFormulario<Valores>>({});

  function alterar<Campo extends keyof Valores>(campo: Campo, valor: Valores[Campo]) {
    setValores((atuais) => ({ ...atuais, [campo]: valor }));
    setErros((atuais) => {
      const restantes = { ...atuais };
      delete restantes[campo];
      return restantes;
    });
  }

  /** Retorna os dados validados ou null (e mostra os erros nos campos). */
  function validar(): z.infer<Schema> | null {
    const resultado = schema.safeParse(valores);
    if (resultado.success) return resultado.data;
    setErros(errosPorCampo(resultado.error) as ErrosDoFormulario<Valores>);
    return null;
  }

  /** Mostra nos campos os erros devolvidos pelo serviço Web. Retorna true se havia erros de campo. */
  function aplicarErrosDoServidor(erro: unknown): boolean {
    if (erro instanceof ErroApi && Object.keys(erro.campos).length > 0) {
      setErros(erro.campos as ErrosDoFormulario<Valores>);
      return true;
    }
    return false;
  }

  return { valores, erros, alterar, validar, aplicarErrosDoServidor };
}
