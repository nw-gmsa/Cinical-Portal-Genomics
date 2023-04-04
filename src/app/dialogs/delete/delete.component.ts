import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Task} from 'fhir/r4';
import {FhirService} from "../../services/fhir.service";

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
