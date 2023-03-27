import {Component, Input, OnInit} from '@angular/core';
import {LoadingMode, LoadingStrategy, LoadingType} from "@covalent/core/loading";
import {FhirService} from "../../../../services/fhir.service";
import {EprService} from "../../../../services/epr.service";
import {TdDialogService} from "@covalent/core/dialogs";
import {ActivatedRoute} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {Observation} from "fhir/r4";
import {Moment} from "moment/moment";
import * as moment from "moment/moment";

@Component({
  selector: 'app-physical-activity-detail',
  templateUrl: './physical-activity-detail.component.html',
  styleUrls: ['./physical-activity-detail.component.scss']
})
export class PhysicalActivityDetailComponent implements OnInit {

  startDate: Moment = moment(new Date());

  endDate: Moment = moment(new Date());
  patientid: string = '';
  loadingMode = LoadingMode;
  loadingStrategy = LoadingStrategy;
  loadingType = LoadingType;
  selectedValue: number = 1;

  constructor( public fhirSrv: FhirService,
               private eprService: EprService,
               private route: ActivatedRoute,
               public dialog: MatDialog) { }

  ngOnInit(): void {
    this.endDate = moment(this.fhirSrv.getToDate())
    const end = this.endDate?.toDate()
    const temp = end?.setMonth(end.getMonth() - (this.selectedValue) );
    this.startDate = moment(new Date(temp))

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

  selected(event: any) {

    const end = this.endDate?.toDate()
    const temp = end?.setMonth(end.getMonth() - (this.selectedValue) );
    this.startDate = moment(new Date(temp))
    this.eprService.startRange.emit(this.startDate)
  }


  functionStartName() {

    if ((this.startDate.toDate() > this.endDate.toDate()) && this.selectedValue !== undefined) {
      const start = this.startDate?.toDate()
      const temp = start?.setMonth(start.getMonth() + (this.selectedValue) );
      this.endDate = moment(new Date(temp))
      this.eprService.endRange.emit(this.endDate)
    }
    this.eprService.startRange.emit(this.startDate)
  }
  functionEndName() {

    if ((this.startDate.toDate() > this.endDate.toDate()) && this.selectedValue !== undefined) {
      const end = this.endDate?.toDate()
      const temp = end?.setMonth(end.getMonth() - (this.selectedValue) );
      this.startDate = moment(new Date(temp))
      this.eprService.startRange.emit(this.startDate)
    }
    this.eprService.endRange.emit(this.endDate)
  }

}
