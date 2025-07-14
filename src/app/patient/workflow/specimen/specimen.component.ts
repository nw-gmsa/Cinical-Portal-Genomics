import {Component, Input, ViewChild} from '@angular/core';
import {Observation, Reference, ServiceRequest, Specimen} from "fhir/r4";
import {FhirService} from "../../../services/fhir.service";
import {environment} from "../../../../environments/environment";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {ResourceDialogComponent} from "../../../dialogs/resource-dialog/resource-dialog.component";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {MatPaginator} from "@angular/material/paginator";

@Component({
  selector: 'app-specimen',
  templateUrl: './specimen.component.html',
  styleUrl: './specimen.component.scss'
})
export class SpecimenComponent {

  @Input() specimens: Specimen[] = [];

  @Input()
  set setSpecimen(reference: Reference | undefined) {
    this.specimens = []

    if (reference !== undefined) {
      this.specimens = []
      this.getReference(reference)
    } else {

    }
  }

  @Input()
  set setSpecimens(references: Reference[] | undefined) {
    this.specimens = []
    if (references !== undefined) {
      for(let reference of references) {
        this.getReference(reference)
      }
    }
  }

  // @ts-ignore
  dataSource: MatTableDataSource<Specimen> ;
  @ViewChild(MatSort) sort: MatSort | undefined;
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  displayedColumns = ['orderNumber', 'accessionNumber', 'type', 'collected','resource'];


  constructor(public fhirService: FhirService,
              public dialog: MatDialog) { }

  getReference(reference: Reference) {
    if (reference.reference === undefined) return;

    this.fhirService.getResource('/'+reference.reference).subscribe(result => {
          if (result !== undefined) {
            if (result.resourceType === 'Specimen') {
              this.specimens.push(result as Specimen)
              this.dataSource = new MatTableDataSource<Specimen>(this.specimens);
            }
          }
        }
    )
  }

  select(resource: any): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      resource
    };
    const resourceDialog: MatDialogRef<ResourceDialogComponent> = this.dialog.open( ResourceDialogComponent, dialogConfig);
  }

  protected readonly environment = environment;
}
