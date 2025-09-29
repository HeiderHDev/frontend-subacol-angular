import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';

import { ToastService } from '@core/services/toast.service';
import {
  FORM_VALIDATORS,
  VALIDATION_LIMITS,
} from '../../constants/validation.constants';
import { Genre } from '../../interfaces/genre.interface';
import {
  LanguageOption,
  MovieFormData,
  MovieVideoData,
} from '../../interfaces/movie-form.interface';
import { Movie } from '../../interfaces/movie.interface';
import { Result } from '../../interfaces/tmdb-response.interface';
import { MovieApiService } from '../../services/movie-api.service';
import { MovieStoreService } from '../../services/movie-store.service';
import { FormUtils } from '../../utils/form.utils';

/**
 * Componente de formulario reactivo para crear/editar películas
 * Implementa CRUD local con validaciones avanzadas
 */
@Component({
  selector: 'app-movie-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatCardModule,
    MatSliderModule,
    MatProgressBarModule,
    MatStepperModule,
    MatTooltipModule,
  ],
  templateUrl: './movie-form.component.html',
  styleUrl: './movie-form.component.scss',
})
export class MovieFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly movieApiService = inject(MovieApiService);
  private readonly movieStore = inject(MovieStoreService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);

  public readonly genres = signal<Genre[]>([]);
  public readonly isSubmitting = signal(false);
  public readonly isLoadingGenres = signal(false);
  public readonly movieId = signal<number | null>(null);
  public readonly existingMovie = signal<Movie | null>(null);
  public readonly isEditMode = computed(() => this.movieId() !== null);
  public readonly formProgress = signal(0);
  public readonly videos = signal<MovieVideoData[]>([]);

  public movieForm: FormGroup;

  public readonly VALIDATION_LIMITS = VALIDATION_LIMITS;
  public readonly FormUtils = FormUtils;

  public readonly languages: LanguageOption[] = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'Inglés' },
    { code: 'fr', name: 'Francés' },
    { code: 'de', name: 'Alemán' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Portugués' },
    { code: 'ja', name: 'Japonés' },
    { code: 'ko', name: 'Coreano' },
    { code: 'zh', name: 'Chino' },
    { code: 'ru', name: 'Ruso' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ar', name: 'Árabe' },
  ];

  public readonly overviewLength = computed(() => {
    const overview = this.movieForm?.get('overview')?.value || '';
    return overview.length;
  });

  public readonly overviewProgress = computed(() => {
    const length = this.overviewLength();
    return (length / VALIDATION_LIMITS.OVERVIEW.MAX) * 100;
  });

  public readonly selectedGenres = computed(() => {
    const selectedIds = this.movieForm?.get('genreIds')?.value || [];
    return this.genres().filter((genre) => selectedIds.includes(genre.id));
  });

  public readonly canSubmit = computed(() => {
    return !this.isSubmitting();
  });

  public readonly hasPreviewData = computed(() => {
    const title = this.movieForm?.get('title')?.value;
    const overview = this.movieForm?.get('overview')?.value;
    return !!(title?.trim() && overview?.trim());
  });

  public readonly selectedLanguageName = computed(() => {
    const code = this.movieForm.get('originalLanguage')?.value;
    if (!code) return '';
    return this.languages.find((l) => l.code === code)?.name || '';
  });

  constructor() {
    this.movieForm = this.createForm();
    this.setupFormWatchers();

    effect(() => {
      const control = this.movieForm.get('genreIds');
      if (this.isLoadingGenres()) {
        control?.disable();
      } else {
        control?.enable();
      }
    });
  }

  ngOnInit(): void {
    this.loadGenres();
    this.checkEditMode();
    this.calculateFormProgress();
  }

  /**
   * Configura los watchers del formulario para reactividad
   */
  private setupFormWatchers(): void {
    this.movieForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.calculateFormProgress();
      });

    this.movieForm
      .get('category')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((category) => {
        this.updateDateValidators(category);
      });

    this.movieForm
      .get('title')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (value && typeof value === 'string') {
          const hasExtraSpaces = /\s{2,}/.test(value);
          if (hasExtraSpaces) {
            const sanitized = value.replace(/\s+/g, ' ').trim();
            this.movieForm
              .get('title')
              ?.setValue(sanitized, { emitEvent: false });
          }
        }
      });

    this.movieForm
      .get('originalTitle')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (value && typeof value === 'string') {
          const hasExtraSpaces = /\s{2,}/.test(value);
          if (hasExtraSpaces) {
            const sanitized = value.replace(/\s+/g, ' ').trim();
            this.movieForm
              .get('originalTitle')
              ?.setValue(sanitized, { emitEvent: false });
          }
        }
      });
  }

  /**
   * Actualiza los validadores de fecha según la categoría seleccionada
   */
  private updateDateValidators(category: string): void {
    const releaseDateControl = this.movieForm.get('releaseDate');
    if (!releaseDateControl) return;

    releaseDateControl.clearValidators();
    releaseDateControl.setValidators([
      ...FORM_VALIDATORS.releaseDate,
      FormUtils.dateNotTooOld,
    ]);

    if (category === 'now_playing') {
      releaseDateControl.addValidators(FormUtils.dateNotInFuture);
    }

    releaseDateControl.updateValueAndValidity();
  }

  /**
   * Calcula el progreso del formulario usando utilidades
   */
  private calculateFormProgress(): void {
    const requiredFields = [
      'title',
      'originalTitle',
      'overview',
      'releaseDate',
      'originalLanguage',
      'genreIds',
      'category',
    ];

    const progress = FormUtils.calculateFormProgress(
      this.movieForm,
      requiredFields
    );
    this.formProgress.set(progress);
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && !isNaN(Number(id))) {
      const movieId = parseInt(id, 10);
      this.movieId.set(movieId);
      this.loadMovieForEdit(movieId);
    }
  }

  private loadMovieForEdit(movieId: number): void {
    const movie = this.movieStore.getMovieById(movieId);
    if (movie) {
      this.existingMovie.set(movie);
      this.populateForm(movie);
    } else {
      this.toastService.error('Error', 'Película no encontrada');
      this.router.navigate(['/my-movies']);
    }
  }

  private populateForm(movie: Movie): void {
    const releaseDate = new Date(movie.release_date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const category = releaseDate > today ? 'upcoming' : 'now_playing';

    this.movieForm.patchValue({
      title: movie.title,
      originalTitle: movie.original_title,
      overview: movie.overview,
      releaseDate: releaseDate,
      originalLanguage: movie.original_language,
      genreIds: movie.genre_ids,
      category: category,
      adult: movie.adult,
      video: movie.video,
      voteAverage: movie.vote_average,
      popularity: movie.popularity,
      posterPath: movie.poster_path || '',
      backdropPath: movie.backdrop_path || '',
      runtime: (movie as any).runtime || 120,
      budget: (movie as any).budget || 0,
      revenue: (movie as any).revenue || 0,
      tagline: (movie as any).tagline || '',
      homepage: (movie as any).homepage || '',
      status: (movie as any).status || 'Released',
    });

    if ((movie as any).videos) {
      this.videos.set((movie as any).videos);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', FORM_VALIDATORS.title],
      originalTitle: ['', FORM_VALIDATORS.originalTitle],
      overview: ['', FORM_VALIDATORS.overview],
      releaseDate: [
        '',
        [
          ...FORM_VALIDATORS.releaseDate,
          FormUtils.dateNotInFuture,
          FormUtils.dateNotTooOld,
        ],
      ],
      originalLanguage: ['es', FORM_VALIDATORS.originalLanguage],
      genreIds: [[], [...FORM_VALIDATORS.genreIds, FormUtils.atLeastOneGenre]],
      category: ['now_playing'],
      adult: [false],
      video: [false],
      voteAverage: [5.0, FORM_VALIDATORS.voteAverage],
      popularity: [100, FORM_VALIDATORS.popularity],
      posterPath: ['', FORM_VALIDATORS.posterPath],
      backdropPath: ['', FORM_VALIDATORS.backdropPath],
      runtime: [120, FORM_VALIDATORS.runtime],
      budget: [0, FORM_VALIDATORS.budget],
      revenue: [0, FORM_VALIDATORS.revenue],
      tagline: ['', FORM_VALIDATORS.tagline],
      homepage: ['', FORM_VALIDATORS.homepage],
      status: ['Released'],
    });
  }

  private loadGenres(): void {
    this.isLoadingGenres.set(true);

    this.movieApiService
      .getGenres()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.genres.set(response.genres);
          this.isLoadingGenres.set(false);
        },
        error: (error) => {
          console.error('Error loading genres:', error);
          this.toastService.warning(
            'Advertencia',
            'No se pudieron cargar los géneros'
          );
          this.isLoadingGenres.set(false);
        },
      });
  }

  public onSubmit(): void {
    if (!this.movieForm.valid) {
      FormUtils.markAllFieldsAsTouched(this.movieForm);
      this.toastService.warning(
        'Formulario Incompleto',
        'Por favor corrige los errores antes de continuar'
      );
      return;
    }

    this.isSubmitting.set(true);
    const formData = this.movieForm.value as MovieFormData;

    if (this.isEditMode()) {
      this.updateMovie(formData);
    } else {
      this.createMovie(formData);
    }
  }

  private createMovie(formData: MovieFormData): void {
    const newMovie = this.createMovieFromForm(formData);

    const success = this.movieStore.createMovie(newMovie);

    if (success) {
      this.toastService.success(
        'Película Creada',
        `"${formData.title}" se agregó exitosamente`
      );
      this.router.navigate(['/my-movies']);
    } else {
      this.toastService.error('Error', 'No se pudo crear la película');
    }

    this.isSubmitting.set(false);
  }

  private updateMovie(formData: MovieFormData): void {
    const movieId = this.movieId()!;
    const updatedData = this.createMovieFromForm(formData, movieId);

    const success = this.movieStore.updateMovie(movieId, updatedData);

    if (success) {
      this.toastService.success(
        'Película Actualizada',
        `"${formData.title}" se actualizó correctamente`
      );
      this.router.navigate(['/my-movies']);
    } else {
      this.toastService.error('Error', 'No se pudo actualizar la película');
    }

    this.isSubmitting.set(false);
  }

  public onReset(): void {
    this.movieForm.reset();
    this.movieForm.patchValue({
      originalLanguage: 'es',
      category: 'now_playing',
      adult: false,
      video: false,
      voteAverage: 5.0,
      popularity: 100,
      genreIds: [],
      runtime: 120,
      budget: 0,
      revenue: 0,
      status: 'Released',
    });
    this.videos.set([]);
    this.calculateFormProgress();
  }

  public onCancel(): void {
    this.router.navigate(this.isEditMode() ? ['/my-movies'] : ['/movies']);
  }

  public removeGenre(genreId: number): void {
    const currentGenres = this.movieForm.get('genreIds')?.value || [];
    const updatedGenres = currentGenres.filter((id: number) => id !== genreId);
    this.movieForm.get('genreIds')?.setValue(updatedGenres);
  }

  public formatSliderLabel(value: number): string {
    return value.toString();
  }

  public getFieldError(fieldName: string): string | null {
    return FormUtils.getFieldError(this.movieForm, fieldName);
  }

  public hasFieldError(fieldName: string): boolean {
    return FormUtils.hasFieldError(this.movieForm, fieldName);
  }

  public isFieldValid(fieldName: string): boolean {
    return FormUtils.isFieldValid(this.movieForm, fieldName);
  }

  public formatDate(date: Date): string {
    return FormUtils.formatDate(date);
  }

  public getSelectedGenreNames(): string {
    return FormUtils.formatGenres(this.selectedGenres());
  }

  public addVideo(): void {
    import('../video-modal/video-modal.component').then(
      ({ VideoModalComponent }) => {
        const dialogRef = this.dialog.open(VideoModalComponent, {
          width: '600px',
          data: { isEdit: false },
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.addVideoToList(result);
            this.toastService.success(
              'Video Agregado',
              `"${result.name}" se agregó correctamente`
            );
          }
        });
      }
    );
  }

  public editVideo(index: number): void {
    const video = this.videos()[index];
    if (!video) return;

    import('../video-modal/video-modal.component').then(
      ({ VideoModalComponent }) => {
        const dialogRef = this.dialog.open(VideoModalComponent, {
          width: '600px',
          data: { video, isEdit: true },
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.updateVideoAtIndex(index, result);
            this.toastService.success(
              'Video Actualizado',
              `"${result.name}" se actualizó correctamente`
            );
          }
        });
      }
    );
  }

  public removeVideo(index: number): void {
    const video = this.videos()[index];
    this.videos.update((videos) => videos.filter((_, i) => i !== index));
    this.toastService.info('Video Eliminado', `"${video.name}" se eliminó`);
  }
  private addVideoToList(video: MovieVideoData): void {
    this.videos.update((videos) => [...videos, video]);
  }

  private updateVideoAtIndex(index: number, newVideo: MovieVideoData): void {
    this.videos.update((videos) =>
      videos.map((v, i) => (i === index ? newVideo : v))
    );
  }

  public formatCurrency(value: number): string {
    return FormUtils.formatCurrency(value);
  }

  public formatRuntime(minutes: number): string {
    return FormUtils.formatDuration(minutes);
  }

  private createMovieFromForm(
    formData: MovieFormData,
    movieId?: number
  ): Result {
    const result: Result = {
      id: movieId ?? FormUtils.generateUniqueId(),
      title: formData.title.trim(),
      original_title: formData.originalTitle.trim(),
      overview: formData.overview.trim(),
      release_date: new Date(formData.releaseDate).toISOString().split('T')[0],
      original_language: formData.originalLanguage,
      genre_ids: formData.genreIds,
      adult: formData.adult,
      video: formData.video,
      vote_average: FormUtils.roundRating(formData.voteAverage || 5.0),
      vote_count: movieId ? this.existingMovie()!.vote_count : 1,
      popularity: formData.popularity || 100,
      poster_path: formData.posterPath?.trim() || null,
      backdrop_path: formData.backdropPath?.trim() || null,
    };

    (result as any).runtime = formData.runtime || null;
    (result as any).budget = formData.budget || 0;
    (result as any).revenue = formData.revenue || 0;
    (result as any).tagline = formData.tagline?.trim() || null;
    (result as any).homepage = formData.homepage?.trim() || null;
    (result as any).status = formData.status || 'Released';
    (result as any).videos = this.videos() || [];

    return result;
  }
}
