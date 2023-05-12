import {EventEmitter, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, Subscription} from 'rxjs';
import {Athlete} from '../models/athlete';
import {SummaryActivity} from '../models/summary-activity';
import {environment} from '../../environments/environment';
import {Bundle, BundleEntry, DiagnosticReport, Observation, Reference} from 'fhir/r4';
import {FhirService} from './fhir.service';
import * as uuid from 'uuid';
import {DialogService} from "./dialog.service";


@Injectable({
  providedIn: 'root'
})
export class StravaService {

  url = 'https://www.strava.com/api/v3/';


  private accessToken = undefined;

  private refreshingToken = false;

  private athlete?: Athlete = undefined;

  loaded: EventEmitter<SummaryActivity[]> = new EventEmitter();


  activityMap = new Map();


  tokenChange: EventEmitter<any> = new EventEmitter();



  athleteChange: EventEmitter<any> = new EventEmitter();



  constructor(private http: HttpClient,
              private fhirService: FhirService,
              private dlgSrv : DialogService) {
  }

  getFromDate(): Date {
    return this.fhirService.getFromDate();
  }
  getToDate(): Date {
    return this.fhirService.getToDate();
  }

      /*


      API Calls

       */


  getHeaders(): HttpHeaders {

    let headers = new HttpHeaders(
    );

    headers = headers.append('Authorization', 'Bearer ' + this.getAccessToken());
    return headers;
  }

  public getAthlete(): Observable<Athlete> {
    return this.http.get<Athlete>(this.url + 'athlete', {headers: this.getHeaders()});
  }

  public setAthlete(athlete: Athlete): void {
    this.athlete = athlete;
    this.athleteChange.emit(athlete);
  }



  processStravaObs(result: any): SummaryActivity[] {
    // Filters out duplcates
    const activities: SummaryActivity[] = [];
    for (const activity of result) {
      const date = this.dlgSrv.getFHIRDateString(new Date(activity.start_date));
      activity.intensity = this.intensity(activity.weighted_average_watts);
      if (this.activityMap.get(activity.id) === undefined) {
        this.activityMap.set(activity.id, activity);
        activities.push(activity);
      } else {
        console.log('Duplicate Id = ' + this.activityMap.get(activity.id));
      }
    }
    return activities;
  }

  intensity(pwr: number): number {
    if (pwr !== +pwr) { return 0; }
    if (this.athlete === undefined || this.athlete.ftp === undefined) { return 0; }

    return Math.round((pwr / this.athlete.ftp) * 100);
  }

  getActivities(page?: number | undefined): void {
    if (page === undefined) {
      this.activityMap = new Map();
    }
    this.getStravaActivities(page).subscribe(
      result => {
        // tslint:disable-next-line:triple-equals
        if (page == undefined) { page = 0; }
        page++;
        const activities = this.processStravaObs(result);
        if (result.length > 0) {
          this.loaded.emit(activities);
          this.getActivities(page);
        } else {
          this.loaded.emit(activities);
        }
      },
      (err) => {
        console.log('STRAVA Error - ' + err);
        console.log(err);
        if (err.status === 401) {
          this.loaded.emit([]);
        }
      }
    );
  }

  public getStravaActivities(page?: string | number | undefined): Observable<any> {
    let uri = this.url + 'athlete/activities';

    uri = uri + '?before=' + Math.floor(this.getToDate().getTime() / 1000)
        + '&after=' + Math.floor(this.getFromDate().getTime() / 1000)
        + '&per_page=30';

    if (page !== undefined) {
      uri = uri + '&page=' + page;
    }
    return this.http.get<any>(uri, {headers: this.getHeaders()});
  }



  /*

  OAUTH2

   */


  public authorise(routeUrl: string): void {
    window.location.href = 'http://www.strava.com/oauth/authorize?client_id=' + environment.stravaClientId +
        '&response_type=code&redirect_uri=' + routeUrl + '&approval_prompt=force&scope=read,activity:read_all,profile:read_all';
  }

  setAccessToken(token: { access_token: undefined; }): void {
    localStorage.setItem('stravaToken', JSON.stringify(token));
    this.accessToken = token.access_token;
    this.tokenChange.emit(token);
  }

  connect(): void {
    const token = this.getAccessToken();
    if (token !== undefined) { this.tokenChange.emit(token); }
  }
  getAccessToken(): string | undefined {

    if (localStorage.getItem('stravaToken') !== undefined) {
      // @ts-ignore
      const token: any = JSON.parse(localStorage.getItem('stravaToken'));

      if (this.isTokenExpired(token)) {
        console.log('Strava refresh token');
        this.accessToken = undefined;
        this.getRefreshToken();
        return undefined;
      }
      if (token !== undefined) {
        this.accessToken = token.access_token;
        return this.accessToken;
      }
    }
    return undefined;
  }

  public getRefreshToken(): Subscription | undefined {
    if (this.refreshingToken) { return undefined; }
    this.refreshingToken = true;
    console.log('Strava token expired');

    // @ts-ignore
    const token: any = JSON.parse(localStorage.getItem('stravaToken'));
    const headers = new HttpHeaders(
    );

    const url = 'https://www.strava.com/oauth/token' +
        '?client_id=' + environment.stravaClientId +
        '&client_secret=' + environment.stravaSecret +
        '&refresh_token=' + token.refresh_token +
        '&grant_type=refresh_token';

    return this.http.post<any>(url, {headers}).subscribe(
        accessToken => {
          console.log('Strava token refreshed');
          this.setAccessToken(accessToken);
          this.refreshingToken = false;
        },
        (err) => {
          console.log('Strava Refresh Error: ', err);
        }
    );
  }

