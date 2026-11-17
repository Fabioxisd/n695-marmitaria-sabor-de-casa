import { conflito, ErroAplicacao } from "../erros";

/** Carrega o cliente do banco apenas no servidor, no momento do uso. */
export async function obterBanco() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

interface ErroBanco {
  code?: string;
  message: string;
}

/** Traduz erros do PostgreSQL em erros de aplicação com mensagens claras. */
export function traduzirErroBanco(erro: ErroBanco): never {
  if (erro.code === "23505") {
    throw conflito("NOME_DUPLICADO", "Já existe uma categoria com esse nome.", {
      nome: "Já existe uma categoria com esse nome.",
    });
  }
  if (erro.code === "23503") {
    throw conflito(
      "REGISTRO_RELACIONADO",
      "O registro possui dados relacionados e não pode ser alterado.",
    );
  }
  if (erro.code === "23514") {
    throw new ErroAplicacao(
      422,
      "VALIDACAO",
      "Os dados enviados não respeitam as regras do cardápio.",
    );
  }
  console.error("[Banco] Erro:", erro);
  throw new ErroAplicacao(500, "ERRO_BANCO", "Não foi possível acessar os dados. Tente novamente.");
}
