import {Component, Inject, OnInit} from '@angular/core';
import {
  Coding, Condition,
  Organization,
  Practitioner,
  ValueSetExpansionContains
} from "fhir/r4";
import {Observable, Subject} from "rxjs";
import {FhirService} from "../../../services/fhir.service";
import {DialogService} from "../../../services/dialog.service";
import {catchError, debounceTime, distinctUntilChanged, map, switchMap} from "rxjs/operators";
import {MatLegacyAutocompleteSelectedEvent as MatAutocompleteSelectedEvent} from "@angular/material/legacy-autocomplete";
import * as uuid from "uuid";
import {TdDialogService} from "@covalent/core/dialogs";
import {Moment} from "moment/moment";
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
@Component({
  selector: 'app-condition-create-edit',
  templateUrl: './condition-create-edit.component.html',
  styleUrls: ['./condition-create-edit.component.scss']
})
export class ConditionCreateEditComponent implements OnInit {
  edit = false;
  condition: Condition;
  disabled: boolean = true;
  patientId = undefined;
  nhsNumber = undefined;
  status: ValueSetExpansionContains[] | undefined;
  verification: ValueSetExpansionContains[] | undefined;
  severities: ValueSetExpansionContains[] = [
    {
      "system": "http://snomed.info/sct",
      "code": "6736007",
      "display": "Moderate"
    },
    {
      "system": "http://snomed.info/sct",
      "code": "255604002",
      "display": "Mild"
    },
    {
      "system": "http://snomed.info/sct",
      "code": "24484000",
      "display": "Severe"
    }
  ]
  organisation$: Observable<Organization[]> | undefined;
  practitioner$: Observable<Practitioner[]> | undefined;
  clinicalStatus: Coding | undefined;
  verificationStatus: Coding | undefined;
  severity: Coding | undefined;
  reasonCode: Coding | undefined;
  reason$: Observable<ValueSetExpansionContains[]> | undefined;
  private searchReasons = new Subject<string>();
  onsetDate: Moment | undefined;
  recordedDate: Moment | undefined;
  abatementDate: Moment | undefined;
  constructor(public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) data: any,
              public fhirService: FhirService,
              public dlgSrv: DialogService,
              private _dialogService: TdDialogService,
              private diaglogRef: MatDialogRef<ConditionCreateEditComponent>) {
    this.patientId = data.patientId;
    this.nhsNumber = data.nhsNumber;
    this.condition = data.condition;

    if (this.condition !== undefined) {
      this.edit = true;
    }

  }

  ngOnInit(): void {

    if (this.condition !== undefined) {

      // leave for now.... allow new new notes if (this.task.note !== undefined && this.task.note.length > 0)
      if (this.condition.code !== undefined && this.condition.code.coding !== undefined) {
        this.reasonCode = this.condition.code.coding[0]
        if (this.condition.severity !== undefined && this.condition.severity.coding !== undefined) {
          {
            for (let stat of this.severities) {
              if (this.condition.severity.coding[0].code === stat.code) {
                console.log('s fd')
                this.severity = stat
              }
            }
          }
        }
      }
    }


    this.fhirService.getConf('/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/condition-clinical').subscribe(
        resource  => {
          this.status = this.dlgSrv.getContainsExpansion(resource);
          if (this.edit && this.condition.clinicalStatus !== undefined && this.condition.clinicalStatus.coding !== undefined) {
              {
                for (let stat of this.status) {
                  if (this.condition.clinicalStatus.coding[0].code === stat.code) {
                    console.log('c fd')
                    this.clinicalStatus = stat
                  }
                }
            }
          }
        }
    );
    this.fhirService.getConf('/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/condition-ver-status').subscribe(
        resource  => {
          this.verification = this.dlgSrv.getContainsExpansion(resource);
          if (this.edit && this.condition.verificationStatus !== undefined && this.condition.verificationStatus.coding !== undefined) {
              for(let stat of this.verification) {
                if (this.condition.verificationStatus.coding[0].code === stat.code) {
                  console.log('v fd')
                  this.verificationStatus = stat
                }
              }
          }
        }
    );
    /*

    Not returning SNOMED terms
    this.fhirService.getConf('/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/condition-severity').subscribe(
        resource  => {
          console.log(JSON.stringify(resource))
          this.severities = this.dlgSrv.getContainsExpansion(resource);
        }
    );
*/

    this.reason$ = this.searchReasons.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term: string) => {
              return this.fhirService.searchConcepts(term, 'http://hl7.org/fhir/ValueSet/clinical-findings');
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
    this.clinicalStatus = status.value;
    this.checkSubmit();
  }
  selectedVerification(status: any): void {
    this.verificationStatus = status.value;
    this.checkSubmit();
  }
  selectedSeverity(status: any): void {
    this.severity = status.value;
    this.checkSubmit();
  }
  selectedReason(event: MatAutocompleteSelectedEvent): void {
    this.reasonCode = {
      system: event.option.value.system,
      code: event.option.value.code,
      display: event.option.value.display,
    };
    this.checkSubmit();
  }

  searchReason(term: string): void {
    if (term.length > 3) {
      this.searchReasons.next(term);
    }
  }

  checkSubmit(): void {
    this.disabled = true;
    if (
        this.reasonCode !== undefined) {
      this.disabled = false;
    }
  }

  submit(): void {
    const condition: Condition = {
      subject: {},
      category: [],
      resourceType: 'Condition',
      clinicalStatus: {
      }
    };
    if (this.reasonCode !== undefined ) {
      condition.code = {
        coding: [
          this.reasonCode
        ]
      };
    }
    if (this.edit) {
      condition.verificationStatus = this.condition.verificationStatus
      condition.severity = this.condition.severity
      condition.clinicalStatus = this.clinicalStatus
    }

    if (this.clinicalStatus !== undefined) {

      condition.clinicalStatus = {
        coding : [{
          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
          code: this.clinicalStatus.code
        }]
      };
    }
    if (this.verificationStatus !== undefined && this.abatementDate == undefined) {

      condition.verificationStatus = {
        coding : [{
          system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
          code: this.verificationStatus.code,
          display: this.verificationStatus.display
        }]
      };
    }
    if (this.clinicalStatus !== undefined) {

      condition.clinicalStatus = {
        coding : [{
          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
          code: this.clinicalStatus.code,
          display: this.clinicalStatus.display
        }]
      };
    }
    if (this.verificationStatus !== undefined  && this.verificationStatus.code === 'entered-in-error') {
      condition.clinicalStatus = undefined
    }
    if (this.severity !== undefined) {

      condition.severity = {
        coding : [this.severity]
      };
    }

    if (this.edit) {
      condition.subject = this.condition.subject
      condition.identifier = this.condition.identifier
      condition.onsetDateTime = this.condition.onsetDateTime
      condition.recordedDate = this.condition.recordedDate
    } else {
      condition.subject = {
        reference: 'Patient/' + this.patientId,
        identifier: {
          system: 'https://fhir.nhs.uk/Id/nhs-number',
          value: this.nhsNumber
        }
      };
      condition.identifier = [{
        system: 'https://tools.ietf.org/html/rfc4122',
        value: uuid.v4()
      }]
      if (this.onsetDate !== undefined) {
        console.log(this.onsetDate);
        condition.onsetDateTime = this.dlgSrv.getFHIRDateString(this.onsetDate.toDate());
      }
      if (this.recordedDate !== undefined) {
        console.log(this.recordedDate);
        condition.recordedDate = this.dlgSrv.getFHIRDateString(this.recordedDate.toDate());
      }
    }
    if (this.abatementDate !== undefined) {
      console.log(this.abatementDate);
      condition.abatementDateTime = this.dlgSrv.getFHIRDateString(this.abatementDate.toDate());
    }
    console.log(JSON.stringify(condition));


    if (!this.edit) {
      this.fhirService.postTIE('/Condition', condition).subscribe((condition) => {
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
      condition.id = this.condition.id
      this.fhirService.putTIE('/Condition/'+condition.id , condition).subscribe(result => {
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
