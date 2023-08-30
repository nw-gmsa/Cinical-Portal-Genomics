import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FhirService} from "../../../services/fhir.service";
import {MatDialog} from "@angular/material/dialog";
import {client} from "fhirclient";
import {EprService} from "../../../services/epr.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Parameters, Questionnaire, QuestionnaireResponse} from "fhir/r4";
import {TdDialogService} from "@covalent/core/dialogs";


declare var LForms: any;

@Component({
  selector: 'app-structured-data-captue',
  templateUrl: './structured-data-captue.component.html',
  styleUrls: ['./structured-data-captue.component.scss']
})
export class StructuredDataCaptueComponent implements OnInit,AfterViewInit {

  @ViewChild('myFormContainer', { static: false }) mydiv: ElementRef | undefined;
  patientId: string | null = null;
  questionnaireId = '7e09e96a-f1c8-4d8b-ad01-8eed9ff132ca'; // initial value if called directly
  questionnaire: Questionnaire | undefined;
  constructor(
      public dialog: MatDialog,
      public fhirService: FhirService,
      private eprService: EprService,
      private route: ActivatedRoute,
      private router: Router,
      private _dialogService: TdDialogService
  ) { }

  ngAfterViewInit(): void {

    if (this.questionnaireId.length > 10) {
      var result = this.fhirService.getTIEResource("/Questionnaire/" + this.questionnaireId).subscribe(
          questionnaire => {
            if (questionnaire.resourceType === 'Questionnaire') {
              this.questionnaire = questionnaire
              const ctx = client({
                serverUrl: this.fhirService.getTIEUrl()
              });
              LForms.Util.setFHIRContext(ctx)

              // Can also just to this LForms.Util.addFormToPage(questionnaire, this.mydiv?.nativeElement, {prepopulate: false});
              var parameters: Parameters = {
                resourceType: "Parameters",
                parameter: []
              }
              parameters.parameter?.push({
                "name": "subject",
                "valueReference": {
                  "reference": "Patient/" + this.patientId
                }
              })
              parameters.parameter?.push({
                "name": "questionnaireRef",
                "valueReference": {
                  "reference": "Questionnaire/" + this.questionnaireId
                }
              })
              this.fhirService.postTIE("/Questionnaire/$populate", parameters).subscribe(response => {
                if (response.resourceType === 'Parameters') {
                  for (var param of response.parameter) {
                    if (param.name === 'response') {
                      let formDef = LForms.Util.convertFHIRQuestionnaireToLForms(questionnaire, "R4");
                      var newFormData = (new LForms.LFormsData(formDef));
                      try {
                        formDef = LForms.Util.mergeFHIRDataIntoLForms('QuestionnaireResponse', param.resource, newFormData, "R4");
                        LForms.Util.addFormToPage(formDef, this.mydiv?.nativeElement, {prepopulate: false});
                      } catch (e) {
                        console.log(e)
                        formDef = null;
                      }
                    }
                  }
                }
              })
            }
          }
      );
    } else {
      var result = this.fhirService.getLOINCResource("/Questionnaire/" + this.questionnaireId).subscribe(
          questionnaire => {
            if (questionnaire.resourceType === 'Questionnaire') {
              this.questionnaire = questionnaire
              const ctx = client({
                serverUrl: this.fhirService.getTIEUrl()
              });
              LForms.Util.setFHIRContext(ctx)
              LForms.Util.addFormToPage(LForms.Util.convertFHIRQuestionnaireToLForms(questionnaire, "R4"),this.mydiv?.nativeElement, {prepopulate: false});
            }
          }
      );
    }
  }

  ngOnInit(): void {
    // This triggers the service to get the Patient
    let patient = this.eprService.getPatient()
    if (patient !== undefined) {
      if (patient.id !== undefined) {
        this.patientId = patient.id
      }
    }
    this.eprService.patientChangeEvent.subscribe(patient => {
      // this is the callback event from the get patient request
      if (patient.id !== undefined) this.patientId = patient.id
    });
    const form= this.route.snapshot.paramMap.get('form');
    if (form != null) {
      this.questionnaireId = form;
    }
  }


  selected($event: Event) {
    console.log($event)
    let formDef = LForms.Util.convertFHIRQuestionnaireToLForms(
        $event, "R4");
    LForms.Util.addFormToPage(formDef, this.mydiv?.nativeElement, {prepopulate: false});

  }

  submit() {
    // results = LForms.Util.getUserData(this.mydiv?.nativeElement)

    let results =  LForms.Util.getFormFHIRData("QuestionnaireResponse", "R4", this.mydiv?.nativeElement)

    if (results.resourceType === "QuestionnaireResponse") {
      let questionnaireResponse : QuestionnaireResponse = results
      questionnaireResponse.subject = {
        reference: "Patient/"+this.patientId
      }
      questionnaireResponse.questionnaire = "Questionnaire/" + this.questionnaireId
      this.fhirService.postTIE('/QuestionnaireResponse', questionnaireResponse).subscribe((newQuestionnaireResponse) => {
           // this.diaglogRef.close(condition);
            this._dialogService.openAlert({
              title: 'Info',
              disableClose: true,
              message:
                  'Form submitted ok',
            });
            if (newQuestionnaireResponse.resourceType === 'QuestionnaireResponse') {
              this.fhirService.postTIE('/QuestionnaireResponse/$extract', newQuestionnaireResponse).subscribe((bundle) => {

                    if (bundle !== undefined && bundle.entry !== undefined) {
                      this.fhirService.postTIE('/', bundle).subscribe((bundle) => {


                            this.router.navigate(['/patient', this.patientId, 'forms'])
                          },
                          error => {
                            console.log(JSON.stringify(error))
                            this._dialogService.openAlert({
                              title: 'Alert',
                              disableClose: true,
                              message:
                                  this.fhirService.getErrorMessage(error),
                            });
                          })
                    } else {
                      this.router.navigate(['/patient', this.patientId, 'forms'])
                    }
                  },
                  error => {
                    console.log(JSON.stringify(error))
                    this._dialogService.openAlert({
                      title: 'Alert',
                      disableClose: true,
                      message:
                          this.fhirService.getErrorMessage(error),
                    });
                  })
            }

          },
          error => {
            console.log(JSON.stringify(error))
            this._dialogService.openAlert({
              title: 'Alert',
              disableClose: true,
              message:
                  this.fhirService.getErrorMessage(error),
            });
          });
    }
  }
}
