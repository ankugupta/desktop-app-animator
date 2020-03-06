import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { MatCardModule, MatToolbarModule, MatButtonModule, MatIconModule, MatProgressBarModule } from '@angular/material';


@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    HomeRoutingModule,
    MatCardModule,
    MatToolbarModule, 
    MatButtonModule, 
    MatIconModule,
    MatProgressBarModule
  ]
})
export class HomeModule { }
