import {Component, Inject, OnInit} from '@angular/core';
import {
  Coding, Condition,
  Organization,
  Practitioner,
  ValueSetExpansionContains
} from "fhir/r4";
import {Observable, Subject} from "rxjs";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {FhirService} from "../../../../services/fhir.service";
import {DialogService} from "../../../../services/dialog.service";
import {catchError, debounceTime, distinctUntilChanged, map, switchMap} from "rxjs/operators";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import * as uuid from "uuid";
import {TdDialogService} from "@covalent/core/dialogs";
import {Moment} from "moment/moment";

@Component({
  selector: 'app-condition-create-edit',
  templateUrl: './condition-create-edit.component.html',
  styleUrls: ['./condition-create-edit.component.scss']
})
export class ConditionCreateEditComponent implements OnInit {
  disabled: boolean = true;
  patientId = undefined;
  nhsNumber = undefined;
  status: ValueSetExpansionContains[] | undefined;
  verification: ValueSetExpansionContains[] | undefined;
  severities: ValueSetExpansionContains[] | undefined;
  organisation$: Observable<Organization[]> | undefined;
  practitioner$: Observable<Practitioner[]> | undefined;
  private clinicalStatus: Coding | undefined;
  private verificationStatus: Coding | undefined;
  private severity: Coding | undefined;
  private reasonCode: Coding | undefined;
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
  }

  ngOnInit(): void {
    this.fhirService.getConf('/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/condition-clinical').subscribe(
        resource  => {
          this.status = this.dlgSrv.getContainsExpansion(resource);
        }
    );
    this.fhirService.getConf('/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/condition-ver-status').subscribe(
        resource  => {
          this.verification = this.dlgSrv.getContainsExpansion(resource);
        }
    );
    this.fhirService.getConf('/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/condition-severity').subscribe(
        resource  => {
          console.log(resource)
          this.severities = this.dlgSrv.getContainsExpansion(resource);
        }
    );
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
      identifier: [{
        system: 'https://tools.ietf.org/html/rfc4122',
        value: uuid.v4()
      }],
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
          code: this.verificationStatus.code
        }]
      };
    }
    if (this.severity !== undefined) {

      condition.severity = {
        coding : [this.severity]
      };
    }
      condition.subject = {
        reference: 'Patient/' + this.patientId,
        identifier: {
          system: 'https://fhir.nhs.uk/Id/nhs-number',
          value: this.nhsNumber
        }
      };
    if (this.onsetDate !== undefined) {
      console.log(this.onsetDate);
      condition.onsetDateTime = this.onsetDate.toISOString();
    }
    if (this.recordedDate !== undefined) {
      console.log(this.recordedDate);
      condition.recordedDate = this.recordedDate.toISOString();
    }
    if (this.abatementDate !== undefined) {
      console.log(this.abatementDate);
      condition.abatementDateTime = this.abatementDate.toISOString();
    }
      console.log(JSON.stringify(condition));

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
  ;

  }

}
