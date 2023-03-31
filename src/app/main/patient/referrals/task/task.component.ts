import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import { Patient, Task} from 'fhir/r4';
import {FhirService} from '../../../../services/fhir.service';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {ResourceDialogComponent} from '../../../../dialogs/resource-dialog/resource-dialog.component';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskComponent implements OnInit {

  @Input() tasks: Task[] | undefined;

  locations: Location[] = [];

  @Input() showDetail = false;

  @Input() patient: Patient | undefined;

  @Output() task = new EventEmitter<any>();



  @Input() patientId: string | undefined;

  @Input() useBundle = false;

  // @ts-ignore
  dataSource: MatTableDataSource<Task>;
  @ViewChild(MatSort) sort: MatSort | undefined;

  displayedColumns = ['authored', 'start', 'end', 'status', 'intent', 'code', 'focus', 'reason', 'description', 'requester', 'owner', 'notes', 'resource'];

  constructor(public fhirService: FhirService,
              public dialog: MatDialog) { }

  ngOnInit(): void {
    if (this.patientId !== undefined) {
      console.log('Patient Id found tasks')
   //   this.dataSource = new TaskDataSource(this.fhirService, this.patientId, []);
    } else {
      this.dataSource = new MatTableDataSource<Task>(this.tasks);
    }
  }

  ngAfterViewInit() {
    if (this.sort != undefined) {
      this.sort.sortChange.subscribe((event) => {
        console.log(event);
      });
      if (this.dataSource !== undefined) this.dataSource.sort = this.sort;
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
