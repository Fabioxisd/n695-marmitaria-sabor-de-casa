import { pratoEdicaoSchema, pratoSchema, type Prato, type SecaoCardapio } from "@/shared/dominio";
import type { RepositorioCategorias, RepositorioPratos } from "../dados/repositorios";
import { naoEncontrado } from "../erros";
import { validarEntrada } from "../validacao";

/** Regras de negócio dos pratos e montagem do cardápio público. */
export function criarServicoPratos(categorias: RepositorioCategorias, pratos: RepositorioPratos) {
  async function garantirCategoria(categoriaId: string): Promise<void> {
    const categoria = await categorias.buscarPorId(categoriaId);
    if (!categoria) throw naoEncontrado("Categoria");
  }

  async function obter(id: string): Promise<Prato> {
    const prato = await pratos.buscarPorId(id);
    if (!prato) throw naoEncontrado("Prato");
    return prato;
  }

  return {
    obter,

    async listarPorCategoria(categoriaId: string) {
      await garantirCategoria(categoriaId);
      return pratos.listarPorCategoria(categoriaId);
    },

    async criar(categoriaId: string, entrada: unknown) {
      await garantirCategoria(categoriaId);
      const dados = validarEntrada(pratoSchema, entrada);
      return pratos.criar(categoriaId, dados);
    },

    async atualizar(id: string, entrada: unknown) {
      await obter(id);
      const dados = validarEntrada(pratoEdicaoSchema, entrada);
      if (dados.categoriaId) await garantirCategoria(dados.categoriaId);
      return pratos.atualizar(id, dados);
    },

    async excluir(id: string) {
      await obter(id);
      await pratos.excluir(id);
    },

    /** Cardápio público: só categorias com pratos disponíveis. */
    async montarCardapio(): Promise<SecaoCardapio[]> {
      const [todasCategorias, disponiveis] = await Promise.all([
        categorias.listar(),
        pratos.listarDisponiveis(),
      ]);
      return todasCategorias
        .map(({ id, nome, descricao }) => ({
          categoria: { id, nome, descricao },
          pratos: disponiveis.filter((prato) => prato.categoriaId === id),
        }))
        .filter((secao) => secao.pratos.length > 0);
    },
  };
}

export type ServicoPratos = ReturnType<typeof criarServicoPratos>;
