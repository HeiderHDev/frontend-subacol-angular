/**
 * Interface para formularios de edición de película
 * Responsabilidad: Definir la estructura de datos para formularios
 */

export interface MovieFormData {
  personalRating: number | null;
  personalNotes: string;
  isFavorite: boolean;
  isWatched: boolean;
  watchedDate: Date | null;
}

export interface MovieFormConfig {
  showPersonalRating: boolean;
  showPersonalNotes: boolean;
  showFavoriteToggle: boolean;
  showWatchedToggle: boolean;
  allowWatchedDateEdit: boolean;
}
