import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PlayTokenComponent } from './play-token.component';

const routes: Routes = [{ path: '', component: PlayTokenComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlayTokenRoutingModule { }
