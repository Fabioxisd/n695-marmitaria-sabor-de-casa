import { Link } from "@tanstack/react-router";
import { ChefHat } from "lucide-react";

const LINKS = [
  { to: "/", rotulo: "Categorias" },
  { to: "/cardapio", rotulo: "Cardápio público" },
] as const;

export function BarraNavegacao() {
  return (
    <header className="border-b bg-card/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground">
            <ChefHat className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="titulo-display block text-xl font-semibold">Sabor de Casa</span>
            <span className="block text-xs text-muted-foreground">Gestão do cardápio</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-semibold">
          {LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.to === "/" }}
              className="rounded-full px-4 py-2 text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
            >
              {link.rotulo}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
