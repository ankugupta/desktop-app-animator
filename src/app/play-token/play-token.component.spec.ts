import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayTokenComponent } from './play-token.component';

describe('PlayTokenComponent', () => {
  let component: PlayTokenComponent;
  let fixture: ComponentFixture<PlayTokenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayTokenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
