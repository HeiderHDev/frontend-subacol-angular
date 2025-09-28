export interface MovieFilters {
  searchTerm: string;
  minRating: number;
  maxRating: number;
  genres: number[];
  yearFrom: number | null;
  yearTo: number | null;
  onlyFavorites: boolean;
  onlyWatched: boolean;
}
