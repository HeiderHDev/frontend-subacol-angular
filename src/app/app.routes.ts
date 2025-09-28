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
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
