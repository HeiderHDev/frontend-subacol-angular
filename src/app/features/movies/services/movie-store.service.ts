import { Injectable, signal, computed } from '@angular/core';
import { Movie, Result } from '../interfaces';
import { ToastService } from '@core/services/toast.service';

export interface MovieStats {
  total: number;
  favorites: number;
  watched: number;
  unwatched: number;
  averageRating: number;
  totalCustomMovies: number;
}

@Injectable({
  providedIn: 'root',
})
export class MovieStoreService {
  private readonly STORAGE_KEY = 'movieApp_data';
  private readonly BACKUP_KEY = 'movieApp_backup';

  private readonly _movies = signal<Movie[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);

  public readonly movies = this._movies.asReadonly();
  public readonly isLoading = this._isLoading.asReadonly();
  public readonly error = this._error.asReadonly();

  public readonly favorites = computed(() =>
    this._movies().filter((movie) => movie.isFavorite)
  );

  public readonly watched = computed(() =>
    this._movies().filter((movie) => movie.isWatched)
  );

  public readonly unwatched = computed(() =>
    this._movies().filter((movie) => !movie.isWatched)
  );

  public readonly customMovies = computed(() =>
    this._movies().filter((movie) => movie.id < 0)
  );

  public readonly tmdbMovies = computed(() =>
    this._movies().filter((movie) => movie.id > 0)
  );

  public readonly stats = computed((): MovieStats => {
    const movies = this._movies();
    const watchedMovies = movies.filter((m) => m.isWatched && m.personalRating);
    const totalRating = watchedMovies.reduce(
      (sum, m) => sum + (m.personalRating || 0),
      0
    );

    return {
      total: movies.length,
      favorites: movies.filter((m) => m.isFavorite).length,
      watched: movies.filter((m) => m.isWatched).length,
      unwatched: movies.filter((m) => !m.isWatched).length,
      averageRating:
        watchedMovies.length > 0 ? totalRating / watchedMovies.length : 0,
      totalCustomMovies: movies.filter((m) => m.id < 0).length,
    };
  });

  constructor(private readonly toastService: ToastService) {
    this.loadFromStorage();
    this.createBackup();
  }

