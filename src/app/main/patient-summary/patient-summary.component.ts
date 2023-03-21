import {Component, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MatChip} from '@angular/material/chips';
import {
  AllergyIntolerance, CarePlan, CareTeam, Condition,
  DocumentReference,
  Encounter, EpisodeOfCare,
  Flag,
  Task, Observation,
  Patient, QuestionnaireResponse, Reference, ServiceRequest, MedicationRequest, DiagnosticReport, Communication
} from 'fhir/r4';
import {FhirService} from '../../services/fhir.service';
import {EprService} from '../../services/epr.service';
import {IAlertConfig, TdDialogService} from '@covalent/core/dialogs';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import { BinaryComponent } from 'src/app/component/binary/binary.component';
import {StravaService} from '../../services/strava.service';
import {Athlete} from '../../models/athlete';
import {TdLoadingService} from '@covalent/core/loading';
import {WithingsService} from '../../services/withings.service';
import {delay} from 'rxjs/operators';
import {PhysicalActivityComponent} from '../physical-activity/physical-activity.component';
import {News2Component} from '../news2/news2.component';
import {TaskCreateComponent} from '../../dialogs/task-create/task-create.component';
import {ServiceCreateComponent} from '../../dialogs/service-create/service-create.component';
import {CareTeamCreateComponent} from '../../dialogs/care-team-create/care-team-create.component';
import {CarePlanCreateComponent} from '../../dialogs/care-plan-create/care-plan-create.component';
import {EpisodeOfCareCreateComponent} from '../../dialogs/episode-of-care-create/episode-of-care-create.component';
import {CommunicationCreateComponent} from '../../dialogs/communication-create/communication-create.component';
import {QuestionnaireResponseCreateComponent} from '../../dialogs/questionnaire-response-create/questionnaire-response-create.component';
import {environment} from '../../../environments/environment';


@Component({
  selector: 'app-patient-summary',
  templateUrl: './patient-summary.component.html',
  styleUrls: ['./patient-summary.component.scss']
})
export class PatientSummaryComponent implements OnInit {

    documents: DocumentReference[] = [];
    forms: QuestionnaireResponse[] = [];
    requests: ServiceRequest[] = [];

    encounters: Encounter[] = [];
    episodes: EpisodeOfCare[] = [];

    tasks: Task[] = [];

    careTeams: CareTeam[] = [];
    carePlans: CarePlan[] = [];
   // careplans: CarePlan[]=[];
    flags: Flag[] = [];
    eolc: Flag | undefined;
    patient: Patient | undefined;
    patientid: string | null = null;

    // @ts-ignore
  allergies: AllergyIntolerance[] = [];
    // @ts-ignore
  medicationRequest: MedicationRequest[] = [];
    // @ts-ignore
  conditions: Condition[] = [];

    // @ts-ignore
  observations: Observation[] = [];
    // @ts-ignore
  diagnosticReports: DiagnosticReport[] = [];

    acutecolor = 'info';
    athlete: Athlete | undefined;

  stravaConnect = true;
  stravaComplete = false;


    @ViewChild('gpchip', {static: false}) gpchip: MatChip | undefined;
  private withingsConnect: boolean | undefined;
  public communications: Communication[] = [];
  public nhsNumber: string | undefined;

  constructor(private router: Router,
              private fhirSrv: FhirService,
              private route: ActivatedRoute,
              private eprService: EprService,
              private strava: StravaService,

              private withings: WithingsService,

              private dialogService: TdDialogService,
              public dialog: MatDialog,
              private viewContainerRef: ViewContainerRef,
              private loadingService: TdLoadingService) { }

