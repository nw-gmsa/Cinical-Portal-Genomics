import { Component, OnInit } from '@angular/core';
import {StravaService} from "../../../services/strava.service";
import {WithingsService} from "../../../services/withings.service";
import {EprService} from "../../../services/epr.service";

@Component({
  selector: 'app-personal-health-device',
  templateUrl: './personal-health-device.component.html',
  styleUrls: ['./personal-health-device.component.scss']
})
export class PersonalHealthDeviceComponent implements OnInit {
  patientid: string | null = null;
  constructor(  private strava: StravaService,

                private withings: WithingsService,
                private eprService: EprService,) { }

  ngOnInit(): void {
    if (this.eprService.patient !== undefined) {
      if (this.eprService.patient.id !== undefined) {
        this.patientid = this.eprService.patient.id;
      }

    }
    this.eprService.patientChangeEvent.subscribe(patient => {
      if (patient.id !== undefined) this.patientid = patient.id
    });

  }
  connectStrava(): void {

    console.log(window.location.origin);
    this.strava.authorise(window.location.origin + '/patient/'+this.patientid);
  }

  connectWithings(): void {
    console.log(window.location.origin);
    this.withings.authorise(window.location.origin + '/patient/'+this.patientid);
  }

}
