import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/components/layout.component').then(
        (c) => c.LayoutComponent
      ),
  },
];