  ngOnInit(): void {

      this.patientid = this.route.snapshot.paramMap.get('patientid');

      console.log(this.patientid);
      this.route.queryParams.subscribe(params => {
        const code = params['code'];
        const state = params['state'];
        console.log(params);
        if (code !== undefined) {
          console.log(code);
          if (state !== undefined && state === 'withings') {
            console.log('Withings detected');
            this.doWithingsSetup(code, state);
          } else {
            this.doStravaSetup(code);
          }
        }
      });
      this.clearDown();
      this.strava.tokenChange.subscribe(token => {
        console.log('Strava Token Received');
        if (token !== undefined) { this.stravaConnect = false; }
        this.stravaLoad();
      });
      this.withings.tokenChange.subscribe(
      token => {
        console.log('Withings Token Received');
        if (token !== undefined) { this.withingsConnect = false; }
        this.withingsLoad();
      }
    );
      this.strava.loaded.subscribe(loaded => {
        console.log('Strava Loaded Received');
        const patientRef: Reference = {
          reference: 'Patient/' + this.patientid
        };
        const transaction = this.strava.createTransaction(this.strava.activities, patientRef);
        this.fhirSrv.sendTransaction(transaction, 'Strava');
      });
      this.withings.activityLoaded.subscribe(result => {
        console.log('Withings Activity Loaded Received');
        const patientRef: Reference = {
          reference: 'Patient/' + this.patientid
        };
        const transaction = this.withings.createTransaction(result, patientRef);
        // console.log(JSON.stringify(transaction))
        this.fhirSrv.sendTransaction(transaction, 'Withings Activity');
      });
      this.withings.sleepLoaded.subscribe(result => {
        console.log('Withings Sleep Loaded Received');
        const patientRef: Reference = {
          reference: 'Patient/' + this.patientid
        };
        const transaction = this.withings.createTransaction(result, patientRef);
       // console.log(JSON.stringify(transaction))
        this.fhirSrv.sendTransaction(transaction, 'Withings Sleep');
      });
      this.withings.measuresLoaded.subscribe(result => {
        console.log('Withings Measures Loaded Received');
        const patientRef: Reference = {
          reference: 'Patient/' + this.patientid
        };
        const transaction = this.withings.createTransaction(result, patientRef);
       // console.log(JSON.stringify(transaction))
        this.fhirSrv.sendTransaction(transaction, 'Withings Measures');
      });
      // removed &_revinclude=CarePlan:patient
      this.fhirSrv.get('/Condition?patient=' + this.patientid).subscribe(bundle => {
         if (bundle.entry !== undefined) {
           for (const entry of bundle.entry) {
             if (entry.resource !== undefined && entry.resource.resourceType === 'Condition') { this.conditions.push(entry.resource as Condition); }
           }
         }
       }
     );
      this.fhirSrv.get('/AllergyIntolerance?patient=' + this.patientid).subscribe(bundle => {
        if (bundle.entry !== undefined) {
          for (const entry of bundle.entry) {
            if (entry.resource !== undefined && entry.resource.resourceType === 'AllergyIntolerance') { this.allergies.push(entry.resource as AllergyIntolerance); }
          }
        }
      }
    );
      this.fhirSrv.get('/MedicationRequest?patient=' + this.patientid).subscribe(bundle => {
        if (bundle.entry !== undefined) {
          for (const entry of bundle.entry) {
            if (entry.resource !== undefined && entry.resource.resourceType === 'MedicationRequest') { this.medicationRequest.push(entry.resource as MedicationRequest); }
          }
        }
      }
    );
      this.fhirSrv.get('/Encounter?patient=' + this.patientid + '&_count=5&_sort=-date').subscribe(bundle => {
        if (bundle.entry !== undefined) {
          for (const entry of bundle.entry) {
            if (entry.resource !== undefined && entry.resource.resourceType === 'Encounter') { this.encounters.push(entry.resource as Encounter); }
          }
        }
      }
    );
      this.fhirSrv.get('/EpisodeOfCare?patient=' + this.patientid + '&status=active,waitlist').subscribe(bundle => {
        if (bundle.entry !== undefined) {
          for (const entry of bundle.entry) {
            if (entry.resource !== undefined && entry.resource.resourceType === 'EpisodeOfCare') { this.episodes.push(entry.resource as EpisodeOfCare); }
          }
        }
      }
    );
      this.fhirSrv.get('/Task?patient=' + this.patientid + '').subscribe(bundle => {
        if (bundle.entry !== undefined) {
          for (const entry of bundle.entry) {
            if (entry.resource !== undefined && entry.resource.resourceType === 'Task') { this.tasks.push(entry.resource as Task); }
          }
        }
      }
    );
      this.fhirSrv.get('/ServiceRequest?patient=' + this.patientid + '').subscribe(bundle => {
        if (bundle.entry !== undefined) {
          for (const entry of bundle.entry) {
            if (entry.resource !== undefined && entry.resource.resourceType === 'ServiceRequest') { this.requests.push(entry.resource as ServiceRequest); }
          }
        }
      }
    );
      this.fhirSrv.get('/Observation?patient=' + this.patientid + '&_count=100&_sort=-date').subscribe(bundle => {
        if (bundle.entry !== undefined) {
          for (const entry of bundle.entry) {
            if (entry.resource !== undefined && entry.resource.resourceType === 'Observation') { this.observations.push(entry.resource as Observation); }
          }
        }
      }
    );
      this.fhirSrv.get('/DiagnosticReport?patient=' + this.patientid + '&_count=50&_sort=-date').subscribe(bundle => {
        if (bundle.entry !== undefined) {
          for (const entry of bundle.entry) {
            if (entry.resource !== undefined && entry.resource.resourceType === 'DiagnosticReport') { this.diagnosticReports.push(entry.resource as DiagnosticReport); }
          }
        }
      }
    );
      this.fhirSrv.get('/DocumentReference?patient=' + this.patientid + '&_count=50&_sort=-date').subscribe(bundle => {
        if (bundle.entry !== undefined) {
          for (const entry of bundle.entry) {
            if (entry.resource !== undefined && entry.resource.resourceType === 'DocumentReference') { this.documents.push(entry.resource as DocumentReference); }
          }
        }
      }
    );
      this.fhirSrv.get('/QuestionnaireResponse?patient=' + this.patientid + '&_count=50').subscribe(bundle => {
        if (bundle.entry !== undefined) {
          for (const entry of bundle.entry) {
          if (entry.resource !== undefined && entry.resource.resourceType === 'QuestionnaireResponse') { this.forms.push(entry.resource as QuestionnaireResponse); }
          }
        }
      }
    );
      this.fhirSrv.getTIE('/CarePlan?patient=' + this.patientid).subscribe(bundle => {
        if (bundle.entry !== undefined) {
          for (const entry of bundle.entry) {
            if (entry.resource !== undefined && entry.resource.resourceType === 'CarePlan') { this.carePlans.push(entry.resource as CarePlan); }
          }
        }
      }
    );
      this.fhirSrv.getTIE('/Communication?_sort=sent&patient=' + this.patientid).subscribe(bundle => {
        if (bundle.entry !== undefined) {
          for (const entry of bundle.entry) {
            if (entry.resource !== undefined && entry.resource.resourceType === 'Communication') { this.communications.push(entry.resource as Communication); }
          }
        }
      }
    );
      this.fhirSrv.getTIE('/CareTeam?patient=' + this.patientid).subscribe(bundle => {
        if (bundle.entry !== undefined) {
          for (const entry of bundle.entry) {
            if (entry.resource !== undefined && entry.resource.resourceType === 'CareTeam') { this.careTeams.push(entry.resource as CareTeam); }
          }
        }
      }
    );
      this.fhirSrv.getResource('/Patient/' + this.patientid)
        .subscribe(resource => {
          const patient = resource as Patient;
          if (patient !== undefined ) {
            if (patient.identifier !== undefined){
              for (const identifier of patient.identifier) {
                if (identifier.system !== undefined && identifier.system.includes('nhs-number')) {
                  this.nhsNumber = identifier.value;
                }
              }
            }
          }
        }
      );


      this.eprService.getAcuteStatusChangeEvent().subscribe( colour => {
      this.acutecolor = colour;
    });
  }