  public getOAuth2AccessToken(authorisationCode: string): void {

    const headers = new HttpHeaders(
    );

    const url = 'https://www.strava.com/oauth/token' +
        '?client_id=' + environment.stravaClientId +
        '&client_secret=' + environment.stravaSecret +
        '&code=' + authorisationCode +
        '&grant_type=authorization_code';

    this.http.post<any>(url, {headers}).subscribe(
        token => {
          this.setAccessToken(token);
        },
        (err) => {
          console.log('Strava Access Error: ', err);
        }
    );
  }



  public getTokenExpirationDate(
      decoded: any
  ): Date | null {

    if (!decoded || !decoded.hasOwnProperty('expires_at')) {
      return null;
    }

    const date = new Date(0);
    date.setUTCSeconds(decoded.expires_at);

    return date;
  }

  public isTokenExpired(
      token: any,
      offsetSeconds?: number
  ): boolean {
    if (!token || token === '') {
      return true;
    }
    const date = this.getTokenExpirationDate(token);
    offsetSeconds = offsetSeconds || 0;
    if (date === null) {
      return false;
    }
    return !(date.valueOf() > new Date().valueOf() + offsetSeconds * 1000);
  }

  public createTransaction(activities: SummaryActivity[], patientRefernce: Reference): Bundle {


    const bundle: Bundle = {
      resourceType: 'Bundle',
      type: 'transaction',
      entry: []
    };
    for (const activity of activities) {

      const activityReport: DiagnosticReport = {
        code: {},
        status: 'final',
        resourceType : 'DiagnosticReport',
        result : []
      };
      activityReport.identifier = [
        {
          system: 'https://fhir.strava.com/Id',
          value: activity.id.toString(2)
        }];
      activityReport.code = {
        coding: [{
          system: 'http://loinc.org',
          code: '34833-4',
          display: 'Recreational therapy Consult note'
        }
          ,
          {
            system: 'http://fhir.strava/Type',
            code: activity.type,
            display: this.fhirService.getType(activity.type)
          }
        ],
        text : activity.name
      };
      activityReport.effectivePeriod = {
        start : this.dlgSrv.getFHIRDateString(new Date(activity.start_date)),
        end: this.dlgSrv.getFHIRDateString(this.fhirService.getEndDate(activity))
      };
      activityReport.subject = patientRefernce;

      if (activity.moving_time !== undefined && activity.moving_time > 0) {
        this.addBundleObservationEntry(bundle, activityReport, activity, 'http://loinc.org',
          '55411-3', 'm','Exercise duration', Math.round(activity.moving_time / 60), 'min');
      } else {
        console.log(activity.elapsed_time)
      }
      if (activity.kilojoules !== undefined && activity.kilojoules > 0) {
        this.addBundleObservationEntry(bundle, activityReport, activity, 'http://loinc.org',
          '55424-6', 'kcal','Calories burned', activity.kilojoules , 'kcal');
      }
      if (activity.average_heartrate !== undefined && activity.average_heartrate > 0) {
        this.addBundleObservationEntry(bundle, activityReport, activity, 'http://loinc.org',
          '66440-9', '{beat}/min', 'Heart rate 10 minutes mean', activity.average_heartrate , 'beat/min');
      }
      // @ts-ignore
      bundle.entry.push({
        fullUrl : 'urn:uuid:' + uuid.v4(),
        resource : activityReport,
        request : {
          method : 'POST',
          url : 'Observation'
        }
      });
    }
    return bundle;
  }
  private addBundleObservationEntry(bundle: Bundle, report: DiagnosticReport, obs: SummaryActivity,
                                    codeSystem: string, code: string, unitCode: string, display: string, value?: number | undefined,
                                    unitDisplay?: string): BundleEntry {
    const fhirObs: Observation = {
      code: {},
      status: 'final',
      resourceType: 'Observation',
      extension: [],
      effectivePeriod : {}
    };
    fhirObs.subject = report.subject;

    fhirObs.identifier = [
      {
        system: 'https://fhir.strava.com/Id',
        value: obs.id + '-' + code
      }
    ];
    const extension = {
      url: 'http://example.fhir.nhs.uk/StructureDefinition/MeasurementSettingExt',
      valueCodeableConcept: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '272501009',
            display: 'Sports facility (environment)'
          }
        ]
      }
    };
    // @ts-ignore
    fhirObs.extension.push(extension);

    // @ts-ignore
    fhirObs.code = {coding : [{system: codeSystem, code, display}]
    };

    if (fhirObs.effectivePeriod !== undefined) {
      fhirObs.effectivePeriod.start = report.effectivePeriod?.start;
      fhirObs.effectivePeriod.end = report.effectivePeriod?.end;
    }

    if (value !== undefined && unitCode !== undefined) {
      // @ts-ignore
      fhirObs.valueQuantity = {value,
        unit: unitDisplay,
        system: 'http://unitsofmeasure.org',
        code: unitCode
      };
    }

    const entry: BundleEntry = {
      fullUrl : 'urn:uuid:' + uuid.v4(),
      resource : fhirObs,
      request : {
        method : 'POST',
        url : 'Observation'
      }
    };
    // @ts-ignore
    report.result.push({reference : entry.fullUrl, display});
    // @ts-ignore
    bundle.entry.push(entry);
    return entry;
  }

}
