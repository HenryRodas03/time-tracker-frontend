import { Component, OnInit, OnDestroy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShiftService } from '../../core/services/shift.service';
import { Worker, WorkShift } from '../../core/models/shift.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly shiftService = inject(ShiftService);

  readonly workerCode = signal<string>('EMP-101');
  readonly currentWorker = signal<Worker | null>(null);
  readonly activeShift = signal<WorkShift | null>(null);
  readonly hasActiveShift = signal<boolean>(false);
  readonly history = signal<WorkShift[]>([]);
  readonly workersList = signal<Worker[]>([]);
  readonly dropdownOpen = signal<boolean>(false);

  readonly elapsedSeconds = signal<number>(0);
  readonly loading = signal<boolean>(false);
  readonly actionLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly currentDateFormatted = signal<string>('');

  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private shiftStartedAt: Date | null = null;

  readonly filteredWorkers = computed(() => {
    const term = this.workerCode().trim().toLowerCase();
    const list = this.workersList();
    if (!term) return list;

    return list.filter(w =>
      w.code.toLowerCase().includes(term) ||
      w.name.toLowerCase().includes(term)
    );
  });

  readonly timerDisplay = computed(() => {
    const total = this.elapsedSeconds();
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  });

  readonly canStart = computed(() => {
    return !this.actionLoading() && !!this.currentWorker() && !this.hasActiveShift();
  });

  readonly canEnd = computed(() => {
    return !this.actionLoading() && !!this.currentWorker() && this.hasActiveShift();
  });

  ngOnInit(): void {
    const today = new Date();
    const formatted = today.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    this.currentDateFormatted.set(formatted.charAt(0).toUpperCase() + formatted.slice(1));

    this.loadWorkersList();
    this.consultWorker();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  loadWorkersList(): void {
    this.shiftService.getWorkers().subscribe({
      next: (resp) => {
        this.workersList.set(resp.data ?? []);
      },
      error: () => {
        this.workersList.set([]);
      },
    });
  }

  toggleDropdown(): void {
    this.dropdownOpen.update(v => !v);
  }

  closeDropdown(): void {
    this.dropdownOpen.set(false);
  }

  selectWorker(worker: Worker): void {
    this.workerCode.set(worker.code);
    this.closeDropdown();
    this.consultWorker();
  }

  consultWorker(codeOverride?: string): void {
    if (codeOverride) {
      this.workerCode.set(codeOverride);
    }

    const code = this.workerCode().trim();
    if (!code) {
      this.errorMessage.set('Por favor ingresa un codigo de trabajador.');
      return;
    }

    this.loading.set(true);
    this.clearMessages();

    this.shiftService.getStatus(code).subscribe({
      next: (resp) => {
        const data = resp.data;
        this.currentWorker.set(data.worker);
        this.hasActiveShift.set(data.has_active_shift);
        this.activeShift.set(data.active_shift);

        if (data.has_active_shift && data.active_shift) {
          this.shiftStartedAt = new Date(data.active_shift.started_at);
          this.startTimer(this.shiftStartedAt);
        } else {
          this.stopTimer();
          this.elapsedSeconds.set(0);
        }

        this.loadHistory(code);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.currentWorker.set(null);
        this.hasActiveShift.set(false);
        this.activeShift.set(null);
        this.history.set([]);
        this.stopTimer();
        this.elapsedSeconds.set(0);
        this.handleHttpError(err);
      },
    });
  }

  startShift(): void {
    const code = this.workerCode().trim();
    if (!code) return;

    this.actionLoading.set(true);
    this.clearMessages();

    this.shiftService.startShift(code).subscribe({
      next: (resp) => {
        this.actionLoading.set(false);
        this.successMessage.set(resp.message ?? 'Jornada iniciada exitosamente.');
        this.hasActiveShift.set(true);
        this.activeShift.set(resp.data);
        this.shiftStartedAt = new Date(resp.data.started_at);
        this.startTimer(this.shiftStartedAt);
        this.loadHistory(code);
      },
      error: (err) => {
        this.actionLoading.set(false);
        this.handleHttpError(err);
      },
    });
  }

  endShift(): void {
    const code = this.workerCode().trim();
    if (!code) return;

    this.actionLoading.set(true);
    this.clearMessages();

    this.shiftService.endShift(code).subscribe({
      next: (resp) => {
        this.actionLoading.set(false);
        const duration = resp.data.duration_formatted ?? `${resp.data.total_worked_seconds}s`;
        this.successMessage.set(
          `Jornada finalizada exitosamente. Tiempo total laborado: ${duration}.`
        );
        this.hasActiveShift.set(false);
        this.activeShift.set(null);
        this.stopTimer();
        this.elapsedSeconds.set(resp.data.total_worked_seconds ?? 0);
        this.loadHistory(code);
      },
      error: (err) => {
        this.actionLoading.set(false);
        this.handleHttpError(err);
      },
    });
  }

  private loadHistory(code: string): void {
    this.shiftService.getHistory(code).subscribe({
      next: (resp) => {
        this.history.set(resp.data ?? []);
      },
      error: () => {
        this.history.set([]);
      },
    });
  }

  private startTimer(startedAt: Date): void {
    this.stopTimer();
    const updateElapsed = () => {
      const now = Date.now();
      const diffMs = Math.max(0, now - startedAt.getTime());
      this.elapsedSeconds.set(Math.floor(diffMs / 1000));
    };

    updateElapsed();
    this.timerInterval = setInterval(updateElapsed, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private clearMessages(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  private handleHttpError(err: any): void {
    if (err.status === 0) {
      this.errorMessage.set('No hay conexion con el servidor backend (http://127.0.0.1:8000).');
      return;
    }

    const backendMessage = err?.error?.message;
    if (backendMessage) {
      this.errorMessage.set(backendMessage);
      return;
    }

    if (err.status === 404) {
      this.errorMessage.set('Trabajador no encontrado en el sistema.');
    } else if (err.status === 409) {
      this.errorMessage.set('Conflicto: Ya existe una jornada activa para este trabajador.');
    } else if (err.status === 422) {
      this.errorMessage.set('No se puede finalizar: No hay una jornada activa registrada.');
    } else {
      this.errorMessage.set('Ocurrio un error inesperado al procesar la solicitud.');
    }
  }
}

