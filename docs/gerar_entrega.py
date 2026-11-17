"""
Gera o PDF de entrega do trabalho N695 seguindo o Modelo de Entrega (Parte II).
Preencha a seção CONFIGURAÇÃO e rode:  python3 docs/gerar_entrega.py
"""
import sys
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (Image, KeepTogether, PageBreak, Paragraph, SimpleDocTemplate,
                                Spacer, Table, TableStyle)

# ============================ CONFIGURAÇÃO ============================
REPO_URL = ""   # ex.: "https://github.com/usuario/sabor-de-casa"
APP_URL = ""    # ex.: "https://sabor-de-casa.lovable.app"
RAMO = "main"
DISCIPLINA = "N695 – Desenvolvimento de Plataformas Web"
TURMA = "N695 – Desenvolvimento de Plataformas Web"
INTEGRANTES = [  # (nome completo, matrícula)
    ("Raimundo Bezerra Baima Neto", ""),
    ("Rômulo da Silva Barros", ""),
    ("Fabio Evangelista Martins", ""),
    ("Vitor Marden Almeida Nunes", ""),
    ("Nayra Raquel da Silva Ferreira", ""),
]
SAIDA = sys.argv[1] if len(sys.argv) > 1 else "/mnt/documents/N695_Entrega_Sabor_de_Casa.pdf"
# ======================================================================

RAIZ = Path(__file__).resolve().parent
CAP = RAIZ / "capturas"
F = "/usr/share/fonts/truetype/dejavu/"
pdfmetrics.registerFont(TTFont("Sans", F + "DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("Sans-B", F + "DejaVuSans-Bold.ttf"))
pdfmetrics.registerFont(TTFont("Sans-I", F + "DejaVuSans-Oblique.ttf"))
pdfmetrics.registerFont(TTFont("Serif-B", F + "DejaVuSerif-Bold.ttf"))
pdfmetrics.registerFont(TTFont("Mono", F + "DejaVuSansMono.ttf"))
pdfmetrics.registerFontFamily("Sans", normal="Sans", bold="Sans-B", italic="Sans-I", boldItalic="Sans-B")

TERRACOTA = colors.HexColor("#B4472A")
TINTA = colors.HexColor("#3A2A22")
CINZA = colors.HexColor("#6B5A4E")
CREME = colors.HexColor("#FBF4E8")
BORDA = colors.HexColor("#E2D3BD")
AZUL = colors.HexColor("#1F4FBF")

st = {
    "corpo": ParagraphStyle("corpo", fontName="Sans", fontSize=10.2, leading=15, textColor=TINTA, spaceAfter=6),
    "h1": ParagraphStyle("h1", fontName="Serif-B", fontSize=17, leading=22, textColor=TERRACOTA, spaceBefore=4, spaceAfter=10),
    "h2": ParagraphStyle("h2", fontName="Sans-B", fontSize=11.5, leading=15, textColor=TINTA, spaceBefore=8, spaceAfter=5),
    "leg": ParagraphStyle("leg", fontName="Sans-I", fontSize=8.6, leading=11, textColor=CINZA, alignment=TA_CENTER, spaceBefore=3, spaceAfter=10),
    "cel": ParagraphStyle("cel", fontName="Sans", fontSize=8.8, leading=11.5, textColor=TINTA),
    "celB": ParagraphStyle("celB", fontName="Sans-B", fontSize=8.8, leading=11.5, textColor=colors.white),
    "mono": ParagraphStyle("mono", fontName="Mono", fontSize=8.6, leading=11.5, textColor=TINTA),
    "capa": ParagraphStyle("capa", fontName="Sans", fontSize=11, leading=16, textColor=TINTA, alignment=TA_CENTER),
    "capaT": ParagraphStyle("capaT", fontName="Serif-B", fontSize=26, leading=32, textColor=TERRACOTA, alignment=TA_CENTER),
}


def pendente(texto):
    return f'<font backColor="#FFE58A" color="#5A3B00"><b>[PREENCHER: {texto}]</b></font>'


def link_arquivo(caminho, rotulo=None):
    """Link para o arquivo no GitHub (ou o caminho, se o repositório ainda não foi informado)."""
    rotulo = rotulo or caminho
    if REPO_URL:
        url = f"{REPO_URL.rstrip('/')}/blob/{RAMO}/{caminho}"
        return f'<link href="{url}" color="#1F4FBF"><u><font name="Mono" size="8.6">{rotulo}</font></u></link>'
    return f'<font name="Mono" size="8.6" color="#1F4FBF">{rotulo}</font>'


def url_ou_pendente(url, descricao):
    return f'<link href="{url}" color="#1F4FBF"><u>{url}</u></link>' if url else pendente(descricao)


def P(texto, estilo="corpo"):
    return Paragraph(texto, st[estilo])


def figura(arquivo, legenda, largura=16.2 * cm, altura_max=10.5 * cm):
    img = Image(str(CAP / arquivo))
    proporcao = img.imageHeight / img.imageWidth
    w, h = largura, largura * proporcao
    if h > altura_max:
        h, w = altura_max, altura_max / proporcao
    img.drawWidth, img.drawHeight = w, h
    moldura = Table([[img]], colWidths=[w + 4])
    moldura.setStyle(TableStyle([("BOX", (0, 0), (-1, -1), 0.6, BORDA), ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                                 ("LEFTPADDING", (0, 0), (-1, -1), 2), ("RIGHTPADDING", (0, 0), (-1, -1), 2),
                                 ("TOPPADDING", (0, 0), (-1, -1), 2), ("BOTTOMPADDING", (0, 0), (-1, -1), 2)]))
    return KeepTogether([moldura, P(legenda, "leg")])


def tabela(cabecalho, linhas, larguras):
    dados = [[P(c, "celB") for c in cabecalho]] + [[P(c, "cel") for c in linha] for linha in linhas]
    t = Table(dados, colWidths=larguras, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), TERRACOTA),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, CREME]),
        ("GRID", (0, 0), (-1, -1), 0.4, BORDA),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    return t


