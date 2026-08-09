import { Component, OnInit, signal } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { MovimentacaoService } from "./services/movimentacao.service";

@Component({
  selector: "app-root",
  standalone: true, // standalone = não precisa registrar em NgModule
  imports: [RouterOutlet, RouterLink, RouterLinkActive], // o que ele vai usar no html
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent implements OnInit {
  menuOpen = signal(false);

  // O Constructor é onde você injeta serviços globais
  constructor(private movimentacaoService: MovimentacaoService) {}

  ngOnInit(): void {
    this.movimentacaoService.carregarDados();
  }

  toggleMenu() {
    this.menuOpen.update((v) => !v);
  }
}
