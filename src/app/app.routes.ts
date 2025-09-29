import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/components/layout.component').then(
        (c) => c.LayoutComponent
      ),
    children: [
      {
        path: '',
        redirectTo: 'movies',
        pathMatch: 'full',
      },
      {
        path: 'movies',
        loadComponent: () =>
          import(
            './features/movies/components/movie-list/movie-list.component'
          ).then((c) => c.MovieListComponent),
      },
      {
        path: 'movies/create',
        loadComponent: () =>
          import(
            './features/movies/components/movie-form/movie-form.component'
          ).then((c) => c.MovieFormComponent),
      },
      {
        path: 'movies/edit/:id',
        loadComponent: () =>
          import(
            './features/movies/components/movie-form/movie-form.component'
          ).then((c) => c.MovieFormComponent),
      },
      {
        path: 'movies/:id',
        loadComponent: () =>
          import(
            './features/movies/pages/movie-details/movie-details.component'
          ).then((c) => c.MovieDetailsComponent),
      },
      {
        path: 'my-movies',
        loadComponent: () =>
          import(
            './features/movies/components/my-movies/my-movies.component'
          ).then((c) => c.MyMoviesComponent),
      },
      {
        path: 'favorites',
        loadComponent: () =>
          import(
            './features/movies/components/favorites/favorites.component'
          ).then((c) => c.FavoritesComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
