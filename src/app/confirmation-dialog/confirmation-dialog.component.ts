import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent implements OnInit {

  message: string;
  okButtonText = "OK";
  cancelButtonText: string;
  dialogData: ConfirmationDialogData;

  constructor(private dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogData: ConfirmationDialogData) {
    this.dialogData = dialogData;
  }

  ngOnInit() {
    this.message = this.dialogData.msg;
    if (this.dialogData.okButtonText) {
      this.okButtonText = this.dialogData.okButtonText;
    }
    if (this.dialogData.cancelButtonText) {
      this.cancelButtonText = this.dialogData.cancelButtonText;
    }
  }

  close(buttonPressed: string) {
    this.dialogRef.close({ buttonPressed: buttonPressed });
  }


}

export interface ConfirmationDialogData {
  msg: string,
  okButtonText?: string,
  cancelButtonText?: string
}