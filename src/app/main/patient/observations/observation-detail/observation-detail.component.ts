import { Component, OnInit } from '@angular/core';
import {FhirService} from "../../../../services/fhir.service";
import {EprService} from "../../../../services/epr.service";
import {TdDialogService} from "@covalent/core/dialogs";
import {MatDialog} from "@angular/material/dialog";
import { Observation} from "fhir/r4";
import {ActivatedRoute} from "@angular/router";
import {LoadingMode, LoadingStrategy, LoadingType} from "@covalent/core/loading";

@Component({
  selector: 'app-observation-detail',
  templateUrl: './observation-detail.component.html',
  styleUrls: ['./observation-detail.component.scss']
})
export class ObservationDetailComponent implements OnInit {
  patientid: string = '';

  observations: Observation[] = [];

  code: string = '';
  loadingMode = LoadingMode;
  loadingStrategy = LoadingStrategy;
  loadingType = LoadingType;
  constructor( public fhirSrv: FhirService,
               private eprService: EprService,
               private route: ActivatedRoute,
               public dialog: MatDialog) { }

  ngOnInit(): void {

    const code= this.route.snapshot.paramMap.get('code');
    if (code != null) this.code = code
    console.log(this.code)
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
    /*
    const end = this.fhirSrv.getToDate();
    const from = new Date();
    from.setDate(end.getDate() - 7 );
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
        }
    );*/

  }

}
