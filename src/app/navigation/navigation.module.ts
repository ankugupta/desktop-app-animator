import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CustomMaterialModule } from '../custom-material.module';
import { NavigationRoutingModule } from './navigation-routing.module';
import { NavigationComponent } from './navigation.component';
import { UpdaterSnackBarComponent } from './updater-snack-bar/updater-snack-bar.component';

@NgModule({
  declarations: [NavigationComponent, UpdaterSnackBarComponent],
  imports: [
    CommonModule,
    NavigationRoutingModule,
    CustomMaterialModule
  ],
  exports: [NavigationComponent],
  entryComponents: [UpdaterSnackBarComponent]
})
export class NavigationModule { }
