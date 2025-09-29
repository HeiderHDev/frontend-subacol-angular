import {
  Component,
  inject,
  signal,
  OnInit,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { MovieApiService } from '../../services/movie-api.service';
import { MovieStoreService } from '../../services/movie-store.service';
import {
  MovieCardComponent,
  MovieCardEvent,
} from '../movie-card/movie-card.component';
import { CarouselComponent } from '@shared/components/carousel/carousel.component';
import { Result } from '../../interfaces/tmdb-response.interface';
import { GenreResponse } from '../../interfaces/genre.interface';

@Component({
  selector: 'app-movie-recommendations',
  standalone: true,
  imports: [CommonModule, MatIconModule, MovieCardComponent, CarouselComponent],
  templateUrl: './movie-recommendations.component.html',
  styleUrl: './movie-recommendations.component.scss',
})
export class MovieRecommendationsComponent implements OnInit {
  private readonly movieApiService = inject(MovieApiService);
  private readonly movieStore = inject(MovieStoreService);

  public readonly movieId = input.required<number>();

  public readonly cardEvent = output<MovieCardEvent>();

  public readonly recommendations = signal<Result[]>([]);
  public readonly genres = signal<GenreResponse['genres']>([]);

  ngOnInit(): void {
    this.loadRecommendations();
    this.loadGenres();
  }

  private loadRecommendations(): void {
    const movieId = this.movieId();

    if (movieId < 0) {
      this.loadCustomRecommendations();
    } else {
      this.movieApiService.getMovieRecommendations(movieId).subscribe({
        next: (response) => {
          const filteredMovies = response.results
            .filter((movie) => movie.poster_path)
            .slice(0, 12);

          this.recommendations.set(filteredMovies);
        },
        error: () => {
          console.warn('No se pudieron cargar las recomendaciones');
          this.loadCustomRecommendations();
        },
      });
    }
  }

  private loadCustomRecommendations(): void {
    const allMovies = this.movieStore.movies();
    const currentMovieId = this.movieId();

    const otherMovies = allMovies
      .filter((movie) => movie.id !== currentMovieId)
      .slice(0, 12);

    this.recommendations.set(otherMovies);
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

  public handleMovieCardEvent(event: MovieCardEvent): void {
    this.cardEvent.emit(event);
  }
}
