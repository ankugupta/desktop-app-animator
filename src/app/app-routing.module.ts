import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {
    path: '', redirectTo: 'home', pathMatch: 'full'
  },
  { 
    path: 'home', loadChildren: () => import('./home/home.module').then(m => m.HomeModule) 
  }, 
  { 
    path: 'about', loadChildren: () => import('./about/about.module').then(m => m.AboutModule) 
  }, 
  { 
    path: 'library', loadChildren: () => import('./library/library.module').then(m => m.LibraryModule) 
  },
  { path: 'download-token', loadChildren: () => import('./download-token/download-token.module').then(m => m.DownloadTokenModule) },
  { path: 'play-token', loadChildren: () => import('./play-token/play-token.module').then(m => m.PlayTokenModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
