import { describe, expect, it } from "vitest";
import type { RepositorioCategorias, RepositorioPratos } from "@/server/dados/repositorios";
import { criarServicoCategorias } from "@/server/servicos/servico-categorias";
import { criarServicoPratos } from "@/server/servicos/servico-pratos";
import { ErroAplicacao } from "@/server/erros";
import type { Categoria, Prato } from "@/shared/dominio";
import { categoriaSchema, pratoSchema } from "@/shared/dominio";

/** Repositórios em memória: testam as regras sem depender do banco. */
function criarRepositoriosEmMemoria() {
  const categorias = new Map<string, Categoria>();
  const pratos = new Map<string, Prato>();
  let sequencia = 0;
  const novoId = () => `00000000-0000-4000-8000-${String(++sequencia).padStart(12, "0")}`;
  const agora = new Date().toISOString();
  const total = (id: string) => [...pratos.values()].filter((p) => p.categoriaId === id).length;
  const comTotal = (c: Categoria) => ({ ...c, totalPratos: total(c.id) });

  const repoCategorias: RepositorioCategorias = {
    listar: async () => [...categorias.values()].map(comTotal),
    buscarPorId: async (id) => (categorias.has(id) ? comTotal(categorias.get(id)!) : null),
    criar: async (dados) => {
      const categoria = {
        id: novoId(),
        ...dados,
        totalPratos: 0,
        criadoEm: agora,
        atualizadoEm: agora,
      };
      categorias.set(categoria.id, categoria);
      return categoria;
    },
    atualizar: async (id, dados) => {
      const categoria = { ...categorias.get(id)!, ...dados };
      categorias.set(id, categoria);
      return comTotal(categoria);
    },
    excluir: async (id) => void categorias.delete(id),
  };

  const repoPratos: RepositorioPratos = {
    listarPorCategoria: async (id) => [...pratos.values()].filter((p) => p.categoriaId === id),
    listarDisponiveis: async () => [...pratos.values()].filter((p) => p.disponivel),
    contarPorCategoria: async (id) => total(id),
    buscarPorId: async (id) => pratos.get(id) ?? null,
    criar: async (categoriaId, dados) => {
      const prato = { id: novoId(), categoriaId, ...dados, criadoEm: agora, atualizadoEm: agora };
      pratos.set(prato.id, prato);
      return prato;
    },
    atualizar: async (id, { categoriaId, ...dados }) => {
      const atual = pratos.get(id)!;
      const prato = { ...atual, ...dados, categoriaId: categoriaId ?? atual.categoriaId };
      pratos.set(id, prato);
      return prato;
    },
    excluir: async (id) => void pratos.delete(id),
  };

  return {
    servicoCategorias: criarServicoCategorias(repoCategorias, repoPratos),
    servicoPratos: criarServicoPratos(repoCategorias, repoPratos),
  };
}

async function capturarErro(promessa: Promise<unknown>): Promise<ErroAplicacao> {
  const erro = await promessa.then(
    () => null,
    (e: unknown) => e,
  );
  if (!(erro instanceof ErroAplicacao)) throw new Error("Era esperado um ErroAplicacao");
  return erro;
}

describe("Regra: campos obrigatórios", () => {
  it("recusa categoria sem nome", () => {
    const resultado = categoriaSchema.safeParse({ nome: "   " });
    expect(resultado.success).toBe(false);
  });

  it("recusa prato sem nome e sem preço, com 422 no serviço", async () => {
    const { servicoCategorias, servicoPratos } = criarRepositoriosEmMemoria();
    const categoria = await servicoCategorias.criar({ nome: "Bebidas" });
    const erro = await capturarErro(servicoPratos.criar(categoria.id, { nome: "", preco: "" }));
    expect(erro.status).toBe(422);
    expect(erro.campos).toMatchObject({
      nome: "Informe o nome do prato.",
      preco: "Informe o preço do prato.",
    });
  });
});