    clearDown(): void {


        this.encounters = [];
        // this.careplans = [];
        this.patient = undefined;
        this.documents = [];

        this.allergies = [];
        this.medicationRequest = [];
        this.conditions = [];
        this.eolc = undefined;
    }

    selectEncounter(encounter: Reference): void {
      if (encounter.reference !== undefined) {
        const str = encounter.reference.split('/');
        console.log(this.route.root);
        this.router.navigate(['..', 'encounter', str[1]], {relativeTo: this.route});
      }
    }

    selectCarePlan(carePlan: Reference): void {

        this.router.navigate(['..', 'careplan', carePlan.id] , { relativeTo : this.route});

    }

  selectDocument(document: DocumentReference): void {
    console.log(document);

    if (document.content !== undefined && document.content.length > 0 && document.content[0].attachment !== undefined
     && document.content[0].attachment.url !== undefined) {

      this.eprService.setDocumentReference(document);
      this.fhirSrv.getBinary(document.content[0].attachment.url).subscribe(result => {

        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.data = {
          id: 1,
          binary: result,
          documentReference: document
        };
        this.dialog.open( BinaryComponent, dialogConfig);
      }, error => {
        if (document.content[0].attachment.contentType !== undefined && document.content[0].attachment.contentType.indexOf('image') === 0) {
          // throw alert if not image
          const alertConfig: IAlertConfig = {message: 'Unable to locate document2.'};
          alertConfig.disableClose = false; // defaults to false
          alertConfig.viewContainerRef = this.viewContainerRef;
          alertConfig.title = 'Alert';
          alertConfig.closeButton = 'Close';
          alertConfig.width = '400px';
          this.dialogService.openAlert(alertConfig);
        } else {
          // Try it anyway
          const dialogConfig = new MatDialogConfig();

          dialogConfig.disableClose = true;
          dialogConfig.autoFocus = true;
          dialogConfig.data = {
            id: 1,
            documentReference: document
          };
          this.dialog.open( BinaryComponent, dialogConfig);
        }
      });

    //  this.router.navigate(['..', 'document', document.id], {relativeTo: this.route });

    } else {
      const alertConfig: IAlertConfig = { message : 'Unable to locate document1.'};
      alertConfig.disableClose =  false; // defaults to false
      alertConfig.viewContainerRef = this.viewContainerRef;
      alertConfig.title = 'Alert';
      alertConfig.closeButton = 'Close';
      alertConfig.width = '400px';
      this.dialogService.openAlert(alertConfig);
    }


  }
  doStravaSetup(authorisationCode: string): void  {

    console.log(authorisationCode);

    // Subscribe to the token change
    this.strava.tokenChange.subscribe(
      token => {
        this.router.navigateByUrl('/patient/' + this.patientid);
      }
    );
    // this will emit a change when the token is retrieved
    this.strava.getOAuth2AccessToken(authorisationCode);
  }

