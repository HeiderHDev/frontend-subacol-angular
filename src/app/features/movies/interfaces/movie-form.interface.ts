/**
 * Interface para el formulario de creación de películas
 * Basada en la estructura de TMDB pero adaptada para creación local
 */
export interface MovieFormData {
  title: string;
  originalTitle: string;
  overview: string;
  releaseDate: string;
  originalLanguage: string;
  genreIds: number[];
  adult: boolean;
  video: boolean;
  category: 'now_playing' | 'upcoming';
  voteAverage?: number;
  popularity?: number;
  posterPath?: string;
  backdropPath?: string;
  runtime?: number;
  budget?: number;
  revenue?: number;
  tagline?: string;
  homepage?: string;
  status?: string;
  videos?: MovieVideoData[];
}

/**
 * Interface para videos de YouTube en el formulario
 */
export interface MovieVideoData {
  name: string;
  key: string;
  type: 'Trailer' | 'Clip' | 'Teaser' | 'Behind the Scenes' | 'Featurette';
  site: 'YouTube';
  size: number;
  official: boolean;
}

/**
 * Interface para validaciones del formulario
 */
export interface MovieFormValidationErrors {
  title?: string[];
  originalTitle?: string[];
  overview?: string[];
  releaseDate?: string[];
  originalLanguage?: string[];
  genreIds?: string[];
}

/**
 * Interface para opciones de idiomas
 */
export interface LanguageOption {
  code: string;
  name: string;
}

/**
 * Resultado del formulario para convertir a Movie
 */
export interface MovieCreationResult {
  movie: MovieFormData;
  isValid: boolean;
  errors?: MovieFormValidationErrors;
}

export interface MovieFormConfig {
  showPersonalRating: boolean;
  showPersonalNotes: boolean;
  showFavoriteToggle: boolean;
  showWatchedToggle: boolean;
  allowWatchedDateEdit: boolean;
}
