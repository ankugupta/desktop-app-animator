import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CustomMaterialModule } from '../custom-material.module';
import { DownloadTokenRoutingModule } from './download-token-routing.module';
import { DownloadTokenComponent } from './download-token.component';

@NgModule({
  declarations: [DownloadTokenComponent],
  imports: [
    CommonModule,
    DownloadTokenRoutingModule,
    CustomMaterialModule,
    FormsModule,
  ]
})
export class DownloadTokenModule { }
