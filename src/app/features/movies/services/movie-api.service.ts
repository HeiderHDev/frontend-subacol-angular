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
import { MovieCredits } from '../interfaces/movie-credits.interface';
import { MovieDetails } from '../interfaces/movie-details.interface';
import { MovieVideosResponse } from '../interfaces/movie-videos.interface';
import { MovieList } from '../interfaces/tmdb-response.interface';

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
   * Obtiene detalles completos de una película
   */
  public getMovieDetails(
    movieId: number,
    language?: string
  ): Observable<MovieDetails> {
    const params = this.buildParams({
      language: language || environment.theMovieDB.defaultLanguage,
      append_to_response: 'credits,videos,images',
    });

    return this.httpService.doGetWithParams<MovieDetails>(
      `${this.baseUrl}/movie/${movieId}`,
      params
    );
  }

  /**
   * Obtiene videos (trailers, clips) de una película
   */
  public getMovieVideos(
    movieId: number,
    language?: string
  ): Observable<MovieVideosResponse> {
    const params = this.buildParams({
      language: language || environment.theMovieDB.defaultLanguage,
    });

    return this.httpService.doGetWithParams<MovieVideosResponse>(
      `${this.baseUrl}/movie/${movieId}/videos`,
      params
    );
  }

  /**
   * Obtiene créditos (reparto y equipo) de una película
   */
  public getMovieCredits(
    movieId: number,
    language?: string
  ): Observable<MovieCredits> {
    const params = this.buildParams({
      language: language || environment.theMovieDB.defaultLanguage,
    });

    return this.httpService.doGetWithParams<MovieCredits>(
      `${this.baseUrl}/movie/${movieId}/credits`,
      params
    );
  }

  /**
   * Obtiene recomendaciones basadas en una película
   */
  public getMovieRecommendations(
    movieId: number,
    params: MovieApiParams = {}
  ): Observable<MovieList> {
    const httpParams = this.buildParams({
      ...params,
      page: params.page || 1,
    });

    return this.httpService.doGetWithParams<MovieList>(
      `${this.baseUrl}/movie/${movieId}/recommendations`,
      httpParams
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
   * Soporte para URLs completas (Pinterest, etc.) y rutas de TMDB
   */
  public getImageUrl(
    imagePath: string | null,
    imageType: 'poster' | 'backdrop' | 'profile' = 'poster'
  ): string {
    if (!imagePath) {
      const fallbacks = {
        poster: 'assets/img/image-not-found.png',
        backdrop: 'assets/img/no-data.png',
        profile: 'assets/img/image-not-found.png',
      };
      return fallbacks[imageType];
    }

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    const size = environment.theMovieDB.imageSizes[imageType];
    return `${environment.theMovieDB.imageBaseUrl}${size}${imagePath}`;
  }

  /**
   * Método específico para URLs de poster
   */
  public getPosterUrl(posterPath: string | null): string {
    return this.getImageUrl(posterPath, 'poster');
  }

  /**
   * Método específico para URLs de backdrop
   */
  public getBackdropUrl(backdropPath: string | null): string {
    return this.getImageUrl(backdropPath, 'backdrop');
  }

  /**
   * Método específico para URLs de perfil
   */
  public getProfileUrl(profilePath: string | null): string {
    return this.getImageUrl(profilePath, 'profile');
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
