import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DownloadTokenComponent } from './download-token.component';

const routes: Routes = [{ path: '', component: DownloadTokenComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DownloadTokenRoutingModule { }
