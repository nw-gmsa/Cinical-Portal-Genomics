import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {MedicationRequest} from 'fhir/r4';
import {FhirService} from '../../services/fhir.service';
import {ResourceDialogComponent} from '../../dialogs/resource-dialog/resource-dialog.component';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';


@Component({
  selector: 'app-medication-request',
  templateUrl: './medication-request.component.html',
  styleUrls: ['./medication-request.component.css']
})
export class MedicationRequestComponent implements OnInit {

  @Input() medicationRequests: MedicationRequest[] | undefined;

  @Input() showDetail = false;


  @Output() medicationRequest = new EventEmitter<any>();

    @Output() context = new EventEmitter<any>();

  @Input() patientId: string | undefined;

  // @ts-ignore
  dataSource: MatTableDataSource<MedicationRequest>;
  @ViewChild(MatSort) sort: MatSort | undefined;

  displayedColumns = [
    'authored','status', 'medication', 'category',  'dose', 'quantity', 'route',  'instructions','requester','performer',
      'resource'];


  constructor(
      public fhirService: FhirService,
      public dialog: MatDialog) { }

  ngOnInit() {
    if (this.patientId !== undefined) {
     // this.dataSource = new MedicationRequestDataSource(this.fhirService, this.patientId, []);
    } else {
      this.dataSource = new MatTableDataSource<MedicationRequest>(this.medicationRequests);
    }
  }
  ngAfterViewInit() {
    if (this.sort != undefined) {
      this.sort.sortChange.subscribe((event) => {
        console.log(event);
      });
      // @ts-ignore
      this.dataSource.sort = this.sort;
    } else {
      console.log('SORT UNDEFINED');
    }
  }

  select(resource: any) {
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
