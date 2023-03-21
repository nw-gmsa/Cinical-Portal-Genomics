import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';

import {Observation, ServiceRequest} from 'fhir/r4';
import {FhirService} from '../../services/fhir.service';
import {ResourceDialogComponent} from '../../dialogs/resource-dialog/resource-dialog.component';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';


@Component({
  selector: 'app-referral-request',
  templateUrl: './referral-request.component.html',
  styleUrls: ['./referral-request.component.css']
})
export class ReferralRequestComponent implements OnInit {

    @Input() referrals: ServiceRequest[] | undefined;

    @Input() showDetail = false;

    @Input() patientId: string | undefined;

    @Output() referral = new EventEmitter<any>();


    @Input() useBundle = false;

  // @ts-ignore
    dataSource: MatTableDataSource<ServiceRequest>;
  @ViewChild(MatSort) sort: MatSort | undefined;

    displayedColumns = ['date', 'start', 'end', 'fulfills', 'status', 'intent', 'priority', 'category',
      'code', 'performer', 'reason', 'requester', 'recipient', 'notes', 'resource'];


  constructor(
              // private modalService: NgbModal,
              public dialog: MatDialog,
              public fhirService: FhirService) {


  }

  ngOnInit(): void {

      if (this.patientId !== undefined) {
      //    this.dataSource = new ReferralRequestDataSource(this.fhirService, this.patientId, []);
      } else {
        this.dataSource = new MatTableDataSource<ServiceRequest>(this.referrals);
      }

  }
  // tslint:disable-next-line:use-lifecycle-interface
  ngAfterViewInit(): void {
    if (this.sort !== undefined) {
      this.sort.sortChange.subscribe((event) => {
        console.log(event);
      });
      if (this.dataSource !== undefined) this.dataSource.sort = this.sort;
    } else {
      console.log('SORT UNDEFINED');
    }
  }

    select(resource: any): void {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.data = {
            id: 1,
            resource
        };
        const resourceDialog: MatDialogRef<ResourceDialogComponent> = this.dialog.open( ResourceDialogComponent, dialogConfig);
    }

}
