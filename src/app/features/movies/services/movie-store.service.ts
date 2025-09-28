import { Injectable, signal, computed } from '@angular/core';
import { Movie, Result } from '../interfaces';
import { ToastService } from '@core/services/toast.service';

@Injectable({
  providedIn: 'root',
})
export class MovieStoreService {
  private readonly STORAGE_KEY = 'movieApp_data';

  private _movies = signal<Movie[]>([]);

  public movies = this._movies.asReadonly();

  public favorites = computed(() =>
    this._movies().filter((movie) => movie.isFavorite)
  );

  public watched = computed(() =>
    this._movies().filter((movie) => movie.isWatched)
  );

  constructor(private toastService: ToastService) {
    this.loadFromStorage();
  }

  public setMovies(results: Result[]): void {
    const existingMovies = this._movies();
    const existingMap = new Map(existingMovies.map((m) => [m.id, m]));

    const newMovies: Movie[] = results.map((result) => {
      const existing = existingMap.get(result.id);
      return existing
        ? { ...result, ...existing }
        : this.createMovieFromResult(result);
    });

    this._movies.set(newMovies);
    this.saveToStorage();
  }

  public toggleFavorite(id: number): void {
    const movie = this.getMovieById(id);
    if (!movie) return;

    const wasFavorite = movie.isFavorite;
    movie.isFavorite = !wasFavorite;

    this._movies.update((movies) =>
      movies.map((m) =>
        m.id === id ? { ...m, isFavorite: movie.isFavorite } : m
      )
    );

    const message = wasFavorite
      ? `"${movie.title}" removida de favoritos`
      : `"${movie.title}" agregada a favoritos`;

    this.toastService.success('Favoritos', message);
    this.saveToStorage();
  }

  public updateRating(id: number, rating: number): void {
    if (rating < 0 || rating > 10) {
      return;
    }

    const movie = this.getMovieById(id);
    if (!movie) return;

    movie.personalRating = rating;

    this._movies.update((movies) =>
      movies.map((m) => (m.id === id ? { ...m, personalRating: rating } : m))
    );

    this.toastService.success('Rating', `"${movie.title}": ${rating}/10`);
    this.saveToStorage();
  }

  public updateNotes(id: number, notes: string): void {
    const trimmedNotes = notes.trim();

    const movie = this.getMovieById(id);
    if (!movie) return;

    movie.personalNotes = trimmedNotes;

    this._movies.update((movies) =>
      movies.map((m) =>
        m.id === id ? { ...m, personalNotes: trimmedNotes } : m
      )
    );

    this.toastService.success('Notas', 'Notas guardadas');
    this.saveToStorage();
  }

  public toggleWatched(id: number): void {
    const movie = this.getMovieById(id);
    if (!movie) return;

    const wasWatched = movie.isWatched;
    movie.isWatched = !wasWatched;
    movie.watchedDate = wasWatched ? null : new Date();

    this._movies.update((movies) =>
      movies.map((m) =>
        m.id === id
          ? { ...m, isWatched: movie.isWatched, watchedDate: movie.watchedDate }
          : m
      )
    );

    const message = wasWatched
      ? `"${movie.title}" desmarcada como vista`
      : `"${movie.title}" marcada como vista`;

    this.toastService.success('Estado', message);
    this.saveToStorage();
  }

  public getMovieById(id: number): Movie | undefined {
    return this._movies().find((movie) => movie.id === id);
  }

  public clearAll(): void {
    this._movies.set([]);
    localStorage.removeItem(this.STORAGE_KEY);
    this.toastService.success('Limpieza', 'Datos eliminados');
  }

  private createMovieFromResult(result: Result): Movie {
    return {
      ...result,
      isFavorite: false,
      personalRating: null,
      personalNotes: '',
      watchedDate: null,
      addedToListDate: new Date(),
      isWatched: false,
    };
  }

  private saveToStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._movies()));
  }

  private loadFromStorage(): void {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      try {
        const movies: Movie[] = JSON.parse(data);
        // Parse dates
        movies.forEach((movie) => {
          movie.release_date = new Date(movie.release_date);
          movie.addedToListDate = new Date(movie.addedToListDate);
          if (movie.watchedDate) {
            movie.watchedDate = new Date(movie.watchedDate);
          }
        });
        this._movies.set(movies);
      } catch (error) {
        console.error('Error loading movies from storage:', error);
      }
    }
  }
}
