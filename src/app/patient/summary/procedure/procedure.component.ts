import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { Procedure, Reference, Resource} from "fhir/r4";
import {FhirService} from "../../../services/fhir.service";
import {MatLegacyTableDataSource as MatTableDataSource} from "@angular/material/legacy-table";
import {ResourceDialogComponent} from "../../../dialogs/resource-dialog/resource-dialog.component";
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
@Component({
  selector: 'app-procedure',
  templateUrl: './procedure.component.html',
  styleUrls: ['./procedure.component.css']
})
export class ProcedureComponent implements OnInit {

  @Input() procedures: Procedure[] | undefined;

  @Output() procedure = new EventEmitter<Procedure>();

  @Output() encounterRef = new EventEmitter<Reference>();

  @Input() patientId: string | undefined;

  @Input() useBundle :boolean = false;

// @ts-ignore
  dataSource : MatTableDataSource<Procedure>;

  displayedColumns = ['performed', 'code','status', 'bodysite', 'complication', 'resource'];

  constructor(
              public dialog: MatDialog,
              public fhirService:FhirService) { }

  ngOnInit() {
    if (this.patientId !== undefined) {

    } else {
      this.dataSource = new MatTableDataSource<Procedure>(this.procedures);
    }
  }


  select(resource: Resource) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      id: 1,
      resource: resource
    };
    const resourceDialog: MatDialogRef<ResourceDialogComponent> = this.dialog.open( ResourceDialogComponent, dialogConfig);
  }
}
