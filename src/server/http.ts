import type { CorpoErro } from "@/shared/dominio";
import { ErroAplicacao } from "./erros";

export function respostaJson(dados: unknown, status = 200): Response {
  return Response.json(dados, { status });
}

function respostaErro(erro: ErroAplicacao): Response {
  const corpo: CorpoErro = {
    erro: { codigo: erro.codigo, mensagem: erro.message, campos: erro.campos },
  };
  return respostaJson(corpo, erro.status);
}

/** Lê o corpo JSON da requisição; lança 400 quando ele não é um JSON válido. */
export async function lerCorpoJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ErroAplicacao(
      400,
      "CORPO_INVALIDO",
      "O corpo da requisição deve ser um JSON válido.",
    );
  }
}

/**
 * Executa a ação de um endpoint e converte qualquer erro em uma resposta JSON padronizada.
 * Erros inesperados viram 500 sem expor detalhes internos ao usuário.
 */
export async function tratarRequisicao(acao: () => Promise<Response>): Promise<Response> {
  try {
    return await acao();
  } catch (erro) {
    if (erro instanceof ErroAplicacao) return respostaErro(erro);
    console.error("[API] Erro inesperado:", erro);
    return respostaErro(
      new ErroAplicacao(
        500,
        "ERRO_INTERNO",
        "Não foi possível concluir a operação. Tente novamente.",
      ),
    );
  }
}
