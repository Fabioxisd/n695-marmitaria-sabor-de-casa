/** Composição: liga os serviços aos repositórios do banco de dados. */
import { repositorioCategorias } from "../dados/repositorio-categorias";
import { repositorioPratos } from "../dados/repositorio-pratos";
import { criarServicoCategorias } from "./servico-categorias";
import { criarServicoPratos } from "./servico-pratos";

export const servicoCategorias = criarServicoCategorias(repositorioCategorias, repositorioPratos);
export const servicoPratos = criarServicoPratos(repositorioCategorias, repositorioPratos);
