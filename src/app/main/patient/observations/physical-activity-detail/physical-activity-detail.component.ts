import { Component, OnInit } from '@angular/core';
import {LoadingMode, LoadingStrategy, LoadingType} from "@covalent/core/loading";
import {FhirService} from "../../../../services/fhir.service";
import {EprService} from "../../../../services/epr.service";
import {TdDialogService} from "@covalent/core/dialogs";
import {ActivatedRoute} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {Observation} from "fhir/r4";

@Component({
  selector: 'app-physical-activity-detail',
  templateUrl: './physical-activity-detail.component.html',
  styleUrls: ['./physical-activity-detail.component.scss']
})
export class PhysicalActivityDetailComponent implements OnInit {

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
