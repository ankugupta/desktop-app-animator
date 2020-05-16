import { Subscription } from 'rxjs';

import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import { CommonUtilService } from '../service/common-util.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit, OnDestroy {

  appUpdatesSubscription: Subscription;

  appUpdateMessage = "";

  constructor(
    private commonUtils: CommonUtilService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit() {

    this.appUpdatesSubscription = this.commonUtils.getAppUpdationAsObservable().subscribe(
      message => {
        this.appUpdateMessage = message;
        this.changeDetectorRef.detectChanges();
      }
    );

  }


  ngOnDestroy(): void {
    this.appUpdatesSubscription.unsubscribe();
  }
}
