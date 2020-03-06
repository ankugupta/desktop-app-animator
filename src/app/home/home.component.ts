import { Component, OnInit } from '@angular/core';
import { ThemePalette, MatDialog } from '@angular/material';
import { PlayTokenComponent } from '../play-token/play-token.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  color: ThemePalette = 'warn';
  mode= 'indeterminate';
  value = 50;
  bufferValue = 75;

  constructor(public dialog: MatDialog) { }

  ngOnInit() {
  }
  playTokenDialog(): void {
    const dialogRef = this.dialog.open(PlayTokenComponent, {
      width: '100%',
      height: '800px',
    });
  }
}
