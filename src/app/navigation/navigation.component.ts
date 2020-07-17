import { Subscription } from 'rxjs';

import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import { CommonUtilService } from '../service/common-util.service';
import { MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition, MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit, OnDestroy {
  horizontalPosition: MatSnackBarHorizontalPosition = 'start';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  appUpdatesSubscription: Subscription;

  appUpdateMessage = "Update Available : Version 2.0.0 <br> App will update itself on next restart";

  constructor(
    private commonUtils: CommonUtilService,
    private changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit() {

this.openSnackBar();
    this.appUpdatesSubscription = this.commonUtils.getAppUpdationAsObservable().subscribe(
      message => {
        //this.appUpdateMessage = message;
        this.changeDetectorRef.detectChanges();
      }
    );

  }

  openSnackBar() {
    this._snackBar.open('Cannonball!!', 'End now', {
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  ngOnDestroy(): void {
    this.appUpdatesSubscription.unsubscribe();
  }
}
