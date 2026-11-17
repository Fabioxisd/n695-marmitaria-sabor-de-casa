import type { FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormulario } from "@/hooks/use-formulario";
import { LIMITES, pratoEdicaoSchema, type Categoria, type PratoEdicao } from "@/shared/dominio";
import { AcoesFormulario } from "./acoes-formulario";
import { Campo, propsDeErro } from "./campo";

export type ValoresPrato = {
  nome: string;
  descricao: string;
  preco: string;
  disponivel: boolean;
  categoriaId: string;
};

interface FormularioPratoProps {
  valoresIniciais: ValoresPrato;
  categorias?: Categoria[] | undefined;
  rotuloSalvar: string;
  salvando: boolean;
  aoSalvar: (dados: PratoEdicao) => Promise<unknown>;
}

export function FormularioPrato({
  valoresIniciais,
  categorias,
  rotuloSalvar,
  salvando,
  aoSalvar,
}: FormularioPratoProps) {
  const formulario = useFormulario(pratoEdicaoSchema, valoresIniciais);
  const { valores, erros, alterar } = formulario;

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    const dados = formulario.validar();
    if (!dados) return;
    await aoSalvar(dados).catch(formulario.aplicarErrosDoServidor);
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-6">
      <Campo id="nome" rotulo="Nome do prato" obrigatorio erro={erros.nome}>
        <Input
          {...propsDeErro("nome", erros.nome)}
          value={valores.nome}
          maxLength={LIMITES.nomePrato}
          placeholder="Ex.: Frango assado com baião"
          onChange={(e) => alterar("nome", e.target.value)}
        />
      </Campo>

      <div className="grid gap-6 sm:grid-cols-2">
        <Campo
          id="preco"
          rotulo="Preço (R$)"
          obrigatorio
          erro={erros.preco}
          dica="Use vírgula: 19,90"
        >
          <Input
            {...propsDeErro("preco", erros.preco)}
            value={valores.preco}
            inputMode="decimal"
            placeholder="0,00"
            onChange={(e) => alterar("preco", e.target.value)}
          />
        </Campo>

        {categorias && (
          <Campo id="categoria" rotulo="Categoria" obrigatorio erro={erros.categoriaId}>
            <Select
              value={valores.categoriaId}
              onValueChange={(valor) => alterar("categoriaId", valor)}
            >
              <SelectTrigger id="categoria" className="h-10 bg-card">
                <SelectValue placeholder="Escolha uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>
        )}
      </div>

      <Campo
        id="descricao"
        rotulo="Descrição"
        erro={erros.descricao}
        dica="Acompanhamentos, tamanho, observações."
      >
        <Textarea
          {...propsDeErro("descricao", erros.descricao)}
          value={valores.descricao}
          maxLength={LIMITES.descricaoPrato}
          rows={3}
          placeholder="Ex.: Arroz, feijão, farofa e salada."
          onChange={(e) => alterar("descricao", e.target.value)}
        />
      </Campo>

      <label
        htmlFor="disponivel"
        className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border bg-muted/60 p-4"
      >
        <span>
          <span className="block text-sm font-semibold">Disponível hoje</span>
          <span className="block text-xs text-muted-foreground">
            Pratos indisponíveis somem do cardápio público, mas continuam cadastrados.
          </span>
        </span>
        <Switch
          id="disponivel"
          checked={valores.disponivel}
          onCheckedChange={(marcado) => alterar("disponivel", marcado)}
        />
      </label>

      <AcoesFormulario
        salvando={salvando}
        rotuloSalvar={rotuloSalvar}
        voltarPara={{
          to: "/categorias/$categoriaId",
          params: { categoriaId: valoresIniciais.categoriaId },
        }}
      />
    </form>
  );
}
