import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

import { ToastService } from '@core/services/toast.service';
import { MovieCardEvent } from '@features/movies/components/movie-card/movie-card.component';
import { MovieRecommendationsComponent } from '@features/movies/components/movie-recommendations/movie-recommendations.component';
import { MovieCredits } from '../../interfaces/movie-credits.interface';
import { MovieDetails } from '../../interfaces/movie-details.interface';
import { MovieVideo } from '../../interfaces/movie-videos.interface';
import { MovieApiService } from '../../services/movie-api.service';
import { MovieStoreService } from '../../services/movie-store.service';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MovieRecommendationsComponent,
  ],
  templateUrl: './movie-details.component.html',
  styleUrl: './movie-details.component.scss',
})
export class MovieDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly movieApiService = inject(MovieApiService);
  private readonly movieStore = inject(MovieStoreService);
  private readonly toastService = inject(ToastService);
  private readonly sanitizer = inject(DomSanitizer);

  public readonly movieId = signal<number | null>(null);

  public readonly movieDetails = signal<MovieDetails | null>(null);
  public readonly videos = signal<MovieVideo[]>([]);
  public readonly credits = signal<MovieCredits | null>(null);
  public readonly selectedTrailerUrl = signal<SafeResourceUrl | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && !isNaN(+id)) {
      this.movieId.set(+id);
      this.loadMovieDetails();
      this.loadMovieVideos();
      this.loadMovieCredits();
    } else {
      this.toastService.error('Error', 'ID de película inválido');
      this.router.navigate(['/movies']);
    }
  }

  public loadMovieDetails(): void {
    const id = this.movieId();
    if (!id) return;

    if (id < 0) {
      const movie = this.movieStore.getMovieById(id);
      if (movie) {
        const mockDetails: MovieDetails = {
          id: movie.id,
          title: movie.title,
          original_title: movie.original_title,
          overview: movie.overview,
          release_date: movie.release_date,
          original_language: movie.original_language,
          adult: movie.adult,
          video: movie.video,
          vote_average: movie.vote_average,
          vote_count: movie.vote_count,
          popularity: movie.popularity,
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          runtime: (movie as any).runtime || null,
          budget: (movie as any).budget || 0,
          revenue: (movie as any).revenue || 0,
          homepage: (movie as any).homepage || null,
          imdb_id: null,
          status: (movie as any).status || 'Released',
          tagline: (movie as any).tagline || null,
          belongs_to_collection: null,
          genres: [],
          production_companies: [],
          production_countries: [],
          spoken_languages: [],
          origin_country: [],
        };

        if ((movie as any).videos && Array.isArray((movie as any).videos)) {
          this.videos.set(
            (movie as any).videos.map((v: any) => ({
              id: v.key,
              key: v.key,
              name: v.name,
              site: v.site,
              type: v.type,
              official: v.official,
              size: v.size,
            }))
          );

          const trailers = this.videos().filter((v) => v.type === 'Trailer');
          if (trailers.length > 0) {
            this.selectTrailer(trailers[0]);
          }
        }

        this.movieDetails.set(mockDetails);
      } else {
        this.toastService.error('Error', 'Película no encontrada');
        this.router.navigate(['/movies']);
      }
    } else {
      this.movieApiService.getMovieDetails(id).subscribe({
        next: (details) => {
          this.movieDetails.set(details);
        },
        error: () => {
          this.toastService.error(
            'Error',
            'No se pudieron cargar los detalles'
          );
          this.router.navigate(['/movies']);
        },
      });
    }
  }

  private loadMovieVideos(): void {
    const id = this.movieId();
    if (!id || id < 0) return;

    this.movieApiService.getMovieVideos(id).subscribe({
      next: (response) => {
        const trailers = response.results.filter(
          (video) => video.type === 'Trailer' && video.site === 'YouTube'
        );
        this.videos.set(trailers);

        if (trailers.length > 0) {
          this.selectTrailer(trailers[0]);
        }
      },
      error: () => {
        console.warn('No se pudieron cargar los videos');
      },
    });
  }

  private loadMovieCredits(): void {
    const id = this.movieId();
    if (!id || id < 0) return;

    this.movieApiService.getMovieCredits(id).subscribe({
      next: (credits) => {
        this.credits.set(credits);
      },
      error: () => {
        console.warn('No se pudieron cargar los créditos');
      },
    });
  }

  public selectTrailer(video: MovieVideo): void {
    const url = `https://www.youtube.com/embed/${video.key}?autoplay=0&rel=0`;
    this.selectedTrailerUrl.set(
      this.sanitizer.bypassSecurityTrustResourceUrl(url)
    );
  }

  public toggleFavorite(): void {
    const id = this.movieId();
    if (id && this.movieDetails()) {
      this.movieStore.toggleFavorite(id);
      this.toastService.success(
        'Actualizado',
        this.isMovieFavorite()
          ? 'Agregado a favoritos'
          : 'Removido de favoritos'
      );
    }
  }

  public toggleWatched(): void {
    const id = this.movieId();
    if (id && this.movieDetails()) {
      this.movieStore.toggleWatched(id);
      this.toastService.success(
        'Actualizado',
        this.isMovieWatched() ? 'Marcado como visto' : 'Marcado como no visto'
      );
    }
  }

  public isMovieFavorite(): boolean {
    const id = this.movieId();
    return id
      ? this.movieStore.favorites().some((movie) => movie.id === id)
      : false;
  }

  public isMovieWatched(): boolean {
    const id = this.movieId();
    return id
      ? this.movieStore.watched().some((movie) => movie.id === id)
      : false;
  }

  public getPosterUrl(): string {
    const details = this.movieDetails();
    return this.movieApiService.getPosterUrl(details?.poster_path || null);
  }

  public getBackdropUrl(): string {
    const details = this.movieDetails();
    return this.movieApiService.getBackdropUrl(details?.backdrop_path || null);
  }

  public getProfileUrl(profilePath: string | null): string {
    return this.movieApiService.getProfileUrl(profilePath);
  }

  public getCompanyLogoUrl(logoPath: string | null): string {
    return this.movieApiService.getImageUrl(logoPath, 'poster');
  }

  public getReleaseYear(): string {
    const details = this.movieDetails();
    return details?.release_date
      ? new Date(details.release_date).getFullYear().toString()
      : '';
  }

  public formatRuntime(): string {
    const runtime = this.movieDetails()?.runtime;
    if (!runtime) return '';

    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    return `${hours}h ${minutes}m`;
  }

  public formatBudget(): string {
    const budget = this.movieDetails()?.budget;
    if (!budget) return 'No disponible';

    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(budget);
  }

  public formatRevenue(): string {
    const revenue = this.movieDetails()?.revenue;
    if (!revenue) return 'No disponible';

    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(revenue);
  }

  public getMainCast(): any[] {
    return this.credits()?.cast.slice(0, 10) || [];
  }

  public getDirectors(): any[] {
    return (
      this.credits()?.crew.filter((person) => person.job === 'Director') || []
    );
  }

  public handleRecommendationEvent(event: MovieCardEvent): void {
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

  public goBackToMovies(): void {
    this.router.navigate(['/movies']);
  }
}
