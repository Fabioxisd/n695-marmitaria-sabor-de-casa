import type { Categoria, CategoriaEntrada } from "@/shared/dominio";
import { obterBanco, traduzirErroBanco } from "./banco";
import type { RepositorioCategorias } from "./repositorios";

const COLUNAS = "id, nome, descricao, created_at, updated_at, pratos(count)";

interface LinhaCategoria {
  id: string;
  nome: string;
  descricao: string | null;
  created_at: string;
  updated_at: string;
  pratos: { count: number }[];
}

function paraCategoria(linha: LinhaCategoria): Categoria {
  return {
    id: linha.id,
    nome: linha.nome,
    descricao: linha.descricao,
    totalPratos: linha.pratos[0]?.count ?? 0,
    criadoEm: linha.created_at,
    atualizadoEm: linha.updated_at,
  };
}

export const repositorioCategorias: RepositorioCategorias = {
  async listar() {
    const banco = await obterBanco();
    const { data, error } = await banco.from("categorias").select(COLUNAS).order("nome");
    if (error) traduzirErroBanco(error);
    return (data as LinhaCategoria[]).map(paraCategoria);
  },

  async buscarPorId(id) {
    const banco = await obterBanco();
    const { data, error } = await banco
      .from("categorias")
      .select(COLUNAS)
      .eq("id", id)
      .maybeSingle();
    if (error) traduzirErroBanco(error);
    return data ? paraCategoria(data as LinhaCategoria) : null;
  },

  async criar(dados: CategoriaEntrada) {
    const banco = await obterBanco();
    const { data, error } = await banco.from("categorias").insert(dados).select(COLUNAS).single();
    if (error) traduzirErroBanco(error);
    return paraCategoria(data as LinhaCategoria);
  },

  async atualizar(id, dados) {
    const banco = await obterBanco();
    const { data, error } = await banco
      .from("categorias")
      .update(dados)
      .eq("id", id)
      .select(COLUNAS)
      .single();
    if (error) traduzirErroBanco(error);
    return paraCategoria(data as LinhaCategoria);
  },

  async excluir(id) {
    const banco = await obterBanco();
    const { error } = await banco.from("categorias").delete().eq("id", id);
    if (error) traduzirErroBanco(error);
  },
};
