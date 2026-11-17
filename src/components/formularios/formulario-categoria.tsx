import type { FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFormulario } from "@/hooks/use-formulario";
import { categoriaSchema, LIMITES, type CategoriaEntrada } from "@/shared/dominio";
import { AcoesFormulario } from "./acoes-formulario";
import { Campo, propsDeErro } from "./campo";

interface FormularioCategoriaProps {
  valoresIniciais?: { nome: string; descricao: string } | undefined;
  rotuloSalvar: string;
  salvando: boolean;
  aoSalvar: (dados: CategoriaEntrada) => Promise<unknown>;
}

export function FormularioCategoria({
  valoresIniciais = { nome: "", descricao: "" },
  rotuloSalvar,
  salvando,
  aoSalvar,
}: FormularioCategoriaProps) {
  const formulario = useFormulario(categoriaSchema, valoresIniciais);
  const { valores, erros, alterar } = formulario;

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    const dados = formulario.validar();
    if (!dados) return;
    await aoSalvar(dados).catch(formulario.aplicarErrosDoServidor);
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-6">
      <Campo id="nome" rotulo="Nome da categoria" obrigatorio erro={erros.nome}>
        <Input
          {...propsDeErro("nome", erros.nome)}
          value={valores.nome}
          maxLength={LIMITES.nomeCategoria}
          placeholder="Ex.: Marmitas Tradicionais"
          onChange={(e) => alterar("nome", e.target.value)}
        />
      </Campo>
      <Campo
        id="descricao"
        rotulo="Descrição"
        erro={erros.descricao}
        dica="Aparece no cardápio público, abaixo do nome da categoria."
      >
        <Textarea
          {...propsDeErro("descricao", erros.descricao)}
          value={valores.descricao}
          maxLength={LIMITES.descricaoCategoria}
          rows={3}
          placeholder="Ex.: Arroz, feijão e a mistura do dia."
          onChange={(e) => alterar("descricao", e.target.value)}
        />
      </Campo>
      <AcoesFormulario salvando={salvando} rotuloSalvar={rotuloSalvar} voltarPara={{ to: "/" }} />
    </form>
  );
}
