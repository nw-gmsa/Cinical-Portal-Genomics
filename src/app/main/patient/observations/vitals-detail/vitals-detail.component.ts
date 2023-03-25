import { Component, OnInit } from '@angular/core';
import {LoadingMode, LoadingStrategy, LoadingType} from "@covalent/core/loading";
import {FhirService} from "../../../../services/fhir.service";
import {EprService} from "../../../../services/epr.service";
import {ActivatedRoute} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-vitals-detail',
  templateUrl: './vitals-detail.component.html',
  styleUrls: ['./vitals-detail.component.scss']
})
export class VitalsDetailComponent implements OnInit {
  patientid: string = '';
  loadingMode = LoadingMode;
  loadingStrategy = LoadingStrategy;
  loadingType = LoadingType;

  constructor( public fhirSrv: FhirService,
               private eprService: EprService,
               private route: ActivatedRoute,
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

  }

}
