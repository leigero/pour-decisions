import { Routes } from '@angular/router';

import { ComponentGalleryComponent } from './component-gallery/component-gallery';
import { FoundationsComponent } from './foundations/foundations';
import { FormsPlaygroundComponent } from './forms-playground/forms-playground';

export const APP_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'foundations',
    pathMatch: 'full',
  },
  {
    path: 'foundations',
    component: FoundationsComponent,
    title: 'Tonic Docs · Foundations',
  },
  {
    path: 'components',
    component: ComponentGalleryComponent,
    title: 'Tonic Docs · Components',
  },
  {
    path: 'forms',
    component: FormsPlaygroundComponent,
    title: 'Tonic Docs · Forms',
  },
  {
    path: '**',
    redirectTo: 'foundations',
  },
];
