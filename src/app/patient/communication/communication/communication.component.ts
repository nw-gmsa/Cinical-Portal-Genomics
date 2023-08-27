import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Communication} from 'fhir/r4';
import {MatSort} from '@angular/material/sort';
import {FhirService} from '../../../services/fhir.service';
import {ResourceDialogComponent} from '../../../dialogs/resource-dialog/resource-dialog.component';
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {MatTableDataSource} from "@angular/material/table";
@Component({
  selector: 'app-communication',
  templateUrl: './communication.component.html',
  styleUrls: ['./communication.component.scss']
})
export class CommunicationComponent implements OnInit {
  @Input()
  public communications: Communication[] | undefined;

  @Output() communication = new EventEmitter<any>();

  @Input() patientId: string | undefined;

  @Input() useBundle = false;

  // @ts-ignore
  dataSource: MatTableDataSource<Communication>;
  @ViewChild(MatSort) sort: MatSort | undefined;

  displayedColumns = [ 'sent', 'category', 'patientmsg', 'message', 'recipients', 'resource'];

  constructor(public fhirService: FhirService, public dialog: MatDialog) { }

  ngOnInit(): void {
    // console.log(this.communications.length)
    // console.log('Patient id = ' + this.patientId);
    if (this.patientId !== undefined) {
      //   this.dataSource = new CommunicationDataSource(this.fhirService, this.patientId, []);
    } else {
      this.dataSource = new MatTableDataSource<Communication>(this.communications);
      // this.dataSource = new CommunicationDataSource(this.fhirService, undefined, this.communications);
    }
  }

  ngAfterViewInit(): void {
    if (this.sort !== undefined) {
      this.sort.sortChange.subscribe((event) => {
        console.log(event);
      });
      // @ts-ignore
      this.dataSource.sort = this.sort;
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

  view(communication: Communication): void {
    this.communication.emit(communication);
  }

  isPatient(communication: Communication): boolean {
    if (communication.sender !== undefined && communication.subject !== undefined) {
      if (communication.sender.reference === communication.subject.reference) {
        return true;
      }
    }
    return false;
  }
}
