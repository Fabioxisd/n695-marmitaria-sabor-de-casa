/** Erro de aplicação com status HTTP e código legível pela interface. */
export class ErroAplicacao extends Error {
  constructor(
    readonly status: number,
    readonly codigo: string,
    mensagem: string,
    readonly campos?: Record<string, string> | undefined,
  ) {
    super(mensagem);
    this.name = "ErroAplicacao";
  }
}

export const naoEncontrado = (recurso: string) =>
  new ErroAplicacao(404, "NAO_ENCONTRADO", `${recurso} não encontrado(a).`);

export const conflito = (codigo: string, mensagem: string, campos?: Record<string, string>) =>
  new ErroAplicacao(409, codigo, mensagem, campos);

export const entradaInvalida = (campos: Record<string, string>) =>
  new ErroAplicacao(422, "VALIDACAO", "Alguns campos precisam ser corrigidos.", campos);
