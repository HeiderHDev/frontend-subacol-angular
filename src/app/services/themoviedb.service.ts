import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Movie, MovieResponse } from '@core/model/movie.interface';

@Injectable({
  providedIn: 'root',
})
export class TheMovieDbService {
  private apiUrl = environment.theMovieDB.apiUrl;
  private apiKey = environment.theMovieDB.apiKey;
  private imageBaseUrl = environment.theMovieDB.imageBaseUrl;

  constructor(private http: HttpClient) {}

  getPopularMovies(page: number = 1): Observable<MovieResponse> {
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('page', page.toString());

    return this.http.get<MovieResponse>(`${this.apiUrl}/movie/popular`, {
      params,
    });
  }

  searchMovies(query: string, page: number = 1): Observable<MovieResponse> {
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('query', query)
      .set('page', page.toString());

    return this.http.get<MovieResponse>(`${this.apiUrl}/search/movie`, {
      params,
    });
  }

  getMovieDetails(movieId: number): Observable<Movie> {
    const params = new HttpParams().set('api_key', this.apiKey);
    return this.http.get<Movie>(`${this.apiUrl}/movie/${movieId}`, { params });
  }

  getImageUrl(
    imagePath: string,
    size: 'poster' | 'backdrop' | 'profile' = 'poster'
  ): string {
    if (!imagePath) return '';
    const imageSize = environment.theMovieDB.imageSizes[size];
    return `${this.imageBaseUrl}${imageSize}${imagePath}`;
  }
}
