import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';

import {Patient, ServiceRequest} from 'fhir/r4';
import {FhirService} from '../../../../services/fhir.service';
import {ResourceDialogComponent} from '../../../../dialogs/resource-dialog/resource-dialog.component';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {animate, state, style, transition, trigger} from "@angular/animations";
import {DeleteComponent} from "../../../../dialogs/delete/delete.component";
import {ServiceCreateComponent} from "../service-create/service-create.component";
import {EprService} from "../../../../services/epr.service";



@Component({
  selector: 'app-referral-request',
  templateUrl: './referral-request.component.html',
  styleUrls: ['./referral-request.component.css'],
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({height: '0px', minHeight: '0'})),
            state('expanded', style({height: '*'})),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ],
})
export class ReferralRequestComponent implements OnInit {

    @Input() referrals: ServiceRequest[] =[];

    @Input() showDetail = false;

    @Input() patientId: string | undefined;
    private nhsNumber: string | undefined;

    @Output() referral = new EventEmitter<any>();
    @Output() taskChange = new EventEmitter<any>();

    @Input() useBundle = false;

    expandedElement: null | ServiceRequest | undefined;


  // @ts-ignore
    dataSource: MatTableDataSource<ServiceRequest>;
  @ViewChild(MatSort) sort: MatSort | undefined;

    displayedColumns = [ 'date', 'start', 'end', 'fulfills', 'status', 'intent', 'priority', 'category',
      'code', 'performer',  'recipient',  'resource'];

    columnsToDisplayWithExpand = [...this.displayedColumns, 'expand'];


  constructor(
              // private modalService: NgbModal,
              public dialog: MatDialog,
              public fhirService: FhirService,
              private eprService: EprService) {


  }

  ngOnInit(): void {
      if (this.eprService.patient !== undefined) {
          if (this.eprService.patient.id !== undefined) {
              this.patientId = this.eprService.patient.id;
              this.getRecords(this.eprService.patient);
          }

      }
      this.eprService.patientChangeEvent.subscribe(patient => {
          if (patient.id !== undefined) this.patientId = patient.id

          this.getRecords(patient);
      });
      this.dataSource = new MatTableDataSource<ServiceRequest>(this.referrals);
  }
    private getRecords(patient : Patient) {
        if (patient !== undefined) {
            this.patientId = patient.id;
            if (patient.identifier !== undefined) {
                for (const identifier of patient.identifier) {
                    if (identifier.system !== undefined && identifier.system.includes('nhs-number')) {
                        this.nhsNumber = identifier.value;
                    }
                }
            }
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

    processTaskChange($event: any) {
        console.log($event)
        this.taskChange.emit($event)
    }

    delete(referral : ServiceRequest) {
        let dialogRef = this.dialog.open(DeleteComponent, {
            width: '250px',
            data:  referral
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                console.log('The dialog was closed ' + result);
                this.fhirService.deleteTIE('/ServiceRequest/'+referral.id).subscribe(result => {
                    console.log(result);
                    this.referrals.forEach((taskIt,index)=> {
                        if (taskIt.id === referral.id) {
                            this.referrals.splice(index, 1);
                        }
                    })
                    this.dataSource = new MatTableDataSource<ServiceRequest>(this.referrals);
                })
            }
        });
    }

    edit(referral: ServiceRequest) {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.height = '85%';
        dialogConfig.width = '50%';

        dialogConfig.data = {
            id: 1,
            patientId: this.patientId,
            nhsNumber: this.nhsNumber,
            serviceRequest: referral
        };
        const dialogRef = this.dialog.open( ServiceCreateComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            console.log(result)
            //this.getResults();
        })
    }
}
