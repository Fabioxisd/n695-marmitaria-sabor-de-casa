/**
 * Contratos da camada de dados. Os serviços dependem destas interfaces,
 * e não do banco diretamente — isso permite testar as regras com repositórios em memória.
 */
import type {
  Categoria,
  CategoriaEntrada,
  Prato,
  PratoEdicao,
  PratoEntrada,
} from "@/shared/dominio";

export interface RepositorioCategorias {
  listar(): Promise<Categoria[]>;
  buscarPorId(id: string): Promise<Categoria | null>;
  criar(dados: CategoriaEntrada): Promise<Categoria>;
  atualizar(id: string, dados: CategoriaEntrada): Promise<Categoria>;
  excluir(id: string): Promise<void>;
}

export interface RepositorioPratos {
  listarPorCategoria(categoriaId: string): Promise<Prato[]>;
  listarDisponiveis(): Promise<Prato[]>;
  contarPorCategoria(categoriaId: string): Promise<number>;
  buscarPorId(id: string): Promise<Prato | null>;
  criar(categoriaId: string, dados: PratoEntrada): Promise<Prato>;
  atualizar(id: string, dados: PratoEdicao): Promise<Prato>;
  excluir(id: string): Promise<void>;
}
