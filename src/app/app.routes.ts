import { Routes } from '@angular/router';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { RoomComponent } from './admin/dashboard/room/room.component';
import { WelcomeComponent } from './welcome/welcome.component';

export const routes: Routes = [
 
  // A route for the main page of your application.
  // The `path` is 'main' and it loads the component for your main page.
  { path: '', component: WelcomeComponent },

  // This is the route for a specific room, which will have a URL like:
  // http://localhost:4200/room/12345
  // The ':roomId' is a route parameter that can be read from within the RoomComponent.
  { path: 'room/:roomCode', component: RoomComponent },
  
  // A wildcard route that handles any URLs that don't match the ones above.
  // It's useful for showing a "Page Not Found" component.
  //{ path: '**', component: PageNotFoundComponent }
];
