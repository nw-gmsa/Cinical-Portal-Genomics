import {Component, Inject, OnInit} from '@angular/core';
import {
  EpisodeOfCare,
  CareTeam,
  Coding,
  Condition,
  ValueSetExpansionContains,
  ServiceRequest, Organization, Practitioner
} from 'fhir/r4';
import {Observable, Subject} from 'rxjs';
import {Moment} from 'moment';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {FhirService} from '../../../../services/fhir.service';
import {DialogService} from '../../../../dialogs/dialog.service';
import {catchError, debounceTime, distinctUntilChanged, map, switchMap} from 'rxjs/operators';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import * as uuid from 'uuid';

@Component({
  selector: 'app-episode-of-care-create',
  templateUrl: './episode-of-care-create.component.html',
  styleUrls: ['./episode-of-care-create.component.scss']
})
export class EpisodeOfCareCreateComponent implements OnInit {

  disabled: boolean = true;
  patientId: string |  undefined;
  nhsNumber: string | undefined;
  statuses: ValueSetExpansionContains[] | undefined;

  types: ValueSetExpansionContains[] | undefined;
  organisation$: Observable<Organization[]> | undefined;
  practitioner$: Observable<Practitioner[]> | undefined;
  careTeams: CareTeam[] = [];
  conditions: Condition[] = [];

  private searchTermsOrg = new Subject<string>();
  private searchTermsDoc = new Subject<string>();

  serviceRequests: ServiceRequest[] = [];
  periodStart: Moment | undefined;
  periodEnd: Moment | undefined;


  stayStatus: string = 'active' ;

  private stayType: Coding | undefined;
  stayServiceRequest: ServiceRequest[] | undefined;
  stayConditions: Condition[] | undefined;
  stayTeams: CareTeam[] | undefined;
  private organisation: Organization | undefined;
  private practitioner: Practitioner | undefined;

  constructor(public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) data: any,
              public fhirService: FhirService,
              public dlgSrv: DialogService,
              private diaglogRef: MatDialogRef<EpisodeOfCareCreateComponent>) {
    this.patientId = data.patientId;
    this.nhsNumber = data.nhsNumber;
  }

  ngOnInit(): void {
    this.fhirService.getConf('/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/episode-of-care-status').subscribe(
      resource  => {
        this.statuses = this.dlgSrv.getContainsExpansion(resource);
      }
    );
    this.fhirService.getConf('/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/episodeofcare-type').subscribe(
      resource  => {
        this.types = this.dlgSrv.getContainsExpansion(resource);
      }
    );
    this.fhirService.getTIE('/CareTeam?patient=' + this.patientId).subscribe(bundle => {
        if (bundle.entry !== undefined) {
          for (const entry of bundle.entry) {
            if (entry.resource.resourceType === 'CareTeam') { this.careTeams.push(entry.resource as CareTeam); }
          }
        }
      }
    );
    this.fhirService.get('/Condition?patient=' + this.patientId).subscribe(bundle => {
        if (bundle.entry !== undefined) {
          for (const entry of bundle.entry) {
            if (entry.resource !== undefined && entry.resource.resourceType === 'Condition') { this.conditions.push(entry.resource as Condition); }
          }
        }
      }
    );
    this.fhirService.get('/ServiceRequest?status=active,on-hold,draft&patient=' + this.patientId).subscribe(bundle => {
        if (bundle.entry !== undefined) {
          for (const entry of bundle.entry) {
            if (entry.resource !== undefined && entry.resource.resourceType === 'ServiceRequest') { this.serviceRequests.push(entry.resource); }
          }
        }
      }
    );
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
      )
    ), catchError(this.dlgSrv.handleError('getPractitioner', []));
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
      )
    ), catchError(this.dlgSrv.handleError('getPractitioner', []));

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

  selectedType(status: any): void {
    this.stayType = status.value;
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
  checkSubmit(): void {
    this.disabled = true;
    if (
      this.stayStatus !== undefined ) {
      this.disabled = false;
    }
  }

  submit(): void {
    const stay: EpisodeOfCare = {

      patient: {},
      identifier: [{
        system: 'https://tools.ietf.org/html/rfc4122',
        value: uuid.v4()
      }],
      period: {
      },
      diagnosis: [],
      referralRequest: [],
      team: [],
      resourceType: 'EpisodeOfCare',
      status: 'active',
      type: []
    };



       switch (this.stayStatus) {
         case 'active' : {
           stay.status = 'active';
           break;
         }
         case 'finished' : {
           stay.status = 'finished';
           break;
         }
         case 'entered-in-error' : {
           stay.status = 'entered-in-error';
           break;
         }
         case 'onhold' : {
           stay.status = 'onhold';
           break;
         }
         case 'waitlist' : {
           stay.status = 'waitlist';
           break;
         }
         case 'planned' : {
           stay.status = 'planned';
           break;
         }
         case 'cancelled' : {
           stay.status = 'cancelled';
           break;
         }
       }

    if (this.stayType !== undefined && stay.type !== undefined) {
     stay.type.push({
       coding: [
         this.stayType
       ]
     });
    }
    if (this.stayConditions !== undefined && this.stayConditions.length > 0 && stay.diagnosis !== undefined) {
      for (const condition of this.stayConditions) {
        stay.diagnosis.push({
          condition: {
            reference: 'Condition/' + condition.id,
            display: this.fhirService.getCodeableConcept(condition.code)
          }
        });
      }
    }
    stay.patient = {
      reference: 'Patient/' + this.patientId,
      identifier: {
        system: 'https://fhir.nhs.uk/Id/nhs-number',
        value: this.nhsNumber
      }
    };
    if (this.organisation !== undefined ) {
        stay.managingOrganization = {
          reference: 'Organization/' + this.organisation.id,
          display: this.organisation.name
        };
    }
    if (this.periodStart !== undefined && stay.period !== undefined) {
      stay.period.start = this.periodStart.toISOString();
    }
    if (this.periodEnd !== undefined && stay.period !== undefined) {
      stay.period.end = this.periodEnd.toISOString();
    }
    if (this.stayServiceRequest !== undefined && this.stayServiceRequest.length > 0 && stay.referralRequest !== undefined) {
      for (const team of this.stayServiceRequest) {
        stay.referralRequest.push({
          reference: 'ServiceRequest/' + team.id,
          display: this.fhirService.getCodeableConceptValue(team.code)
        });
      }
    }
    if (this.practitioner !== undefined ) {
      stay.careManager = {
        reference: 'Practitioner/' + this.practitioner.id,
        display: this.fhirService.getIdentifiers(this.practitioner.identifier)
      };
      if (this.practitioner.identifier !== undefined && this.practitioner.identifier.length>0) {
        stay.careManager.identifier = {
          system: this.practitioner.identifier[0].system,
          value: this.practitioner.identifier[0].value,
        }
      }
    }
    if (this.stayTeams !== undefined && this.stayTeams.length > 0 && stay.team !== undefined) {
      for (const team of this.stayTeams) {
        stay.team.push({
          reference: 'CareTeam/' + team.id,
          display: team.name
        });
      }
    }
    console.log(stay);
    this.fhirService.postTIE('/EpisodeOfCare', stay).subscribe(result => {
      this.diaglogRef.close();
      this.dialog.closeAll();
    });
  }
}
