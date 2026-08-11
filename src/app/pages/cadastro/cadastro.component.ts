import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MovimentacaoService } from '../../services/movimentacao.service';
import { CategoriaMovimentacao } from '../../models/movimentacao.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatRadioModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.scss',
})
export class CadastroComponent {
  private fb = inject(FormBuilder);
  private movimentacaoService = inject(MovimentacaoService);

  readonly categorias: CategoriaMovimentacao[] = [
    'Salário',
    'PIX',
    'TED',
    'Boleto',
    'Cartão',
    'Investimento',
    'Outros',
  ];

  // Feedback de salvar (sucesso/erro)
  readonly mensagem = signal<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  readonly salvando = signal(false);

  // FormBuilder.group() monta o estado do form e suas validações.
  readonly form = this.fb.group({
    data: ['', [Validators.required]],
    tipo: ['Entrada' as 'Entrada' | 'Saida', [Validators.required]],
    categoria: ['', [Validators.required]],
    descricao: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
    valor: [null as number | null, [Validators.required, Validators.min(0.01)]],
  });

  // Getter de conveniência pra acessar os controles no template (form.controls.x é verboso)
  get f() {
    return this.form.controls;
  }

  async onSubmit(): Promise<void> {
    this.mensagem.set(null);

    if (this.form.invalid) {
      // markAllAsTouched força o Angular a mostrar os erros de todos os campos de uma vez
      this.form.markAllAsTouched();
      return;
    }

    this.salvando.set(true);
    const valores = this.form.getRawValue();

    const resultado = await this.movimentacaoService.salvar({
      data: valores.data!,
      tipo: valores.tipo!,
      categoria: valores.categoria as CategoriaMovimentacao,
      descricao: valores.descricao!,
      valor: Number(valores.valor),
    });

    this.salvando.set(false);
    this.mensagem.set({
      tipo: resultado.ok ? 'sucesso' : 'erro',
      texto: resultado.mensagem,
    });

    if (resultado.ok) {
      this.limpar();
    }
  }

  limpar(): void {
    this.form.reset({
      data: '',
      tipo: 'Entrada',
      categoria: '',
      descricao: '',
      valor: null,
    });
  }
}