def topico(numero, titulo):
    return P(f"{numero}. {titulo}", "h1")


def capa():
    logo = Image(str(CAP / "logo_unifor.png"))
    logo.drawWidth, logo.drawHeight = 6.2 * cm, 6.2 * cm * logo.imageHeight / logo.imageWidth
    integrantes = [[n, m if m else pendente("matrícula")] for n, m in INTEGRANTES]
    t = tabela(["Integrante (nome completo)", "Matrícula"], integrantes, [10.5 * cm, 5.5 * cm])
    return [
        logo, Spacer(1, 0.6 * cm),
        P("<b>UNIVERSIDADE DE FORTALEZA</b><br/>CENTRO DE CIÊNCIAS TECNOLÓGICAS", "capa"),
        Spacer(1, 0.5 * cm),
        P(f"<b>Disciplina:</b> {DISCIPLINA}<br/><b>Turma:</b> {TURMA}", "capa"),
        Spacer(1, 2.2 * cm),
        P("Sabor de Casa — Cardápio Digital", "capaT"),
        Spacer(1, 0.3 * cm),
        P("Relatório de entrega do trabalho final<br/><b>Cenário escolhido: Cenário 3 — Marmitaria com cardápio digital</b>", "capa"),
        Spacer(1, 2 * cm), t, Spacer(1, 2.4 * cm),
        P("Fortaleza – CE<br/>2026", "capa"),
        PageBreak(),
    ]


