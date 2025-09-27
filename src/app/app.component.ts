import { NgxToastModule } from '@angular-magic/ngx-toast';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { LoadingService } from '@core/services/loading.service';
import { SpinnerComponent } from './core/components/spinner/spinner.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxToastModule, SpinnerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'frontend-subacol-angular';
  public loading = false;
  private readonly _loadingService = inject(LoadingService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  public ngOnInit(): void {
    this.listenToLoading();
  }

  private listenToLoading(): void {
    this._loadingService
      .isLoading()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((loading) => {
        this.loading = loading;
        this.cdr.detectChanges();
      });
  }
}
