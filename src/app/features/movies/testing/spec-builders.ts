import { MovieList, Result } from '../interfaces/tmdb-response.interface';

export class ResultBuilder {
  private result: Result = {
    adult: false,
    backdrop_path: '',
    genre_ids: [],
    id: 0,
    original_language: 'en',
    original_title: '',
    overview: '',
    popularity: 0,
    poster_path: '',
    release_date: new Date(),
    title: '',
    video: false,
    vote_average: 0,
    vote_count: 0,
  };

  withId(id: number) {
    this.result.id = id;
    return this;
  }
  withTitle(title: string) {
    this.result.title = title;
    return this;
  }
  build(): Result {
    return { ...this.result };
  }
}

export class MovieListBuilder {
  private movieList: MovieList = {
    dates: { minimum: new Date('2025-01-01'), maximum: new Date('2025-12-31') },
    page: 1,
    results: [],
    total_pages: 1,
    total_results: 0,
  };

  withPage(page: number) {
    this.movieList.page = page;
    return this;
  }
  withResults(results: Result[]) {
    this.movieList.results = results;
    return this;
  }
  withTotals(pages: number, results: number) {
    this.movieList.total_pages = pages;
    this.movieList.total_results = results;
    return this;
  }
  withDates(min: Date, max: Date) {
    this.movieList.dates = { minimum: min, maximum: max };
    return this;
  }

  build(): MovieList {
    return { ...this.movieList };
  }
}
