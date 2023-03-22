import {EventEmitter, Injectable} from '@angular/core';
import {Patient} from 'fhir/r4';

@Injectable()
export class EprService {

  patient: Patient | undefined;

  resource: any = undefined;

  section: string | undefined;


  constructor(

  ) { }


  public patientChangeEvent: EventEmitter<Patient> = new EventEmitter();

  public setPatient(patient: Patient) {
    this.patient = patient;
    this.patientChangeEvent.emit(this.patient);
  }


  clear() {
    this.patient = undefined;
    this.patientChangeEvent.emit(undefined);
  }


}
