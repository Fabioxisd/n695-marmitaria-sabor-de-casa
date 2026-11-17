/**
 * Domínio compartilhado entre a interface e o serviço Web.
 * As mesmas regras de validação rodam no navegador (feedback imediato)
 * e no servidor (garantia), evitando código duplicado.
 */
import { z } from "zod";

export const LIMITES = {
  nomeCategoria: 60,
  descricaoCategoria: 200,
  nomePrato: 80,
  descricaoPrato: 300,
  precoMaximo: 9999.99,
} as const;

export interface Categoria {
  id: string;
  nome: string;
  descricao: string | null;
  totalPratos: number;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Prato {
  id: string;
  categoriaId: string;
  nome: string;
  descricao: string | null;
  preco: number;
  disponivel: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface SecaoCardapio {
  categoria: Pick<Categoria, "id" | "nome" | "descricao">;
  pratos: Prato[];
}

/** Formato padrão de erro devolvido pelo serviço Web. */
export interface CorpoErro {
  erro: {
    codigo: string;
    mensagem: string;
    campos?: Record<string, string> | undefined;
  };
}

const textoObrigatorio = (mensagem: string, maximo: number) =>
  z
    .string({ required_error: mensagem, invalid_type_error: mensagem })
    .trim()
    .min(1, mensagem)
    .max(maximo, `Use no máximo ${maximo} caracteres.`);

const textoOpcional = (maximo: number) =>
  z
    .string()
    .trim()
    .max(maximo, `Use no máximo ${maximo} caracteres.`)
    .nullish()
    .transform((valor) => (valor ? valor : null));

/** Aceita número ou texto ("19,90" ou "19.90") e converte para número. */
function converterPreco(valor: unknown): unknown {
  if (valor === "" || valor === null || valor === undefined) return undefined;
  if (typeof valor !== "string") return valor;
  const numero = Number(valor.trim().replace(",", "."));
  return Number.isNaN(numero) ? valor : numero;
}

const precoSchema = z.preprocess(
  converterPreco,
  z
    .number({
      required_error: "Informe o preço do prato.",
      invalid_type_error: "Informe um preço válido, por exemplo 19,90.",
    })
    .gt(0, "O preço deve ser maior que zero.")
    .max(LIMITES.precoMaximo, "O preço deve ser no máximo R$ 9.999,99."),
);

export const categoriaSchema = z.object({
  nome: textoObrigatorio("Informe o nome da categoria.", LIMITES.nomeCategoria),
  descricao: textoOpcional(LIMITES.descricaoCategoria),
});

export const pratoSchema = z.object({
  nome: textoObrigatorio("Informe o nome do prato.", LIMITES.nomePrato),
  descricao: textoOpcional(LIMITES.descricaoPrato),
  preco: precoSchema,
  disponivel: z
    .boolean({ invalid_type_error: "Informe se o prato está disponível." })
    .default(true),
});

/** Na edição, o prato também pode ser movido para outra categoria. */
export const pratoEdicaoSchema = pratoSchema.extend({
  categoriaId: z.string().uuid("Escolha uma categoria válida.").optional(),
});

export type CategoriaEntrada = z.infer<typeof categoriaSchema>;
export type PratoEntrada = z.infer<typeof pratoSchema>;
export type PratoEdicao = z.infer<typeof pratoEdicaoSchema>;

/** Converte os erros do Zod em { campo: mensagem }, mantendo a primeira mensagem de cada campo. */
export function errosPorCampo(erro: z.ZodError): Record<string, string> {
  const campos: Record<string, string> = {};
  for (const problema of erro.issues) {
    const campo = problema.path.join(".") || "geral";
    campos[campo] ??= problema.message;
  }
  return campos;
}

/** Compara nomes ignorando maiúsculas, acentos e espaços extras. */
export function normalizarNome(nome: string): string {
  return nome
    .trim()
    .replace(/\s+/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
