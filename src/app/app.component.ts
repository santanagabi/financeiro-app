import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MovimentacaoService } from './services/movimentacao.service';

@Component({
  selector: 'app-root',
  standalone: true, // standalone = não precisa registrar em NgModule, parecido com SFC do Vue
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  // OnInit é o equivalente ao onMounted() do Vue (roda quando o componente "monta")
  constructor(private movimentacaoService: MovimentacaoService) {}

  ngOnInit(): void {
    this.movimentacaoService.carregarDados();
  }
}
