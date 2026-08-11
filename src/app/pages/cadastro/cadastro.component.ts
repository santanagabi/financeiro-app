import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { form, FormField, submit, required, min, minLength, maxLength } from '@angular/forms/signals';
import { MovimentacaoService } from '../../services/movimentacao.service';
import { CategoriaMovimentacao } from '../../models/movimentacao.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, FormField, MatFormFieldModule, MatInputModule, MatSelectModule, MatRadioModule, MatButtonModule, MatCardModule, MatIconModule, MatSnackBarModule],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CadastroComponent {

  private movimentacaoService = inject(MovimentacaoService);
  private snackBar = inject(MatSnackBar);

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
  readonly salvando = signal(false);

  /**
   * --- CONCEITOS ARQUITETURAIS APLICADOS (Para a Entrevista) ---
   * 
   * Por que usar Signal Forms (v21+) ao invés do clássico Reactive Forms (FormBuilder)?
   * 
   * 1. Reatividade Síncrona e Unificada: Em Reactive Forms, os valores são Observables (RxJS), 
   *    exigindo gerenciamento de assinaturas (.subscribe). Com Signals, o estado do formulário 
   *    é 100% síncrono e integrado perfeitamente ao ChangeDetection.OnPush, sem vazamento de memória.
   * 
   * 2. Type-Safety (Tipagem Forte) Baseado no Modelo: Ao invés de o formulário ditar o tipo
   *    dos dados, a estrutura nasce a partir de um Model fortemente tipado (`this.model`).
   *    O formulário apenas mapeia esse Model com regras de validação, impedindo erros de tipagem
   *    comuns do FormBuilder (como valores "null" não esperados).
   */
  protected readonly model = signal({
    data: '',
    tipo: 'Entrada' as 'Entrada' | 'Saida',
    categoria: '',
    descricao: '',
    valor: 0,
  });

  readonly userForm = form(this.model, (schemaPath) => {
    required(schemaPath.data);
    required(schemaPath.tipo);
    required(schemaPath.categoria);
    required(schemaPath.descricao);
    minLength(schemaPath.descricao, 5);
    maxLength(schemaPath.descricao, 100);
    required(schemaPath.valor);
    min(schemaPath.valor, 0.01);
  });

  onSubmit(): void {
    submit(this.userForm, async () => {
      this.salvando.set(true);
      const valores = this.model();

      try {
        const resultado = await this.movimentacaoService.salvar({
          data: valores.data,
          tipo: valores.tipo,
          categoria: valores.categoria as CategoriaMovimentacao,
          descricao: valores.descricao,
          valor: Number(valores.valor),
        });

        if (resultado.ok) {
          this.snackBar.open(resultado.mensagem, 'OK', { 
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
          this.limpar();
        } else {
          this.snackBar.open(resultado.mensagem, 'Fechar', { 
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        }
      } catch (err: any) {
        this.snackBar.open('Erro interno ao salvar: ' + (err.message || String(err)), 'Fechar', { 
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      } finally {
        this.salvando.set(false);
      }
    });
  }

  limpar(): void {
    this.model.set({
      data: '',
      tipo: 'Entrada',
      categoria: '',
      descricao: '',
      valor: 0,
    });
    // Reseta o estado do form (touched, dirty) para apagar os erros visuais
    this.userForm().reset();
  }
}
