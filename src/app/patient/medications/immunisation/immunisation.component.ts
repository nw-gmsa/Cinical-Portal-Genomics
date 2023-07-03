import {Component, Input, OnInit} from "@angular/core";
import {Immunization, Resource} from "fhir/r4";
import {MatLegacyDialog as MatDialog, MatLegacyDialogConfig as MatDialogConfig, MatLegacyDialogRef as MatDialogRef} from "@angular/material/legacy-dialog";
import {FhirService} from "../../../services/fhir.service";
import {MatLegacyTableDataSource as MatTableDataSource} from "@angular/material/legacy-table";
import {ResourceDialogComponent} from "../../../dialogs/resource-dialog/resource-dialog.component";

@Component({
  selector: 'app-immunisation',
  templateUrl: './immunisation.component.html',
  styleUrls: ['./immunisation.component.css']
})
export class ImmunisationComponent implements OnInit {

  @Input()
  immunisations: Immunization[] | undefined;

  @Input()
  patientId: string | undefined;

  // @ts-ignore
    dataSource : MatTableDataSource<Immunization>;


  displayedColumns = ['date','procedure', 'code','indication','dose','status', 'resource'];

  constructor(
              public dialog: MatDialog,
              public fhirService: FhirService,
              ) { }

  ngOnInit() {
    if (this.patientId !== undefined) {
    //  this.dataSource = new ImmunizationDataSource(this.fhirService, this.patientId, []);
    } else {
      this.dataSource = new MatTableDataSource<Immunization>(this.immunisations);
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
