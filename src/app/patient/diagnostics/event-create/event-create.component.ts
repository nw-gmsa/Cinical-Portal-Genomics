import {Component, EventEmitter, Inject, OnInit} from '@angular/core';
import {
  Coding, 
  Observation,
  ValueSetExpansionContains
} from "fhir/r4";
import {Observable, Subject} from "rxjs";
import {Moment} from "moment/moment";
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef} from "@angular/material/legacy-dialog";
import {FhirService} from "../../../services/fhir.service";
import {DialogService} from "../../../services/dialog.service";
import {TdDialogService} from "@covalent/core/dialogs";
import {MatLegacyAutocompleteSelectedEvent as MatAutocompleteSelectedEvent} from "@angular/material/legacy-autocomplete";
import {catchError, debounceTime, distinctUntilChanged, map, switchMap} from "rxjs/operators";
import * as uuid from "uuid";

@Component({
  selector: 'app-event-create',
  templateUrl: './event-create.component.html',
  styleUrls: ['./event-create.component.scss']
})
export class EventCreateComponent implements OnInit {



  edit = false;
  observation: Observation;
  disabled: boolean = true;
  patientId = undefined;
  nhsNumber = undefined;
  status: ValueSetExpansionContains[] | undefined;


  severity: Coding | undefined;
  reasonCode: Coding | undefined;
  reason$: Observable<ValueSetExpansionContains[]> | undefined;
  private searchReasons = new Subject<string>();

  effectiveDate: Moment | undefined;
  constructor(public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) data: any,
              public fhirService: FhirService,
              public dlgSrv: DialogService,
              private _dialogService: TdDialogService,
              private diaglogRef: MatDialogRef<EventCreateComponent>) {
    this.patientId = data.patientId;
    this.nhsNumber = data.nhsNumber;
    this.observation = data.observation; }

  ngOnInit(): void {

    this.reason$ = this.searchReasons.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term: string) => {
              return this.fhirService.searchSNOMEDConcepts(term);
            }
        ),
        map(resource    => {
              return this.dlgSrv.getContainsExpansion(resource);
            }
        ),
        catchError(this.dlgSrv.handleError('getReasons', [])))
    ;
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
    const observation: Observation = {
      code: {},
      subject: {},
      resourceType: 'Observation',
      status: "final"
    };
    if (this.reasonCode !== undefined ) {
      observation.code = {
        coding: [
          this.reasonCode
        ]
      };
    }

    if (this.edit) {
      observation.subject = this.observation.subject
      observation.identifier = this.observation.identifier
      observation.effectiveDateTime = this.observation.effectiveDateTime
    } else {
      observation.subject = {
        reference: 'Patient/' + this.patientId,
        identifier: {
          system: 'https://fhir.nhs.uk/Id/nhs-number',
          value: this.nhsNumber
        }
      };
      observation.identifier = [{
        system: 'https://tools.ietf.org/html/rfc4122',
        value: uuid.v4()
      }]
      if (this.effectiveDate !== undefined) {

        observation.effectiveDateTime = this.dlgSrv.getFHIRDateString(this.effectiveDate.toDate());
      } else {
        observation.effectiveDateTime = this.dlgSrv.getFHIRDateString(new Date())
      }
    }

    console.log(JSON.stringify(observation));


    if (!this.edit) {
      this.fhirService.postTIE('/Observation', observation).subscribe((observation) => {
            this.diaglogRef.close(observation);
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
      observation.id = this.observation.id
      this.fhirService.putTIE('/Observation/'+observation.id , observation).subscribe(result => {
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
