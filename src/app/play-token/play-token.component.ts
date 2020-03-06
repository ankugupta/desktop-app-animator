import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-play-token',
  templateUrl: './play-token.component.html',
  styleUrls: ['./play-token.component.scss']
})
export class PlayTokenComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<PlayTokenComponent>) { }

  ngOnInit() {
  }
  close() {
    this.dialogRef.close();
  }
}
