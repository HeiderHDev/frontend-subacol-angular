import { TestBed } from '@angular/core/testing';
import { MovieStoreService } from './movie-store.service';
import { ToastService } from '@core/services/toast.service';
import { Movie, Result } from '../interfaces';

describe('MovieStoreService', () => {
  let service: MovieStoreService;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    const toastSpy = jasmine.createSpyObj('ToastService', [
      'success',
      'error',
      'warning',
      'info',
    ]);

    TestBed.configureTestingModule({
      providers: [
        MovieStoreService,
        { provide: ToastService, useValue: toastSpy },
      ],
    });

    service = TestBed.inject(MovieStoreService);
    toastServiceSpy = TestBed.inject(
      ToastService
    ) as jasmine.SpyObj<ToastService>;

    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with empty movies', () => {
    expect(service.movies()).toEqual([]);
    expect(service.favorites()).toEqual([]);
    expect(service.watched()).toEqual([]);
  });

  describe('setMovies', () => {
    it('should set movies from API results', () => {
      const apiResults: Result[] = [
        {
          id: 1,
          title: 'Test Movie',
          overview: 'Test overview',
          poster_path: '/test.jpg',
          backdrop_path: '/backdrop.jpg',
          release_date: new Date('2024-01-01'),
          vote_average: 8.0,
          vote_count: 100,
          popularity: 50,
          genre_ids: [28],
          adult: false,
          original_language: 'en',
          original_title: 'Test Movie',
          video: false,
        },
      ];

      service.setMovies(apiResults);

      const movies = service.movies();
      expect(movies.length).toBe(1);
      expect(movies[0].id).toBe(1);
      expect(movies[0].title).toBe('Test Movie');
      expect(movies[0].isFavorite).toBe(false);
      expect(movies[0].personalRating).toBe(null);
      expect(movies[0].personalNotes).toBe('');
      expect(movies[0].isWatched).toBe(false);
    });

    it('should merge with existing local data', () => {
      const apiResults: Result[] = [
        {
          id: 1,
          title: 'Test Movie',
          overview: 'Test overview',
          poster_path: '/test.jpg',
          backdrop_path: '/backdrop.jpg',
          release_date: new Date('2024-01-01'),
          vote_average: 8.0,
          vote_count: 100,
          popularity: 50,
          genre_ids: [28],
          adult: false,
          original_language: 'en',
          original_title: 'Test Movie',
          video: false,
        },
      ];

      // Set initial movies with local data
      service.setMovies(apiResults);
      service.toggleFavorite(1);
      service.updateRating(1, 9.0);
      service.updateNotes(1, 'Great movie');

      // Update with same API results
      service.setMovies(apiResults);

      const movie = service.getMovieById(1);
      expect(movie?.isFavorite).toBe(true);
      expect(movie?.personalRating).toBe(9.0);
      expect(movie?.personalNotes).toBe('Great movie');
    });
  });

  describe('toggleFavorite', () => {
    it('should toggle favorite status', () => {
      const apiResults: Result[] = [
        {
          id: 1,
          title: 'Test Movie',
          overview: 'Test overview',
          poster_path: '/test.jpg',
          backdrop_path: '/backdrop.jpg',
          release_date: new Date('2024-01-01'),
          vote_average: 8.0,
          vote_count: 100,
          popularity: 50,
          genre_ids: [28],
          adult: false,
          original_language: 'en',
          original_title: 'Test Movie',
          video: false,
        },
      ];

      service.setMovies(apiResults);
      service.toggleFavorite(1);

      expect(service.getMovieById(1)?.isFavorite).toBe(true);
      expect(service.favorites().length).toBe(1);
      expect(toastServiceSpy.success).toHaveBeenCalledWith(
        'Favoritos',
        '"Test Movie" agregada a favoritos'
      );
    });

    it('should remove from favorites when toggled twice', () => {
      const apiResults: Result[] = [
        {
          id: 1,
          title: 'Test Movie',
          overview: 'Test overview',
          poster_path: '/test.jpg',
          backdrop_path: '/backdrop.jpg',
          release_date: new Date('2024-01-01'),
          vote_average: 8.0,
          vote_count: 100,
          popularity: 50,
          genre_ids: [28],
          adult: false,
          original_language: 'en',
          original_title: 'Test Movie',
          video: false,
        },
      ];

      service.setMovies(apiResults);
      service.toggleFavorite(1);
      service.toggleFavorite(1);

      expect(service.getMovieById(1)?.isFavorite).toBe(false);
      expect(service.favorites().length).toBe(0);
      expect(toastServiceSpy.success).toHaveBeenCalledWith(
        'Favoritos',
        jasmine.stringContaining('removida de favoritos')
      );
    });
  });

  describe('updateRating', () => {
    it('should update personal rating', () => {
      const apiResults: Result[] = [
        {
          id: 1,
          title: 'Test Movie',
          overview: 'Test overview',
          poster_path: '/test.jpg',
          backdrop_path: '/backdrop.jpg',
          release_date: new Date('2024-01-01'),
          vote_average: 8.0,
          vote_count: 100,
          popularity: 50,
          genre_ids: [28],
          adult: false,
          original_language: 'en',
          original_title: 'Test Movie',
          video: false,
        },
      ];

      service.setMovies(apiResults);
      service.updateRating(1, 9.5);

      expect(service.getMovieById(1)?.personalRating).toBe(9.5);
      expect(toastServiceSpy.success).toHaveBeenCalledWith(
        'Rating',
        '"Test Movie": 9.5/10'
      );
    });

    it('should not update rating outside valid range', () => {
      const apiResults: Result[] = [
        {
          id: 1,
          title: 'Test Movie',
          overview: 'Test overview',
          poster_path: '/test.jpg',
          backdrop_path: '/backdrop.jpg',
          release_date: new Date('2024-01-01'),
          vote_average: 8.0,
          vote_count: 100,
          popularity: 50,
          genre_ids: [28],
          adult: false,
          original_language: 'en',
          original_title: 'Test Movie',
          video: false,
        },
      ];

      service.setMovies(apiResults);
      service.updateRating(1, 11);

      expect(service.getMovieById(1)?.personalRating).toBe(null);
      expect(toastServiceSpy.success).not.toHaveBeenCalled();
    });
  });

  describe('updateNotes', () => {
    it('should update personal notes', () => {
      const apiResults: Result[] = [
        {
          id: 1,
          title: 'Test Movie',
          overview: 'Test overview',
          poster_path: '/test.jpg',
          backdrop_path: '/backdrop.jpg',
          release_date: new Date('2024-01-01'),
          vote_average: 8.0,
          vote_count: 100,
          popularity: 50,
          genre_ids: [28],
          adult: false,
          original_language: 'en',
          original_title: 'Test Movie',
          video: false,
        },
      ];

      service.setMovies(apiResults);
      service.updateNotes(1, 'Great movie!');

      expect(service.getMovieById(1)?.personalNotes).toBe('Great movie!');
      expect(toastServiceSpy.success).toHaveBeenCalledWith(
        'Notas',
        'Notas guardadas'
      );
    });
  });

  describe('toggleWatched', () => {
    it('should mark movie as watched', () => {
      const apiResults: Result[] = [
        {
          id: 1,
          title: 'Test Movie',
          overview: 'Test overview',
          poster_path: '/test.jpg',
          backdrop_path: '/backdrop.jpg',
          release_date: new Date('2024-01-01'),
          vote_average: 8.0,
          vote_count: 100,
          popularity: 50,
          genre_ids: [28],
          adult: false,
          original_language: 'en',
          original_title: 'Test Movie',
          video: false,
        },
      ];

      service.setMovies(apiResults);
      service.toggleWatched(1);

      const movie = service.getMovieById(1);
      expect(movie?.isWatched).toBe(true);
      expect(movie?.watchedDate).toBeDefined();
      expect(service.watched().length).toBe(1);
      expect(toastServiceSpy.success).toHaveBeenCalledWith(
        'Estado',
        '"Test Movie" marcada como vista'
      );
    });

    it('should unmark movie as watched', () => {
      const apiResults: Result[] = [
        {
          id: 1,
          title: 'Test Movie',
          overview: 'Test overview',
          poster_path: '/test.jpg',
          backdrop_path: '/backdrop.jpg',
          release_date: new Date('2024-01-01'),
          vote_average: 8.0,
          vote_count: 100,
          popularity: 50,
          genre_ids: [28],
          adult: false,
          original_language: 'en',
          original_title: 'Test Movie',
          video: false,
        },
      ];

      service.setMovies(apiResults);
      service.toggleWatched(1);
      service.toggleWatched(1);

      const movie = service.getMovieById(1);
      expect(movie?.isWatched).toBe(false);
      expect(movie?.watchedDate).toBeNull();
      expect(service.watched().length).toBe(0);
    });
  });

  describe('getMovieById', () => {
    it('should return movie by id', () => {
      const apiResults: Result[] = [
        {
          id: 1,
          title: 'Test Movie',
          overview: 'Test overview',
          poster_path: '/test.jpg',
          backdrop_path: '/backdrop.jpg',
          release_date: new Date('2024-01-01'),
          vote_average: 8.0,
          vote_count: 100,
          popularity: 50,
          genre_ids: [28],
          adult: false,
          original_language: 'en',
          original_title: 'Test Movie',
          video: false,
        },
      ];

      service.setMovies(apiResults);

      const movie = service.getMovieById(1);
      expect(movie?.id).toBe(1);
      expect(movie?.title).toBe('Test Movie');
    });

    it('should return undefined for non-existent id', () => {
      expect(service.getMovieById(999)).toBeUndefined();
    });
  });

  describe('clearAll', () => {
    it('should clear all movies', () => {
      const apiResults: Result[] = [
        {
          id: 1,
          title: 'Test Movie',
          overview: 'Test overview',
          poster_path: '/test.jpg',
          backdrop_path: '/backdrop.jpg',
          release_date: new Date('2024-01-01'),
          vote_average: 8.0,
          vote_count: 100,
          popularity: 50,
          genre_ids: [28],
          adult: false,
          original_language: 'en',
          original_title: 'Test Movie',
          video: false,
        },
      ];

      service.setMovies(apiResults);
      service.clearAll();

      expect(service.movies()).toEqual([]);
      expect(localStorage.getItem('movieApp_data')).toBeNull();
      expect(toastServiceSpy.success).toHaveBeenCalledWith(
        'Limpieza',
        'Datos eliminados'
      );
    });
  });

  describe('localStorage integration', () => {
    it('should save to localStorage when state changes', () => {
      const apiResults: Result[] = [
        {
          id: 1,
          title: 'Test Movie',
          overview: 'Test overview',
          poster_path: '/test.jpg',
          backdrop_path: '/backdrop.jpg',
          release_date: new Date('2024-01-01'),
          vote_average: 8.0,
          vote_count: 100,
          popularity: 50,
          genre_ids: [28],
          adult: false,
          original_language: 'en',
          original_title: 'Test Movie',
          video: false,
        },
      ];

      service.setMovies(apiResults);
      service.toggleFavorite(1);

      const savedData = localStorage.getItem('movieApp_data');
      expect(savedData).toBeDefined();

      const parsedData = JSON.parse(savedData!);
      expect(parsedData[0].isFavorite).toBe(true);
    });

    it('should load from localStorage on initialization', () => {
      const movies: Movie[] = [
        {
          id: 1,
          title: 'Test Movie',
          overview: 'Test overview',
          poster_path: '/test.jpg',
          backdrop_path: '/backdrop.jpg',
          release_date: new Date('2024-01-01'),
          vote_average: 8.0,
          vote_count: 100,
          popularity: 50,
          genre_ids: [28],
          adult: false,
          original_language: 'en',
          original_title: 'Test Movie',
          video: false,
          isFavorite: true,
          personalRating: 9.0,
          personalNotes: 'Great',
          watchedDate: null,
          addedToListDate: new Date('2024-01-01'),
          isWatched: false,
        },
      ];

      localStorage.setItem('movieApp_data', JSON.stringify(movies));

      // Reset TestBed to get fresh service instance
      TestBed.resetTestingModule();
      const toastSpy = jasmine.createSpyObj('ToastService', [
        'success',
        'error',
        'warning',
        'info',
      ]);

      TestBed.configureTestingModule({
        providers: [
          MovieStoreService,
          { provide: ToastService, useValue: toastSpy },
        ],
      });

      const newService = TestBed.inject(MovieStoreService);
      expect(newService.movies().length).toBe(1);
      expect(newService.movies()[0].isFavorite).toBe(true);
      expect(newService.movies()[0].personalRating).toBe(9.0);
    });
  });
});
