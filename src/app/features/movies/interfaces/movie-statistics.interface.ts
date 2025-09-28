import { Movie } from './movie.interface';

export interface MovieStatistics {
  totalMovies: number;
  totalFavorites: number;
  totalWatched: number;
  averageRating: number;
  averagePersonalRating: number;
  moviesByGenre: GenreCount[];
  moviesByYear: YearCount[];
  topRatedMovies: Movie[];
  recentlyAdded: Movie[];
}

export interface GenreCount {
  genreId: number;
  genreName: string;
  count: number;
  averageRating: number;
}

export interface YearCount {
  year: number;
  count: number;
  averageRating: number;
}
