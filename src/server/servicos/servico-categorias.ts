import { categoriaSchema, normalizarNome, type Categoria } from "@/shared/dominio";
import type { RepositorioCategorias, RepositorioPratos } from "../dados/repositorios";
import { conflito, naoEncontrado } from "../erros";
import { validarEntrada } from "../validacao";

/** Regras de negócio das categorias do cardápio. */
export function criarServicoCategorias(
  categorias: RepositorioCategorias,
  pratos: RepositorioPratos,
) {
  async function obter(id: string): Promise<Categoria> {
    const categoria = await categorias.buscarPorId(id);
    if (!categoria) throw naoEncontrado("Categoria");
    return categoria;
  }

  /**
   * Regra do cenário: o nome da categoria não pode se repetir.
   * A comparação ignora maiúsculas, acentos e espaços extras ("Sobremesas" = " sobremesás ").
   */
  async function garantirNomeDisponivel(nome: string, idAtual?: string): Promise<void> {
    const procurado = normalizarNome(nome);
    const existente = (await categorias.listar()).find(
      (categoria) => categoria.id !== idAtual && normalizarNome(categoria.nome) === procurado,
    );
    if (existente) {
      const mensagem = `Já existe uma categoria chamada "${existente.nome}".`;
      throw conflito("NOME_DUPLICADO", mensagem, { nome: mensagem });
    }
  }

  /** Regra do cenário: não excluir uma categoria que ainda tenha pratos. */
  async function garantirSemPratos(categoria: Categoria): Promise<void> {
    const total = await pratos.contarPorCategoria(categoria.id);
    if (total > 0) {
      const plural = total === 1 ? "1 prato cadastrado" : `${total} pratos cadastrados`;
      throw conflito(
        "CATEGORIA_COM_PRATOS",
        `A categoria "${categoria.nome}" ainda tem ${plural}. Exclua ou mova os pratos antes de excluí-la.`,
      );
    }
  }

  return {
    listar: () => categorias.listar(),
    obter,

    async criar(entrada: unknown) {
      const dados = validarEntrada(categoriaSchema, entrada);
      await garantirNomeDisponivel(dados.nome);
      return categorias.criar(dados);
    },

    async atualizar(id: string, entrada: unknown) {
      await obter(id);
      const dados = validarEntrada(categoriaSchema, entrada);
      await garantirNomeDisponivel(dados.nome, id);
      return categorias.atualizar(id, dados);
    },

    async excluir(id: string) {
      const categoria = await obter(id);
      await garantirSemPratos(categoria);
      await categorias.excluir(id);
    },
  };
}

export type ServicoCategorias = ReturnType<typeof criarServicoCategorias>;
