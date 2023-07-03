import { Component, OnInit } from '@angular/core';
import {FhirService} from "../../../services/fhir.service";
import {EprService} from "../../../services/epr.service";
import {TdDialogService} from "@covalent/core/dialogs";
import {MatLegacyDialog as MatDialog} from "@angular/material/legacy-dialog";
import { Observation} from "fhir/r4";
import {ActivatedRoute} from "@angular/router";
import {LoadingMode, LoadingStrategy, LoadingType} from "@covalent/core/loading";

@Component({
  selector: 'app-observation-detail',
  templateUrl: './observation-detail.component.html',
  styleUrls: ['./observation-detail.component.scss']
})
export class ObservationDetailComponent implements OnInit {
  patientId: string = '';

  observations: Observation[] = [];

  code: string = '';
  loadingMode = LoadingMode;
  loadingStrategy = LoadingStrategy;
  loadingType = LoadingType;
  constructor( public fhirService: FhirService,
               private eprService: EprService,
               private route: ActivatedRoute,
               public dialog: MatDialog) { }

  ngOnInit(): void {

    const code= this.route.snapshot.paramMap.get('code');
    if (code != null) this.code = code
    console.log(this.code)
    let patient = this.eprService.getPatient()
    if (patient !== undefined) {
      if (patient.id !== undefined) {
        this.patientId = patient.id
        this.getRecords();
      }

    }
    this.eprService.patientChangeEvent.subscribe(patient => {
      if (patient.id !== undefined) this.patientId = patient.id
      this.getRecords();
    });
  }

  getRecords() {
    /*
    const end = this.fhirService.getToDate();
    const from = new Date();
    from.setDate(end.getDate() - 7 );
    this.fhirService.get('/Observation?patient=' + this.patientid
        + '&date=gt' + fromthis.dlgSrv.getFHIRDateString().split('T')[0]
        + '&_count=400&_sort=-date').subscribe(bundle => {
          if (bundle.entry !== undefined) {
            for (const entry of bundle.entry) {
              if (entry.resource !== undefined && entry.resource.resourceType === 'Observation') {
                this.observations.push(entry.resource as Observation);
              }
            }
          }
        }
    );*/

  }

}
