import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ServiceRequest, Task} from "fhir/r4";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {FhirService} from "../../../../services/fhir.service";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {ResourceDialogComponent} from "../../../../dialogs/resource-dialog/resource-dialog.component";

@Component({
  selector: 'app-referral-request-tasks',
  templateUrl: './referral-request-tasks.component.html',
  styleUrls: ['./referral-request-tasks.component.scss']
})
export class ReferralRequestTasksComponent implements OnInit {

  @Input()
  serviceRequest: ServiceRequest | undefined

  tasks: Task[] = [];



  @Output() task = new EventEmitter<any>();



  // @ts-ignore
  dataSource: MatTableDataSource<Task>;
  @ViewChild(MatSort) sort: MatSort | undefined;

  displayedColumns = ['authored', 'start', 'end', 'status', 'intent', 'code', 'reason', 'description','requester', 'owner', 'notes', 'resource'];

  constructor(public fhirService: FhirService,
              public dialog: MatDialog) { }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<Task>(this.tasks);
    if (this.serviceRequest !== undefined) {
      this.fhirService.getTIE('/Task?focus=ServiceRequest/' + this.serviceRequest.id + '&_sort=-authored-on').subscribe(bundle => {
            if (bundle.entry !== undefined) {
              for (const entry of bundle.entry) {
                if (entry.resource !== undefined && entry.resource.resourceType === 'Task') {
                  this.tasks.push(entry.resource as Task); }
              }
              this.dataSource = new MatTableDataSource<Task>(this.tasks);
            }
          }
      );
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
