import {Component, ElementRef, Inject, Input, OnInit, ViewChild} from '@angular/core';
import {QuestionnaireResponse} from 'fhir/r4';

import {FhirService} from '../../../services/fhir.service';
import {ActivatedRoute} from "@angular/router";
import {EprService} from "../../../services/epr.service";
import {client} from "fhirclient";

declare var LForms: any;

@Component({
  selector: 'app-questionnaire-response-view',
  templateUrl: './questionnaire-response-view.component.html',
  styleUrls: ['./questionnaire-response-view.component.scss']
})
export class QuestionnaireResponseViewComponent implements OnInit {
  patientId: string = '';
  @Input() resource: QuestionnaireResponse | undefined;
  private form: any;
  @ViewChild('myFormContainer', { static: false }) mydiv: ElementRef | undefined;
  constructor(public fhir: FhirService,
              private eprService: EprService,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    const form= this.route.snapshot.paramMap.get('form');
    if (form != null) {
      this.form = form;
      this.getRecords()
    }
    let patient = this.eprService.getPatient()
    if (patient !== undefined) {
      if (patient.id !== undefined) {
        this.patientId = patient.id
      }
    }
    this.eprService.patientChangeEvent.subscribe(patient => {
      if (patient.id !== undefined) this.patientId = patient.id
    });

  }
  getRecords() {

    this.fhir.getTIE('/QuestionnaireResponse/' + this.form).subscribe(resource => {
          if (resource !== undefined && resource.resourceType === 'QuestionnaireResponse') {

            var questionnaireResponse: QuestionnaireResponse = resource;
            console.log(questionnaireResponse)
            if (questionnaireResponse.questionnaire !== undefined) {
              console.log('not undef')
              var result = this.fhir.getTIEResource('/'+questionnaireResponse.questionnaire).subscribe(
                  questionnaire => {
                    if (questionnaire.resourceType === 'Questionnaire') {
                      const ctx = client({
                        serverUrl: this.fhir.getTIEUrl()
                      });
                      LForms.Util.setFHIRContext(ctx)

                      let formDef = LForms.Util.convertFHIRQuestionnaireToLForms(questionnaire, "R4");
                      var newFormData = (new LForms.LFormsData(formDef));
                      try {
                        formDef = LForms.Util.mergeFHIRDataIntoLForms('QuestionnaireResponse', questionnaireResponse, newFormData, "R4");
                        LForms.Util.addFormToPage(formDef, this.mydiv?.nativeElement, {prepopulate: false});
                      } catch (e) {
                        console.log(e)
                        formDef = null;
                      }
                    }
                  }
              );
            }
          }
        }
    );

  }

}
