import type { ReactNode } from "react";

export function CartaoFormulario({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-2xl rounded-2xl border bg-card p-6 shadow-card sm:p-8">{children}</div>
  );
}
