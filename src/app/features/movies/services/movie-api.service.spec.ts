import { TestBed } from '@angular/core/testing';
import { MovieApiService } from './movie-api.service';
import { HttpService } from '@core/services/http.service';
import { of } from 'rxjs';
import { environment } from '@env/environment';
import { MovieList } from '../interfaces/tmdb-response.interface';
import { MovieListBuilder } from '../testing/spec-builders';

describe('MovieApiService (AAA + Builder)', () => {
  let service: MovieApiService;
  const httpSpy = jasmine.createSpyObj<HttpService>('HttpService', [
    'doGetWithParams',
  ]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MovieApiService, { provide: HttpService, useValue: httpSpy }],
    });
    service = TestBed.inject(MovieApiService);
    httpSpy.doGetWithParams.calls.reset();
  });

  function lastCall() {
    const call = httpSpy.doGetWithParams.calls.mostRecent();
    return { url: call.args[0], params: call.args[1] };
  }

  it('getPopularMovies devuelve lista válida', () => {
    // Arrange
    const expected: MovieList = new MovieListBuilder().build();
    httpSpy.doGetWithParams.and.returnValue(of(expected));
    let result!: MovieList;

    // Act
    service.getPopularMovies().subscribe((res) => (result = res));

    // Assert
    expect(result).toEqual(expected);
    const { url } = lastCall();
    expect(url).toBe(`${environment.theMovieDB.apiUrl}/movie/popular`);
  });

  it('getTopRatedMovies respeta page y language', () => {
    // Arrange
    httpSpy.doGetWithParams.and.returnValue(of(new MovieListBuilder().build()));

    // Act
    service.getTopRatedMovies({ page: 3, language: 'es-ES' }).subscribe();

    // Assert
    const { url, params } = lastCall();
    expect(url).toBe(`${environment.theMovieDB.apiUrl}/movie/top_rated`);
    expect(params.get('page')).toBe('3');
    expect(params.get('language')).toBe('es-ES');
  });

  it('searchMovies lanza error si query está vacía', () => {
    // Act + Assert
    expect(() => service.searchMovies('')).toThrowError(
      'El término de búsqueda no puede estar vacío'
    );
  });

  it('searchMovies incluye query e include_adult=false', () => {
    // Arrange
    httpSpy.doGetWithParams.and.returnValue(of(new MovieListBuilder().build()));

    // Act
    service.searchMovies('Inception', { page: 2 }).subscribe();

    // Assert
    const { url, params } = lastCall();
    expect(url).toBe(`${environment.theMovieDB.apiUrl}/search/movie`);
    expect(params.get('query')).toBe('Inception');
    expect(params.get('include_adult')).toBe('false');
    expect(params.get('page')).toBe('2');
  });

  it('getMovieDetails agrega append_to_response y language', () => {
    // Arrange
    httpSpy.doGetWithParams.and.returnValue(of({} as any));

    // Act
    service.getMovieDetails(123).subscribe();

    // Assert
    const { url, params } = lastCall();
    expect(url).toBe(`${environment.theMovieDB.apiUrl}/movie/123`);
    expect(params.get('append_to_response')).toBe('credits,videos,images');
    expect(params.get('language')).toBe(environment.theMovieDB.defaultLanguage);
  });
});
