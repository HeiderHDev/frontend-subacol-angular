import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MovieListComponent } from './movie-list.component';
import { MovieApiService } from '../../services/movie-api.service';
import { MovieStoreService } from '../../services/movie-store.service';
import { ToastService } from '@core/services/toast.service';
import { Genre } from '../../interfaces/genre.interface';
import { Movie } from '../../interfaces/movie.interface';
import { MovieList, Result } from '../../interfaces/tmdb-response.interface';
import {
  GenreBuilder,
  MovieBuilder,
  MovieListBuilder,
  ResultBuilder,
} from '@testing/spec-builders';

const asMovie = (r: Result): Movie => MovieBuilder.fromResult(r).build();

describe('MovieListComponent (AAA + Builders)', () => {
  let component: MovieListComponent;

  const apiSpy = jasmine.createSpyObj<MovieApiService>('MovieApiService', [
    'getPopularMovies',
    'getTopRatedMovies',
    'getNowPlayingMovies',
    'getUpcomingMovies',
    'searchMovies',
    'getGenres',
    'getImageUrl',
  ]);

  class MovieStoreStub {
    private _movies: Movie[] = [];

    movies = (): Movie[] => this._movies;
    favorites = (): Movie[] => this._movies.filter((m: Movie) => m.isFavorite);
    watched = (): Movie[] => this._movies.filter((m: Movie) => m.isWatched);
    customMovies = (): Movie[] => this._movies.filter((m: Movie) => m.id < 0);
    tmdbMovies = (): Movie[] => this._movies.filter((m: Movie) => m.id > 0);

    setMovies = (results: Result[]): void => {
      this._movies = results.map(asMovie);
    };

    toggleFavorite = (id: number): void => {
      this._movies = this._movies.map((m: Movie) =>
        m.id === id ? { ...m, isFavorite: !m.isFavorite } : m
      );
    };

    toggleWatched = (id: number): void => {
      this._movies = this._movies.map((m: Movie) =>
        m.id === id ? { ...m, isWatched: !m.isWatched } : m
      );
    };

    getMovieById = (id: number): Movie | undefined =>
      this._movies.find((m: Movie) => m.id === id);
  }

  const storeStub = new MovieStoreStub();
  const toastSpy = jasmine.createSpyObj<ToastService>('ToastService', [
    'success',
    'error',
    'info',
  ]);

  const r1: Result = new ResultBuilder()
    .withId(1)
    .withTitle('A')
    .withPoster('/a.jpg')
    .build();
  const r2: Result = new ResultBuilder()
    .withId(2)
    .withTitle('B')
    .withPoster('/b.jpg')
    .build();

  const list = (): MovieList =>
    new MovieListBuilder()
      .withResults([r1, r2])
      .withDates('2025-01-01', '2025-12-31')
      .build();

  const genres: Genre[] = [
    new GenreBuilder().withId(10).withName('Acción').build(),
    new GenreBuilder().withId(11).withName('Drama').build(),
  ];

  beforeEach(() => {
    apiSpy.getPopularMovies.and.returnValue(of(list()));
    apiSpy.getGenres.and.returnValue(of({ genres }));

    apiSpy.getImageUrl.and.returnValue('about:blank');

    TestBed.configureTestingModule({
      imports: [MovieListComponent],
      providers: [
        { provide: MovieApiService, useValue: apiSpy },
        { provide: MovieStoreService, useValue: storeStub },
        { provide: ToastService, useValue: toastSpy },
      ],
    });

    const fixture = TestBed.createComponent(MovieListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const displayed = (): Movie[] => component.displayed();

  it('ngOnInit: carga géneros y populares, apaga loading y llena displayed', () => {
    expect(apiSpy.getGenres).toHaveBeenCalled();
    expect(apiSpy.getPopularMovies).toHaveBeenCalled();
    expect(displayed().length).toBe(2);
  });

  it('onCategoryChange: carga categoría top_rated', () => {
    component.selectedCategory = 'top_rated';
    apiSpy.getTopRatedMovies.and.returnValue(of(list()));

    component.onCategoryChange();

    expect(apiSpy.getTopRatedMovies).toHaveBeenCalled();
    expect(displayed().length).toBe(2);
  });

  it('onCategoryChange: en error muestra toast', () => {
    component.selectedCategory = 'now_playing';
    apiSpy.getNowPlayingMovies.and.returnValue(
      throwError(() => new Error('fail'))
    );

    component.onCategoryChange();

    expect(apiSpy.getNowPlayingMovies).toHaveBeenCalled();
    expect(toastSpy.error).toHaveBeenCalledWith(
      'Error',
      'No se pudieron cargar las películas'
    );
  });

  it('onCategoryChange: limpia searchTerm y carga categoría seleccionada', () => {
    component.selectedCategory = 'top_rated';
    apiSpy.getTopRatedMovies.and.returnValue(of(list()));

    component.onCategoryChange();

    expect(component.searchTerm).toBe('');
    expect(apiSpy.getTopRatedMovies).toHaveBeenCalled();
  });

  it('onSearch: con término llama searchMovies y actualiza displayed', () => {
    component.searchTerm = 'batman';
    apiSpy.searchMovies.and.returnValue(of(list()));

    component.onSearch();

    const call = apiSpy.searchMovies.calls.mostRecent();
    expect(call.args[0]).toBe('batman');
    expect(displayed().length).toBe(2);
  });

  it('onSearch: vacío → carga populares por defecto', () => {
    component.searchTerm = '   ';
    apiSpy.getPopularMovies.calls.reset();
    apiSpy.getPopularMovies.and.returnValue(of(list()));

    component.onSearch();

    expect(apiSpy.getPopularMovies).toHaveBeenCalled();
  });

  it('toggleFavoritesFilter: filtra solo favoritos', () => {
    component['applyToggles'](storeStub.movies());
    expect(displayed().length).toBe(2);

    storeStub.toggleFavorite(1);
    component.toggleFavoritesFilter();

    expect(component.showOnlyFavorites).toBeTrue();
    expect(displayed().map((m: Movie) => m.id)).toEqual([1]);
  });

  it('toggleWatchedFilter: filtra solo vistas', () => {
    component['applyToggles'](storeStub.movies());
    expect(displayed().length).toBe(2);

    storeStub.toggleWatched(2);
    component.toggleWatchedFilter();

    expect(component.showOnlyWatched).toBeTrue();
    expect(displayed().map((m: Movie) => m.id)).toEqual([2]);
  });

  it('handleCard: favoriteToggle re-aplica filtros y muta store', () => {
    component['applyToggles'](storeStub.movies());
    expect(displayed().length).toBe(2);

    component.handleCard({ type: 'favoriteToggle', movieId: 1 });

    expect(storeStub.getMovieById(1)!.isFavorite).toBeTrue();
    expect(displayed().length).toBe(2);
  });

  it('handleCard: viewDetails llama toast.info', () => {
    component.handleCard({ type: 'viewDetails', movieId: 99 });
    expect(toastSpy.info).toHaveBeenCalledWith(
      'Detalles',
      'Ver detalles de película ID: 99'
    );
  });
});
