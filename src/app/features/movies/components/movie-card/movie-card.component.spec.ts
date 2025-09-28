import { TestBed } from '@angular/core/testing';
import { MovieCardComponent, MovieCardEvent } from './movie-card.component';
import { MovieApiService } from '../../services/movie-api.service';
import { Genre } from '../../interfaces/genre.interface';
import { Result } from '../../interfaces/tmdb-response.interface';
import { GenreBuilder, ResultBuilder } from '@testing/spec-builders';

describe('MovieCardComponent (AAA + Builders)', () => {
  let component: MovieCardComponent;

  const apiSpy = jasmine.createSpyObj<MovieApiService>('MovieApiService', [
    'getImageUrl',
  ]);

  const movie: Result = new ResultBuilder()
    .withId(42)
    .withTitle('Inception')
    .withPoster('/p.jpg')
    .withGenres([1, 2, 3, 4])
    .withRelease(new Date('2020-05-10'))
    .build();

  const genres: Genre[] = [
    new GenreBuilder().withId(1).withName('Acción').build(),
    new GenreBuilder().withId(2).withName('Drama').build(),
    new GenreBuilder().withId(3).withName('Comedia').build(),
    new GenreBuilder().withId(4).withName('Sci-Fi').build(),
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MovieCardComponent],
      providers: [{ provide: MovieApiService, useValue: apiSpy }],
    });

    const fixture = TestBed.createComponent(MovieCardComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('movie', movie);
    fixture.componentRef.setInput('genres', genres);

    apiSpy.getImageUrl.and.returnValue('https://img.cdn/poster.jpg');

    fixture.detectChanges();
  });

  it('posterUrl usa MovieApiService.getImageUrl con poster', () => {
    const url = component.posterUrl();
    expect(apiSpy.getImageUrl).toHaveBeenCalledWith('/p.jpg', 'poster');
    expect(url).toBe('https://img.cdn/poster.jpg');
  });

  it('releaseYear devuelve el año de release_date', () => {
    const year = component.releaseYear();
    expect(year).toBe(2020);
  });

  it('movieGenres mapea ids a géneros y limita a 3', () => {
    const top3 = component.movieGenres();
    expect(top3.length).toBe(3);
    expect(top3.map((g: Genre) => g.name)).toEqual([
      'Acción',
      'Drama',
      'Comedia',
    ]);
  });

  it('onToggleFavorite emite "favoriteToggle"', () => {
    let received!: MovieCardEvent;
    component.cardEvent.subscribe((e: MovieCardEvent) => (received = e));

    component.onToggleFavorite();

    expect(received).toEqual({ type: 'favoriteToggle', movieId: 42 });
  });

  it('onToggleWatched emite "watchedToggle"', () => {
    let received!: MovieCardEvent;
    component.cardEvent.subscribe((e: MovieCardEvent) => (received = e));

    component.onToggleWatched();

    expect(received).toEqual({ type: 'watchedToggle', movieId: 42 });
  });

  it('onViewDetails emite "viewDetails"', () => {
    let received!: MovieCardEvent;
    component.cardEvent.subscribe((e: MovieCardEvent) => (received = e));

    component.onViewDetails();

    expect(received).toEqual({ type: 'viewDetails', movieId: 42 });
  });

  it('onImageError reemplaza src por placeholder', () => {
    const img = document.createElement('img');
    img.src = 'old';
    const ev = new Event('error');
    Object.defineProperty(ev, 'target', { value: img });

    component.onImageError(ev);

    expect(img.src).toContain('/assets/img/image-not-found.png');
  });
});
