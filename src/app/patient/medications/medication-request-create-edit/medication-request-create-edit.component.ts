import {Component, Inject, OnInit} from '@angular/core';
import {Coding, Identifier, MedicationRequest, ValueSetExpansionContains} from "fhir/r4";
import {Observable, Subject} from "rxjs";
import {Moment} from "moment";
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef} from "@angular/material/legacy-dialog";
import {FhirService} from "../../../services/fhir.service";
import {DialogService} from "../../../services/dialog.service";
import {TdDialogService} from "@covalent/core/dialogs";
import {catchError, debounceTime, distinctUntilChanged, map, switchMap} from "rxjs/operators";
import {MatLegacyAutocompleteSelectedEvent as MatAutocompleteSelectedEvent} from "@angular/material/legacy-autocomplete";
import * as uuid from "uuid";


@Component({
  selector: 'app-medication-request-create-edit',
  templateUrl: './medication-request-create-edit.component.html',
  styleUrls: ['./medication-request-create-edit.component.scss']
})
export class MedicationRequestCreateEditComponent implements OnInit {

  edit = false;
  medicationRequest: MedicationRequest;
  disabled: boolean = true;
  patientId = undefined;
  nhsNumber = undefined;
  statuses: ValueSetExpansionContains[] | undefined;
  intents: ValueSetExpansionContains[] | undefined;
  therapies: ValueSetExpansionContains[] | undefined;
  categories: ValueSetExpansionContains[] | undefined;
  medicationStatus: Coding | undefined;
  medicationIntent: Coding | undefined;

  medicationCode: Coding | undefined;
  medication$: Observable<ValueSetExpansionContains[]> | undefined;
  private searchMedications = new Subject<string>();
  authorisedDate: Moment | undefined;
  medicationTherapy: Coding | undefined;
  medicationCategory: Coding | undefined;
  dosageInstruction: String | undefined;

