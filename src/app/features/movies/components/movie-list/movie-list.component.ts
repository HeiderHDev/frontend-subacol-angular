import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import {
  MovieCardComponent,
  MovieCardEvent,
} from '../movie-card/movie-card.component';
import { MovieApiService } from '../../services/movie-api.service';
import { MovieStoreService } from '../../services/movie-store.service';
import { ToastService } from '@core/services/toast.service';

import { GenreResponse } from '../../interfaces/genre.interface';
import { Movie } from '../../interfaces/movie.interface';
import { MovieList, Result } from '../../interfaces/tmdb-response.interface';

type Category = 'popular' | 'top_rated' | 'now_playing' | 'upcoming' | 'custom';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatButtonToggleModule,
    MovieCardComponent,
  ],
  templateUrl: './movie-list.component.html',
  styleUrl: './movie-list.component.scss',
})
export class MovieListComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly api = inject(MovieApiService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  public readonly store = inject(MovieStoreService);

  @ViewChild('sentinel', { static: false }) sentinel!: ElementRef<HTMLElement>;

  public searchTerm = '';
  public selectedCategory: Category = 'popular';
  public showOnlyFavorites = false;
  public showOnlyWatched = false;

  public readonly genres = signal<GenreResponse['genres']>([]);
  public readonly displayed = signal<Movie[]>([]);

  private readonly page = signal<number>(1);
  private readonly totalPages = signal<number>(1);
  private readonly isLoading = signal<boolean>(false);

  public readonly isLoadingMore = computed<boolean>(() => this.isLoading());
  public readonly hasMorePages = computed<boolean>(
    () => this.page() < this.totalPages()
  );

  public readonly toggleGroupValue = computed<string[]>(() => {
    const values: string[] = [];
    if (this.showOnlyFavorites) values.push('fav');
    if (this.showOnlyWatched) values.push('seen');
    return values;
  });

  private observer: IntersectionObserver | null = null;

  ngOnInit(): void {
    this.loadGenres();
    this.resetAndLoad();
  }

  ngAfterViewInit(): void {
    this.setupObserver();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.observer = null;
  }

  private setupObserver(): void {
    if (!this.sentinel?.nativeElement) return;

    this.observer?.disconnect();

    this.observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting && this.hasMorePages() && !this.isLoading()) {
          this.loadNextPage();
        }
      },
      {
        root: null,
        rootMargin: '400px 0px',
        threshold: 0.01,
      }
    );

    this.observer.observe(this.sentinel.nativeElement);
  }

  private loadNextPage(): void {
    this.page.set(this.page() + 1);
    this.fetch();
  }

  public resetAndLoad(): void {
    this.page.set(1);
    this.totalPages.set(1);
    this.isLoading.set(false);
    this.store.setMovies([]);
    this.displayed.set([]);
    this.fetch();
  }

  private fetch(): void {
    if (this.selectedCategory === 'custom') {
      const customMovies = this.store.customMovies();
      this.displayed.set(this.applyToggles(customMovies));
      this.totalPages.set(1);
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    const currentPage = this.page();
    const trimmed = this.searchTerm.trim();

    const request$ =
      trimmed.length > 0
        ? this.api.searchMovies(trimmed, { page: currentPage })
        : this.getCategoryCall(this.selectedCategory, currentPage);

    request$.subscribe({
      next: (resp: MovieList) => {
        const prevTmdb: Result[] = this.store.tmdbMovies();
        const prevIds = new Set<number>(prevTmdb.map((m: Result) => m.id));

        const uniqueNew: Result[] = resp.results.filter(
          (r: Result) => !prevIds.has(r.id)
        );

        const combinedResults: Result[] = [...prevTmdb, ...uniqueNew];

        this.store.setMovies(combinedResults);

        this.displayed.set(this.applyToggles(this.store.movies()));
        this.totalPages.set(resp.total_pages ?? 1);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Error', 'No se pudieron cargar las películas');
        this.isLoading.set(false);
      },
    });
  }

  private getCategoryCall(cat: Category, page: number) {
    switch (cat) {
      case 'popular':
        return this.api.getPopularMovies({ page });
      case 'top_rated':
        return this.api.getTopRatedMovies({ page });
      case 'now_playing':
        return this.api.getNowPlayingMovies({ page });
      case 'upcoming':
        return this.api.getUpcomingMovies({ page });
      default:
        return this.api.getPopularMovies({ page });
    }
  }

  private loadGenres(): void {
    this.api.getGenres().subscribe({
      next: (r: GenreResponse) => this.genres.set(r.genres),
      error: () => console.warn('No se pudieron cargar los géneros'),
    });
  }

  public onSearch(): void {
    this.page.set(1);
    this.totalPages.set(1);
    this.store.setMovies([]);
    this.displayed.set([]);
    this.fetch();
  }

  public onCategoryChange(): void {
    this.searchTerm = '';
    this.resetAndLoad();
  }

  public toggleFavoritesFilter(): void {
    this.showOnlyFavorites = !this.showOnlyFavorites;
    this.displayed.set(this.applyToggles(this.store.movies()));
  }

  public toggleWatchedFilter(): void {
    this.showOnlyWatched = !this.showOnlyWatched;
    this.displayed.set(this.applyToggles(this.store.movies()));
  }

  private applyToggles(movies: Movie[]): Movie[] {
    let list: Movie[] = movies;
    if (this.showOnlyFavorites) list = list.filter((m: Movie) => m.isFavorite);
    if (this.showOnlyWatched) list = list.filter((m: Movie) => m.isWatched);

    return list.sort((a, b) => {
      const aIsLocal = a.id < 0;
      const bIsLocal = b.id < 0;

      if (aIsLocal && !bIsLocal) return -1;
      if (!aIsLocal && bIsLocal) return 1;

      return 0;
    });
  }

  public handleCard(event: MovieCardEvent): void {
    switch (event.type) {
      case 'favoriteToggle': {
        this.store.toggleFavorite(event.movieId);
        this.displayed.set(this.applyToggles(this.store.movies()));
        break;
      }
      case 'watchedToggle': {
        this.store.toggleWatched(event.movieId);
        this.displayed.set(this.applyToggles(this.store.movies()));
        break;
      }
      case 'viewDetails': {
        this.toast.info(
          'Detalles',
          `Ver detalles de película ID: ${event.movieId}`
        );
        this.router.navigate(['/movies', event.movieId]);
        break;
      }
    }
  }

  public loadMore(): void {
    if (this.isLoading() || !this.hasMorePages()) return;
    this.loadNextPage();
  }

  public onSearchInput(): void {
    if (this.searchTerm.trim().length === 0) {
      this.onSearch();
    }
  }

  public clearSearch(): void {
    this.searchTerm = '';
    this.onSearch();
  }

  public resetFilters(): void {
    this.searchTerm = '';
    this.showOnlyFavorites = false;
    this.showOnlyWatched = false;
    this.onSearch();
  }
}
