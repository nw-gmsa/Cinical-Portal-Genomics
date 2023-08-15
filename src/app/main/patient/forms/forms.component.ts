import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FhirService} from "../../../services/fhir.service";
import {EprService} from "../../../services/epr.service";
import {Patient, Questionnaire, QuestionnaireResponse} from "fhir/r4";
import {environment} from "../../../../environments/environment";
import {TaskCreateComponent} from "../../../patient/workflow/task-create/task-create.component";
import {MatLabel} from "@angular/material/form-field";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";

declare var LForms: any;

@Component({
  selector: 'app-forms',
  templateUrl: './forms.component.html',
  styleUrls: ['./forms.component.scss']
})
export class FormsComponent implements OnInit,AfterViewInit {
  forms: QuestionnaireResponse[] = [];
  patientId: string | null = null;
  private nhsNumber: string | undefined;

  @ViewChild('myFormContainer', { static: false }) mydiv: ElementRef | undefined;

  constructor( public fhirService: FhirService,
               private eprService: EprService,
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
    this.fhirService.get('/QuestionnaireResponse?patient=' + this.patientId + '&_count=50').subscribe(bundle => {
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

  ngAfterViewInit(): void {
    var questionnaire : Questionnaire = {
      "item": [
        {
          "type": "quantity",
          "extension": [
            {
              "valueBoolean": true,
              "url": "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-observationExtract"
            },
            {
              "url": "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-observationLinkPeriod",
              "valueDuration": {
                "value": 2,
                "unit": "hours",
                "system": "http://unitsofmeasure.org",
                "code": "h"
              }
            },
            {
              "url": "http://hl7.org/fhir/StructureDefinition/questionnaire-unitOption",
              "valueCoding": {
                "system": "http://unitsofmeasure.org",
                "code": "mmol/L",
                "display": "millimole per liter"
              }
            }
          ],
          "linkId": "4837143311069",
          "code": [
            {
              "system": "http://snomed.info/sct",
              "code": "997671000000106"
            }
          ],
          "text": "Blood glucose level"
        }
      ],
      "resourceType": "Questionnaire",
      "url": "https://example.fhir.nhs.uk/Questionnaire/Glucose",
      "title": "Glucose",
      "status": "draft",
      "code": [
        {
          "system": "http://snomed.info/sct",
          "code": "997671000000106"
        }
      ]
    }

    console.log(this.mydiv)
    LForms.Util.addFormToPage(questionnaire, this.mydiv?.nativeElement, {prepopulate: false});
  }

}
