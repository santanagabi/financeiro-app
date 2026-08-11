import { Routes } from "@angular/router";

export const routes: Routes = [
  { path: "", redirectTo: "dashboard", pathMatch: "full" },
  {
    path: "dashboard",
    loadComponent: () =>
      import("./features/dashboard/dashboard.component").then(
        (m) => m.DashboardComponent,
      ),
    title: "Dashboard | Financeiro",
  },
  {
    path: "cadastro",
    loadComponent: () =>
      import("./features/movimentacoes/cadastro/cadastro.component").then(
        (m) => m.CadastroComponent,
      ),
    title: "Nova Movimentação | Financeiro",
  },
  { path: "**", redirectTo: "dashboard" },
];
