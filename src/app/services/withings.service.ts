import {EventEmitter, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {DatePipe} from '@angular/common';
import {Obs} from '../models/obs';
import {FhirService} from './fhir.service';
import {Bundle, Coding, Extension, Observation, Reference} from 'fhir/r4';
import {environment} from '../../environments/environment';
import {JwtHelperService} from '@auth0/angular-jwt';
import * as uuid from 'uuid';
import {delay} from 'rxjs/operators';
import {MeasurementSetting} from '../models/enums/MeasurementSetting';
import {DeviceSetting} from '../models/enums/DeviceSetting';

@Injectable({
  providedIn: 'root'
})
export class WithingsService {

  private accessToken = undefined;

  private refreshingToken = false;

  url = 'https://wbsapi.withings.net';
  private redirect: string | undefined;
  constructor(private http: HttpClient,

              private fhir: FhirService,
              private datePipe: DatePipe) { }


  tokenChange: EventEmitter<any> = new EventEmitter();

  sleepLoaded: EventEmitter<any> = new EventEmitter();
  measuresLoaded: EventEmitter<any> = new EventEmitter();
  activityLoaded: EventEmitter<any> = new EventEmitter();

  sleepCompleted: EventEmitter<any> = new EventEmitter<any>();
  activityCompleted: EventEmitter<any> = new EventEmitter<any>();
  measuresCompleted: EventEmitter<any> = new EventEmitter<any>();

  public async getMeasures(): Promise<void> {
    await delay(20000);
    if (!this.hasAccessToken()) {
      return;
    }
    // @ts-ignore
    this.getAPIMeasures().subscribe((result) => {
        if (result.status === 401) {
          console.log('Withings 401', result);
          this.deleteAccessToken();
        } else {
          return this.processMeasures(result.body.measuregrps);
        }
      },
      (err) => {
        console.log(err);
        if (err.status === 401) {

          }
        }
    );
  }



  getSleep(): void {
    if (!this.hasAccessToken()) { return; }
    // @ts-ignore
    this.getAPISleepSummary().subscribe((result) => {
          if (result.status === 401) {
            console.log('Withings 401', result);
            this.deleteAccessToken();
          }
          else if (result.status === 403) {
            console.log('Withings 403 - Need to ask for permission', result);

          } else {
            return this.processSleep(result);
          }
        },
        (err) => {
          console.log(err);
          if (err.status === 401) {

          }
        }
    );
  }

  async getActivity(): Promise<void> {
    if (!this.hasAccessToken()) {
      return;
    }
    // @ts-ignore
    this.getAPIActivity().subscribe(result => {
          if (result.status === 401) {
            console.log('Withings 401', result);
            this.deleteAccessToken();
          } else {
            return this.processActivity(result);
          }
        },
        (err) => {
          console.log(err);
          if (err.status === 401) {

          }
        }
    );
  }
  /* **********************
     EXTERNAL API CALLS
  ********************   */


  public getAPIActivity(offset?: number): Observable<any> {

    // Use the postman collection for details

    // https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-getactivity

    const headers = this.getAPIHeaders();


    let bodge = 'action=getactivity'
        + '&data_fields=steps,hr_average,hr_min,hr_max,totalcalories,calories,active'
        + '&startdateymd=' + this.fhir.getFromDate().toISOString().split('T')[0]
        + '&enddateymd=' + this.fhir.getToDate().toISOString().split('T')[0];
    //  + '&lastupdate='+Math.floor(lastUpdate.getTime()/1000);
    if (offset !== undefined) {
      bodge = bodge + '&offset=' + Math.floor(offset);
    }
    //  console.log(bodge)
    return this.http.post<any>(this.url + '/v2/measure', bodge, { headers} );
  }
  /*
  public getWorkouts(offset?: number): Observable<any> {

    // Use the postman collection for details

    // https://developer.withings.com/api-reference/#tag/measure/operation/measurev2-getworkouts

    const headers = this.getAPIHeaders();


    let bodge = 'action=getworkouts'
      + '&data_fields=steps,hr_average,hr_min,hr_max,calories,spo2_average'
      + '&startdateymd=' + this.fhir.getFromDate().toISOString().split('T')[0]
      + '&enddateymd=' + this.fhir.getToDate().toISOString().split('T')[0];
    //  + '&lastupdate='+Math.floor(lastUpdate.getTime()/1000);
    if (offset !== undefined) {
      bodge = bodge + '&offset=' + Math.floor(offset);
    }

    return this.http.post<any>(this.url + '/v2/measure', bodge, { headers} );
  }
*/

  private getAPIMeasures(): Observable<any> {

    // Use the postman collection for details

    // https://developer.withings.com/api-reference/#tag/measure/operation/measure-getmeas

    const headers = this.getAPIHeaders();


    const bodge = 'action=getmeas'
        + '&meastypes=1,5,8,9,10,11,12,54,71,73,77,76,88,91,123,135,136,137,138,139'
        + '&category=1'
        + '&startdate=' + Math.floor(this.fhir.getFromDate().getTime() / 1000)
        + '&enddate=' + Math.floor(this.fhir.getToDate().getTime() / 1000);
    // + '&lastupdate='+Math.floor(lastUpdate.getTime()/1000);

    return this.http.post<any>(this.url + '/measure', bodge, { headers} );

  }

  private getAPISleepGet(start: number, end: number): Observable<any> {

    // This is just a 24 hour window
    /*
        const to = new Date();
        // this.to.setDate( temp.getDate() - this.duration - this.duration)
        const from = new Date();
        from.setDate(to.getDate() - 1 );
    */
    const headers = this.getAPIHeaders();

    // https://developer.withings.com/api-reference/#tag/sleep/operation/sleepv2-get
    const hrv = 'action=get'
        + '&startdate=' + start
        + '&enddate=' + + end
        + '&data_fields=sdnn_1,rmssd';

    return this.http.post<any>(this.url + '/v2/sleep', hrv, { headers} );

  }

  private getAPISleepSummary(): Observable<any> {

    const headers = this.getAPIHeaders();

    // https://developer.withings.com/api-reference/#tag/sleep/operation/sleepv2-getsummary

    const bodge = 'action=getsummary'
        + '&startdateymd=' + this.datePipe.transform(this.fhir.getFromDate(), 'yyyy-MM-dd')
        + '&enddateymd=' + this.datePipe.transform(this.fhir.getToDate(), 'yyyy-MM-dd')
        // + '&lastupdate='+Math.floor(lastUpdate.getTime()/1000)
        + '&data_fields=breathing_disturbances_intensity,deepsleepduration,lightsleepduration'
        + ',wakeupcount,durationtosleep,sleep_score,remsleepduration'
        + ',snoring,rr_average,hr_average,hr_min,apnea_hypopnea_index';

    return this.http.post<any>(this.url + '/v2/sleep', bodge, { headers} );

  }
  /*

  EXTERNAL API CALLS

   */

  public authorise(routeUrl: string): void {
    if (routeUrl.substring(routeUrl.length - 1, 1) === '/') {
      routeUrl = routeUrl.substring(0, routeUrl.length - 1);
    }
    this.redirect = routeUrl;
    localStorage.setItem('appRoute', routeUrl);
    window.location.href = 'https://account.withings.com/oauth2_user/authorize2?response_type=code&client_id='
        + environment.withingClientId
        + '&redirect_uri=' + routeUrl
        + '&state=withings'
        + '&scope=user.metrics,user.activity';
  }




  /*

  PRE FHIR PROCESSING

   */
  async processMeasures(measures: any): Promise<void> {
    if (measures === undefined) {
      return;
    }
    let observations: Obs[] = [];
    let count = this.fhir.pageOn * this.fhir.measurePageMod;
    for (const grp of measures) {
      count--;
      const date = new Date(+grp.date * 1000).toISOString();

      const obs: Obs = {
        obsDate: new Date(date),
        measurementSetting: MeasurementSetting.home
      };
      // console.log(obs);
      for (const measure of grp.measures) {
        switch (measure.type) {
          case 1:
            obs.weight = +measure.value / 1000;
            break;
          case 76:
            obs.muscle_mass = +measure.value / 100;
            break;
          case 5 :
            // free fat mass
            break;
          case 8:
            obs.fat_mass = +measure.value / 100;
            break;
          case 11:
            obs.heartrate = +measure.value;
            break;
          case 12:
            // 5 figure temp?
            break;
          case 77:
            obs.hydration = +measure.value / 100;
            break;
          case 71:
            obs.bodytemp = +measure.value / 1000;
            break;
          case 73:
            obs.skintemp = +measure.value / 1000;
            break;
          case 91:
            obs.pwv = +measure.value / 1000;
            break;
          case 9 :
            obs.diastolic = +measure.value / 1000;
            break;
          case 10 :
            obs.systolic = +measure.value / 1000;
            break;
          case 88 :
            obs.bone_mass = +measure.value / 1000;
            break;
          default:
            console.log(measure.type + ' ' + measure.value);
        }
      }

      observations.push(obs);
      if (count < 1) {
        await this.delay(this.fhir.throttle);
        this.measuresLoaded.emit(observations);
        observations = [];
        count = this.fhir.pageOn * this.fhir.measurePageMod;
      }
    }
    await this.delay(this.fhir.throttle);
    this.measuresLoaded.emit(observations);
    this.measuresCompleted.emit({});

  }

  async processActivity(activityData: any | undefined): Promise<void> {
    if (activityData === undefined || activityData.body === undefined) {
      return;
    }
    let observations: Obs[] = [];
    let count = this.fhir.pageOn;
    for (const activity of activityData.body.activities) {
      count--;
      const obs: Obs = {
        obsDate: new Date(activity.date),
        measurementSetting: MeasurementSetting.home
      };

      if (activity.steps !== undefined) {
        obs.steps = activity.steps;

      }
      if (activity.hr_average !== undefined) {
        obs.hr_average = activity.hr_average;
      }
      if (activity.hr_min !== undefined) {
        obs.hr_min = activity.hr_min;
      }
      if (activity.hr_max !== undefined) {
        obs.hr_max = activity.hr_max;
      }
      if (activity.totalcalories !== undefined) {
        obs.totalcalories = activity.totalcalories;
      }

      // Should not be necessary as date range should prevent it
      if (obs.obsDate > this.fhir.getFromDate()) {
        observations.push(obs);
      }

      if (count < 1) {
        await this.delay(this.fhir.throttle);
        this.activityLoaded.emit(observations);
        count = this.fhir.pageOn;
        observations = [];
      }
    }
    // console.log(observations)
    await this.delay(this.fhir.throttle);
    this.activityLoaded.emit(observations);
    this.activityCompleted.emit({});
  }

  async processSleep(sleepData: any): Promise<void> {
    if (sleepData === undefined || sleepData.body === undefined) {
      return;
    }
    let observations: Obs[] = [];
    let count = this.fhir.pageOn;
    for (const sleep of sleepData.body.series) {
      count--;
      const obs: Obs = {
        obsDate: new Date(sleep.startdate * 1000),
        obsEndDate: new Date(sleep.enddate * 1000),
        id: sleep.id,
        asleep: true,
        measurementSetting: MeasurementSetting.home
      };
      if (sleep.data.durationtosleep !== undefined) {
        obs.durationtosleep = sleep.data.durationtosleep;
      }
      if (sleep.data.deepsleepduration !== undefined) {
        obs.deepsleepduration = sleep.data.deepsleepduration;
      }
      if (sleep.data.breathing_disturbances_intensity !== undefined) {
        obs.breathing_disturbances_intensity = sleep.data.breathing_disturbances_intensity;
      }
      if (sleep.data.wakeupcount !== undefined) {
        obs.wakeupcount = sleep.data.wakeupcount;
      }
      if (sleep.data.sleep_score !== undefined) {
        obs.sleep_score = sleep.data.sleep_score;
      }
      if (sleep.data.remsleepduration !== undefined) {
        obs.remsleepduration = sleep.data.remsleepduration;
      }
      if (sleep.data.lightsleepduration !== undefined) {
        obs.lightsleepduration = sleep.data.lightsleepduration;
      }
      if (sleep.data.hr_average !== undefined) {
        obs.hr_average = sleep.data.hr_average;
      }
      if (sleep.data.apnea_hypopnea_index !== undefined) {
        obs.apnea_hypopnea_index = sleep.data.apnea_hypopnea_index;
      }
      if (sleep.data.snoring !== undefined) {
        obs.snoring = sleep.data.snoring;
      }
      if (sleep.data.rr_average !== undefined) {
        obs.rr_average = sleep.data.rr_average;
      }
      observations.push(obs);
      if (count < 1) {
        await this.delay(this.fhir.throttle);
        this.sleepLoaded.emit(observations);
        observations = [];
        count = this.fhir.pageOn;
      }
      this.getAPISleepGet(sleep.startdate, sleep.enddate).subscribe(result => {
        const enddate = new Date(sleep.enddate * 1000);
        const startdate = new Date(sleep.startdate * 1000);
        this.processSleepGet(startdate, enddate, sleep.id, result);
      });
    }
    await this.delay(this.fhir.throttle);
    this.sleepLoaded.emit(observations);
    this.sleepCompleted.emit({});

  }

  async processSleepGet(startdate: Date, enddate: Date, id: string, sleepData: any): Promise<void> {
    let count = 0;
    let sum = 0;
    if (sleepData.body !== undefined && sleepData.body.series !== undefined) {
      for (const sleep of sleepData.body.series) {
        if (sleep.sdnn_1 !== undefined) {
          Object.entries(sleep.sdnn_1).forEach(([key, value]) => {
            // console.log(`${key}: ${value}`);
            // @ts-ignore
            if (value > 0) {
              count++;
              sum = sum + Number(value as string);
            }
          });
        }
      }
      if (count > 0) {
        const observations: Obs[] = [];
        const obs: Obs = {
          obsDate: startdate,
          obsEndDate: enddate,
          id,
          asleep: true,
          measurementSetting: MeasurementSetting.home,
          sdnn_1: Math.round(sum / count)
        };
        observations.push(obs);
        this.sleepLoaded.emit(observations);
      }
    } else {
      console.log(startdate.toISOString() + ' + ' + enddate.toISOString());
      console.log(sleepData);
    }
  }



  /*

  FHIR CONVERSIONS


   */


  createTransaction(observations: Obs[], patient: Reference): Bundle {
    const bundle: Bundle = {
      resourceType: 'Bundle', type: 'transaction',
      entry: []
    };
    for (const obs of observations) {

      if (obs.weight !== undefined) {
        const fhirWeight = this.getObservation(patient, bundle, obs, true, '27113001', 'kg',
            obs.measurementSetting, 'Body weight', obs.weight, 'kilogram', undefined, undefined, DeviceSetting.floorScale);
        // @ts-ignore
        fhirWeight.code.coding.push({
          system: 'http://loinc.org',
          code: '29463-7',
          display: 'Body Weight'
        });
      }
      if (obs.fat_mass !== undefined) {
        const fhirFat = this.getObservation(patient, bundle, obs, false, '73708-0',
            'kg', obs.measurementSetting, 'Body fat [Mass] Calculated', obs.fat_mass, 'kilogram',
            undefined, undefined, DeviceSetting.floorScale);
      }
      if (obs.muscle_mass !== undefined) {
        const fhirMuscle = this.getObservation(patient, bundle, obs, false, '73964-9', 'kg',
            obs.measurementSetting, 'Body muscle mass', obs.muscle_mass, 'kilogram', undefined, undefined, DeviceSetting.floorScale);
      }
      if (obs.hydration !== undefined) {
        const fhirMuscle = this.getObservation(patient, bundle, obs, false, '73706-4', 'kg',
            obs.measurementSetting, 'Extracellular fluid [Volume] Measured', obs.hydration, 'kilogram',
            undefined, undefined, DeviceSetting.floorScale);
      }
      if (obs.bodytemp !== undefined) {
        const temp = this.getObservation(patient, bundle, obs, true, '276885007', 'Cel', obs.measurementSetting,
            'Core body temperature', obs.bodytemp, 'degree Celsius');
        // @ts-ignore
        temp.code.coding.push({
          system: 'http://loinc.org',
          code: '8310-5',
          display: 'Body temperature'
        });
      }
      if (obs.skintemp !== undefined) {
        const temp = this.getObservation(patient, bundle, obs, true, '364537001', 'Cel', obs.measurementSetting,
            'Temperature of skin', obs.skintemp, 'degree Celsius');
      }

      if (obs.remsleepduration !== undefined && obs.lightsleepduration !== undefined && obs.deepsleepduration !== undefined) {
        const fhirSleep = this.getObservation(patient, bundle, obs, false, '93832-4', 'h',
            obs.measurementSetting, 'Sleep duration',
            (obs.remsleepduration + obs.lightsleepduration + obs.deepsleepduration) / 3600, 'hour',
            obs.id);
        if (obs.sleep_score !== undefined) {
          this.addComponent(fhirSleep, 'http://withings.com/data_fields', 'sleep_score',
              'Sleep Score', obs.sleep_score, 'ScoreOf', '{ScoreOf}');
          this.addComponent(fhirSleep, 'http://withings.com/data_fields', 'remsleepduration',
              'Rem Sleep Duration', (obs.remsleepduration) / 3600, 'hour', 'h');
          this.addComponent(fhirSleep, 'http://withings.com/data_fields', 'lightsleepduration',
              'Light Sleep Duration', (obs.lightsleepduration) / 3600, 'hour', 'h');
          this.addComponent(fhirSleep, 'http://withings.com/data_fields', 'deepsleepduration',
              'Deep Sleep Duration', (obs.deepsleepduration) / 3600, 'hour', 'h');
        }
      }

      if (obs.diastolic !== undefined && obs.systolic !== undefined) {
        // Seems withings changed data structure around sept 2017
        if (obs.diastolic < 1) {
          obs.diastolic = obs.diastolic * 1000;
        }
        if (obs.systolic < 1) {
          obs.systolic = obs.systolic * 1000;
        }
        const fhirBP = this.getObservation(patient, bundle, obs, true, '75367002', undefined, obs.measurementSetting,
            'Blood pressure', undefined, undefined, undefined, undefined, DeviceSetting.pressumeMonitor);
        // @ts-ignore
        fhirBP.code.coding.push({
          system: 'http://loinc.org',
          code: '85354-9',
          display: 'Blood pressure panel with all children optional'
        });
        this.addComponent(fhirBP, 'http://snomed.info/sct', '72313002', 'Systolic arterial pressure', obs.systolic, 'mmHg', 'mm[Hg]');
        this.addComponent(fhirBP, 'http://snomed.info/sct', '1091811000000102', 'Diastolic arterial pressure', obs.diastolic, 'mmHg', 'mm[Hg]');
      }
      if (obs.pwv !== undefined) {
        this.getObservation(patient, bundle, obs, false, '77196-4', 'm/s',
            obs.measurementSetting, 'Pulse wave velocity', obs.pwv, 'm/s', undefined, undefined, DeviceSetting.floorScale);
      }

      if (obs.steps !== undefined) {
        this.getObservation(patient, bundle, obs, false, '55423-8', 'count', obs.measurementSetting, 'Number of steps in unspecified time Pedometer', obs.steps, 'count');
      }
      if (obs.heartrate !== undefined) {
        const hr = this.getObservation(patient, bundle, obs, true, '364075005',
            '{beats}/min', obs.measurementSetting, 'Heart rate', obs.heartrate,
            'beats/min');
        // @ts-ignore
        hr.code.coding.push({
          system: 'http://loinc.org',
          code: '8867-4',
          display: 'Heart rate'
        });
      }
      if (obs.hr_average !== undefined) {
        const hr = this.getObservation(patient, bundle, obs, false, '66440-9', '{beats}/min',
            obs.measurementSetting, 'Heart rate 10 minutes mean', obs.hr_average, 'beats/min',
            obs.id, obs.asleep);
      }
      if (obs.sdnn_1 !== undefined) {
        const hr = this.getObservation(patient, bundle, obs, false, '80404-7', 'ms',
            obs.measurementSetting, 'Heart Rate Variablity (RR.sd)', obs.sdnn_1, 'ms',
            obs.id, obs.asleep, DeviceSetting.actigraph);
      }
      if (obs.snoring !== undefined) {
        const hr = this.getObservation(patient, bundle, obs, true, '72863001', 'min',
            obs.measurementSetting, 'Snoring (finding)', Math.round(obs.snoring / 60), 'minute',
            obs.id, obs.asleep, DeviceSetting.actigraph);
      }
      if (obs.rr_average !== undefined) {
        const hr = this.getObservation(patient, bundle, obs, true, '86290005', '{Breaths}/min',
            obs.measurementSetting, 'Respiratory rate', obs.rr_average, 'Breaths / minute',
            obs.id, obs.asleep, DeviceSetting.actigraph);
      }
      if (obs.apnea_hypopnea_index !== undefined) {
        const hr = this.getObservation(patient, bundle, obs, true, '716202005', 'score',
            obs.measurementSetting, 'Apnea Hypopnea Index', obs.apnea_hypopnea_index, 'Score',
            obs.id, obs.asleep, DeviceSetting.actigraph);
      }
      if (obs.hr_min !== undefined) {
        const hrmin = this.getObservation(patient, bundle, obs, false, '40443-4', '{beats}/min',
            obs.measurementSetting, 'Heart rate - resting', obs.hr_min, 'beats/min');
        // @ts-ignore
        hrmin.code.coding.push({
          system: 'http://snomed.info/sct',
          code: '444981005',
          display: 'Resting heart rate'
        });
      }
      if (obs.hr_max !== undefined) {
        this.getObservation(patient, bundle, obs, false, '8873-2', '{beats}/min',
            obs.measurementSetting, 'Maximum Heart rate in 24 Hours', obs.hr_max, 'beats/min');
      }
      if (obs.totalcalories !== undefined) {
        const calories = this.getObservation(patient, bundle, obs, false, '41979-6', 'kcal/(24.h)',
            obs.measurementSetting, 'Calories burned 24h Calc', obs.totalcalories, 'kcal/(24.h)');

      }
    }
    return bundle;
  }

  private addComponent(fhirObs: Observation, codeSystem: string, code: string, display: string, value: number, unit: string, unitcode: string): void {
    if (fhirObs.component === undefined) { fhirObs.component = []; }

    const coding: Coding = {

      system: codeSystem,
      code,
      display
    };
    fhirObs.component.push({
      code : {
        coding : [
          coding
        ]
      },
      valueQuantity: {
        value,
        unit,
        system: 'http://unitsofmeasure.org',
        code: unitcode
      }
    });
  }

  private getObservation(patient: Reference, bundle: Bundle, obs: Obs,
                         snomed: boolean, code: string, unitcode?: string, measurementSetting?: MeasurementSetting, display?: string, value?: number | undefined,
                         unitdisplay?: string,  id?: string, asleep?: boolean, deviceSetting?: DeviceSetting): Observation {
    const fhirObs: Observation = {
      code: {}, status: 'final',
      resourceType: 'Observation',
      extension: []
    };

    fhirObs.subject = patient;
    if (id !== undefined) {
      fhirObs.identifier = [
        {
          system: 'https://fhir.withings.com/Id',
          value: id + '-' + code
        }
      ];
    } else {
      fhirObs.identifier = [
        {
          system: 'https://fhir.withings.com/Id',
          value: code + '-' + this.datePipe.transform(obs.obsDate, 'yyyyMMddhhmmsss')
        }
      ];
    }
    // duplicate check
    // @ts-ignore
    for (const entry of bundle.entry) {
      if (entry.resource !== undefined) {
        const resource: any = entry.resource;
        if (resource.identifier !== undefined && resource.identifier[0] !== undefined) {
          if (resource.identifier[0].value === fhirObs.identifier[0].value) {
            console.log('Duplicate ' + fhirObs.identifier[0].value + ' code ' + code);
          }
        }
      }
    }
    if (snomed) {
      fhirObs.code = {
        coding : [{
          system: 'http://snomed.info/sct',
          code,
          display
        }
        ]
      };
    } else {
      fhirObs.code = {
        coding : [{
          system: 'http://loinc.org',
          code,
          display
        }
        ]
      };
    }
    if (obs.obsEndDate !== undefined) {
      fhirObs.effectivePeriod = {
        start:obs.obsDate.toISOString(),
        end: obs.obsEndDate.toISOString()
      }
    } else {
      fhirObs.effectiveDateTime = obs.obsDate.toISOString();
    }
    if (value !== undefined && unitdisplay !== undefined) {
      fhirObs.valueQuantity = {
        value,
        unit: unitdisplay,
        system: 'http://unitsofmeasure.org',
        code: unitcode
      };
    }
    if (asleep !== undefined) {
      let extension: Extension;
      if (asleep) {
        extension = {
          url: 'http://hl7.org/fhir/us/vitals/StructureDefinition/SleepStatusExt',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '248220008',
                display: 'Asleep (finding)'
              }
            ]
          }
        };
      } else {
        extension = {
          url: 'http://hl7.org/fhir/us/vitals/StructureDefinition/SleepStatusExt',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '248218005',
                display: 'Awake (finding)'
              }
            ]
          }
        };
      }
      fhirObs.extension?.push(extension);
    }
    if (measurementSetting !== undefined) {
      const setting = {
        url: 'http://example.fhir.nhs.uk/StructureDefinition/MeasurementSettingExt',
        valueCodeableConcept: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: measurementSetting.split('^')[0],
              display: measurementSetting.split('^')[1]
            }
          ]
        }
      };
      fhirObs.extension?.push(setting);
    }
    if (deviceSetting !== undefined) {
      const settingDevice = {
        url: 'http://hl7.org/fhir/StructureDefinition/observation-deviceCode',
        valueCodeableConcept: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: deviceSetting.split('^')[0],
              display: deviceSetting.split('^')[1]
            }
          ]
        }
      };
      fhirObs.extension?.push(settingDevice);
    }

    bundle.entry?.push({
      fullUrl : 'urn:uuid:' + uuid.v4(),
      resource : fhirObs,
      request : {
        method : 'POST',
        url : 'Observation'
      }
    });
    return fhirObs;
  }


  /*

   SECURITY BLOCK

   */

  initToken(): void {
    const token = this.getAccessToken();
    if (token !== undefined) { this.tokenChange.emit(token); }

  }


  getAccessToken(): string | undefined {
    console.log('Get Access token');
    if (localStorage.getItem('withingsToken') !== undefined) {
      // @ts-ignore
      const token: any = JSON.parse(localStorage.getItem('withingsToken'));

      const helper = new JwtHelperService();

      /*
      disabled 6 Mar 2023
      if (this.isTokenExpired(token.body)) {

        console.log('withings Token expired');
        this.accessToken = undefined;
        this.getRefreshToken();
        return undefined;
      } */
      if (token !== undefined) {
        this.accessToken = token.body.access_token;
        // @ts-ignore
        return this.accessToken;
      }
    }
    return undefined;
  }