def conteudo():
    c = []
    # 2
    c += [topico(2, "Links de acesso"),
          tabela(["Item", "Link"], [
              ["Repositório público no GitHub", url_ou_pendente(REPO_URL, "link do repositório público")],
              ["Aplicação publicada", url_ou_pendente(APP_URL, "link da aplicação publicada")],
              ["Cardápio público (página para os clientes)", url_ou_pendente(f"{APP_URL.rstrip('/')}/cardapio" if APP_URL else "", "link da aplicação + /cardapio")],
          ], [6 * cm, 10 * cm]), Spacer(1, 0.5 * cm)]
    # 3
    c += [topico(3, "Cenário escolhido e justificativa"),
          P("A equipe escolheu o <b>Cenário 3 — Marmitaria com cardápio digital</b>. A Sabor de Casa vende marmitas por "
            "aplicativo de mensagens e divulga o cardápio como foto de um quadro escrito à mão; quando um prato acaba ou "
            "muda de preço, a foto antiga continua circulando e gera pedidos errados."),
          P("Escolhemos este cenário por três motivos: (1) o problema é concreto e próximo do nosso dia a dia — pequenos "
            "negócios de comida de Fortaleza enfrentam exatamente essa dificuldade; (2) a relação <i>Categoria → Prato</i> "
            "é simples de entender, o que nos permitiu concentrar esforço na qualidade técnica (serviço Web, validação e "
            "clean code); e (3) as regras do cenário — nome de categoria sem repetição e bloqueio da exclusão de categoria "
            "com pratos — exigem regras de negócio no servidor, e não apenas formulários, o que exercita os percursos 3 e 4."),
          Spacer(1, 0.3 * cm)]
    # 4
    c += [topico(4, "Visão geral da solução"),
          P("A aplicação tem duas partes: o <b>painel de gestão</b>, onde a proprietária mantém categorias e pratos, e o "
            "<b>cardápio público</b>, uma página sempre atualizada que pode ser enviada aos clientes no lugar da foto. "
            "Pratos marcados como indisponíveis somem do cardápio público, mas continuam cadastrados."),
          P("Entidades e relação", "h2"),
          tabela(["Entidade", "Atributos", "Relação"], [
              ["<b>Categoria</b>", "id, nome (obrigatório, único), descrição, data de criação e de atualização",
               "Uma categoria reúne <b>vários</b> pratos (1:N)"],
              ["<b>Prato</b>", "id, categoria (chave estrangeira), nome (obrigatório), descrição, preço (&gt; 0), disponível (sim/não), datas",
               "Cada prato pertence a <b>uma</b> categoria"],
          ], [2.6 * cm, 8.4 * cm, 5 * cm]),
          Spacer(1, 0.3 * cm),
          P("A relação é preservada no banco por uma chave estrangeira <font name='Mono'>pratos.categoria_id → categorias.id</font> "
            "com <font name='Mono'>ON DELETE RESTRICT</font>, que impede apagar uma categoria que ainda tenha pratos."),
          KeepTogether([P("Arquitetura em camadas", "h2"),
          tabela(["Camada", "Responsabilidade", "Pasta no repositório"], [
              ["Interface", "Telas, navegação e formulários; consome o serviço Web por HTTP", link_arquivo("src/routes", "src/routes/*.tsx") + "<br/>" + link_arquivo("src/components")],
              ["Serviço Web", "Endpoints REST (GET, POST, PUT, DELETE) e tratamento de erros", link_arquivo("src/routes/api")],
              ["Regras de negócio", "Validação e regras do cenário", link_arquivo("src/server/servicos")],
              ["Dados", "Acesso ao banco PostgreSQL (repositórios)", link_arquivo("src/server/dados")],
          ], [3 * cm, 7.5 * cm, 5.5 * cm])]),
          Spacer(1, 0.4 * cm)]
    # 5
    c += [topico(5, "Ferramentas e stack utilizadas"),
          tabela(["Item", "Tecnologia"], [
              ["Linguagem", "TypeScript (front-end e back-end), HTML e CSS"],
              ["Interface", "React 19, TanStack Router (navegação entre telas), TanStack Query (consumo do serviço), Tailwind CSS, componentes shadcn/ui"],
              ["Serviço Web", "TanStack Start — rotas de servidor REST em <font name='Mono'>src/routes/api</font>, respondendo JSON"],
              ["Validação", "Zod — os mesmos esquemas validam no navegador e no servidor"],
              ["Persistência", "Banco de dados relacional PostgreSQL (Lovable Cloud)"],
              ["Testes", "Vitest — testes automatizados das regras do cenário"],
              ["Hospedagem", "Lovable (publicação da aplicação) e GitHub (repositório público)"],
              ["Ferramentas de apoio", "Lovable (ambiente de desenvolvimento com IA), Git/GitHub"],
          ], [3.5 * cm, 12.5 * cm]),
          Spacer(1, 0.4 * cm)]
    # 6
    c += [topico(6, "Interface"),
          P("A interface tem as três telas mínimas do cenário — <b>lista de categorias</b>, <b>cadastro/edição de "
            "categoria</b> e <b>lista de pratos de uma categoria com cadastro/edição</b> — e uma tela extra de "
            "cardápio público. A navegação segue o fluxo abaixo:"),
          tabela(["Tela", "Endereço", "Leva para"], [
              ["Lista de categorias", "/", "Nova categoria · Ver pratos · Editar · Excluir · Cardápio público"],
              ["Cadastro de categoria", "/categorias/nova", "Volta para a lista ao salvar ou cancelar"],
              ["Edição de categoria", "/categorias/:id/editar", "Volta para a lista ao salvar ou cancelar"],
              ["Pratos da categoria", "/categorias/:id", "Novo prato · Editar prato · Excluir prato · Editar categoria · Todas as categorias"],
              ["Cadastro de prato", "/categorias/:id/pratos/novo", "Volta para os pratos da categoria"],
              ["Edição de prato", "/categorias/:id/pratos/:pratoId/editar", "Volta para os pratos da categoria"],
              ["Cardápio público", "/cardapio", "Menu superior: Categorias"],
          ], [3.6 * cm, 5.4 * cm, 7 * cm]),
          PageBreak(),
          figura("01_lista_categorias.png", "Figura 1 — Lista de categorias, com total de pratos e ações de ver pratos, editar e excluir."),
          figura("02_pratos_da_categoria.png", "Figura 2 — Navegação para os pratos de uma categoria (Marmitas Tradicionais), com preço e disponibilidade."),
          figura("06_formulario_categoria_preenchido.png", "Figura 3 — Formulário de cadastro de categoria."),
          figura("03_editar_categoria.png", "Figura 4 — Formulário de edição de categoria, já preenchido com os dados atuais."),
          figura("12_editar_prato.png", "Figura 5 — Formulário de edição de prato: nome, preço, categoria, descrição e disponibilidade."),
          figura("13_confirmar_exclusao.png", "Figura 6 — Confirmação antes de excluir uma categoria."),
          figura("16_cardapio_publico.png", "Figura 7 — Cardápio público: só pratos disponíveis, agrupados por categoria."),
          PageBreak()]
    # 7
    c += [topico(7, "Serviço Web"),
          P("O serviço Web foi implementado pela equipe como uma API REST que recebe e devolve JSON. A interface nunca "
            "acessa o banco diretamente: toda leitura e escrita passa por estes endpoints."),
          tabela(["Entidade", "Operação", "Método e rota", "Código no GitHub"], [
              ["Categoria", "Listar", "GET /api/categorias", link_arquivo("src/routes/api/categorias.ts", "categorias.ts")],
              ["Categoria", "Criar", "POST /api/categorias", link_arquivo("src/routes/api/categorias.ts", "categorias.ts")],
              ["Categoria", "Buscar uma", "GET /api/categorias/:id", link_arquivo("src/routes/api/categorias.$id.ts", "categorias.$id.ts")],
              ["Categoria", "Atualizar", "PUT /api/categorias/:id", link_arquivo("src/routes/api/categorias.$id.ts", "categorias.$id.ts")],
              ["Categoria", "Excluir", "DELETE /api/categorias/:id", link_arquivo("src/routes/api/categorias.$id.ts", "categorias.$id.ts")],
              ["Prato", "Listar da categoria", "GET /api/categorias/:id/pratos", link_arquivo("src/routes/api/categorias.$id.pratos.ts", "categorias.$id.pratos.ts")],
              ["Prato", "Criar na categoria", "POST /api/categorias/:id/pratos", link_arquivo("src/routes/api/categorias.$id.pratos.ts", "categorias.$id.pratos.ts")],
              ["Prato", "Buscar um", "GET /api/pratos/:id", link_arquivo("src/routes/api/pratos.$id.ts", "pratos.$id.ts")],
              ["Prato", "Atualizar", "PUT /api/pratos/:id", link_arquivo("src/routes/api/pratos.$id.ts", "pratos.$id.ts")],
              ["Prato", "Excluir", "DELETE /api/pratos/:id", link_arquivo("src/routes/api/pratos.$id.ts", "pratos.$id.ts")],
              ["Cardápio", "Cardápio público", "GET /api/cardapio", link_arquivo("src/routes/api/cardapio.ts", "cardapio.ts")],
          ], [2.2 * cm, 3.2 * cm, 5.6 * cm, 5 * cm]),
          Spacer(1, 0.3 * cm),
          P("Na interface, o consumo do serviço está em " + link_arquivo("src/lib/api/cardapio-api.ts") + " e "
            + link_arquivo("src/lib/api/cliente-http.ts") + ". As regras ficam em "
            + link_arquivo("src/server/servicos/servico-categorias.ts") + " e "
            + link_arquivo("src/server/servicos/servico-pratos.ts") + "."),
          P("Códigos de resposta: 200 (sucesso), 201 (criado), 400 (requisição inválida), 404 (não encontrado), "
            "409 (conflito com regra do cenário), 422 (dados inválidos) e 500 (erro interno)."),
          PageBreak(),
          P("Exemplos de requisição e resposta", "h2"),
          figura("api_categorias_1.png", "Figura 8 — Listar categorias (GET) e criar categoria (POST, 201 Created).", altura_max=11 * cm),
          figura("api_categorias_2.png", "Figura 9 — Atualizar categoria (PUT) e buscar uma categoria (GET).", altura_max=11 * cm),
          figura("api_pratos_1.png", "Figura 10 — Criar prato em uma categoria (POST, preço com vírgula aceito) e listar os pratos dela (GET).", altura_max=11 * cm),
          figura("api_pratos_2.png", "Figura 11 — Atualizar prato (PUT) e tentativa de excluir categoria com prato (DELETE, 409 Conflict).", altura_max=11 * cm),
          figura("api_exclusoes.png", "Figura 12 — Excluir prato e, em seguida, a categoria já vazia (DELETE, 200 OK).", altura_max=7 * cm),
          PageBreak()]
    # 8
    c += [topico(8, "Persistência dos dados"),
          P("Os dados são armazenados em um <b>banco de dados relacional PostgreSQL</b> (Lovable Cloud), com duas tabelas: "
            "<font name='Mono'>categorias</font> e <font name='Mono'>pratos</font>. A estrutura foi criada por migração SQL: "
            + link_arquivo("drizzle/migrations/0000_migration.sql") + "."),
          tabela(["Garantia no banco", "Como foi feita"], [
              ["Relação 1:N", "<font name='Mono'>pratos.categoria_id REFERENCES categorias(id) ON DELETE RESTRICT</font>"],
              ["Nome de categoria único", "Índice único em <font name='Mono'>lower(btrim(nome))</font> — ignora maiúsculas e espaços"],
              ["Preço maior que zero", "<font name='Mono'>CHECK (preco &gt; 0)</font> com tipo <font name='Mono'>numeric(10,2)</font>"],
              ["Campos obrigatórios", "<font name='Mono'>NOT NULL</font> e <font name='Mono'>CHECK (length(btrim(nome)) &gt; 0)</font>"],
              ["Data de atualização", "Gatilho (trigger) que atualiza <font name='Mono'>updated_at</font> em toda alteração"],
              ["Acesso protegido", "Segurança por linha (RLS) ativa sem acesso público: só o servidor da aplicação lê e grava"],
          ], [4.5 * cm, 11.5 * cm]),
          Spacer(1, 0.3 * cm),
          P("<b>Como o serviço acessa os dados:</b> os endpoints chamam os serviços de regra, que dependem de "
            "<i>repositórios</i> — objetos com operações como <font name='Mono'>listar</font>, "
            "<font name='Mono'>buscarPorId</font>, <font name='Mono'>criar</font>, <font name='Mono'>atualizar</font> e "
            "<font name='Mono'>excluir</font>. Os repositórios montam as consultas ao PostgreSQL e convertem as linhas do "
            "banco (<font name='Mono'>categoria_id</font>, <font name='Mono'>created_at</font>) para o formato da aplicação "
            "(<font name='Mono'>categoriaId</font>, <font name='Mono'>criadoEm</font>). Erros do banco (nome duplicado, "
            "chave estrangeira) são traduzidos em mensagens claras."),
          P("Código: " + link_arquivo("src/server/dados/repositorios.ts") + " (contratos), "
            + link_arquivo("src/server/dados/repositorio-categorias.ts") + ", "
            + link_arquivo("src/server/dados/repositorio-pratos.ts") + " e "
            + link_arquivo("src/server/dados/banco.ts") + "."),
          PageBreak()]
    # 9
    c += [topico(9, "Validação de entrada e tratamento de erros"),
          P("As regras são verificadas em três níveis: no <b>navegador</b> (resposta imediata ao usuário), no "
            "<b>serviço Web</b> (garantia, mesmo que alguém chame a API diretamente) e no <b>banco</b> (última barreira). "
            "Navegador e servidor usam o mesmo esquema de validação, sem duplicar regras."),
          tabela(["Regra do cenário", "Mensagem ao usuário", "Código"], [
              ["Campos obrigatórios", "“Informe o nome da categoria.” / “Informe o nome do prato.” / “Informe o preço do prato.”", link_arquivo("src/shared/dominio.ts")],
              ["Preço maior que zero", "“O preço deve ser maior que zero.”", link_arquivo("src/shared/dominio.ts")],
              ["Nome de categoria sem repetição", "“Já existe uma categoria chamada \"Fitness\".”", link_arquivo("src/server/servicos/servico-categorias.ts", "servico-categorias.ts")],
              ["Não excluir categoria com pratos", "“A categoria ... ainda tem N pratos cadastrados. Exclua ou mova os pratos antes de excluí-la.”", link_arquivo("src/server/servicos/servico-categorias.ts", "servico-categorias.ts")],
          ], [3.8 * cm, 7.2 * cm, 5 * cm]),
          Spacer(1, 0.3 * cm),
          P("Tratamento de erros: " + link_arquivo("src/server/http.ts") + " converte qualquer erro em uma resposta JSON "
            "padronizada; " + link_arquivo("src/server/validacao.ts") + " valida entradas e identificadores; "
            + link_arquivo("src/hooks/use-formulario.ts") + " mostra os erros embaixo de cada campo; e "
            + link_arquivo("src/hooks/use-mutacoes-cardapio.ts") + " exibe avisos de sucesso ou falha. Testes automatizados "
            "das quatro regras: " + link_arquivo("src/test/regras-cardapio.test.ts") + "."),
          PageBreak(),
          figura("04_erro_campos_obrigatorios_categoria.png", "Figura 13 — Campo obrigatório: tentativa de criar categoria sem nome.", altura_max=9.6 * cm),
          figura("05_erro_nome_duplicado.png", "Figura 14 — Nome repetido: “ fitness ” é recusado porque já existe “Fitness” (o servidor ignora maiúsculas e espaços).", altura_max=9.6 * cm),
          figura("09_erro_campos_obrigatorios_prato.png", "Figura 15 — Campos obrigatórios do prato (nome e preço).", altura_max=9.6 * cm),
          figura("10_erro_preco_zero.png", "Figura 16 — Preço igual a zero é recusado.", altura_max=9.6 * cm),
          figura("14_erro_excluir_categoria_com_pratos.png", "Figura 17 — Exclusão bloqueada: a categoria ainda tem pratos.", altura_max=9.6 * cm),
          figura("api_erros.png", "Figura 18 — As mesmas regras no serviço Web: 422 (campos inválidos) e 409 (nome duplicado).", altura_max=9.6 * cm),
          PageBreak()]
    # 10
    c += [topico(10, "Técnicas de clean code aplicadas"),
          tabela(["Prática", "Link no repositório", "O que o link demonstra"], [
              ["Nomes significativos", link_arquivo("src/server/servicos/servico-categorias.ts", "servico-categorias.ts"),
               "Funções com nomes que dizem a regra: <font name='Mono'>garantirNomeDisponivel</font> e <font name='Mono'>garantirSemPratos</font>."],
              ["Nomes significativos", link_arquivo("src/lib/formatacao.ts", "formatacao.ts"),
               "<font name='Mono'>formatarPreco</font>, <font name='Mono'>precoParaCampo</font> e <font name='Mono'>contarPratos</font> dispensam comentários."],
              ["Funções curtas, responsabilidade única", link_arquivo("src/server/http.ts", "http.ts"),
               "Cada função faz uma coisa: ler o corpo JSON, montar a resposta, tratar o erro."],
              ["Funções curtas, responsabilidade única", link_arquivo("src/server/dados/repositorio-pratos.ts", "repositorio-pratos.ts"),
               "Cada método executa uma única consulta; a conversão banco → aplicação fica em <font name='Mono'>paraPrato</font>."],
              ["Separação em camadas", link_arquivo("src/routes/api/categorias.$id.ts", "categorias.$id.ts"),
               "O endpoint só recebe a requisição e chama o serviço; não contém regra nem SQL."],
              ["Separação em camadas", link_arquivo("src/server/dados/repositorios.ts", "repositorios.ts"),
               "Contratos da camada de dados: as regras dependem da interface, não do banco — por isso são testadas em memória."],
              ["Ausência de código duplicado", link_arquivo("src/shared/dominio.ts", "dominio.ts"),
               "Um único esquema de validação usado pelo navegador e pelo servidor."],
              ["Ausência de código duplicado", link_arquivo("src/hooks/use-formulario.ts", "use-formulario.ts"),
               "Um único hook de formulário (valores, erros, validação) reaproveitado pelos formulários de categoria e de prato."],
          ], [3.6 * cm, 4.4 * cm, 8 * cm]),
          Spacer(1, 0.5 * cm)]
    # 11
    c += [topico(11, "Declaração de uso de IA generativa"),
          P("<b>A equipe utilizou IA generativa</b> no desenvolvimento deste trabalho, de forma declarada:"),
          tabela(["Ferramenta", "Como foi usada"], [
              ["Lovable (agente de IA para desenvolvimento Web)",
               "Geração inicial do código da interface, do serviço Web, da estrutura do banco e dos testes, a partir do "
               "enunciado do trabalho; geração da imagem ilustrativa do cardápio público; apoio na montagem deste relatório "
               "e das capturas de tela."],
          ], [5 * cm, 11 * cm]),
          Spacer(1, 0.2 * cm),
          P("A IA não foi usada como caixa-preta: a equipe revisou o código, executou e testou cada tela e cada regra do "
            "cenário na aplicação publicada, e é capaz de explicar a arquitetura, as camadas e cada arquivo entregue. "
            + pendente("a equipe deve confirmar/ajustar este texto com o que cada integrante realmente fez")),
          PageBreak()]
    # 12
    c += [topico(12, "Considerações finais e aprendizados da equipe"),
          P(pendente("rascunho — revisar com as palavras da equipe")),
          P("<b>O que aprendemos.</b> Entendemos na prática a diferença entre validar no navegador e validar no servidor: "
            "a validação da interface melhora a experiência, mas só a do serviço Web garante a regra, porque qualquer "
            "pessoa pode chamar a API diretamente. Também vimos o valor de separar a aplicação em camadas: como as regras "
            "do cenário dependem de repositórios, e não do banco, conseguimos testá-las automaticamente sem banco de dados."),
          P("<b>Dificuldades.</b> A regra de nome de categoria sem repetição parecia simples, mas exigiu decidir o que é "
            "“repetido” (maiúsculas, espaços extras e acentos) e protegê-la também no banco, com um índice único, para "
            "evitar duplicidade quando dois cadastros acontecem ao mesmo tempo. Outro ponto foi padronizar as mensagens "
            "de erro do serviço Web para que a interface mostrasse cada erro no campo certo."),
          P("<b>O que faríamos a seguir.</b> Login para a área de gestão (hoje o painel é aberto), envio do cardápio "
            "direto para o WhatsApp e fotos dos pratos."),
          Spacer(1, 0.5 * cm)]
    # 13
    c += [topico(13, "Referências"),
          P("MOZILLA. <i>MDN Web Docs — HTTP response status codes</i>. Disponível em: https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status."),
          P("TANSTACK. <i>TanStack Start — Server Routes</i>. Disponível em: https://tanstack.com/start/latest/docs/framework/react/guide/server-routes."),
          P("TANSTACK. <i>TanStack Query — Documentation</i>. Disponível em: https://tanstack.com/query/latest."),
          P("ZOD. <i>Zod — TypeScript-first schema validation</i>. Disponível em: https://zod.dev."),
          P("POSTGRESQL GLOBAL DEVELOPMENT GROUP. <i>PostgreSQL Documentation — Constraints</i>. Disponível em: https://www.postgresql.org/docs/current/ddl-constraints.html."),
          P("MARTIN, Robert C. <i>Código limpo: habilidades práticas do Agile Software</i>. Rio de Janeiro: Alta Books, 2009."),
          P("LOVABLE. <i>Lovable Documentation</i>. Disponível em: https://docs.lovable.dev."),
          ]
    return c


def rodape(canvas, doc):
    if doc.page == 1:
        return
    canvas.saveState()
    canvas.setFont("Sans", 8)
    canvas.setFillColor(CINZA)
    canvas.drawString(2 * cm, 1.2 * cm, "N695 – Desenvolvimento de Plataformas Web · Sabor de Casa (Cenário 3)")
    canvas.drawRightString(A4[0] - 2 * cm, 1.2 * cm, f"Página {doc.page}")
    canvas.setStrokeColor(BORDA)
    canvas.line(2 * cm, 1.6 * cm, A4[0] - 2 * cm, 1.6 * cm)
    canvas.restoreState()


def main():
    doc = SimpleDocTemplate(SAIDA, pagesize=A4, leftMargin=2 * cm, rightMargin=2 * cm, topMargin=2 * cm,
                            bottomMargin=2.2 * cm, title="N695 — Entrega — Sabor de Casa",
                            author="Equipe N695 — Cenário 3")
    doc.build(capa() + conteudo(), onFirstPage=rodape, onLaterPages=rodape)
    print("PDF gerado em", SAIDA)


if __name__ == "__main__":
    main()
