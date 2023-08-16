import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FhirService} from "../../../../services/fhir.service";
import {MatDialog} from "@angular/material/dialog";
import {client} from "fhirclient";


declare var LForms: any;

@Component({
  selector: 'app-structured-data-captue',
  templateUrl: './structured-data-captue.component.html',
  styleUrls: ['./structured-data-captue.component.scss']
})
export class StructuredDataCaptueComponent implements OnInit,AfterViewInit {

  @ViewChild('myFormContainer', { static: false }) mydiv: ElementRef | undefined;

  constructor(
      public dialog: MatDialog,
      public fhirService: FhirService
  ) { }

  ngAfterViewInit(): void {
    var questionnaire = this.fhirService.getTIEResource("/Questionnaire/7e09e96a-f1c8-4d8b-ad01-8eed9ff132ca").subscribe(
        result => {
          if (result.resourceType === 'Questionnaire') {
            const ctx = client({
              serverUrl: "https://3cdzg7kbj4.execute-api.eu-west-2.amazonaws.com/poc/events/FHIR/R4"
            });
            console.log("set FHIR Context")
            LForms.Util.setFHIRContext(ctx)
            let formDef = LForms.Util.convertFHIRQuestionnaireToLForms(
                result, "R4");
            console.log(formDef)
            LForms.Util.addFormToPage(formDef, this.mydiv?.nativeElement, {prepopulate: false});
            console.log('LForms.Util.addFormToPage')
          }
        }
    );
  }

  ngOnInit(): void {

  }


}
