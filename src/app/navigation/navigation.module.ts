import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CustomMaterialModule } from '../custom-material.module';
import { NavigationRoutingModule } from './navigation-routing.module';
import { NavigationComponent } from './navigation.component';

@NgModule({
  declarations: [NavigationComponent],
  imports: [
    CommonModule,
    NavigationRoutingModule,
    CustomMaterialModule
  ],
  exports: [NavigationComponent]
})
export class NavigationModule { }
