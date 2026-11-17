CREATE TABLE public.categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL CHECK (length(btrim(nome)) > 0),
  descricao text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX categorias_nome_unico ON public.categorias (lower(btrim(nome)));

CREATE TABLE public.pratos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria_id uuid NOT NULL REFERENCES public.categorias(id) ON DELETE RESTRICT,
  nome text NOT NULL CHECK (length(btrim(nome)) > 0),
  descricao text,
  preco numeric(10,2) NOT NULL CHECK (preco > 0),
  disponivel boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX pratos_categoria_idx ON public.pratos (categoria_id);

GRANT ALL ON public.categorias TO service_role;
GRANT ALL ON public.pratos TO service_role;

ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pratos ENABLE ROW LEVEL SECURITY;
-- Sem políticas para anon/authenticated: o acesso aos dados acontece apenas pelo serviço Web (API) da aplicação.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER categorias_updated_at BEFORE UPDATE ON public.categorias
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER pratos_updated_at BEFORE UPDATE ON public.pratos
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.categorias (id, nome, descricao) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Marmitas Tradicionais', 'Arroz, feijão e a mistura do dia, do jeito de casa.'),
  ('22222222-2222-2222-2222-222222222222', 'Fitness', 'Opções leves, com proteína e legumes.'),
  ('33333333-3333-3333-3333-333333333333', 'Sobremesas', 'Doces caseiros para fechar a refeição.'),
  ('44444444-4444-4444-4444-444444444444', 'Bebidas', 'Sucos naturais e refrigerantes.');

INSERT INTO public.pratos (categoria_id, nome, descricao, preco, disponivel) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Feijoada completa', 'Feijoada com arroz, couve, farofa e laranja.', 24.90, true),
  ('11111111-1111-1111-1111-111111111111', 'Frango assado', 'Coxa e sobrecoxa assadas, arroz, feijão e salada.', 19.90, true),
  ('11111111-1111-1111-1111-111111111111', 'Carne de sol com macaxeira', 'Carne de sol acebolada, macaxeira cozida e vinagrete.', 27.50, true),
  ('11111111-1111-1111-1111-111111111111', 'Panelada', 'Panelada cearense com arroz e farofa.', 22.00, false),
  ('22222222-2222-2222-2222-222222222222', 'Frango grelhado com legumes', 'Peito de frango, brócolis, cenoura e arroz integral.', 21.90, true),
  ('22222222-2222-2222-2222-222222222222', 'Tilápia com purê de abóbora', 'Filé de tilápia grelhado e purê de abóbora.', 25.90, true),
  ('33333333-3333-3333-3333-333333333333', 'Pudim de leite', 'Fatia de pudim de leite condensado.', 7.50, true),
  ('33333333-3333-3333-3333-333333333333', 'Mousse de maracujá', 'Pote de 150 ml.', 6.00, true),
  ('44444444-4444-4444-4444-444444444444', 'Suco de cajá 500 ml', 'Suco natural da fruta.', 6.50, true);