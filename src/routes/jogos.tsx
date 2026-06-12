import { createFileRoute, redirect } from "@tanstack/react-router";

// Redirect /jogos → /_authenticated/jogos (the gated layout handles auth check).
// Using a clean public-looking URL since users land on /jogos after signup.
export const Route = createFileRoute("/jogos")({
  beforeLoad: () => {
    throw redirect({ to: "/_authenticated/jogos" as never });
  },
  component: () => null,
});
