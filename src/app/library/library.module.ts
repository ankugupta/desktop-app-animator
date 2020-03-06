import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LibraryRoutingModule } from './library-routing.module';
import { LibraryComponent } from './library.component';
import { MatCardModule } from '@angular/material';


@NgModule({
  declarations: [LibraryComponent],
  imports: [
    CommonModule,
    LibraryRoutingModule,
    MatCardModule

  ]
})
export class LibraryModule { }
