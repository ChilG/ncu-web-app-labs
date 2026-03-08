import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'registration',
        loadComponent: () => import('./components/user-registration/user-registration.component').then(m => m.UserRegistrationComponent)
    },
    {
        path: 'users',
        loadComponent: () => import('./components/user-list/user-list.component').then(m => m.UserListComponent)
    },
    {
        path: '',
        redirectTo: 'registration',
        pathMatch: 'full'
    }
];
