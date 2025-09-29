import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

import {
  MovieCardComponent,
  MovieCardEvent,
} from '../movie-card/movie-card.component';
import { MovieStoreService } from '../../services/movie-store.service';

/**
 * Componente para mostrar solo las películas favoritas
 */
@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MovieCardComponent,
  ],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss',
})
export class FavoritesComponent {
  public readonly movieStore = inject(MovieStoreService);
  private readonly router = inject(Router);

  public handleMovieCardEvent(event: MovieCardEvent): void {
    switch (event.type) {
      case 'favoriteToggle':
        this.movieStore.toggleFavorite(event.movieId);
        break;

      case 'watchedToggle':
        this.movieStore.toggleWatched(event.movieId);
        break;

      case 'viewDetails':
        this.router.navigate(['/movies', event.movieId]);
        break;
    }
  }
}
