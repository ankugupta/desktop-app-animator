import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DownloadTokenRoutingModule } from './download-token-routing.module';
import { DownloadTokenComponent } from './download-token.component';
import { MatFormFieldModule, MatInputModule, MatButtonModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [DownloadTokenComponent],
  imports: [
    CommonModule,
    DownloadTokenRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class DownloadTokenModule { }
