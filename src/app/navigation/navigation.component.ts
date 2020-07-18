import { Subscription } from 'rxjs';

import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import { CommonUtilService } from '../service/common-util.service';
import { MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition, MatSnackBar } from '@angular/material';
import { UpdaterSnackBarComponent } from './updater-snack-bar/updater-snack-bar.component';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit, OnDestroy {
  horizontalPosition: MatSnackBarHorizontalPosition = 'start';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  appUpdatesSubscription: Subscription;

  constructor(
    private commonUtils: CommonUtilService,
    private changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit() {

    this.appUpdatesSubscription = this.commonUtils.getAppUpdationAsObservable().subscribe(
      message => {
        if (message) {
          this.openSnackBar(message);
          this.changeDetectorRef.detectChanges();
        }
      }
    );

  }

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(UpdaterSnackBarComponent, {
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      data: { message: message },
      panelClass: ['updater-message']
    });
  }

  ngOnDestroy(): void {
    this.appUpdatesSubscription.unsubscribe();
  }
}
