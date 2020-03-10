import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationRoutingModule } from './navigation-routing.module';
import { NavigationComponent } from './navigation.component';
import { CustomMaterialModule } from '../custom-material.module';


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
