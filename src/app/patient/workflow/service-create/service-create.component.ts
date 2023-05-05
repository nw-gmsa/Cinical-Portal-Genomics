import {Component, Inject, OnInit} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {
  CarePlan,
  CareTeam,
  Coding,
  Organization,
  Practitioner,
  Reference, Resource,
  ServiceRequest,
  ValueSetExpansionContains
} from 'fhir/r4';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {FhirService} from '../../../services/fhir.service';
import {catchError, debounceTime, distinctUntilChanged, map, switchMap} from 'rxjs/operators';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import * as uuid from 'uuid';
import {MatSelectChange} from '@angular/material/select';
import {DialogService} from '../../../services/dialog.service';

@Component({
  selector: 'app-service-create',
  templateUrl: './service-create.component.html',
  styleUrls: ['./service-create.component.scss']
})
export class ServiceCreateComponent implements OnInit {

  contains$: Observable<ValueSetExpansionContains[]> | undefined;
  reason$: Observable<ValueSetExpansionContains[]> | undefined;

  performer$: Observable<ValueSetExpansionContains[]> | undefined;
  organisation$: Observable<Organization[]> | undefined;

  intents: ValueSetExpansionContains[] | undefined;

  careTeams: CareTeam[] = [];
  conditions: Resource[] = [];
  carePlans: CarePlan[] = [];
  practitioner$: Observable<Practitioner[]> | undefined;
  status: ValueSetExpansionContains[] | undefined;

  priority: ValueSetExpansionContains[] | undefined;
  categories: ValueSetExpansionContains[] | undefined;
  private searchTerms = new Subject<string>();
  private searchReasons = new Subject<string>();

  private searchPerformers = new Subject<string>();
  private searchTermsOrg = new Subject<string>();
  private searchTermsDoc = new Subject<string>();

  private organisation: Organization | undefined;
  private practitioner: Practitioner | undefined;
  private serviceRequestCode: Coding | undefined;

  disabled: boolean = true;
  patientId = undefined;
  nhsNumber = undefined;
  notes: string | undefined;
  private category: Coding | undefined;
  private reasonCode: Coding | undefined;

  private performerCode: Coding | undefined;
  planTeams: CareTeam[] | undefined;
  planPlans: CarePlan[] | undefined;
  planConditions: Resource[] | undefined;
  careIntent: string = 'order';
  serviceRequestStatus: string = 'active';
  serviceRequestPriority: string = 'routine'

  serviceRequest: ServiceRequest | undefined;
  edit = false;
  supportingInformation: Resource[] = [];
  supporting: Resource[] = [];

