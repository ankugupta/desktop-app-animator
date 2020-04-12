import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CustomMaterialModule } from '../custom-material.module';
import { PlayTokenRoutingModule } from './play-token-routing.module';
import { PlayTokenComponent } from './play-token.component';

@NgModule({
  declarations: [PlayTokenComponent],
  imports: [
    CommonModule,
    PlayTokenRoutingModule,
    CustomMaterialModule
  ]
})
export class PlayTokenModule { }
