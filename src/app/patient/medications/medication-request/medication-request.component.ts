import {Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {MedicationRequest} from 'fhir/r4';
import {FhirService} from '../../../services/fhir.service';
import {ResourceDialogComponent} from '../../../dialogs/resource-dialog/resource-dialog.component';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {DeleteComponent} from "../../../dialogs/delete/delete.component";


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
    'authored','status', 'medication', 'category', 'intent', 'therapy', 'dose', 'quantity',
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

  ngOnChanges(changes: SimpleChanges) {
    console.log('changed')
    if (changes['medicationRequests'] !== undefined) {
      this.dataSource = new MatTableDataSource<MedicationRequest>(this.medicationRequests);
    } else {

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

  delete(medicationRequest : MedicationRequest) {
    let dialogRef = this.dialog.open(DeleteComponent, {
      width: '250px',
      data:  medicationRequest
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('The dialog was closed ' + result);
        this.fhirService.deleteTIE('/MedicationRequest/'+medicationRequest.id).subscribe(() => {
          // @ts-ignore
          this.medicationRequests.forEach((taskIt,index)=> {
            if (taskIt.id === medicationRequest.id) {
              // @ts-ignore
              this.medicationRequests.splice(index, 1);
            }
          })
          this.dataSource = new MatTableDataSource<MedicationRequest>(this.medicationRequests);
        })
      }
    });
  }
}
