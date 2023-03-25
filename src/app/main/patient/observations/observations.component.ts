import { Component, OnInit } from '@angular/core';
import {DiagnosticReport, Observation} from "fhir/r4";
import {FhirService} from "../../../services/fhir.service";
import {EprService} from "../../../services/epr.service";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {TdDialogService} from "@covalent/core/dialogs";
import {LoadingMode, LoadingStrategy, LoadingType, TdLoadingService} from "@covalent/core/loading";
import {Router} from "@angular/router";

@Component({
  selector: 'app-observations',
  templateUrl: './observations.component.html',
  styleUrls: ['./observations.component.scss']
})
export class ObservationsComponent implements OnInit {
  observations: Observation[] = [];
  // @ts-ignore
  diagnosticReports: DiagnosticReport[] = [];

  patientid: string | null = null;
  loadingMode = LoadingMode;
  loadingStrategy = LoadingStrategy;
  loadingType = LoadingType;
  constructor( public fhirSrv: FhirService,
               private eprService: EprService,
               private dialogService: TdDialogService,
               private _loadingService: TdLoadingService,
               private router: Router,
               public dialog: MatDialog) { }

  ngOnInit(): void {
    if (this.eprService.patient !== undefined) {
      if (this.eprService.patient.id !== undefined) {
        this.patientid = this.eprService.patient.id;
        this.getRecords();
      }

    }
    this.eprService.patientChangeEvent.subscribe(patient => {
      if (patient.id !== undefined) this.patientid = patient.id
      this.getRecords();
    });
  }

  getRecords() {
    const end = this.fhirSrv.getToDate();
    const from = new Date();
    from.setDate(end.getDate() - 7 );
    this._loadingService.register('overlayStarSyntax');
      this.fhirSrv.get('/Observation?patient=' + this.patientid
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
      this.fhirSrv.get('/DiagnosticReport?patient=' + this.patientid + '&_count=50&_sort=-date').subscribe(bundle => {
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


}
