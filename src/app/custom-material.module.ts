import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  MatListModule, 
  MatToolbarModule, 
  MatButtonModule, 
  MatSidenavModule, 
  MatIconModule,
  MatCardModule,
  MatDialogModule,
  MatFormFieldModule,
  MatInputModule,
  MatProgressBarModule,
  MatSnackBarModule, 
} from '@angular/material';



@NgModule({
  declarations: [],
  imports: [
    //CommonModule,
  ],
  exports: [
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatProgressBarModule,
    MatSnackBarModule
  ]
})
export class CustomMaterialModule { }
