import { Component, OnInit } from '@angular/core';
import {StravaService} from "../../services/strava.service";
import {WithingsService} from "../../services/withings.service";
import {EprService} from "../../services/epr.service";
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
  markdown = `HL7 has several implementation guides covering integrations with devices.
  
  - FHIR [Personal Health Device Implementation Guide](https://build.fhir.org/ig/HL7/phd/index.html) which covers patient/consumer held devices integrating with health systems. This can often be found in **Remote Patient Monitoring** and **Virtual Wards** scenarios.
  - FHIR [Point-of-Care Device Implementation Guide](http://build.fhir.org/ig/HL7/uv-pocd/) which covers Point of Care Medical Devices (PoCD) integrating with Electronic Medical Records in primary or acute settings.
  - v2 [ORU_R01 Unsolicited Obsevation Message](https://hl7-definition.caristix.com/v2/HL7v2.5.1/TriggerEvents/ORU_R01) is used in acute and primary care to import observations from both personnel held devices and point of care devices.
  
  
  The device integrations on this app have followed [PoCD RESTful Transfer](http://build.fhir.org/ig/HL7/uv-pocd/transfer.html), the data is retrieved from PHR data stores using native API's and then converted to FHIR Observations. 
  Ideally this would have been implemented as a notification system where the device would have altered the App of any changes and then automatically updated the Electronic Health Records. 
  
  If you are building an Apple Device based application consider using HealthKit's FHIR API's for [accssing health records](https://developer.apple.com/documentation/healthkit/samples/accessing_health_records).`;
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
              if (response.IPv4 === '86.27.236.161' || response.IPv4 === '86.27.237.181') {
                this.visible = true;
            //    console.log(response.IPv4);
              }

            })
        ).subscribe(next => {
         // console.log('called')
    })
  }

}
