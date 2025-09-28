import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';

import {
  MovieCardComponent,
  MovieCardEvent,
} from '../movie-card/movie-card.component';
import { MovieApiService } from '../../services/movie-api.service';
import { MovieStoreService } from '../../services/movie-store.service';
import { Movie } from '../../interfaces/movie.interface';
import { Genre } from '../../interfaces/genre.interface';
import { ToastService } from '@core/services/toast.service';

/**
 * Componente principal para listar y gestionar películas
 * Responsabilidad: Orquestar carga de datos, filtros y acciones CRUD
 */
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
    MovieCardComponent,
  ],
  templateUrl: './movie-list.component.html',
  styleUrl: './movie-list.component.scss',
})
export class MovieListComponent implements OnInit {
  private readonly movieApiService = inject(MovieApiService);
  public readonly movieStore = inject(MovieStoreService);
  private readonly toastService = inject(ToastService);

  public searchTerm = '';
  public selectedCategory = 'popular';
  public showOnlyFavorites = false;
  public showOnlyWatched = false;
  public readonly isLoading = signal(false);
  public readonly genres = signal<Genre[]>([]);

  public readonly displayedMovies = signal<Movie[]>([]);

  ngOnInit(): void {
    this.loadGenres();
    this.loadPopularMovies();
  }

  public loadPopularMovies(): void {
    this.isLoading.set(true);
    this.movieApiService.getPopularMovies().subscribe({
      next: (response) => {
        this.movieStore.setMovies(response.results);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: (error) => {
        this.toastService.error('Error', 'No se pudieron cargar las películas');
        this.isLoading.set(false);
      },
    });
  }

  public loadTopRatedMovies(): void {
    this.isLoading.set(true);
    this.movieApiService.getTopRatedMovies().subscribe({
      next: (response) => {
        this.movieStore.setMovies(response.results);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Error', 'No se pudieron cargar las películas');
        this.isLoading.set(false);
      },
    });
  }

  public loadNowPlayingMovies(): void {
    this.isLoading.set(true);
    this.movieApiService.getNowPlayingMovies().subscribe({
      next: (response) => {
        this.movieStore.setMovies(response.results);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Error', 'No se pudieron cargar las películas');
        this.isLoading.set(false);
      },
    });
  }

  public loadUpcomingMovies(): void {
    this.isLoading.set(true);
    this.movieApiService.getUpcomingMovies().subscribe({
      next: (response) => {
        this.movieStore.setMovies(response.results);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Error', 'No se pudieron cargar las películas');
        this.isLoading.set(false);
      },
    });
  }

  private loadGenres(): void {
    this.movieApiService.getGenres().subscribe({
      next: (response) => {
        this.genres.set(response.genres);
      },
      error: () => {
        console.warn('No se pudieron cargar los géneros');
      },
    });
  }

  public onSearch(): void {
    if (this.searchTerm.trim()) {
      this.isLoading.set(true);
      this.movieApiService.searchMovies(this.searchTerm).subscribe({
        next: (response) => {
          this.movieStore.setMovies(response.results);
          this.applyFilters();
          this.isLoading.set(false);
        },
        error: () => {
          this.toastService.error('Error', 'Error en la búsqueda');
          this.isLoading.set(false);
        },
      });
    } else {
      this.loadMoviesByCategory();
    }
  }

  public onCategoryChange(): void {
    this.searchTerm = '';
    this.loadMoviesByCategory();
  }

  public toggleFavoritesFilter(): void {
    this.showOnlyFavorites = !this.showOnlyFavorites;
    this.applyFilters();
  }

  public toggleWatchedFilter(): void {
    this.showOnlyWatched = !this.showOnlyWatched;
    this.applyFilters();
  }

  private loadMoviesByCategory(): void {
    switch (this.selectedCategory) {
      case 'popular':
        this.loadPopularMovies();
        break;
      case 'top_rated':
        this.loadTopRatedMovies();
        break;
      case 'now_playing':
        this.loadNowPlayingMovies();
        break;
      case 'upcoming':
        this.loadUpcomingMovies();
        break;
    }
  }

  private applyFilters(): void {
    let movies = this.movieStore.movies();

    if (this.showOnlyFavorites) {
      movies = movies.filter((movie) => movie.isFavorite);
    }

    if (this.showOnlyWatched) {
      movies = movies.filter((movie) => movie.isWatched);
    }

    this.displayedMovies.set(movies);
  }

  public handleMovieCardEvent(event: MovieCardEvent): void {
    switch (event.type) {
      case 'favoriteToggle':
        this.movieStore.toggleFavorite(event.movieId);
        this.applyFilters();
        break;

      case 'watchedToggle':
        this.movieStore.toggleWatched(event.movieId);
        this.applyFilters();
        break;

      case 'viewDetails':
        // TODO: Navegar a página de detalles o abrir modal
        this.toastService.info(
          'Detalles',
          `Ver detalles de película ID: ${event.movieId}`
        );
        break;
    }
  }
}
