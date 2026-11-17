import type { Prato, PratoEdicao, PratoEntrada } from "@/shared/dominio";
import { obterBanco, traduzirErroBanco } from "./banco";
import type { RepositorioPratos } from "./repositorios";

const COLUNAS = "id, categoria_id, nome, descricao, preco, disponivel, created_at, updated_at";

interface LinhaPrato {
  id: string;
  categoria_id: string;
  nome: string;
  descricao: string | null;
  preco: number | string;
  disponivel: boolean;
  created_at: string;
  updated_at: string;
}

function paraPrato(linha: LinhaPrato): Prato {
  return {
    id: linha.id,
    categoriaId: linha.categoria_id,
    nome: linha.nome,
    descricao: linha.descricao,
    preco: Number(linha.preco),
    disponivel: linha.disponivel,
    criadoEm: linha.created_at,
    atualizadoEm: linha.updated_at,
  };
}

function paraLinha(dados: PratoEntrada | PratoEdicao) {
  return {
    nome: dados.nome,
    descricao: dados.descricao,
    preco: dados.preco,
    disponivel: dados.disponivel,
    ...("categoriaId" in dados && dados.categoriaId ? { categoria_id: dados.categoriaId } : {}),
  };
}

export const repositorioPratos: RepositorioPratos = {
  async listarPorCategoria(categoriaId) {
    const banco = await obterBanco();
    const { data, error } = await banco
      .from("pratos")
      .select(COLUNAS)
      .eq("categoria_id", categoriaId)
      .order("nome");
    if (error) traduzirErroBanco(error);
    return (data as LinhaPrato[]).map(paraPrato);
  },

  async listarDisponiveis() {
    const banco = await obterBanco();
    const { data, error } = await banco
      .from("pratos")
      .select(COLUNAS)
      .eq("disponivel", true)
      .order("nome");
    if (error) traduzirErroBanco(error);
    return (data as LinhaPrato[]).map(paraPrato);
  },

  async contarPorCategoria(categoriaId) {
    const banco = await obterBanco();
    const { count, error } = await banco
      .from("pratos")
      .select("id", { count: "exact", head: true })
      .eq("categoria_id", categoriaId);
    if (error) traduzirErroBanco(error);
    return count ?? 0;
  },

  async buscarPorId(id) {
    const banco = await obterBanco();
    const { data, error } = await banco.from("pratos").select(COLUNAS).eq("id", id).maybeSingle();
    if (error) traduzirErroBanco(error);
    return data ? paraPrato(data as LinhaPrato) : null;
  },

  async criar(categoriaId, dados) {
    const banco = await obterBanco();
    const { data, error } = await banco
      .from("pratos")
      .insert({ ...paraLinha(dados), categoria_id: categoriaId })
      .select(COLUNAS)
      .single();
    if (error) traduzirErroBanco(error);
    return paraPrato(data as LinhaPrato);
  },

  async atualizar(id, dados) {
    const banco = await obterBanco();
    const { data, error } = await banco
      .from("pratos")
      .update(paraLinha(dados))
      .eq("id", id)
      .select(COLUNAS)
      .single();
    if (error) traduzirErroBanco(error);
    return paraPrato(data as LinhaPrato);
  },

  async excluir(id) {
    const banco = await obterBanco();
    const { error } = await banco.from("pratos").delete().eq("id", id);
    if (error) traduzirErroBanco(error);
  },
};
