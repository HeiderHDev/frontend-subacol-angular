import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { HttpService } from '@core/services/http.service';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { GenreResponse } from '../interfaces/genre.interface';
import {
  MovieApiParams,
  SearchParams,
} from '../interfaces/movie-api-params.interface';
import { MovieList, Result } from '../interfaces/tmdb-response.interface';

/**
 * Servicio para consumir API de TMDB
 * Responsabilidad: Operaciones específicas de películas
 * Usa HttpService para requests base
 */
@Injectable({
  providedIn: 'root',
})
export class MovieApiService {
  private readonly httpService = inject(HttpService);
  private readonly baseUrl = environment.theMovieDB.apiUrl;

  /**
   * Obtiene películas populares
   */
  public getPopularMovies(params: MovieApiParams = {}): Observable<MovieList> {
    const httpParams = this.buildParams(params);
    return this.httpService.doGetWithParams<MovieList>(
      `${this.baseUrl}/movie/popular`,
      httpParams
    );
  }

  /**
   * Obtiene películas en cartelera
   */
  public getNowPlayingMovies(
    params: MovieApiParams = {}
  ): Observable<MovieList> {
    const httpParams = this.buildParams(params);
    return this.httpService.doGetWithParams<MovieList>(
      `${this.baseUrl}/movie/now_playing`,
      httpParams
    );
  }

  /**
   * Obtiene películas mejor valoradas
   */
  public getTopRatedMovies(params: MovieApiParams = {}): Observable<MovieList> {
    const httpParams = this.buildParams(params);
    return this.httpService.doGetWithParams<MovieList>(
      `${this.baseUrl}/movie/top_rated`,
      httpParams
    );
  }

  /**
   * Obtiene próximos estrenos
   */
  public getUpcomingMovies(params: MovieApiParams = {}): Observable<MovieList> {
    const httpParams = this.buildParams(params);
    return this.httpService.doGetWithParams<MovieList>(
      `${this.baseUrl}/movie/upcoming`,
      httpParams
    );
  }

  /**
   * Busca películas por término
   */
  public searchMovies(
    query: string,
    params: MovieApiParams = {}
  ): Observable<MovieList> {
    if (!query?.trim()) {
      throw new Error('El término de búsqueda no puede estar vacío');
    }

    const searchParams: SearchParams = {
      query: query.trim(),
      include_adult: false,
      ...params,
    };

    const httpParams = this.buildParams(searchParams);
    return this.httpService.doGetWithParams<MovieList>(
      `${this.baseUrl}/search/movie`,
      httpParams
    );
  }

  /**
   * Obtiene detalles de una película
   */
  public getMovieDetails(
    movieId: number,
    language?: string
  ): Observable<Result> {
    const params = this.buildParams({
      language: language || environment.theMovieDB.defaultLanguage,
      append_to_response: 'credits,videos,images',
    });

    return this.httpService.doGetWithParams<Result>(
      `${this.baseUrl}/movie/${movieId}`,
      params
    );
  }

  /**
   * Obtiene lista de géneros
   */
  public getGenres(language?: string): Observable<GenreResponse> {
    const params = this.buildParams({
      language: language || environment.theMovieDB.defaultLanguage,
    });

    return this.httpService.doGetWithParams<GenreResponse>(
      `${this.baseUrl}/genre/movie/list`,
      params
    );
  }

  /**
   * Construye URL de imagen
   */
  public getImageUrl(
    imagePath: string | null,
    imageType: 'poster' | 'backdrop' | 'profile' = 'poster'
  ): string {
    if (!imagePath) {
      return 'assets/img/no-poster.jpg';
    }

    const size = environment.theMovieDB.imageSizes[imageType];
    return `${environment.theMovieDB.imageBaseUrl}${size}${imagePath}`;
  }

  /**
   * Construye parámetros HTTP con API key
   * Solo se encarga de la lógica específica de TMDB
   */
  private buildParams(params: Record<string, any>): HttpParams {
    let httpParams = new HttpParams()
      .set('api_key', environment.theMovieDB.apiKey)
      .set(
        'language',
        params['language'] || environment.theMovieDB.defaultLanguage
      )
      .set('page', params['page']?.toString() || '1');

    // Agregar parámetros específicos
    Object.entries(params).forEach(([key, value]) => {
      if (
        key !== 'language' &&
        key !== 'page' &&
        value != null &&
        value !== ''
      ) {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    return httpParams;
  }
}
