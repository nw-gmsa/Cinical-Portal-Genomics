import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {OperationOutcome, Patient} from 'fhir/r4';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}



@Component({
  selector: 'app-validate-fhir',
  templateUrl: './validate-fhir.component.html',
  styleUrls: ['./validate-fhir.component.scss']
})
export class ValidateFhirComponent implements OnInit {

  ISSUES_DATA: any = {
    resourceType: 'OperationOutcome',
    issue: [
      {
        severity: 'information',
        code: 'processing',
        details: {
          coding: [
            {
              system: 'http://hl7.org/fhir/java-core-messageId',
              code: 'Extension_EXT_Unknown'
            }
          ]
        },
        diagnostics: 'Unknown extension https://fhir.nhs.uk/R4/StructureDefinition/Extension-DM-PrescriptionStatusHistory',
        location: [
          'Bundle.entry[1].resource.ofType(MedicationRequest).extension[1]',
          'Line 1, Col 1999'
        ]
      },
      {
        severity: 'error',
        code: 'processing',
        details: {
          coding: [
            {
              system: 'http://hl7.org/fhir/java-core-messageId',
              code: 'Terminology_TX_System_ValueSet'
            }
          ]
        },
        diagnostics: 'Invalid System URI: http://snomed.info/sct - cannot use a value set URI as a system',
        location: [
          'Bundle.entry[1].resource.ofType(MedicationRequest).medication.ofType(CodeableConcept).coding[0]',
          'Line 1, Col 2449'
        ]
      },
      {
        severity: 'information',
        code: 'processing',
        details: {
          coding: [
            {
              system: 'http://hl7.org/fhir/java-core-messageId',
              code: 'Terminology_TX_System_NotKnown'
            }
          ]
        },
        diagnostics: 'Code System URI "http://snomed.info/sct" is unknown so the code cannot be validated',
        location: [
          'Bundle.entry[1].resource.ofType(MedicationRequest).medication.ofType(CodeableConcept).coding[0]',
          'Line 1, Col 2449'
        ]
      },
      {
        severity: 'information',
        code: 'processing',
        details: {
          coding: [
            {
              system: 'http://hl7.org/fhir/java-core-messageId'
            }
          ]
        },
        diagnostics: 'Details for urn:uuid:1b012fda-a5ac-43b3-8895-f20c74be9952 matching against Profile http://hl7.org/fhir/StructureDefinition/Patient',
        location: [
          'Bundle.entry[1].resource.ofType(MedicationRequest).subject',
          'Line 1, Col 2606'
        ]
      },
      {
        severity: 'warning',
        code: 'processing',
        details: {
          coding: [
            {
              system: 'http://hl7.org/fhir/java-core-messageId',
              code: 'Rule prac-gmc: "GMC must be of the format CNNNNNNN" Failed'
            }
          ]
        },
        diagnostics: 'Rule prac-gmc: "GMC must be of the format CNNNNNNN" Failed',
        location: [
          'Bundle.entry[8].resource.ofType(Practitioner)',
          'Line 1, Col 6247'
        ]
      }
    ]
  };

  displayedColumns: string[] = ['icon', 'severity', 'diagnostics', 'location'];
  dataSource = this.ISSUES_DATA.issue;

  response: any = undefined;

  editorLanguage = 'json';
  editorVal = '';

  resource: Patient
    = {
    resourceType : 'Patient',
    identifier: [
      {
        system: 'https://fhir.nhs.uk/Id/nhs-number',
        value: '9912003888'
      }
    ]
  };

  firstFormGroup = this.formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this.formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  isLinear = false;



  constructor(private formBuilder: FormBuilder,
              private http: HttpClient,
              // tslint:disable-next-line:variable-name
              private _changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.editorVal = this.getResource();
  }

  changeLanguage(): void {
    this.editorVal =
      this.editorLanguage === 'json'
        ? this.getResource()
        : '';
    this._changeDetectorRef.detectChanges();
  }


  getResource(): string {
    return JSON.stringify(this.resource, undefined, 4);
  }


  public validate(): void{
    this.http.post(environment.fhirServer +'$validate?profile=https://fhir.nhs.uk/StructureDefinition/NHSDigital-Patient', this.resource).subscribe(
      response => {
        this.response = response;
        this.ISSUES_DATA = response;
        console.log(response);
      },
      error => {
        console.log(error);
      }
    );
  }

  public callBackFunc(data: any): void {
    //
  }
}
