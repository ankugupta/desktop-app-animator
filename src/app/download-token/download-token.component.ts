import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';


@Component({
  selector: 'app-download-token',
  templateUrl: './download-token.component.html',
  styleUrls: ['./download-token.component.scss']
})
export class DownloadTokenComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<DownloadTokenComponent>) { }

  ngOnInit() {
  }

  close() {
    this.dialogRef.close();
  }
}
