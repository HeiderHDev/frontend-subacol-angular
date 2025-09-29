import { signal, computed, Signal } from '@angular/core';
import { Movie, Result } from '@features/movies/interfaces';

export class MovieStoreStub {
  private readonly _movies = signal<Movie[]>([]);

  public readonly movies: Signal<Movie[]> = this._movies.asReadonly();
  public readonly favorites = computed(() =>
    this._movies().filter((m) => m.isFavorite)
  );
  public readonly watched = computed(() =>
    this._movies().filter((m) => m.isWatched)
  );

  setMovies = (data: Result[] | Movie[]) => {
    const toMovie = (r: any): Movie => ({
      ...r,
      isFavorite: r.isFavorite ?? false,
      personalRating: r.personalRating ?? null,
      personalNotes: r.personalNotes ?? '',
      isWatched: r.isWatched ?? false,
      watchedDate: r.watchedDate ?? null,
      addedToListDate: r.addedToListDate ?? new Date(),
    });
    this._movies.set((data as any[]).map(toMovie));
  };

  toggleFavorite = (id: number) => {
    this._movies.update((list) =>
      list.map((m) => (m.id === id ? { ...m, isFavorite: !m.isFavorite } : m))
    );
  };

  toggleWatched = (id: number) => {
    this._movies.update((list) =>
      list.map((m) => (m.id === id ? { ...m, isWatched: !m.isWatched } : m))
    );
  };

  getMovieById = (id: number): Movie | undefined =>
    this._movies().find((m) => m.id === id);

  clearAll = () => this._movies.set([]);
}
