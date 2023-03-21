import { Component, OnInit } from '@angular/core';
import {DiagnosticReport, Observation} from "fhir/r4";
import {FhirService} from "../../../services/fhir.service";
import {ActivatedRoute} from "@angular/router";
import {EprService} from "../../../services/epr.service";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {PhysicalActivityComponent} from "../../diaglogs/physical-activity/physical-activity.component";
import {News2Component} from "../../diaglogs/news2/news2.component";
import {TdDialogService} from "@covalent/core/dialogs";

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
  constructor( private fhirSrv: FhirService,
               private eprService: EprService,
               private dialogService: TdDialogService,
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
      console.log(patient);
      this.getRecords();
    });
  }

  getRecords() {
      this.fhirSrv.get('/Observation?patient=' + this.patientid + '&_count=100&_sort=-date').subscribe(bundle => {
            if (bundle.entry !== undefined) {
              for (const entry of bundle.entry) {
                if (entry.resource !== undefined && entry.resource.resourceType === 'Observation') {
                  this.observations.push(entry.resource as Observation);
                }
              }
            }
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

  loadPhysicalActivity(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = '70%';
    dialogConfig.width = '90%';

    dialogConfig.data = {
      id: 1,
      patientId: this.patientid
    };
    this.dialog.open( PhysicalActivityComponent, dialogConfig);
  }
  loadNEWS2(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = '70%';
    dialogConfig.width = '90%';

    dialogConfig.data = {
      id: 1,
      patientId: this.patientid
    };
    this.dialog.open( News2Component, dialogConfig);
  }

}
