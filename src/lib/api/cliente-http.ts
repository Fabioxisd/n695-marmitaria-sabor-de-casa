import type { CorpoErro } from "@/shared/dominio";

/** Erro devolvido pelo serviço Web, com a mensagem pronta para mostrar ao usuário. */
export class ErroApi extends Error {
  constructor(
    readonly status: number,
    readonly codigo: string,
    mensagem: string,
    readonly campos: Record<string, string> = {},
  ) {
    super(mensagem);
    this.name = "ErroApi";
  }
}

type Metodo = "GET" | "POST" | "PUT" | "DELETE";

function ehCorpoErro(corpo: unknown): corpo is CorpoErro {
  return typeof corpo === "object" && corpo !== null && "erro" in corpo;
}

/** Faz uma requisição JSON ao serviço Web e converte falhas em ErroApi. */
export async function requisitar<T>(
  caminho: string,
  metodo: Metodo = "GET",
  corpo?: unknown,
): Promise<T> {
  let resposta: Response;
  try {
    const opcoes: RequestInit = { method: metodo };
    if (corpo !== undefined) {
      opcoes.headers = { "Content-Type": "application/json" };
      opcoes.body = JSON.stringify(corpo);
    }
    resposta = await fetch(caminho, opcoes);
  } catch {
    throw new ErroApi(0, "SEM_CONEXAO", "Sem conexão com o servidor. Verifique sua internet.");
  }

  const dados: unknown = await resposta.json().catch(() => null);
  if (resposta.ok) return dados as T;

  if (ehCorpoErro(dados)) {
    const { codigo, mensagem, campos } = dados.erro;
    throw new ErroApi(resposta.status, codigo, mensagem, campos);
  }
  throw new ErroApi(resposta.status, "ERRO_DESCONHECIDO", "Algo deu errado. Tente novamente.");
}

export function mensagemDeErro(erro: unknown): string {
  return erro instanceof Error ? erro.message : "Algo deu errado. Tente novamente.";
}
