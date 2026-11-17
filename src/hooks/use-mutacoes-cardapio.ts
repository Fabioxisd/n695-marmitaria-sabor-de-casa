import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { apiCategorias, apiPratos } from "@/lib/api/cardapio-api";
import { ErroApi, mensagemDeErro } from "@/lib/api/cliente-http";
import type { CategoriaEntrada, PratoEdicao } from "@/shared/dominio";

function avisarErro(erro: unknown) {
  const temErrosDeCampo = erro instanceof ErroApi && Object.keys(erro.campos).length > 0;
  toast.error(temErrosDeCampo ? "Corrija os campos destacados." : mensagemDeErro(erro));
}

/** Após qualquer alteração, recarrega listas e cardápio a partir do serviço Web. */
function useAtualizarDados() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries();
}

export function useSalvarCategoria(id?: string) {
  const atualizarDados = useAtualizarDados();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (dados: CategoriaEntrada) =>
      id ? apiCategorias.atualizar(id, dados) : apiCategorias.criar(dados),
    onSuccess: async (categoria) => {
      await atualizarDados();
      toast.success(id ? "Categoria atualizada." : `Categoria "${categoria.nome}" criada.`);
      navigate({ to: "/" });
    },
    onError: avisarErro,
  });
}

export function useExcluirCategoria() {
  const atualizarDados = useAtualizarDados();
  return useMutation({
    mutationFn: (id: string) => apiCategorias.excluir(id),
    onSuccess: async (resposta) => {
      await atualizarDados();
      toast.success(resposta.mensagem);
    },
    onError: avisarErro,
  });
}

export function useSalvarPrato(categoriaId: string, pratoId?: string) {
  const atualizarDados = useAtualizarDados();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (dados: PratoEdicao) =>
      pratoId ? apiPratos.atualizar(pratoId, dados) : apiPratos.criar(categoriaId, dados),
    onSuccess: async (prato) => {
      await atualizarDados();
      toast.success(pratoId ? "Prato atualizado." : `Prato "${prato.nome}" adicionado.`);
      navigate({ to: "/categorias/$categoriaId", params: { categoriaId: prato.categoriaId } });
    },
    onError: avisarErro,
  });
}

export function useExcluirPrato() {
  const atualizarDados = useAtualizarDados();
  return useMutation({
    mutationFn: (id: string) => apiPratos.excluir(id),
    onSuccess: async (resposta) => {
      await atualizarDados();
      toast.success(resposta.mensagem);
    },
    onError: avisarErro,
  });
}
