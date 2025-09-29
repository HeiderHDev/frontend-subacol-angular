import { Genre, Movie, MovieList, Result } from '@features/movies/interfaces';

export class ResultBuilder {
  private readonly data: Result = {
    adult: false,
    backdrop_path: '',
    genre_ids: [],
    id: 0,
    original_language: 'en',
    original_title: '',
    overview: '',
    popularity: 0,
    poster_path: '',
    release_date: '2024-01-01',
    title: '',
    video: false,
    vote_average: 0,
    vote_count: 0,
  };

  withId(id: number) {
    this.data.id = id;
    return this;
  }
  withTitle(title: string) {
    this.data.title = title;
    return this;
  }
  withPoster(path: string) {
    this.data.poster_path = path;
    return this;
  }
  withGenres(ids: number[]) {
    this.data.genre_ids = ids;
    return this;
  }
  withRelease(date: string) {
    this.data.release_date = date;
    return this;
  }

  build(): Result {
    return { ...this.data };
  }
}

export class MovieListBuilder {
  private readonly data: MovieList = {
    dates: { minimum: '2025-01-01', maximum: '2025-12-31' },
    page: 1,
    results: [],
    total_pages: 1,
    total_results: 0,
  };

  withDates(min: string, max: string) {
    this.data.dates = { minimum: min, maximum: max };
    return this;
  }
  withPage(page: number) {
    this.data.page = page;
    return this;
  }
  withResults(results: Result[]) {
    this.data.results = results;
    return this;
  }
  withTotals(pages: number, results: number) {
    this.data.total_pages = pages;
    this.data.total_results = results;
    return this;
  }

  build(): MovieList {
    return { ...this.data };
  }
}

export class GenreBuilder {
  private readonly data: Genre = { id: 0, name: '' };

  withId(id: number) {
    this.data.id = id;
    return this;
  }
  withName(name: string) {
    this.data.name = name;
    return this;
  }

  build(): Genre {
    return { ...this.data };
  }
}

/** Builder de Movie (modelo interno del store) */
export class MovieBuilder {
  private readonly data: Movie;

  constructor() {
    this.data = {
      adult: false,
      backdrop_path: '',
      genre_ids: [],
      id: 0,
      original_language: 'en',
      original_title: '',
      overview: '',
      popularity: 0,
      poster_path: '',
      release_date: '2024-01-01',
      title: '',
      video: false,
      vote_average: 0,
      vote_count: 0,
      isFavorite: false,
      personalRating: null,
      personalNotes: '',
      isWatched: false,
      watchedDate: null,
      addedToListDate: new Date(),
    };
  }

  static fromResult(r: Result): MovieBuilder {
    return new MovieBuilder()
      .withId(r.id)
      .withTitle(r.title)
      .withPoster(r.poster_path ?? '')
      .withGenres(r.genre_ids)
      .withRelease(r.release_date);
  }

  withId(id: number) {
    this.data.id = id;
    return this;
  }
  withTitle(title: string) {
    this.data.title = title;
    return this;
  }
  withPoster(path: string) {
    this.data.poster_path = path;
    return this;
  }
  withGenres(ids: number[]) {
    this.data.genre_ids = ids;
    return this;
  }
  withRelease(d: string) {
    this.data.release_date = d;
    return this;
  }
  favorite() {
    this.data.isFavorite = true;
    return this;
  }
  watched() {
    this.data.isWatched = true;
    this.data.watchedDate = new Date();
    return this;
  }

  build(): Movie {
    return { ...this.data };
  }
}