/*
  public getRefreshToken(): string {
    console.log('refreshing token NOT YET IMPLEMENTED');

    if (this.refreshingToken) { return; }
    this.refreshingToken = true;



    const token: any = JSON.parse(localStorage.getItem('withingsToken'));

    const url = 'https://wbsapi.withings.net/v2/oauth2';


    const bodge = 'action=requesttoken'
      + 'grant_type=refresh_token'
      + '&client_id=' + environment.withingClientId
      + '&client_secret=' + environment.withingSecret
      + '&refresh_token=' + token.refresh_token;

    this.http.post<any>(url, bodge, { headers : {}} ).subscribe(
        accesstoken => {
          console.log('Withings refreshed token');
          this.setAccessToken(accesstoken);
          this.refreshingToken = false;
        },
        (err) => {
          console.log(err);
        }
    );
  }
*/


  public getOAuth2AccessToken(authorisationCode: string, routeUrl: string): void {


    // https://developer.withings.com/api-reference/#tag/oauth2/operation/oauth2-getaccesstoken

    const headers = {};

    const url = 'https://wbsapi.withings.net/v2/oauth2';

    const bodge = 'action=requesttoken'
        + '&grant_type=authorization_code'
        + '&client_id=' + environment.withingClientId
        + '&client_secret=' + environment.withingSecret
        + '&redirect_uri=' + routeUrl
        + '&code=' + authorisationCode;



    this.http.post<any>(url, bodge, { headers} ).subscribe(
        token => {
          console.log('withings Access Token');
          this.setAccessToken(token);
        },
        (err) => {
          console.log(err);
        }
    );
  }

  private hasAccessToken(): boolean {

    if (this.accessToken !== undefined) { return true; }
    this.getAccessToken();
    if (this.accessToken !== undefined) { return true; }
    console.log('No withing token found');
    return false;
  }


  private deleteAccessToken(): void {
    this.accessToken = undefined;
    localStorage.removeItem('withingsToken');
  }

  private getTokenExpirationDate(
      decoded: any
  ): Date | null {

    if (!decoded || !decoded.hasOwnProperty('expires_at')) {
      // Invalid format
      localStorage.removeItem('withingsToken');
      return null;
    }

    const date = new Date(0);
    date.setUTCSeconds(decoded.expires_at);

    return date;
  }

  private isTokenExpired(
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




  getAPIHeaders(): HttpHeaders {

    let headers = new HttpHeaders(
    );

    headers = headers.append('Authorization', 'Bearer ' + this.getAccessToken());
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    return headers;
  }

  /*
  User needs to login in order for this to work
  getOAuth2Headers() : HttpHeaders {

    let headers = new HttpHeaders(
    );

    headers = headers.append('Authorization', 'Bearer '+this.auth.getAccessToken());
    return headers;
  }
*/
  setAccessToken(token: any): void {
    // Create an expires at ..... don't know when we got the token
    token.expires_at = Math.round((new Date().valueOf()) / 1000) + token.expires_in;
    localStorage.setItem('withingsToken', JSON.stringify(token));
    this.accessToken = token.access_token;
    console.log('Stored access token');
    this.tokenChange.emit(token);
  }

  private delay(ms: number): Promise<any> {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }


}
