import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FhirService} from "../../services/fhir.service";
import {EprService} from "../../services/epr.service";
import {Patient, Questionnaire, QuestionnaireResponse} from "fhir/r4";
import {environment} from "../../../environments/environment";
import {TaskCreateComponent} from "../workflow/task-create/task-create.component";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {Router} from "@angular/router";


@Component({
  selector: 'app-forms',
  templateUrl: './forms.component.html',
  styleUrls: ['./forms.component.scss']
})
export class FormsComponent implements OnInit {
  forms: QuestionnaireResponse[] = [];
  patientId: string | null = null;
  private nhsNumber: string | undefined;

  form: Questionnaire | undefined;
  questionnaires: Questionnaire[] = [];

  constructor( public fhirService: FhirService,
               private eprService: EprService,
               private router: Router,
               public dialog: MatDialog) { }

  ngOnInit(): void {
    let patient = this.eprService.getPatient()

    if (patient !== undefined) {
      if (patient.id !== undefined) {
        this.patientId = patient.id
        this.getRecords(patient);
      }

    }
    this.eprService.patientChangeEvent.subscribe(patient => {
      if (patient.id !== undefined) this.patientId = patient.id

      this.getRecords(patient);
    });

    this.fhirService.getTIE('/Questionnaire').subscribe(bundle => {
          if (bundle.entry !== undefined) {
            for (const entry of bundle.entry) {
              if (entry.resource !== undefined && entry.resource.resourceType === 'Questionnaire') { this.questionnaires.push(entry.resource as Questionnaire); }
            }
          }
        }
    );
  }

  getRecords(patient: Patient){
    if (patient !== undefined ) {
      if (patient.identifier !== undefined){
        for (const identifier of patient.identifier) {
          if (identifier.system !== undefined && identifier.system.includes('nhs-number')) {
            this.nhsNumber = identifier.value;
          }
        }
      }
    }
    this.forms = [];
    this.fhirService.get('/QuestionnaireResponse?patient=' + this.patientId + '&_count=50&_sort=-authored').subscribe(bundle => {
          if (bundle.entry !== undefined) {
            for (const entry of bundle.entry) {
              if (entry.resource !== undefined && entry.resource.resourceType === 'QuestionnaireResponse') { this.forms.push(entry.resource as QuestionnaireResponse); }
            }
          }
        }
    );
  }

  addForms(): void {
    window.open('https://lhcforms.nlm.nih.gov/lforms-fhir-app/?server=' + environment.tieServer, '_blank');
  }
  addFormsNew(): void {
    this.router.navigate(['/patient', this.patientId, 'sdc'])
  }

  addTask(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = '85%';
    dialogConfig.width = '50%';

    dialogConfig.data = {
      id: 1,
      patientId: this.patientId,
      nhsNumber: this.nhsNumber,
      taskType: 1
    };
    const dialogRef = this.dialog.open(TaskCreateComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      console.log(result)
      if (result !== undefined) {
        // TODO review if required
      }
    })
  }

  selected(questionnaire : Questionnaire) {
    console.log(questionnaire)
    this.router.navigate(['/patient', this.patientId, 'sdc', questionnaire.id])
  }


}
