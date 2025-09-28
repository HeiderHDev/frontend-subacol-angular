/**
 * Interface para el estado global de películas
 * Responsabilidad: Definir la estructura del estado de la aplicación
 */
import { Movie } from './movie.interface';
import { MovieFilters } from './movie-filters.interface';
import { SortOption } from './movie-sort.interface';
import { PaginationInfo } from './pagination.interface';
import { LoadingState } from './loading-state.interface';

export interface MovieState {
  movies: Movie[];
  filteredMovies: Movie[];
  favorites: Movie[];
  watchedMovies: Movie[];
  filters: MovieFilters;
  sortOption: SortOption;
  pagination: PaginationInfo;
  loading: LoadingState;
}
