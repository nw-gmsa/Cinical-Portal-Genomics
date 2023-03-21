import {EventEmitter, Injectable} from '@angular/core';

import {FhirService} from './fhir.service';
import {AllergyIntolerance, DocumentReference, Flag, Patient} from 'fhir/r4';


@Injectable()
export class EprService {

  public routes: Object[] = [
    {
      icon: 'search',
      route: '/hie',
      title: 'Patient Find'
    }
    , {
      icon: 'hotel',
      route: '/hie/caseload',
      title: 'Caseload',
    }
    /*   , {
         icon: 'dashboard',
         route: '/hie/capacity',
         title: 'Emergency Planning',
       }
     Not for Alder Hey hackathon  , {
         icon: 'directions',
         route: '/dos',
         title: 'Directory Services',
       }
    , {
      icon: 'translate',
      route: '/term',
      title: 'Reference Services',
    }*/
  ];

  public oauth2routes: Object[] = [
     {
      icon: 'apps',
      route: '/hie/smart',
      title: 'SMART on FHIR Apps',
    }
  ];

  public routesExt: Object[] = [{
    icon: 'lock',
    route: 'https://data.developer.nhs.uk/ccri-auth/',
    title: 'OAuth2 (SMART on FHIR) Server',
  }
    , {
      icon: 'note',
      route: 'https://data.developer.nhs.uk/document-viewer/',
      title: 'FHIR Document Viewer',
    }
    , {
      icon: 'library_books',
      route: 'https://nhsconnect.github.io/CareConnectAPI/',
      title: 'NHS Digital Care Connect API',
    }
    , {
      icon: 'library_books',
      route: 'https://fhir-test.hl7.org.uk/',
      title: 'HL7 UK FHIR Profiles',
    }
    , {
      icon: 'library_books',
      route: 'https://fhir.nhs.uk/',
      title: 'NHS Digital FHIR Profiles',
    }
  ];


  patient: Patient | undefined;

  resource: any = undefined;

  section: string | undefined;


  acuteConnectStatusEmitter: EventEmitter<string> = new EventEmitter();

  flagEmitter: EventEmitter<Flag> = new EventEmitter();

  patientAllergies: AllergyIntolerance[] = [];

  patientFlags: Flag[] = [];

  constructor(
    private fhirService: FhirService
  ) { }

  documentReference: DocumentReference | undefined;

  private title: string | undefined;

  private titleChangeEvent: EventEmitter<string> = new EventEmitter<string>();

  private patientChangeEvent: EventEmitter<Patient> = new EventEmitter();

  private resourceChangeEvent: EventEmitter<any> = new EventEmitter();

  private sectionChangeEvent: EventEmitter<string> = new EventEmitter();

  set(patient: Patient) {

    this.patient = patient;

    this.patientAllergies = [];

    this.patientChangeEvent.emit(this.patient);
  }

  getTitleChange() {
    return this.titleChangeEvent;
  }

  setTitle(title: string) {
    this.patientFlags = [];
    this.getFlagChangeEmitter().emit(undefined);
    this.title = title;
    this.titleChangeEvent.emit(title);
  }

  clear() {
    this.patient = undefined;
    this.patientChangeEvent.emit(this.patient);
  }

  getFlagChangeEmitter() {
     return this.flagEmitter;
  }

  addFlag(flag: Flag) {
    this.patientFlags.push(flag);
    this.flagEmitter.emit(flag);
  }

  getAcuteStatusChangeEvent() {
    return this.acuteConnectStatusEmitter;
  }




  setDocumentReference(document: DocumentReference) {
    this.documentReference = document;
  }


}
