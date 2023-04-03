import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {FhirService} from "../../../services/fhir.service";
import {EprService} from "../../../services/epr.service";
import {TdDialogService} from "@covalent/core/dialogs";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {Patient, ServiceRequest, Task} from "fhir/r4";
import {TaskCreateComponent} from "./task-create/task-create.component";
import {ServiceCreateComponent} from "./service-create/service-create.component";

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss']
})
export class WorkflowComponent implements OnInit {
  requests: ServiceRequest[] = [];
  tasks: Task[] = [];
  patientId: string | null = null;
  private nhsNumber: string | undefined;
  constructor( private fhirSrv: FhirService,
               private eprService: EprService,
               private dialogService: TdDialogService,
               public dialog: MatDialog,
               private viewContainerRef: ViewContainerRef) { }

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
  }

  private getRecords(patient : Patient) {
    if (patient !== undefined) {
      if (patient.identifier !== undefined) {
        for (const identifier of patient.identifier) {
          if (identifier.system !== undefined && identifier.system.includes('nhs-number')) {
            this.nhsNumber = identifier.value;
          }
        }
      }
    }
    this.getResults();
  }
  getResults() {
    this.fhirSrv.getTIE('/Task?patient=' + this.patientId + '').subscribe(bundle => {
          if (bundle.entry !== undefined) {
            for (const entry of bundle.entry) {
              if (entry.resource !== undefined && entry.resource.resourceType === 'Task') {
                this.tasks.push(entry.resource as Task); }
            }
          }
        }
    );
    this.fhirSrv.getTIE('/ServiceRequest?patient=' + this.patientId + '').subscribe(bundle => {
          if (bundle.entry !== undefined) {
            for (const entry of bundle.entry) {
              if (entry.resource !== undefined && entry.resource.resourceType === 'ServiceRequest') { this.requests.push(entry.resource as ServiceRequest); }
            }
          }
        }
    );
  }
  addTask(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = '85%';
    dialogConfig.width = '50%';

    dialogConfig.data = {
      id: 1,
      patientId: this.patientId,
      nhsNumber: this.nhsNumber
    };
    const dialogRef = this.dialog.open( TaskCreateComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      console.log(result)
      if (result !== undefined) {
        let taskCopy = this.tasks;
        this.tasks = [];
        taskCopy.push(result)
        this.tasks = taskCopy;
      }
    })
  }

  addServiceRequest(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = '85%';
    dialogConfig.width = '50%';

    dialogConfig.data = {
      id: 1,
      patientId: this.patientId,
      nhsNumber: this.nhsNumber
    };
    const dialogRef = this.dialog.open( ServiceCreateComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      console.log(result)
      this.getResults();
    })
  }

  getResultsEvent() {
    console.log('Update event fired')
    this.requests = [];
    this.tasks = [];
    // possible problem on query being too fast. AWS appears to have a delay before results arrive
    this.getResults();
  }
}
