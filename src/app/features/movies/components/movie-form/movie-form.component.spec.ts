import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { of } from 'rxjs';

import { MovieFormComponent } from './movie-form.component';
import { MovieApiService } from '../../services/movie-api.service';
import { MovieStoreService } from '../../services/movie-store.service';
import { ToastService } from '@core/services/toast.service';
import { Movie } from '../../interfaces/movie.interface';
import { MovieStoreStub } from '@testing/movie-store.stub';

function makeActivatedRoute(
  params: Record<string, string> = {}
): ActivatedRoute {
  return {
    snapshot: { paramMap: convertToParamMap(params) } as any,
  } as ActivatedRoute;
}

describe('MovieFormComponent (AAA)', () => {
  let fixture: ComponentFixture<MovieFormComponent>;
  let component: MovieFormComponent;
  let movieApiSpy: jasmine.SpyObj<MovieApiService>;
  let toastSpy: jasmine.SpyObj<ToastService>;
  let storeStub: MovieStoreStub;

  beforeEach(async () => {
    movieApiSpy = jasmine.createSpyObj<MovieApiService>('MovieApiService', [
      'getGenres',
    ]);
    toastSpy = jasmine.createSpyObj<ToastService>('ToastService', [
      'success',
      'warning',
      'error',
    ]);
    storeStub = new MovieStoreStub();

    movieApiSpy.getGenres.and.returnValue(of({ genres: [] }));

    await TestBed.configureTestingModule({
      imports: [MovieFormComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: MovieApiService, useValue: movieApiSpy },
        { provide: MovieStoreService, useValue: storeStub },
        { provide: ToastService, useValue: toastSpy },
        { provide: ActivatedRoute, useValue: makeActivatedRoute() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.movieForm.get('originalLanguage')?.value).toBe('es');
    expect(component.movieForm.get('adult')?.value).toBe(false);
    expect(component.movieForm.get('video')?.value).toBe(false);
    expect(component.movieForm.get('voteAverage')?.value).toBe(5.0);
    expect(component.movieForm.get('popularity')?.value).toBe(100);
  });

  it('should load genres on init', () => {
    expect(movieApiSpy.getGenres).toHaveBeenCalled();
    expect(component.genres()).toEqual([]);
  });

  it('should validate required fields', () => {
    const form = component.movieForm;
    expect(form.get('title')?.hasError('required')).toBeTrue();
    expect(form.get('originalTitle')?.hasError('required')).toBeTrue();
    expect(form.get('overview')?.hasError('required')).toBeTrue();
    expect(form.get('releaseDate')?.hasError('required')).toBeTrue();
    expect(form.get('genreIds')?.hasError('required')).toBeTrue();
  });

  describe('Edit mode tests', () => {
    let editFixture: ComponentFixture<MovieFormComponent>;
    let editComponent: MovieFormComponent;

    beforeEach(async () => {
      TestBed.resetTestingModule();

      const movie: Movie = {
        id: 123,
        title: 'T',
        original_title: 'OT',
        overview: 'desc',
        release_date: '2024-05-01',
        original_language: 'es',
        genre_ids: [1, 2],
        adult: false,
        video: false,
        vote_average: 7,
        vote_count: 10,
        popularity: 100,
        poster_path: '/p.jpg',
        backdrop_path: '/b.jpg',
        isFavorite: false,
        personalRating: null,
        personalNotes: '',
        isWatched: false,
        watchedDate: null,
        addedToListDate: new Date(),
      };

      const editStoreStub = new MovieStoreStub();
      spyOn(editStoreStub, 'getMovieById').and.returnValue(movie);

      await TestBed.configureTestingModule({
        imports: [MovieFormComponent],
        providers: [
          provideRouter([]),
          provideNoopAnimations(),
          { provide: MovieApiService, useValue: movieApiSpy },
          { provide: MovieStoreService, useValue: editStoreStub },
          { provide: ToastService, useValue: toastSpy },
          {
            provide: ActivatedRoute,
            useValue: makeActivatedRoute({ id: '123' }),
          },
        ],
      }).compileComponents();

      editFixture = TestBed.createComponent(MovieFormComponent);
      editComponent = editFixture.componentInstance;
      editFixture.detectChanges();
    });

    it('should go to edit mode when route has id and populate form', () => {
      // Assert
      expect(editComponent.isEditMode()).toBeTrue();
      expect(editComponent.movieId()).toBe(123);
      expect(editComponent.movieForm.get('title')?.value).toBe('T');
      expect(editComponent.movieForm.get('originalTitle')?.value).toBe('OT');
    });
  });
});
