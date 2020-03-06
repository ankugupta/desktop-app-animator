import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlayTokenRoutingModule } from './play-token-routing.module';
import { PlayTokenComponent } from './play-token.component';
import { MatIconModule, MatButtonModule } from '@angular/material';


@NgModule({
  declarations: [PlayTokenComponent],
  imports: [
    CommonModule,
    PlayTokenRoutingModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class PlayTokenModule { }
