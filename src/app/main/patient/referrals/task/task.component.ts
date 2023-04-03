import {Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {Patient, ServiceRequest, Task} from 'fhir/r4';
import {FhirService} from '../../../../services/fhir.service';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {ResourceDialogComponent} from '../../../../dialogs/resource-dialog/resource-dialog.component';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {animate, state, style, transition, trigger} from "@angular/animations";
import {TaskCreateComponent} from "../task-create/task-create.component";

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

  @Input() useBundle = false;

  // @ts-ignore
  dataSource: MatTableDataSource<Task>;
  @ViewChild(MatSort) sort: MatSort | undefined;

  expandedElement: null | Task | undefined;
  displayedColumns = ['authored', 'lastModified', 'status', 'intent', 'code', 'focus',  'owner', 'edit', 'resource'];
  columnsToDisplayWithExpand = [...this.displayedColumns, 'expand'];
  showHeader = true;
  constructor(public fhirService: FhirService,
              public dialog: MatDialog) { }

  ngOnInit(): void {
    if (this.patientId !== undefined) {
      console.log('Patient Id found tasks')
   //   this.dataSource = new TaskDataSource(this.fhirService, this.patientId, []);
    } else {
      this.dataSource = new MatTableDataSource<Task>(this.tasks);
    }

    let displayedColumns;
    this.refreshResults()

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
      console.log(this.tasks);
      this.dataSource = new MatTableDataSource<Task>(this.tasks);
    } else {
      console.log(changes)
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
      console.log(result)
      // TODO need to update the local copy of this event
      if (this.serviceRequest !== undefined) {
        console.log('Refresh Results')
        this.getResultsEvent(result);
        this.task.emit(result)
      } else {
        console.log('Task emit')
        this.task.emit(result)
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

}
