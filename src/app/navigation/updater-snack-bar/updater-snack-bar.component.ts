import {Component, Inject} from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material';


@Component({
    selector: 'app-updater-snack-bar',
    templateUrl: './updater-snack-bar.component.html',
    styleUrls: ['./updater-snack-bar.component.scss']
  })
  export class UpdaterSnackBarComponent {

    snackBarRef: MatSnackBarRef<UpdaterSnackBarComponent>;
    snackBarMessage: any;

    constructor( @Inject(MAT_SNACK_BAR_DATA) snackBarData, @Inject(MatSnackBarRef) snackBarRef){
        this.snackBarMessage = snackBarData.message;
        this.snackBarRef = snackBarRef;
    }

    closeSnackBar(){
        this.snackBarRef.dismiss();
    }
  }