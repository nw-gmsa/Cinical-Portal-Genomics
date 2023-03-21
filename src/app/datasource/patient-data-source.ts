import {DataSource} from "@angular/cdk/table";
import {BehaviorSubject, Observable} from "rxjs";
import {Patient} from 'fhir/r4';
import {FhirService} from '../services/fhir.service';


export class PatientDataSource extends DataSource<any> {
    constructor(public fhirService: FhirService,
                public patients: Patient[],
                public patientObservable: Observable<Patient[]> | undefined,
                public useObservable: boolean = false
    ) {
    super();

  }

  private dataStore: {
    patients: Patient[];
  } | undefined;

  connect(): Observable<Patient[]> {

    //
 //   console.log('calling data service');
    if (this.useObservable && this.patientObservable !== undefined) {
   //   console.log('Patient Observable ');
      return this.patientObservable;
    }


    // @ts-ignore
    let _patients : BehaviorSubject<Patient[]> = <BehaviorSubject<Patient[]>>new BehaviorSubject([]);;

    this.dataStore = { patients: [] };

    if (this.patients !== [] && this.patients !== undefined) {
      for (let patient of this.patients) {
        this.dataStore.patients.push(<Patient> patient);
      }
      _patients.next(Object.assign({}, this.dataStore).patients);
    }

   return _patients.asObservable();
  }

  disconnect() {}
}
