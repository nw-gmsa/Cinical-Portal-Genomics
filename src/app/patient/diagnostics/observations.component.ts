import { Component, OnInit } from '@angular/core';
import {DiagnosticReport, Observation, Patient} from "fhir/r4";
import {FhirService} from "../../services/fhir.service";
import {EprService} from "../../services/epr.service";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {TdDialogService} from "@covalent/core/dialogs";
import {LoadingMode, LoadingStrategy, LoadingType, TdLoadingService} from "@covalent/core/loading";
import {Router} from "@angular/router";
import {GoalCreateComponent} from "../care-coordination/goal-create/goal-create.component";
import {DiagnosticReportCreateComponent} from "./diagnostic-report-create/diagnostic-report-create.component";

@Component({
  selector: 'app-observations',
  templateUrl: './observations.component.html',
  styleUrls: ['./observations.component.scss']
})
export class ObservationsComponent implements OnInit {
  observations: Observation[] = [];
  // @ts-ignore
  diagnosticReports: DiagnosticReport[] = [];

  patientId: string | null = null;
  private nhsNumber: string | undefined;
  loadingMode = LoadingMode;
  loadingStrategy = LoadingStrategy;
  loadingType = LoadingType;
  constructor( public fhirService: FhirService,
               private eprService: EprService,
               private dialogService: TdDialogService,
               private _loadingService: TdLoadingService,
               private router: Router,
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
    from.setDate(end.getDate() - 7 );
    this._loadingService.register('overlayStarSyntax');
    this.observations = [];
      this.fhirService.get('/Observation?patient=' + this.patientId
          + '&date=gt' + from.toISOString().split('T')[0]
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
      this.fhirService.get('/DiagnosticReport?patient=' + this.patientId + '&_count=50&_sort=-date').subscribe(bundle => {
            if (bundle.entry !== undefined) {
              for (const entry of bundle.entry) {
                if (entry.resource !== undefined && entry.resource.resourceType === 'DiagnosticReport') {
                  this.diagnosticReports.push(entry.resource as DiagnosticReport);
                }
              }
            }
          }
      );

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
}
