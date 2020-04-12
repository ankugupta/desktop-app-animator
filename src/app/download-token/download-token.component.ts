import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-download-token',
  templateUrl: './download-token.component.html',
  styleUrls: ['./download-token.component.scss']
})
export class DownloadTokenComponent implements OnInit {

  downloadToken: string;

  constructor(private dialogRef: MatDialogRef<DownloadTokenComponent>) { }

  ngOnInit() {
    this.downloadToken = "";
  }


  close(data?: string) {
    this.dialogRef.close(data);
  }
}
