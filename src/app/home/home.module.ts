import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CustomMaterialModule } from '../custom-material.module';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    HomeRoutingModule,
    CustomMaterialModule
  ]
})
export class HomeModule { }
