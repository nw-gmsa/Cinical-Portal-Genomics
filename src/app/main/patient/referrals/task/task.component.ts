import {Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {Patient, ServiceRequest, Task} from 'fhir/r4';
import {FhirService} from '../../../../services/fhir.service';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {ResourceDialogComponent} from '../../../../dialogs/resource-dialog/resource-dialog.component';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {animate, state, style, transition, trigger} from "@angular/animations";
import {TaskCreateComponent} from "../task-create/task-create.component";
import {DeleteComponent} from "../../../../dialogs/delete/delete.component";
import {EprService} from "../../../../services/epr.service";

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class TaskComponent implements OnInit {

  @Input() tasks: Task[] = [];

  @Input()
  serviceRequest: ServiceRequest | undefined

  locations: Location[] = [];

  @Input() showDetail = false;

  @Input() patient: Patient | undefined;

  @Output() task = new EventEmitter<any>();



  @Input() patientId: string | undefined;

  private nhsNumber: string | undefined;


  @Input() useBundle = false;

  // @ts-ignore
  dataSource: MatTableDataSource<Task>;
  @ViewChild(MatSort) sort: MatSort | undefined;

  expandedElement: null | Task | undefined;
  displayedColumns = ['authored', 'lastModified', 'status', 'intent', 'code', 'focus',  'owner', 'resource'];
  columnsToDisplayWithExpand = [...this.displayedColumns, 'expand'];
  showHeader = true;
  constructor(public fhirService: FhirService,
              public dialog: MatDialog,
              private eprService: EprService) { }

  ngOnInit(): void {
    let patient = this.eprService.getPatient()
    if (patient !== undefined) {
      if (patient.id !== undefined) {
        this.patientId = patient.id
        this.getRecords(patient);
      }

    }
    this.eprService.patientChangeEvent.subscribe(patient => {
      if (patient.id !== undefined) this.patientId = patient.id

      this.getRecords(patient);
    });
    if (this.patientId !== undefined) {
      console.log('Patient Id found tasks')
   //   this.dataSource = new TaskDataSource(this.fhirService, this.patientId, []);
    } else {
      this.dataSource = new MatTableDataSource<Task>(this.tasks);
    }

    let displayedColumns;
    this.refreshResults()

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

  ngAfterViewInit() {
    if (this.sort != undefined) {
      this.sort.sortChange.subscribe((event) => {
        console.log(event);
      });
      if (this.dataSource !== undefined) this.dataSource.sort = this.sort;
    } else {
      console.log('SORT UNDEFINED');
    }
    // @ts-ignore
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'authored': {
          if (item.authoredOn !== undefined) {

            return item.authoredOn
          }
          return undefined;
        }
        case 'start': {
          if (item.executionPeriod !== undefined && item.executionPeriod.start !== undefined) {

            return item.executionPeriod.start
          }
          return undefined;
        }
        default: {
          return undefined
        }
      };
    };
  }

  refreshResults() {
    if (this.serviceRequest !== undefined) {
      this.showHeader = false;
      this.fhirService.getTIE('/Task?focus=ServiceRequest/' + this.serviceRequest.id + '&_sort=-authored-on').subscribe(bundle => {
            if (bundle.entry !== undefined) {
              for (const entry of bundle.entry) {
                if (entry.resource !== undefined && entry.resource.resourceType === 'Task') {
                  this.tasks.push(entry.resource as Task);
                }
              }
              this.dataSource = new MatTableDataSource<Task>(this.tasks);
            }
          }
      );
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

  ngOnChanges(changes: SimpleChanges) {

    if (changes['tasks'] !== undefined) {
     // console.log(this.tasks);
      this.dataSource = new MatTableDataSource<Task>(this.tasks);
    } else {
    //  console.log(changes)
    }
  }

  edit(task: Task) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = '85%';
    dialogConfig.width = '50%';

    dialogConfig.data = {
      id: 1,
      patientId: this.patientId,
      task: task
    };
    const dialogRef = this.dialog.open( TaskCreateComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      //console.log(result)
      if (result !== undefined && result.resourceType !== undefined) {
        // TODO need to update the local copy of this event
        if (this.serviceRequest !== undefined) {
         // console.log('Refresh Results')
          this.getResultsEvent(result);
          this.task.emit(result)
        } else {
        //  console.log('Task emit')
          this.task.emit(result)
        }
      }
    })
  }

  getResultsEvent(task: Task) {
    if (task !== undefined) {
      let taskCopy = this.tasks;
      this.tasks = [];
      // check if present
      let found = undefined;
      taskCopy.forEach((taskIt,index)=> {
        if (taskIt.id === task.id) {
          found = index;
        }
      })
      if (found == undefined) {
        taskCopy.push(task)
      } else {
        // replace
        taskCopy[found] = task;
      }
      this.tasks = Object.assign([], taskCopy)
      this.dataSource = new MatTableDataSource<Task>(this.tasks);
    }
  }

  delete(task : Task) {
     let dialogRef = this.dialog.open(DeleteComponent, {
        width: '250px',
        data:  task
      });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('The dialog was closed ' + result);
        this.fhirService.deleteTIE('/Task/'+task.id).subscribe(result => {
          console.log(result);
          this.tasks.forEach((taskIt,index)=> {
            if (taskIt.id === task.id) {
              this.tasks.splice(index, 1);
            }
          })
          this.dataSource = new MatTableDataSource<Task>(this.tasks);
        })
      }
    });
  }
  addTask(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = '85%';
    dialogConfig.width = '50%';

    let taskType = 0;
    if (this.serviceRequest !== undefined) taskType = 2;
    dialogConfig.data = {
      id: 1,
      patientId: this.patientId,
      nhsNumber: this.nhsNumber,
      focus: this.serviceRequest,
      taskType: taskType
    };
    const dialogRef = this.dialog.open( TaskCreateComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      console.log(result)
      if (result !== undefined) {
        this.tasks.push(result)
        this.task.emit(result)
        this.dataSource = new MatTableDataSource<Task>(this.tasks);
      }
    })
  }
}