  constructor(public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) data: any,
              public fhirService: FhirService,
              public dlgSrv: DialogService,
              private diaglogRef: MatDialogRef<ServiceCreateComponent>) {
    this.patientId = data.patientId;
    this.nhsNumber = data.nhsNumber;
    this.serviceRequest = data.serviceRequest;
    if (this.serviceRequest !== undefined) this.edit = true;
  }

  ngOnInit(): void {
    this.fhirService.getTIE('/CarePlan?patient=' + this.patientId).subscribe(bundle => {
        if (bundle.entry !== undefined) {
          for (const entry of bundle.entry) {
            if (entry.resource.resourceType === 'CarePlan') { this.carePlans.push(entry.resource as CarePlan); }
          }
        }
      }
    );
    this.fhirService.getConf('/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/request-intent').subscribe(
      resource  => {
        this.intents = this.dlgSrv.getContainsExpansion(resource);
      }
    );
    this.fhirService.getTIE('/CareTeam?patient=' + this.patientId).subscribe(bundle => {
        if (bundle.entry !== undefined) {
          for (const entry of bundle.entry) {
            if (entry.resource !== undefined && entry.resource.resourceType === 'CareTeam') { this.careTeams.push(entry.resource as CareTeam); }
          }
        }
      }
    );
    this.fhirService.get('/Condition?patient=' + this.patientId).subscribe(bundle => {
        if (bundle.entry !== undefined) {
          for (const entry of bundle.entry) {
            if (entry.resource !== undefined && entry.resource.resourceType === 'Condition') { this.conditions.push(entry.resource); }
          }
        }
      }
    );
    this.fhirService.get('/DiagnosticReport?patient=' + this.patientId).subscribe(bundle => {
        if (bundle.entry !== undefined) {
          for (const entry of bundle.entry) {
            if (entry.resource !== undefined && entry.resource.resourceType === 'DiagnosticReport') { this.conditions.push(entry.resource); }
          }
        }
      }
    );
    this.fhirService.get('/DocumentReference?patient=' + this.patientId).subscribe(bundle => {
          if (bundle.entry !== undefined) {
            for (const entry of bundle.entry) {
              if (entry.resource !== undefined && entry.resource.resourceType === 'DocumentReference') { this.supportingInformation.push(entry.resource); }
            }
          }
        }
    );
    this.fhirService.get('/QuestionnaireResponse?patient=' + this.patientId).subscribe(bundle => {
          if (bundle.entry !== undefined) {
            for (const entry of bundle.entry) {
              if (entry.resource !== undefined && entry.resource.resourceType === 'QuestionnaireResponse') { this.supportingInformation.push(entry.resource); }
            }
          }
        }
    );
    this.fhirService.getConf('/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/request-status').subscribe(
      resource  => {
        this.status = this.dlgSrv.getContainsExpansion(resource);
      }
    );
    this.fhirService.getConf('/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/request-priority').subscribe(
      resource  => {
        this.priority = this.dlgSrv.getContainsExpansion(resource);
      }
    );
    this.fhirService.getConf('/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/servicerequest-category').subscribe(
      resource  => {
        this.categories = this.dlgSrv.getContainsExpansion(resource);
      }
    );

    this.contains$ = this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => {
          return this.fhirService.searchConcepts(term, 'https://fhir.hl7.org.uk/ValueSet/UKCore-ProcedureCode');
        }
      ),
      map(resource    => {
          return this.dlgSrv.getContainsExpansion(resource);
        }

    ), catchError(this.dlgSrv.handleError('getPatients', [])));

    this.performer$ = this.searchPerformers.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => {
          return this.fhirService.searchConcepts(term, 'http://hl7.org/fhir/ValueSet/participant-role');
        }
      ),
      map(resource    => {
          return this.dlgSrv.getContainsExpansion(resource);
        }

    ), catchError(this.dlgSrv.handleError('getPatients', [])));

    this.reason$ = this.searchReasons.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => {
          return this.fhirService.searchConcepts(term, 'https://fhir.hl7.org.uk/ValueSet/UKCore-ServiceRequestReasonCode');
        }
      ),
      map(resource    => {
          return this.dlgSrv.getContainsExpansion(resource);
        }

    ), catchError(this.dlgSrv.handleError('getReasons', [])));

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

  }

  search(term: string): void {
    if (term.length > 3) {
      this.searchTerms.next(term);
    }
  }
  searchReason(term: string): void {
    if (term.length > 3) {
      this.searchReasons.next(term);
    }
  }
  searchPerformer(term: string): void {
    if (term.length > 3) {
      this.searchPerformers.next(term);
    }
  }
  searchDoc(term: string): void {
    if (term.length > 3) {
      this.searchTermsDoc.next(term);
    }
  }
  searchOrg(term: string): void {
    if (term.length > 3) {
      this.searchTermsOrg.next(term);
    }
  }

  selectedServiceRequest(event: MatAutocompleteSelectedEvent): void {
    this.serviceRequestCode = {
      system: event.option.value.system,
      code: event.option.value.code,
      display: event.option.value.display,
    };
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
  selectedPerformer(event: MatAutocompleteSelectedEvent): void {
    this.performerCode = {
      system: event.option.value.system,
      code: event.option.value.code,
      display: event.option.value.display,
    };
    this.checkSubmit();
  }
  selectedCategory(status: MatSelectChange): void {
    this.category = status.value;
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

  selectedStatus(status: any): void {
    console.log(status);
    this.serviceRequestStatus = status.value;
    this.checkSubmit();
  }
  selectedPriority(status: any): void {
    this.serviceRequestPriority = status.value;
    this.checkSubmit();
  }
  selectedIntent(intent: any): void {
    this.careIntent = intent.value;
    this.checkSubmit();
  }

  checkSubmit(): void {
    this.disabled = true;
    if (this.serviceRequestCode !== undefined &&
      (this.practitioner !== undefined || this.organisation !== undefined || (this.planTeams !== undefined && this.planTeams.length > 0)) &&
      this.serviceRequestStatus !== undefined) {
      this.disabled = false;
    }
  }

  submit(): void {
    const serviceRequest: ServiceRequest = {
      intent: 'order',
      basedOn: [],
      subject: {},
      identifier: [{
        system: 'https://tools.ietf.org/html/rfc4122',
        value: uuid.v4()
      }],
      category: [],
      performer: [],
      resourceType: 'ServiceRequest',
      status: 'active',

      reasonCode: [],
      reasonReference: []
    };
    if (this.serviceRequestCode) {
      serviceRequest.code = {
        coding: [
          this.serviceRequestCode
        ]
      }
    }
    if (serviceRequest.reasonCode !== undefined && this.reasonCode !== undefined) {
      serviceRequest.reasonCode.push({
        coding: [
          this.reasonCode
        ]
      });
    }
    if (this.organisation !== undefined && serviceRequest.performer !== undefined) {
      const reference: Reference = {
        reference: 'Organization/' + this.organisation.id,
        display: this.dlgSrv.getResourceDisplay(this.organisation)
      };
      if (this.organisation.identifier !== undefined && this.organisation.identifier.length > 0) {
        reference.identifier = this.organisation.identifier[0];
      }
      serviceRequest.performer.push(reference);
    }
    if (this.practitioner !== undefined && serviceRequest.performer !== undefined) {
      const reference: Reference = {
        reference: 'Practitioner/' + this.practitioner.id,
        display: this.dlgSrv.getResourceDisplay(this.practitioner)
      };
      if (this.practitioner.identifier !== undefined && this.practitioner.identifier.length > 0) {
        reference.identifier = this.practitioner.identifier[0];
      }
      serviceRequest.performer.push(reference);
    }
    if (this.serviceRequestPriority !== undefined) {
      switch (this.serviceRequestPriority) {
          case 'routine': {
            serviceRequest.priority = 'routine';
            break;
          }
        case 'urgent': {
          serviceRequest.priority = 'urgent';
          break;
        }
        case 'asap': {
          serviceRequest.priority = 'asap';
          break;
        }
        case 'stat': {
          serviceRequest.priority = 'stat';
          break;
        }
        }
    }
    if (this.careIntent !== undefined) {
      switch (this.careIntent) {
        case 'proposal': {
          serviceRequest.intent = 'proposal';
          break;
        }
        case 'plan': {
          serviceRequest.intent = 'plan';
          break;
        }
        case 'order': {
          serviceRequest.intent = 'order';
          break;
        }
        case 'option': {
          serviceRequest.intent = 'option';
          break;
        }
        case 'instance-order': {
          serviceRequest.intent = 'instance-order';
          break;
        }
        case 'filler-order': {
          serviceRequest.intent = 'filler-order';
          break;
        }
        case 'reflex-order': {
          serviceRequest.intent = 'reflex-order';
          break;
        }
        case 'original-order': {
          serviceRequest.intent = 'original-order';
          break;
        }
        case 'directive': {
          serviceRequest.intent = 'directive';
          break;
        }
      }
    }

      switch (this.serviceRequestStatus) {
        case 'active' : {
          serviceRequest.status = 'active';
          break;
        }
        case 'completed' : {
          serviceRequest.status = 'completed';
          break;
        }
        case 'entered-in-error' : {
          serviceRequest.status = 'entered-in-error';
          break;
        }
        case 'on-hold' : {
          serviceRequest.status = 'on-hold';
          break;
        }
        case 'unknown' : {
          serviceRequest.status = 'unknown';
          break;
        }
        case 'draft' : {
          serviceRequest.status = 'draft';
          break;
        }
        case 'revoked' : {
          serviceRequest.status = 'revoked';
          break;
        }
      }

    serviceRequest.subject = {
      reference: 'Patient/' + this.patientId,
      identifier: {
        system: 'https://fhir.nhs.uk/Id/nhs-number',
        value: this.nhsNumber
      }
    };
    if (this.notes !== undefined && this.notes.trim() !== '') {
      serviceRequest.note = [
        {
          time: new Date().toISOString().split('T')[0],
          text: this.notes.trim()
        }
      ];
    }
    if (this.category !== undefined && serviceRequest.category !== undefined) {
      serviceRequest.category.push({
        coding : [
          this.category
        ]
      });
    }
    if (this.performerCode !== undefined) {
      serviceRequest.performerType = {
        coding : [
          this.performerCode
        ]
      };
    }
    if (this.planPlans !== undefined && this.planPlans.length > 0 && serviceRequest.basedOn !== undefined) {
        for (const carePlan of this.planPlans) {
          const reference: Reference = {
            display: carePlan.title,
            reference: 'CarePlan/' + carePlan.id
          };
          serviceRequest.basedOn.push(reference);
        }
    }
    if (this.supporting !== undefined && this.supporting.length>0) {
      serviceRequest.supportingInfo = [];
      this.supporting.forEach( resource => {

        var reference : Reference = {
          type: resource.resourceType,
          reference: resource.resourceType + '/' + resource.id,
          display: this.dlgSrv.getResourceDisplay(resource)
        }
        // @ts-ignore
        serviceRequest.supportingInfo.push(reference);
      })
    }
    if (this.planTeams !== undefined && this.planTeams.length > 0 && serviceRequest.performer !== undefined) {
      for (const carePlan of this.planTeams) {
        const reference: Reference = {
          display: carePlan.name,
          reference: 'CareTeam/' + carePlan.id
        };
        serviceRequest.performer.push(reference);
      }
    }
    if (this.planConditions !== undefined && this.planConditions.length > 0 && serviceRequest.reasonReference !== undefined) {
      for (const carePlan of this.planConditions) {
        const reference: Reference = {
          display: this.dlgSrv.getResourceDisplay(carePlan),
          type: carePlan.resourceType,
          reference: carePlan.resourceType + '/' + carePlan.id
        };
        serviceRequest.reasonReference.push(reference);
      }
    }

    console.log(serviceRequest);
    serviceRequest.authoredOn = new Date().toISOString();
    this.fhirService.postTIE('/ServiceRequest', serviceRequest).subscribe((result) => {
      this.diaglogRef.close(result);
    });

  }


}
