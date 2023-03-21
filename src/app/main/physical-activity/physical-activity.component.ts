import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import {FhirService} from '../../services/fhir.service';

@Component({
  selector: 'app-physical-activity',
  templateUrl: './physical-activity.component.html',
  styleUrls: ['./physical-activity.component.scss']
})
export class PhysicalActivityComponent implements OnInit {

  patientId : string = '';
  constructor(public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) data: any,
              public fhirService: FhirService) {

    this.patientId = data.patientId;
  }

  ngOnInit(): void {
  }

}
