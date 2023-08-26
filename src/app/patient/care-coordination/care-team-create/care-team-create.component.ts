import {Component, Inject, OnInit} from '@angular/core';
import {Coding, Organization, Practitioner, Reference, CareTeam, ValueSetExpansionContains, ContactPoint} from 'fhir/r4';
import {FhirService} from '../../../services/fhir.service';
import {DialogService} from '../../../services/dialog.service';
import {Observable, Subject} from 'rxjs';
import {MatLegacyAutocompleteSelectedEvent as MatAutocompleteSelectedEvent} from '@angular/material/legacy-autocomplete';
import {catchError, debounceTime, distinctUntilChanged, map, switchMap} from 'rxjs/operators';
import * as uuid from 'uuid';
import {Moment} from 'moment';
import {TdDialogService} from "@covalent/core/dialogs";
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-care-team-create',
  templateUrl: './care-team-create.component.html',
  styleUrls: ['./care-team-create.component.scss']
})
export class CareTeamCreateComponent implements OnInit {
  disabled: boolean = true;
  patientId = undefined;
  nhsNumber = undefined;
  status: ValueSetExpansionContains[] | undefined;
  organisation$: Observable<Organization[]> | undefined;
  practitioner$: Observable<Practitioner[]> | undefined;
  private careTeamStatus: Coding | undefined;
  private reasonCode: Coding | undefined;
  reason$: Observable<ValueSetExpansionContains[]> | undefined;
  private searchReasons = new Subject<string>();
  private searchTermsOrg = new Subject<string>();
  private searchTermsDoc = new Subject<string>();
  periodStart: Moment | undefined;
  periodEnd: Moment | undefined;
  teamName: string | undefined;
  notes: string | undefined;
  phone: string | undefined;

  private organisation: Organization | undefined;
  private practitioner: Practitioner | undefined;
  email: string | undefined;

  constructor(public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) data: any,
              public fhirService: FhirService,
              public dlgSrv: DialogService,
              private _dialogService: TdDialogService,
              private diaglogRef: MatDialogRef<CareTeamCreateComponent>) {
    this.patientId = data.patientId;
    this.nhsNumber = data.nhsNumber;
  }


  ngOnInit(): void {
    this.fhirService.getConf('/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/care-team-status').subscribe(
      resource  => {
        this.status = this.dlgSrv.getContainsExpansion(resource);
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
    this.organisation$ = this.searchTermsOrg.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => {
          return this.fhirService.getDirectory('/Organization?name=' + term);
        }
      ),

      map(resource    => {
          return this.dlgSrv.getContainsOrganisation(resource);
        }

    ), catchError(this.dlgSrv.handleError('getPractitioner', [])));
    this.practitioner$ = this.searchTermsDoc.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => {
          return this.fhirService.getDirectory('/Practitioner?name=' + term);
        }
      ),
      map(resource    => {
          return this.dlgSrv.getContainsPractitoner(resource);
        }

    ), catchError(this.dlgSrv.handleError('getPractitioner', [])));

  }

  selectedStatus(status: any): void {
    this.careTeamStatus = status.value;
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
  selectedOrg(event: MatAutocompleteSelectedEvent): void {
    this.organisation = event.option.value;
    this.checkSubmit();
  }
  selectedDr(event: MatAutocompleteSelectedEvent): void {
    this.practitioner = event.option.value;
    this.checkSubmit();
  }

  searchReason(term: string): void {
    if (term.length > 3) {
      this.searchReasons.next(term);
    }
  }
  searchOrg(value: string): void {
    if (value.length > 3) {
      this.searchTermsOrg.next(value);
    }
  }
  searchDoc(term: string): void {
    if (term.length > 3) {
      this.searchTermsDoc.next(term);
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
    const careTeam: CareTeam = {
      subject: undefined,
      identifier: [{
        system: 'https://tools.ietf.org/html/rfc4122',
        value: uuid.v4()
      }],
      period: {
      },
      category: [],
      telecom: [],
      managingOrganization: [],
      participant: [],
      resourceType: 'CareTeam',
      status: 'active',
      reasonCode: []
    };
    if (this.reasonCode !== undefined && careTeam.reasonCode !== undefined) {
      careTeam.reasonCode.push({
        coding: [
          this.reasonCode
        ]
      });
    }
    if (this.organisation !== undefined) {
      const reference: Reference = {
        reference: 'Organization/' + this.organisation.id,
        type: this.organisation.resourceType,
        display: this.dlgSrv.getResourceDisplay(this.organisation)
      };
      if (this.organisation.identifier !== undefined && this.organisation.identifier.length > 0) {
        reference.identifier = this.organisation.identifier[0];
      }

      if (careTeam.managingOrganization !== undefined) {careTeam.managingOrganization.push(reference);}
    }
    if (this.practitioner !== undefined) {
      const reference: Reference = {
        reference: 'Practitioner/' + this.practitioner.id
      };
      if (this.practitioner.identifier !== undefined && this.practitioner.identifier.length > 0) {
        reference.identifier = this.practitioner.identifier[0];
      }
      if (careTeam.participant !== undefined) careTeam.participant.push({
        member: reference
      });
    }
    if (this.careTeamStatus !== undefined) {
      switch (this.careTeamStatus.code) {
        case 'active' : {
          careTeam.status = 'active';
          break;
        }
        case 'proposed' : {
          careTeam.status = 'proposed';
          break;
        }
        case 'entered-in-error' : {
          careTeam.status = 'entered-in-error';
          break;
        }
        case 'suspended' : {
          careTeam.status = 'suspended';
          break;
        }
        case 'inactive' : {
          careTeam.status = 'inactive';
          break;
        }
      }
      careTeam.subject = {
        reference: 'Patient/' + this.patientId,
        identifier: {
          system: 'https://fhir.nhs.uk/Id/nhs-number',
          value: this.nhsNumber
        }
      };
      if (this.notes !== undefined) {
        careTeam.note = [
          {
            text: this.notes.trim()
          }
        ];
      }
      if (this.email !== undefined) {
         const contact: ContactPoint = {
           system: 'email',
           value: this.email.trim()
         };
        if (careTeam.telecom !== undefined) careTeam.telecom.push(contact);
      }
      if (this.phone !== undefined) {
        const contact: ContactPoint = {
          system: 'phone',
          value: this.phone.trim()
        };
        if (careTeam.telecom !== undefined) careTeam.telecom.push(contact);
      }
      if (this.teamName !== undefined) {
        careTeam.name = this.teamName.trim();
      }
      if (this.periodStart !== undefined) {
        console.log(this.periodStart);
        if (careTeam.period !== undefined) careTeam.period.start = this.dlgSrv.getFHIRDateString(this.periodStart.toDate());
      }
      if (this.periodEnd !== undefined) {
        console.log(this.periodEnd);
        if (careTeam.period !== undefined) careTeam.period.end = this.dlgSrv.getFHIRDateString(this.periodEnd.toDate());
      }
      console.log(careTeam);

      this.fhirService.postTIE('/CareTeam', careTeam).subscribe((careTeam) => {
        this.diaglogRef.close(careTeam);
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
