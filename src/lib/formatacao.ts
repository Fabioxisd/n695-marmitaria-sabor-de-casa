const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const formatarPreco = (valor: number) => moeda.format(valor);

/** Mostra o preço no campo do formulário com vírgula decimal (19,90). */
export const precoParaCampo = (valor: number) => valor.toFixed(2).replace(".", ",");

export const contarPratos = (total: number) =>
  total === 0 ? "Nenhum prato" : total === 1 ? "1 prato" : `${total} pratos`;
