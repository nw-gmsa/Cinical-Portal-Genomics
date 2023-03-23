import {Component, Inject, Input, OnInit} from '@angular/core';

import {MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import {FhirService} from '../../../../services/fhir.service';
import {Observation} from 'fhir/r4';


@Component({
  selector: 'app-observation-chart-dialog',
  templateUrl: './observation-chart-dialog.component.html',
  styleUrls: ['./observation-chart-dialog.component.css']
})
export class ObservationChartDialogComponent implements OnInit {



  @Input()
  observation: Observation;

  patientId: string = '';
  observationCode: string = '';
  observationTitle: string = '';



  constructor(public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) data: any,
              public fhirService: FhirService) {

    this.observation = data.resource;

  }

  ngOnInit(): void {
    if (this.observation !== undefined) {
      if (this.observation.code !== undefined) {
        // @ts-ignore
        this.observationCode = this.observation.code.coding[0].code;
        // @ts-ignore
        this.observationTitle = this.observation.code.coding[0].display;
      }
      if (this.observation.subject !== undefined) {
        // @ts-ignore
        this.patientId = this.observation.subject.reference.split('/')[1];
      }
    }
  }

}
