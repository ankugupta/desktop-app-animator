import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadTokenComponent } from './download-token.component';

describe('DownloadTokenComponent', () => {
  let component: DownloadTokenComponent;
  let fixture: ComponentFixture<DownloadTokenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DownloadTokenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
