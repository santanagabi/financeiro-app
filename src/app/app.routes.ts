import { Routes } from "@angular/router";

// A diferença é o "loadComponent" -> isso faz lazy loading automático (code splitting),
// ou seja, o código da tela só é baixado quando o usuário navega até ela.
export const routes: Routes = [
  { path: "", redirectTo: "dashboard", pathMatch: "full" },
  {
    path: "dashboard",
    loadComponent: () =>
      import("./pages/dashboard/dashboard.component").then(
        (m) => m.DashboardComponent,
      ),
    title: "Dashboard | Financeiro",
  },
  {
    path: "cadastro",
    loadComponent: () =>
      import("./pages/cadastro/cadastro.component").then(
        (m) => m.CadastroComponent,
      ),
    title: "Nova Movimentação | Financeiro",
  },
  { path: "**", redirectTo: "dashboard" },
];
