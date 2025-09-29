import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  MovieCardComponent,
  MovieCardEvent,
} from '../movie-card/movie-card.component';
import { MovieStoreService } from '../../services/movie-store.service';
import { ToastService } from '@core/services/toast.service';

/**
 * Componente para mostrar solo las películas creadas por el usuario
 * Se distinguen por tener IDs negativos
 */
@Component({
  selector: 'app-my-movies',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MovieCardComponent,
  ],
  templateUrl: './my-movies.component.html',
  styleUrl: './my-movies.component.scss',
})
export class MyMoviesComponent {
  public readonly movieStore = inject(MovieStoreService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  // Computed para filtrar solo películas creadas por el usuario (ID negativo)
  public readonly myMovies = computed(() =>
    this.movieStore.movies().filter((movie) => movie.id < 0)
  );

  public readonly averageRating = computed(() => {
    const movies = this.myMovies();
    if (movies.length === 0) return '0.0';

    const sum = movies.reduce((acc, movie) => acc + movie.vote_average, 0);
    return (sum / movies.length).toFixed(1);
  });

  public goToCreateMovie(): void {
    this.router.navigate(['/movies/create']);
  }

  public editMovie(movieId: number): void {
    this.router.navigate(['/movies/edit', movieId]);
  }

  public deleteMovie(movieId: number): void {
    const movie = this.movieStore.getMovieById(movieId);
    if (movie && confirm(`¿Estás seguro de eliminar "${movie.title}"?`)) {
      const updatedMovies = this.movieStore
        .movies()
        .filter((m) => m.id !== movieId);
      this.movieStore.setMovies(updatedMovies);

      this.toastService.success(
        'Película eliminada',
        `"${movie.title}" ha sido eliminada permanentemente`
      );
    }
  }

  public handleMovieCardEvent(event: MovieCardEvent): void {
    switch (event.type) {
      case 'favoriteToggle':
        this.movieStore.toggleFavorite(event.movieId);
        break;

      case 'watchedToggle':
        this.movieStore.toggleWatched(event.movieId);
        break;

      case 'viewDetails':
        this.editMovie(event.movieId);
        break;
    }
  }
}
