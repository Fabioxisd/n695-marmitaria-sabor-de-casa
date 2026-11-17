import type { z } from "zod";
import { errosPorCampo } from "@/shared/dominio";
import { ErroAplicacao, entradaInvalida } from "./erros";

const FORMATO_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Valida dados de entrada com o schema do domínio; lança 422 com as mensagens por campo. */
export function validarEntrada<Schema extends z.ZodTypeAny>(
  schema: Schema,
  dados: unknown,
): z.infer<Schema> {
  const resultado = schema.safeParse(dados);
  if (!resultado.success) throw entradaInvalida(errosPorCampo(resultado.error));
  return resultado.data;
}

/** Garante que o identificador recebido na URL tem formato válido. */
export function validarId(id: string, recurso: string): string {
  if (!FORMATO_UUID.test(id)) {
    throw new ErroAplicacao(400, "ID_INVALIDO", `Identificador de ${recurso} inválido.`);
  }
  return id;
}
