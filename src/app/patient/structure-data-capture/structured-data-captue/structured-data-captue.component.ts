import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FhirService} from "../../../services/fhir.service";
import {MatDialog} from "@angular/material/dialog";
import {client} from "fhirclient";
import {EprService} from "../../../services/epr.service";
import {ActivatedRoute, Router} from "@angular/router";
import {QuestionnaireResponse} from "fhir/r4";
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

  constructor(
      public dialog: MatDialog,
      public fhirService: FhirService,
      private eprService: EprService,
      private route: ActivatedRoute,
      private router: Router,
      private _dialogService: TdDialogService
  ) { }

  ngAfterViewInit(): void {

    var questionnaire = this.fhirService.getTIEResource("/Questionnaire/"+this.questionnaireId).subscribe(
        result => {
          if (result.resourceType === 'Questionnaire') {
            const ctx = client({
              serverUrl: this.fhirService.getTIEUrl()
            });
            LForms.Util.setFHIRContext(ctx)
            let formDef = LForms.Util.convertFHIRQuestionnaireToLForms(
                result, "R4");
            LForms.Util.addFormToPage(formDef, this.mydiv?.nativeElement, {prepopulate: false});
            console.log('LForms.Util.addFormToPage')
          }
        }
    );
  }

  ngOnInit(): void {
    let patient = this.eprService.getPatient()
    if (patient !== undefined) {
      if (patient.id !== undefined) {
        this.patientId = patient.id
      }
    }
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
      console.log(questionnaireResponse)
      this.fhirService.postTIE('/QuestionnaireResponse', questionnaireResponse).subscribe((condition) => {
           // this.diaglogRef.close(condition);
            this._dialogService.openAlert({
              title: 'Info',
              disableClose: true,
              message:
                  'Form submitted ok',
            });
            this.fhirService.postTIE('/QuestionnaireResponse/$extract', questionnaireResponse).subscribe((bundle) => {
              console.log(bundle)
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
