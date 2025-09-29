import { Component, input, output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Genre } from '../../interfaces/genre.interface';
import { MovieApiService } from '../../services/movie-api.service';
import { Result } from '../../interfaces/tmdb-response.interface';
import { Movie } from '../../interfaces/movie.interface';

/**
 * Evento que emite el MovieCard
 */
export interface MovieCardEvent {
  type: 'favoriteToggle' | 'watchedToggle' | 'viewDetails';
  movieId: number;
}

/**
 * Componente de tarjeta para mostrar películas
 * Responsabilidad: Solo presentación y emisión de eventos
 * No maneja estado, solo recibe datos y emite acciones
 */
@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.scss',
})
export class MovieCardComponent {
  private readonly movieApiService = inject(MovieApiService);

  public readonly movie = input.required<Result | Movie>();
  public readonly genres = input<Genre[]>([]);

  public readonly cardEvent = output<MovieCardEvent>();

  public readonly posterUrl = computed(() =>
    this.movieApiService.getImageUrl(this.movie().poster_path, 'poster')
  );

  public readonly releaseYear = computed(() =>
    new Date(this.movie().release_date).getFullYear()
  );

  public readonly movieGenres = computed(() => {
    const movieGenreIds = this.movie().genre_ids;
    const allGenres = this.genres();
    return allGenres
      .filter((genre) => movieGenreIds.includes(genre.id))
      .slice(0, 3);
  });

  public isFavorite(): boolean {
    return 'isFavorite' in this.movie()
      ? (this.movie() as Movie).isFavorite
      : false;
  }

  public isWatched(): boolean {
    return 'isWatched' in this.movie()
      ? (this.movie() as Movie).isWatched
      : false;
  }

  public getPersonalRating(): number | null {
    return 'personalRating' in this.movie()
      ? (this.movie() as Movie).personalRating
      : null;
  }

  public getPersonalNotes(): string {
    return 'personalNotes' in this.movie()
      ? (this.movie() as Movie).personalNotes
      : '';
  }

  public onToggleFavorite(): void {
    this.cardEvent.emit({ type: 'favoriteToggle', movieId: this.movie().id });
  }

  public onToggleWatched(): void {
    this.cardEvent.emit({ type: 'watchedToggle', movieId: this.movie().id });
  }

  public onViewDetails(): void {
    this.cardEvent.emit({ type: 'viewDetails', movieId: this.movie().id });
  }

  public onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img) return;
    img.src = '/assets/img/image-not-found.png';
  }
}
