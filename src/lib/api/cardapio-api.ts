/** Funções da interface que consomem o serviço Web próprio (/api). */
import { queryOptions } from "@tanstack/react-query";
import type {
  Categoria,
  CategoriaEntrada,
  Prato,
  PratoEdicao,
  PratoEntrada,
  SecaoCardapio,
} from "@/shared/dominio";
import { requisitar } from "./cliente-http";

export const chaves = {
  categorias: ["categorias"] as const,
  categoria: (id: string) => ["categorias", id] as const,
  pratosDaCategoria: (categoriaId: string) => ["categorias", categoriaId, "pratos"] as const,
  prato: (id: string) => ["pratos", id] as const,
  cardapio: ["cardapio"] as const,
};

export const consultaCategorias = () =>
  queryOptions({
    queryKey: chaves.categorias,
    queryFn: () => requisitar<Categoria[]>("/api/categorias"),
  });

export const consultaCategoria = (id: string) =>
  queryOptions({
    queryKey: chaves.categoria(id),
    queryFn: () => requisitar<Categoria>(`/api/categorias/${id}`),
  });

export const consultaPratosDaCategoria = (categoriaId: string) =>
  queryOptions({
    queryKey: chaves.pratosDaCategoria(categoriaId),
    queryFn: () => requisitar<Prato[]>(`/api/categorias/${categoriaId}/pratos`),
  });

export const consultaPrato = (id: string) =>
  queryOptions({
    queryKey: chaves.prato(id),
    queryFn: () => requisitar<Prato>(`/api/pratos/${id}`),
  });

export const consultaCardapio = () =>
  queryOptions({
    queryKey: chaves.cardapio,
    queryFn: () => requisitar<SecaoCardapio[]>("/api/cardapio"),
  });

type Mensagem = { mensagem: string };

export const apiCategorias = {
  criar: (dados: CategoriaEntrada) => requisitar<Categoria>("/api/categorias", "POST", dados),
  atualizar: (id: string, dados: CategoriaEntrada) =>
    requisitar<Categoria>(`/api/categorias/${id}`, "PUT", dados),
  excluir: (id: string) => requisitar<Mensagem>(`/api/categorias/${id}`, "DELETE"),
};

export const apiPratos = {
  criar: (categoriaId: string, dados: PratoEntrada) =>
    requisitar<Prato>(`/api/categorias/${categoriaId}/pratos`, "POST", dados),
  atualizar: (id: string, dados: PratoEdicao) =>
    requisitar<Prato>(`/api/pratos/${id}`, "PUT", dados),
  excluir: (id: string) => requisitar<Mensagem>(`/api/pratos/${id}`, "DELETE"),
};
