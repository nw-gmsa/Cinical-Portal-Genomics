import {Component, Inject, OnInit} from '@angular/core';
import {Task} from 'fhir/r4';
import {FhirService} from "../../services/fhir.service";
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
@Component({
  selector: 'app-delete',
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.scss']
})
export class DeleteComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<DeleteComponent>,
              @Inject(MAT_DIALOG_DATA) public data: Task,
              public fhirService: FhirService) {}

  ngOnInit(): void {
  }

  cancel() {
    this.dialogRef.close(false);
  }
  ok() {
    this.dialogRef.close(true);
  }
}
