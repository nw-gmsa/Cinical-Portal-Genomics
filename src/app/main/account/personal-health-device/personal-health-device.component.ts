import { Component, OnInit } from '@angular/core';
import {StravaService} from "../../../services/strava.service";
import {WithingsService} from "../../../services/withings.service";
import {EprService} from "../../../services/epr.service";
import {HttpClient} from "@angular/common/http";
import {Observable, tap, throwError} from "rxjs";
import {catchError} from "rxjs/operators";

@Component({
  selector: 'app-personal-health-device',
  templateUrl: './personal-health-device.component.html',
  styleUrls: ['./personal-health-device.component.scss']
})
export class PersonalHealthDeviceComponent implements OnInit {
  patientId: string | null = null;
  visible = false;
  constructor(  private strava: StravaService,
                private http: HttpClient,
                private withings: WithingsService,
                private eprService: EprService,) { }

  ngOnInit(): void {
    this.getVisible();
    console.log(window.location.pathname);
    let patient = this.eprService.getPatient()
    if (patient !== undefined) {
      if (patient.id !== undefined) {
        this.patientId = patient.id;
      }
    }
    this.eprService.patientChangeEvent.subscribe(patient => {
      if (patient.id !== undefined) this.patientId = patient.id
    });

  }
  connectStrava(): void {
    console.log(window.location.origin);
    this.strava.authorise(window.location.origin + this.getPathName(window.location.pathname) +  '/patient/'+this.patientId);
  }

  connectWithings(): void {
    console.log(window.location.origin);
    this.withings.authorise(window.location.origin + this.getPathName(window.location.pathname) +  '/patient/'+this.patientId);
  }
  getPathName(pathname: string): string {
    if (pathname.includes('FHIR-R4')) return "/FHIR-R4-Demonstration";
    return "";
  }

  getVisible() {
  //  this.visible = false;
    console.log('getVisible');
    this.http.get<any>('https://geolocation-db.com/json/')
        .pipe(
            catchError((err: any, caught: any) => {
       //       console.log(err)
              return throwError(err)
            }),
            tap(response => {
              if (response.IPv4 === '86.27.236.161') {
                this.visible = true;
            //    console.log(response.IPv4);
              }

            })
        ).subscribe(next => {
         // console.log('called')
    })
  }

}