  constructor(public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) data: any,
              public fhirService: FhirService,
              public dlgSrv: DialogService,
              private _dialogService: TdDialogService,
              private diaglogRef: MatDialogRef<MedicationRequestCreateEditComponent>) {
    this.patientId = data.patientId;
    this.nhsNumber = data.nhsNumber;
    this.medicationRequest = data.medicationRequest;

    if (this.medicationRequest !== undefined) {
      this.edit = true;
    }

  }

  ngOnInit(): void {

    if (this.medicationRequest !== undefined) {

      // leave for now.... allow new new notes if (this.task.note !== undefined && this.task.note.length > 0)
      if (this.medicationRequest.medicationCodeableConcept !== undefined && this.medicationRequest.medicationCodeableConcept.coding !== undefined) {
        this.medicationCode = this.medicationRequest.medicationCodeableConcept.coding[0]
      }
    }

    this.fhirService.getConf('/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/medicationrequest-status').subscribe(
        resource  => {
          this.statuses = this.dlgSrv.getContainsExpansion(resource);
        }
    );
    this.fhirService.getConf('/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/medicationrequest-intent').subscribe(
        resource  => {
          this.intents = this.dlgSrv.getContainsExpansion(resource);
        }
    );
    this.fhirService.getConf('/ValueSet/$expand?url=https://fhir.nhs.uk/ValueSet/DM-medicationrequest-course-of-therapy').subscribe(
        resource  => {
          this.therapies = this.dlgSrv.getContainsExpansion(resource);
        }
    );
    this.fhirService.getConf('/ValueSet/$expand?url=https://fhir.hl7.org.uk/ValueSet/UKCore-MedicationRequestCategory').subscribe(
        resource  => {
          this.categories = this.dlgSrv.getContainsExpansion(resource);
        }
    );


    this.medication$ = this.searchMedications.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term: string) => {
              return this.fhirService.searchConcepts(term, 'https://fhir.nhs.uk/ValueSet/NHSDigital-MedicationRequest-Code');
            }
        ),
        map(resource    => {
              return this.dlgSrv.getContainsExpansion(resource);
            }
        ),
        catchError(this.dlgSrv.handleError('getReasons', [])))
    ;
  }

  selectedStatus(status: any): void {
    this.medicationStatus = status.value;
    this.checkSubmit();
  }

  selectedMedication(event: MatAutocompleteSelectedEvent): void {
    this.medicationCode = {
      system: event.option.value.system,
      code: event.option.value.code,
      display: event.option.value.display,
    };
    this.checkSubmit();
  }

  searchMedication(term: string): void {
    if (term.length > 3) {
      this.searchMedications.next(term);
    }
  }

  checkSubmit(): void {

    this.disabled = !(this.medicationCode !== undefined
        && this.medicationStatus !== undefined
        && this.medicationIntent !== undefined
        && this.medicationCategory !== undefined
        && this.medicationTherapy !== undefined);
  }

  submit(): void {
    const medicationRequest: MedicationRequest = {
      intent: 'order', status: 'unknown',
      subject: {},
      category: [],
      resourceType: 'MedicationRequest',
      extension:  [
        {
          url: "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionType",
          valueCoding: {
            system: "https://fhir.nhs.uk/CodeSystem/prescription-type",
            code: "0101"
          }
        }
      ],
      dosageInstruction: [
        {
          text: "1 tablet, daily"
        }
      ],
      "dispenseRequest": {
        "extension":  [
          {
            "url": "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PerformerSiteType",
            "valueCoding": {
              "system": "https://fhir.nhs.uk/CodeSystem/dispensing-site-preference",
              "code": "0004"
            }
          }
        ],
        "quantity": {
          "value": 28,
          "unit": "tablet",
          "system": "http://snomed.info/sct",
          "code": "428673006"
        }
      }
    };
    if (this.medicationCode !== undefined ) {
      medicationRequest.medicationCodeableConcept = {
        coding: [
          this.medicationCode
        ]
      };
    }
    if (this.dosageInstruction !== undefined) {
      // @ts-ignore
      medicationRequest.dosageInstruction[0].text = this.dosageInstruction.trim()
    }




    if (this.edit) {
      medicationRequest.subject = this.medicationRequest.subject
      medicationRequest.identifier = this.medicationRequest.identifier

    } else {
      medicationRequest.subject = {
        reference: 'Patient/' + this.patientId,
        identifier: {
          system: 'https://fhir.nhs.uk/Id/nhs-number',
          value: this.nhsNumber
        }
      };
      // @ts-ignore

      var identifier : Identifier = {
        system: 'https://fhir.nhs.uk/Id/prescription-order-number',
        value: uuid.v4()
      }
      // To get around EPS rules
      medicationRequest.requester = {
        "reference": "https://fhir.example.org/Patient/56166769-c1c4-4d07-afa8-132b5dfca666"
      }
      medicationRequest.identifier = [ {
        system: 'https://fhir.nhs.uk/Id/prescription-order-item-number',
        value: identifier.value
      }]
      medicationRequest.groupIdentifier = identifier
      medicationRequest.groupIdentifier.extension = [
          {
            "url": "https://fhir.nhs.uk/StructureDefinition/Extension-DM-PrescriptionId",
            "valueIdentifier": {
              system: 'https://fhir.nhs.uk/Id/prescription',
              value: identifier.value
            }
          }
        ]
      if (this.authorisedDate !== undefined) {

        medicationRequest.authoredOn = this.dlgSrv.getFHIRDateString(this.authorisedDate.toDate());
      }

    }

    switch(this.medicationStatus?.code) {
      case 'active' : {
        medicationRequest.status = 'active'
        break;
      }
      case 'on-hold' : {
        medicationRequest.status = 'on-hold'
        break;
      }
      case 'cancelled' : {
        medicationRequest.status = 'cancelled'
        break;
      }
      case 'completed' : {
        medicationRequest.status = 'completed'
        break;
      }
      case 'entered-in-error' : {
        medicationRequest.status = 'entered-in-error'
        break;
      }
      case 'stopped' : {
        medicationRequest.status = 'stopped'
        break;
      }
      case 'draft' : {
        medicationRequest.status = 'draft'
        break;
      }
      case 'unknown' : {
        medicationRequest.status = 'unknown'
        break;
      }



    }
    switch(this.medicationIntent?.code) {
      case 'proposal' : {
        medicationRequest.intent = 'proposal'
        break;
      }
      case 'plan' : {
        medicationRequest.intent = 'plan'
        break;
      }
      case 'order' : {
        medicationRequest.intent = 'order'
        break;
      }
      case 'original-order' : {
        medicationRequest.intent = 'original-order'
        break;
      }
      case 'reflex-order' : {
        medicationRequest.intent = 'reflex-order'
        break;
      }
      case 'filler-order' : {
        medicationRequest.intent = 'filler-order'
        break;
      }
      case 'instance-order' : {
        medicationRequest.intent = 'instance-order'
        break;
      }
      case 'option' : {
        medicationRequest.intent = 'option'
        break;
      }
    }
    if (this.medicationTherapy !== undefined) {

      medicationRequest.courseOfTherapyType = {
        coding : [this.medicationTherapy]
      };
    }
    if (this.medicationCategory !== undefined) {

      medicationRequest.category = [{
        coding : [this.medicationCategory]
      }];
    }
    medicationRequest.substitution = {
      allowedBoolean: false
    }
    console.log(JSON.stringify(medicationRequest));


    if (!this.edit) {
      this.fhirService.postTIE('/MedicationRequest', medicationRequest).subscribe((condition) => {
            this.diaglogRef.close(condition);
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
    } else {
      medicationRequest.id = this.medicationRequest.id
      this.fhirService.putTIE('/MedicationRequest/'+medicationRequest.id , medicationRequest).subscribe(result => {
            this.diaglogRef.close(result);
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