  doWithingsSetup(authorisationCode: string, state: any): void {

    console.log(authorisationCode);
    this.withings.tokenChange.subscribe(
      token => {
        this.router.navigateByUrl('/patient/' + this.patientid);
      }
    );
    const url = window.location.href.split('?');
    this.withings.getOAuth2AccessToken(authorisationCode, url[0]);
  }
  connectStrava(): void {

    this.strava.authorise(window.location.href);
  }

  connectWithings(): void {
    this.withings.authorise(window.location.href);

  }

  stravaLoad(): void {
    this.getAthlete();

    this.phrLoad(false);
  }

  getAthlete(): void {

    this.strava.getAthlete().subscribe(
      result => {
        this.athlete = result;
        this.strava.setAthlete(result);
      },
      (err) => {
        console.log(err);
        if (err.status === 401) {
          this.stravaConnect = true;
        }
      }
    );
  }

  phrLoad(withing: boolean): void {
    this.stravaComplete = false;

    this.loadStart();
    this.strava.getActivities();


   // TODO reload data
  }

  loadComplete(): void {
    this.loadingService.resolve('overlayStarSyntax');
  }

  loadStart(): void {
    this.loadingService.register('overlayStarSyntax');
  }

  private async withingsLoad(): Promise<void> {
    // Process sequentially. Don't bombard AWS with many requests
    this.withings.getSleep();
    await delay(20000);
    await this.withings.getMeasures();
    await delay(100000);
    this.withings.getActivity();

    // Strava covers this this.withings.getWorkoutResults();
  }

  loadPhysicalActivity(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = '70%';
    dialogConfig.width = '90%';

    dialogConfig.data = {
      id: 1,
      patientId: this.patientid
    };
    this.dialog.open( PhysicalActivityComponent, dialogConfig);
  }
  loadNEWS2(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = '70%';
    dialogConfig.width = '90%';

    dialogConfig.data = {
      id: 1,
      patientId: this.patientid
    };
    this.dialog.open( News2Component, dialogConfig);
  }
  addTask(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = '85%';
    dialogConfig.width = '50%';

    dialogConfig.data = {
      id: 1,
      patientId: this.patientid,
      nhsNumber: this.nhsNumber
    };
    this.dialog.open( TaskCreateComponent, dialogConfig);
  }

  addServiceRequest(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = '85%';
    dialogConfig.width = '50%';

    dialogConfig.data = {
      id: 1,
      patientId: this.patientid,
      nhsNumber: this.nhsNumber
    };
    this.dialog.open( ServiceCreateComponent, dialogConfig);
  }

  addCareTeam(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = '80%';
    dialogConfig.width = '50%';

    dialogConfig.data = {
      id: 1,
      patientId: this.patientid,
      nhsNumber: this.nhsNumber
    };
    this.dialog.open( CareTeamCreateComponent, dialogConfig);
  }
  addCarePlan(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = '80%';
    dialogConfig.width = '50%';

    dialogConfig.data = {
      id: 1,
      patientId: this.patientid,
      nhsNumber: this.nhsNumber
    };
    this.dialog.open( CarePlanCreateComponent, dialogConfig);
  }

  addStay(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = '80%';
    dialogConfig.width = '50%';

    dialogConfig.data = {
      id: 1,
      patientId: this.patientid,
      nhsNumber: this.nhsNumber
    };
    this.dialog.open( EpisodeOfCareCreateComponent, dialogConfig);
  }

  addCommunication(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = '80%';
    dialogConfig.width = '50%';

    dialogConfig.data = {
      id: 1,
      patientId: this.patientid,
      nhsNumber: this.nhsNumber
    };
    this.dialog.open( CommunicationCreateComponent, dialogConfig);
  }

  addForms(): void {
    window.open('https://lhcforms.nlm.nih.gov/lforms-fhir-app/?server=' + environment.tieServer, '_blank');
  }
}
