import { Component, OnInit } from '@angular/core';
import {DiagnosticReport, Observation, Patient, ServiceRequest, Task} from "fhir/r4";
import {FhirService} from "../../services/fhir.service";
import {EprService} from "../../services/epr.service";
import {LoadingMode, LoadingStrategy, LoadingType, TdLoadingService} from "@covalent/core/loading";
import {DiagnosticReportCreateComponent} from "./diagnostic-report-create/diagnostic-report-create.component";
import {EventCreateComponent} from "./event-create/event-create.component";
import {DialogService} from "../../services/dialog.service";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {environment} from "../../../environments/environment";
import {ServiceCreateComponent} from "../workflow/service-create/service-create.component";


@Component({
  selector: 'app-observations',
  templateUrl: './observations.component.html',
  styleUrls: ['./observations.component.scss']
})
export class ObservationsComponent implements OnInit {
  searchRange = 14;
  observations: Observation[] = [];
  tasks: Task[] = []
  // @ts-ignore
  diagnosticReports: DiagnosticReport[] = [];
  requests: ServiceRequest[] = [];

  patientId: string | null = null;
  private nhsNumber: string | undefined;
  loadingMode = LoadingMode;
  loadingStrategy = LoadingStrategy;
  loadingType = LoadingType;
  constructor( public fhirService: FhirService,
               private eprService: EprService,
               private dialogService:DialogService,
               private _loadingService: TdLoadingService,
               private dlgSrv: DialogService,
               public dialog: MatDialog) { }

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
  }

  getResults() {
    this._loadingService.register('overlayStarSyntax');
    this.tasks = [];
    this.fhirService.getTIE('/Task?patient=' + this.patientId + '').subscribe(bundle => {
      this._loadingService.resolve('overlayStarSyntax');
      if (bundle.entry !== undefined) {
        for (const entry of bundle.entry) {
          if (entry.resource !== undefined && entry.resource.resourceType === 'Task') {
            this.tasks.push(entry.resource as Task); }
        }
      }
    });
    this.requests = [];
    this.fhirService.getTIE('/ServiceRequest?patient=' + this.patientId + '').subscribe(bundle => {
      this._loadingService.resolve('overlayStarSyntax');
      if (bundle.entry !== undefined) {
        for (const entry of bundle.entry) {
          if (entry.resource !== undefined && entry.resource.resourceType === 'ServiceRequest') { this.requests.push(entry.resource as ServiceRequest); }
        }
      }
    });
  }

  getRecords(patient : Patient) {
    if (patient !== undefined) {
      if (patient.identifier !== undefined) {
        for (const identifier of patient.identifier) {
          if (identifier.system !== undefined && identifier.system.includes('nhs-number')) {
            this.nhsNumber = identifier.value;
          }
        }
      }
    }
    const end = this.fhirService.getToDate();
    const from = new Date();
    from.setDate(end.getDate() -  this.searchRange);
    this._loadingService.register('overlayStarSyntax');
    this.observations = [];
      this.fhirService.get('/Observation?patient=' + this.patientId
        //  + '&date=gt' + this.dlgSrv.getFHIRDateString(from).split('T')[0]
          + '&_count=400&_sort=-date').subscribe(bundle => {
            if (bundle.entry !== undefined) {
              for (const entry of bundle.entry) {
                if (entry.resource !== undefined && entry.resource.resourceType === 'Observation') {
                  this.observations.push(entry.resource as Observation);
                }
              }
            }
          },() => {}, () =>{
            this._loadingService.resolve('overlayStarSyntax');
          }
      );
      this.diagnosticReports = [];
      this.fhirService.get('/DiagnosticReport?patient=' + this.patientId
         // + '&date=gt' + this.dlgSrv.getFHIRDateString(from).split('T')[0]
          + '&_count=50&_sort=-date').subscribe(bundle => {
            if (bundle.entry !== undefined) {
              for (const entry of bundle.entry) {
                if (entry.resource !== undefined && entry.resource.resourceType === 'DiagnosticReport') {
                  this.diagnosticReports.push(entry.resource as DiagnosticReport);
                }
              }
            }
          }
      );
    this.getResults();
  }


    protected readonly undefined = undefined;


  addReport() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = '80%';
    dialogConfig.width = '50%';

    dialogConfig.data = {
      id: 1,
      patientId: this.patientId,
      nhsNumber: this.nhsNumber
    };
    const dialogRef = this.dialog.open( DiagnosticReportCreateComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {

      if (result !== undefined && result.resourceType !== undefined) {
        console.log(result)
        this.diagnosticReports.push(result);
        this.diagnosticReports = Object.assign([], this.diagnosticReports)
      }
    })
  }

  addEvent() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = '40%';
    dialogConfig.width = '40%';

    dialogConfig.data = {
      id: 1,
      patientId: this.patientId,
      nhsNumber: this.nhsNumber
    };
    const dialogRef = this.dialog.open( EventCreateComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {

      if (result !== undefined && result.resourceType !== undefined) {
        console.log(result)
        this.observations.push(result);
        this.observations = Object.assign([], this.observations)
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
      if (result !== undefined && result.resourceType !== undefined) {
        console.log(result)
        this.requests.push(result);
        this.requests = Object.assign([], this.requests)
      }
    })
  }

  getResultsEvent(task: Task) {
    console.log('Task update received')
    console.log(task)
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
      // console.log(this.tasks)
    }
  }

  protected readonly environment = environment;
}
