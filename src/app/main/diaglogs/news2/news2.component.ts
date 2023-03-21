import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import {FhirService} from '../../../services/fhir.service';

@Component({
  selector: 'app-news2',
  templateUrl: './news2.component.html',
  styleUrls: ['./news2.component.scss']
})
export class News2Component implements OnInit {

  patientId : string;
  constructor(public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) data : any,
              public fhirService: FhirService) {

    this.patientId = data.patientId;
  }

  ngOnInit(): void {
  }

}