describe("Regra: preço maior que zero", () => {
  it("recusa preço zero", () => {
    expect(pratoSchema.safeParse({ nome: "Suco", preco: 0 }).success).toBe(false);
  });

  it("recusa preço negativo", () => {
    expect(pratoSchema.safeParse({ nome: "Suco", preco: -5 }).success).toBe(false);
  });

  it("aceita 0,01 escrito com vírgula", () => {
    const resultado = pratoSchema.safeParse({ nome: "Suco", preco: "0,01" });
    expect(resultado.success && resultado.data.preco).toBe(0.01);
  });
});

describe("Regra: nome de categoria sem repetição", () => {
  it("recusa criar categoria com nome já existente, ignorando maiúsculas e espaços", async () => {
    const { servicoCategorias } = criarRepositoriosEmMemoria();
    await servicoCategorias.criar({ nome: "Fitness" });
    const erro = await capturarErro(servicoCategorias.criar({ nome: "  fitness " }));
    expect(erro.status).toBe(409);
    expect(erro.codigo).toBe("NOME_DUPLICADO");
  });

  it("recusa nome repetido com acento diferente", async () => {
    const { servicoCategorias } = criarRepositoriosEmMemoria();
    await servicoCategorias.criar({ nome: "Sobremesas" });
    const erro = await capturarErro(servicoCategorias.criar({ nome: "Sobremesás" }));
    expect(erro.status).toBe(409);
    expect(erro.codigo).toBe("NOME_DUPLICADO");
  });

  it("recusa nome repetido com espaços duplicados no meio", async () => {
    const { servicoCategorias } = criarRepositoriosEmMemoria();
    await servicoCategorias.criar({ nome: "Marmitas Tradicionais" });
    const erro = await capturarErro(servicoCategorias.criar({ nome: "Marmitas   Tradicionais" }));
    expect(erro.status).toBe(409);
    expect(erro.codigo).toBe("NOME_DUPLICADO");
  });

  it("recusa renomear uma categoria para o nome de outra", async () => {
    const { servicoCategorias } = criarRepositoriosEmMemoria();
    await servicoCategorias.criar({ nome: "Bebidas" });
    const fitness = await servicoCategorias.criar({ nome: "Fitness" });
    const erro = await capturarErro(servicoCategorias.atualizar(fitness.id, { nome: "BEBIDAS" }));
    expect(erro.status).toBe(409);
    expect(erro.codigo).toBe("NOME_DUPLICADO");
  });

  it("permite salvar a própria categoria sem mudar o nome", async () => {
    const { servicoCategorias } = criarRepositoriosEmMemoria();
    const categoria = await servicoCategorias.criar({ nome: "Fitness" });
    const atualizada = await servicoCategorias.atualizar(categoria.id, {
      nome: "Fitness",
      descricao: "Leve",
    });
    expect(atualizada.descricao).toBe("Leve");
  });
});

describe("Regra: não excluir categoria que ainda tenha pratos", () => {
  it("recusa excluir categoria com 1 prato", async () => {
    const { servicoCategorias, servicoPratos } = criarRepositoriosEmMemoria();
    const categoria = await servicoCategorias.criar({ nome: "Sobremesas" });
    await servicoPratos.criar(categoria.id, { nome: "Pudim", preco: 7.5 });
    const erro = await capturarErro(servicoCategorias.excluir(categoria.id));
    expect(erro.status).toBe(409);
    expect(erro.codigo).toBe("CATEGORIA_COM_PRATOS");
  });

  it("exclui a categoria depois que o último prato é removido", async () => {
    const { servicoCategorias, servicoPratos } = criarRepositoriosEmMemoria();
    const categoria = await servicoCategorias.criar({ nome: "Sobremesas" });
    const prato = await servicoPratos.criar(categoria.id, { nome: "Pudim", preco: 7.5 });
    await servicoPratos.excluir(prato.id);
    await servicoCategorias.excluir(categoria.id);
    expect(await servicoCategorias.listar()).toHaveLength(0);
  });
});
