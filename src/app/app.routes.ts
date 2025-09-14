import { Routes } from '@angular/router';
import { RoomComponent } from './guest/room/room.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { DashboardComponent } from './host/dashboard/dashboard.component';
import { MenuEditorComponent } from './host/dashboard/menu/menu-editor.component';

export const routes: Routes = [
  // A route for the main page of your application.
  // The `path` is 'main' and it loads the component for your main page.
  { path: '', component: WelcomeComponent },

  // This is the route for a specific room, which will have a URL like:
  // http://localhost:4200/room/12345
  // The ':roomCode' is a route parameter that can be read from within the RoomComponent.
  { path: 'room/:roomCode', component: RoomComponent },

  {
    path: 'dashboard/:roomId',
    component: DashboardComponent,
    children: [
      // This is a child route. Its full path will be 'dashboard/:roomId/menu-editor'.
      // It will render inside the <router-outlet> of the DashboardComponent.
      { path: 'menu-editor', component: MenuEditorComponent },
    ],
  },
];
