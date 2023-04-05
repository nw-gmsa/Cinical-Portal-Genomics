import { Component, OnInit } from '@angular/core';
import {FhirService} from "../../../services/fhir.service";
import {EprService} from "../../../services/epr.service";
import {TdDialogService} from "@covalent/core/dialogs";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {Patient, QuestionnaireResponse} from "fhir/r4";
import {environment} from "../../../../environments/environment";


@Component({
  selector: 'app-forms',
  templateUrl: './forms.component.html',
  styleUrls: ['./forms.component.scss']
})
export class FormsComponent implements OnInit {
  forms: QuestionnaireResponse[] = [];
  patientId: string | null = null;
  private nhsNumber: string | undefined;
  constructor( public fhirSrv: FhirService,
               private eprService: EprService,
               private dialogService: TdDialogService,
               public dialog: MatDialog) { }

  ngOnInit(): void {
    if (this.eprService.patient !== undefined) {
      if (this.eprService.patient.id !== undefined) {
        this.patientId = this.eprService.patient.id;
        this.getRecords(this.eprService.patient);
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
    this.fhirSrv.get('/QuestionnaireResponse?patient=' + this.patientId + '&_count=50').subscribe(bundle => {
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



}