  /**
   * CREATE: Agrega una nueva película
   */
  public createMovie(movieData: Result): boolean {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      if (this.getMovieById(movieData.id)) {
        this._error.set('La película ya existe en la colección');
        this.toastService.warning(
          'Película Duplicada',
          'Esta película ya está en tu colección'
        );
        return false;
      }

      const newMovie = this.createMovieFromResult(movieData);
      this._movies.update((movies) => [newMovie, ...movies]);

      this.saveToStorage();

      return true;
    } catch (error) {
      this._error.set('Error al crear la película');
      this.toastService.error('Error', 'No se pudo crear la película');
      console.error('Error creating movie:', error);
      return false;
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * READ: Actualiza la lista completa de películas (para resultados de API)
   */
  public setMovies(results: Result[]): void {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      const existingMovies = this._movies();
      const existingMap = new Map(existingMovies.map((m) => [m.id, m]));

      const newMovies: Movie[] = results.map((result) => {
        const existing = existingMap.get(result.id);
        return existing
          ? { ...result, ...this.preserveUserData(existing) }
          : this.createMovieFromResult(result);
      });

      const customMovies = existingMovies.filter(
        (m) => m.id < 0 && !results.some((r) => r.id === m.id)
      );

      this._movies.set([...newMovies, ...customMovies]);
      this.saveToStorage();
    } catch (error) {
      this._error.set('Error al actualizar películas');
      console.error('Error setting movies:', error);
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * UPDATE: Actualiza una película existente
   */
  public updateMovie(id: number, updatedData: Partial<Movie>): boolean {
    try {
      const existingMovie = this.getMovieById(id);
      if (!existingMovie) {
        this._error.set('Película no encontrada');
        this.toastService.error('Error', 'La película no existe');
        return false;
      }

      this._movies.update((movies) =>
        movies.map((movie) =>
          movie.id === id
            ? {
                ...movie,
                ...updatedData,
                addedToListDate: movie.addedToListDate,
              }
            : movie
        )
      );

      this.saveToStorage();
      return true;
    } catch (error) {
      this._error.set('Error al actualizar la película');
      this.toastService.error('Error', 'No se pudo actualizar la película');
      console.error('Error updating movie:', error);
      return false;
    }
  }

  /**
   * DELETE: Elimina una película
   */
  public deleteMovie(id: number): boolean {
    try {
      const movie = this.getMovieById(id);
      if (!movie) {
        this._error.set('Película no encontrada');
        this.toastService.error('Error', 'La película no existe');
        return false;
      }

      this._movies.update((movies) => movies.filter((m) => m.id !== id));

      this.saveToStorage();
      this.toastService.success(
        'Película Eliminada',
        `"${movie.title}" se eliminó de tu colección`
      );
      return true;
    } catch (error) {
      this._error.set('Error al eliminar la película');
      this.toastService.error('Error', 'No se pudo eliminar la película');
      console.error('Error deleting movie:', error);
      return false;
    }
  }

  /**
   * READ: Obtiene una película por ID
   */
  public getMovieById(id: number): Movie | undefined {
    return this._movies().find((movie) => movie.id === id);
  }

  /**
   * READ: Busca películas por término
   */
  public searchMovies(term: string): Movie[] {
    if (!term.trim()) return this._movies();

    const searchTerm = term.toLowerCase().trim();
    return this._movies().filter(
      (movie) =>
        movie.title.toLowerCase().includes(searchTerm) ||
        movie.original_title.toLowerCase().includes(searchTerm) ||
        movie.overview.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * READ: Filtra películas por género
   */
  public getMoviesByGenre(genreId: number): Movie[] {
    return this._movies().filter((movie) => movie.genre_ids.includes(genreId));
  }

  /**
   * READ: Obtiene películas ordenadas
   */
  public getMoviesSorted(
    sortBy: 'title' | 'release_date' | 'vote_average' | 'addedToListDate',
    ascending = true
  ): Movie[] {
    const movies = [...this._movies()];

    movies.sort((a, b) => {
      let valueA: any, valueB: any;

      switch (sortBy) {
        case 'title':
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
          break;
        case 'release_date':
          valueA = new Date(a.release_date);
          valueB = new Date(b.release_date);
          break;
        case 'vote_average':
          valueA = a.vote_average;
          valueB = b.vote_average;
          break;
        case 'addedToListDate':
          valueA = a.addedToListDate;
          valueB = b.addedToListDate;
          break;
        default:
          return 0;
      }

      if (valueA < valueB) return ascending ? -1 : 1;
      if (valueA > valueB) return ascending ? 1 : -1;
      return 0;
    });

    return movies;
  }

  public toggleFavorite(id: number): boolean {
    const movie = this.getMovieById(id);
    if (!movie) return false;

    const wasFavorite = movie.isFavorite;
    const success = this.updateMovie(id, { isFavorite: !wasFavorite });

    if (success) {
      const message = wasFavorite
        ? `"${movie.title}" removida de favoritos`
        : `"${movie.title}" agregada a favoritos`;
      this.toastService.success('Favoritos', message);
    }

    return success;
  }

  public updateRating(id: number, rating: number): boolean {
    if (rating < 0 || rating > 10) {
      this.toastService.warning(
        'Rating Inválido',
        'El rating debe estar entre 0 y 10'
      );
      return false;
    }

    const movie = this.getMovieById(id);
    if (!movie) return false;

    const success = this.updateMovie(id, { personalRating: rating });

    if (success) {
      this.toastService.success(
        'Rating Actualizado',
        `"${movie.title}": ${rating}/10`
      );
    }

    return success;
  }

  public updateNotes(id: number, notes: string): boolean {
    const trimmedNotes = notes.trim();
    const movie = this.getMovieById(id);
    if (!movie) return false;

    const success = this.updateMovie(id, { personalNotes: trimmedNotes });

    if (success) {
      this.toastService.success(
        'Notas Actualizadas',
        'Las notas se guardaron correctamente'
      );
    }

    return success;
  }

  public toggleWatched(id: number): boolean {
    const movie = this.getMovieById(id);
    if (!movie) return false;

    const wasWatched = movie.isWatched;
    const updateData: Partial<Movie> = {
      isWatched: !wasWatched,
      watchedDate: wasWatched ? null : new Date(),
    };

    const success = this.updateMovie(id, updateData);

    if (success) {
      const message = wasWatched
        ? `"${movie.title}" desmarcada como vista`
        : `"${movie.title}" marcada como vista`;
      this.toastService.success('Estado Actualizado', message);
    }

    return success;
  }

  public addMultipleMovies(movies: Result[]): {
    success: number;
    errors: number;
  } {
    let success = 0;
    let errors = 0;

    movies.forEach((movie) => {
      if (this.createMovie(movie)) {
        success++;
      } else {
        errors++;
      }
    });

    if (success > 0) {
      this.toastService.success(
        'Películas Agregadas',
        `${success} película(s) agregada(s) exitosamente`
      );
    }
    if (errors > 0) {
      this.toastService.warning(
        'Algunas películas no se agregaron',
        `${errors} película(s) ya existían o tuvieron errores`
      );
    }

    return { success, errors };
  }

  public deleteMultiple(ids: number[]): boolean {
    try {
      const moviesToDelete = ids
        .map((id) => this.getMovieById(id))
        .filter(Boolean) as Movie[];

      if (moviesToDelete.length === 0) {
        this.toastService.warning(
          'Sin Selección',
          'No se encontraron películas para eliminar'
        );
        return false;
      }

      this._movies.update((movies) =>
        movies.filter((movie) => !ids.includes(movie.id))
      );

      this.saveToStorage();
      this.toastService.success(
        'Películas Eliminadas',
        `${moviesToDelete.length} película(s) eliminada(s)`
      );
      return true;
    } catch (error) {
      this._error.set('Error al eliminar las películas');
      this.toastService.error('Error', 'No se pudieron eliminar las películas');
      console.error('Error deleting multiple movies:', error);
      return false;
    }
  }

  public clearAll(): void {
    if (this._movies().length === 0) {
      this.toastService.info('Sin Datos', 'No hay películas para eliminar');
      return;
    }

    this._movies.set([]);
    localStorage.removeItem(this.STORAGE_KEY);
    this.toastService.success(
      'Datos Eliminados',
      'Todas las películas fueron eliminadas'
    );
  }

  public createBackup(): boolean {
    try {
      const currentData = localStorage.getItem(this.STORAGE_KEY);
      if (currentData) {
        const backup = {
          data: JSON.parse(currentData),
          timestamp: new Date().toISOString(),
          version: '1.0',
        };
        localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backup));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creating backup:', error);
      return false;
    }
  }

  public restoreFromBackup(): boolean {
    try {
      const backupData = localStorage.getItem(this.BACKUP_KEY);
      if (!backupData) {
        this.toastService.warning(
          'Sin Backup',
          'No se encontró un backup disponible'
        );
        return false;
      }

      const backup = JSON.parse(backupData);
      const movies: Movie[] = backup.data;

      movies.forEach((movie) => {
        movie.addedToListDate = new Date(movie.addedToListDate);
        if (movie.watchedDate) {
          movie.watchedDate = new Date(movie.watchedDate);
        }
      });

      this._movies.set(movies);
      this.saveToStorage();
      this.toastService.success(
        'Backup Restaurado',
        'Los datos se restauraron correctamente'
      );
      return true;
    } catch (error) {
      this.toastService.error('Error', 'No se pudo restaurar el backup');
      console.error('Error restoring backup:', error);
      return false;
    }
  }

  public exportData(): string {
    return JSON.stringify(
      {
        movies: this._movies(),
        exportDate: new Date().toISOString(),
        version: '1.0',
      },
      null,
      2
    );
  }

  public importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      const movies: Movie[] = data.movies || [];

      if (!Array.isArray(movies)) {
        throw new Error('Formato de datos inválido');
      }

      movies.forEach((movie) => {
        movie.addedToListDate = new Date(movie.addedToListDate);
        if (movie.watchedDate) {
          movie.watchedDate = new Date(movie.watchedDate);
        }
      });

      this._movies.set(movies);
      this.saveToStorage();
      this.toastService.success(
        'Datos Importados',
        `${movies.length} película(s) importada(s)`
      );
      return true;
    } catch (error) {
      this.toastService.error(
        'Error de Importación',
        'El archivo no tiene el formato correcto'
      );
      console.error('Error importing data:', error);
      return false;
    }
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

  private preserveUserData(existingMovie: Movie) {
    return {
      isFavorite: existingMovie.isFavorite,
      personalRating: existingMovie.personalRating,
      personalNotes: existingMovie.personalNotes,
      watchedDate: existingMovie.watchedDate,
      addedToListDate: existingMovie.addedToListDate,
      isWatched: existingMovie.isWatched,
    };
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._movies()));
    } catch (error) {
      this._error.set('Error al guardar en el almacenamiento local');
      console.error('Error saving to localStorage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      this._isLoading.set(true);
      const data = localStorage.getItem(this.STORAGE_KEY);

      if (data) {
        const movies: Movie[] = JSON.parse(data);

        movies.forEach((movie) => {
          movie.addedToListDate = new Date(movie.addedToListDate);
          if (movie.watchedDate) {
            movie.watchedDate = new Date(movie.watchedDate);
          }
        });

        this._movies.set(movies);
      }
    } catch (error) {
      this._error.set('Error al cargar datos del almacenamiento');
      console.error('Error loading movies from storage:', error);
    } finally {
      this._isLoading.set(false);
    }
  }
}
