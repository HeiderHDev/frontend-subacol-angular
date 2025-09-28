import { Result } from './tmdb-response.interface';

export interface Movie extends Result {
  isFavorite: boolean;
  personalRating: number | null;
  personalNotes: string;
  watchedDate: Date | null;
  addedToListDate: Date;
  isWatched: boolean;
}
