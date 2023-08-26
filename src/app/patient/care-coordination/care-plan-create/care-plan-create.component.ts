import {Component, Inject, OnInit} from '@angular/core';
import {Moment} from 'moment/moment';
import {
  CarePlan,
  CareTeam,
  Coding,
  Condition,
  Extension, Goal,
  Reference,
  Resource,
  ValueSetExpansionContains
} from 'fhir/r4';
import {FhirService} from '../../../services/fhir.service';
import {DialogService} from '../../../services/dialog.service';
import {Observable, Subject} from 'rxjs';
import {catchError, debounceTime, distinctUntilChanged, map, switchMap} from 'rxjs/operators';
import * as uuid from 'uuid';
import {TdDialogService} from "@covalent/core/dialogs";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";


@Component({
  selector: 'app-care-plan-create',
  templateUrl: './care-plan-create.component.html',
  styleUrls: ['./care-plan-create.component.scss']
})
export class CarePlanCreateComponent implements OnInit {
  disabled: boolean = true;
  patientId : string | undefined;
  nhsNumber : string | undefined;
  statuses: ValueSetExpansionContains[] | undefined;
  intents: ValueSetExpansionContains[] | undefined;
  categories$: Observable<ValueSetExpansionContains[]> | undefined;
  conditions$: Observable<ValueSetExpansionContains[]> | undefined;
  careTeams: CareTeam[] = [];
  conditions: Condition[] = [];
  planDescription: string | undefined;
  planTitle: string | undefined;
  periodStart: Moment | undefined;
  periodEnd: Moment | undefined;

  notes: string | undefined;
  carePlanStatus: string = 'active';
  carePlanIntent: string = 'plan';
  private category: Coding | undefined;
  private condition: Coding | undefined;
  private searchCategories = new Subject<string>();
  private searchConditions = new Subject<string>();

  planTeams: CareTeam[] | undefined;
  planConditions: Condition[] | undefined;

  edit = false;
  supportingInformation: Resource[] = [];
  supporting: Resource[] = [];
  goals: Goal[] = [];
  allGoals: Goal[] = [];

  constructor(public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) data: any,
              public fhirService: FhirService,
              public dlgSrv: DialogService,
              private _dialogService: TdDialogService,
              private diaglogRef: MatDialogRef<CarePlanCreateComponent>) {
    this.patientId = data.patientId;
   // this.nhsNumber = data.nhsNumber;
  }

  ngOnInit(): void {
    this.fhirService.getConf('/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/request-status').subscribe(
      resource  => {
        this.statuses = this.dlgSrv.getContainsExpansion(resource);
      }
    );
    this.fhirService.getConf('/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/care-plan-intent').subscribe(
      resource  => {
        this.intents = this.dlgSrv.getContainsExpansion(resource);
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
            // @ts-ignore
            if (entry.resource.resourceType === 'Condition') { this.conditions.push(entry.resource as Condition); }
          }
        }
      }
    );

    // Supporting Infor resources

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
    this.fhirService.getTIE('/Goal?patient=' + this.patientId).subscribe(bundle => {
          if (bundle.entry !== undefined) {
            for (const entry of bundle.entry) {
              if (entry.resource !== undefined && entry.resource.resourceType === 'Goal') { this.allGoals.push(entry.resource); }
            }
          }
        }
    );

    this.categories$ = this.searchCategories.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => {
          return this.fhirService.searchConcepts(term, 'http://hl7.org/fhir/ValueSet/care-plan-category');
        }
      ),
      map(resource    => {
          return this.dlgSrv.getContainsExpansion(resource);
        }
        ), catchError(this.dlgSrv.handleError('getReasons', [])));

    this.conditions$ = this.searchConditions.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => {
          return this.fhirService.searchConcepts(term, 'https://fhir.hl7.org.uk/ValueSet/UKCore-ConditionCode');
        }
      ),
      map(resource    => {
          return this.dlgSrv.getContainsExpansion(resource);
        }
    ), catchError(this.dlgSrv.handleError('getReasons', [])));
  }

  selectedStatus(status: any): void {
    this.carePlanStatus = status.value;
    this.checkSubmit();
  }
  selectedIntent(intent: any): void {
    this.carePlanIntent = intent.value;
    this.checkSubmit();
  }

  checkSubmit(): void {
    this.disabled = true;
    if (
      this.carePlanStatus !== undefined && this.carePlanIntent !== undefined) {
      this.disabled = false;
    }
  }

  searchCategory(value: string): void {
    if (value.length > 2) {
      this.searchCategories.next(value);
    }
  }
  searchCondition(value: string): void {
    if (value.length > 2) {
      this.searchConditions.next(value);
    }
  }
  selectedCondition(event: MatAutocompleteSelectedEvent): void {
    this.condition = {
      system: event.option.value.system,
      code: event.option.value.code,
      display: event.option.value.display,
    };
    this.checkSubmit();
  }
  selectedCategory(event: MatAutocompleteSelectedEvent): void {
    this.category = {
      system: event.option.value.system,
      code: event.option.value.code,
      display: event.option.value.display,
    };
    this.checkSubmit();
  }
  submit(): void {
    const carePlan: CarePlan = {
      intent: "option",
      subject: {},
      identifier: [{
        system: 'https://tools.ietf.org/html/rfc4122',
        value: uuid.v4()
      }],
      period: {
      },
      addresses: [],
      category: [],
      careTeam: [],
      resourceType: 'CarePlan',
      status: 'active'
    };
    if (this.category !== undefined) {
      // @ts-ignore
      carePlan.category.push({
        coding: [
          this.category
        ]
      });
    }
    if (this.planTeams !== undefined && this.planTeams.length > 0) {
        for (const team of this.planTeams) {
            // @ts-ignore
          carePlan.careTeam.push({
              reference: 'CareTeam/' + team.id,
              display: team.name
            });
        }
    }
    if (this.planConditions !== undefined && this .planConditions.length > 0) {
      for (const condition of this.planConditions) {
        // @ts-ignore
        carePlan.addresses.push({reference: 'Condition/' + condition.id, display: this.fhirService.getCodeableConcept(condition.code)
        });
      }
    }
    if (this.condition !== undefined) {
       const reference: Reference = {
          display: this.condition.display,
         extension: []
       };
       const ext: Extension = {
         url: 'https://fhir.nhs.uk/StructureDefinition/CodeableReference',
         valueCodeableConcept: {
           coding: [
             this.condition
           ]
         }
       };
       // @ts-ignore
      reference.extension.push(ext);
       // @ts-ignore
      carePlan.addresses.push(reference);
    }
    if (this.carePlanStatus !== undefined) {
      switch (this.carePlanStatus) {
        case 'active' : {
          carePlan.status = 'active';
          break;
        }
        case 'completed' : {
          carePlan.status = 'completed';
          break;
        }
        case 'entered-in-error' : {
          carePlan.status = 'entered-in-error';
          break;
        }
        case 'on-hold' : {
          carePlan.status = 'on-hold';
          break;
        }
        case 'unknown' : {
          carePlan.status = 'unknown';
          break;
        }
        case 'draft' : {
          carePlan.status = 'draft';
          break;
        }
        case 'revoked' : {
          carePlan.status = 'revoked';
          break;
        }
      }
    }
    if (this.carePlanIntent !== undefined) {
      switch (this.carePlanIntent) {
        case 'proposal': {
          carePlan.intent = 'proposal';
          break;
        }
        case 'plan': {
          carePlan.intent = 'plan';
          break;
        }
        case 'order': {
          carePlan.intent = 'order';
          break;
        }
        case 'option': {
          carePlan.intent = 'option';
          break;
        }
      }
    }
    carePlan.subject = {
        reference: 'Patient/' + this.patientId,

      };
    if (this.nhsNumber !== undefined) {
      carePlan.subject.identifier =  {
        system: 'https://fhir.nhs.uk/Id/nhs-number',
            value: this.nhsNumber
      }
    }
    if (this.notes !== undefined && this.notes.trim() !== '') {
      carePlan.note = [
        {
          time: this.dlgSrv.getFHIRDateString(new Date()).split('T')[0],
          text: this.notes.trim()
        }
      ];
    }
    if (this.planTitle !== undefined) {
      carePlan.title = this.planTitle.trim();
    }
    if (this.planDescription !== undefined && this.planDescription.trim() !== '') {
      carePlan.description = this.planDescription.trim();
    }
    if (this.periodStart !== undefined) {
      console.log(this.periodStart);
      // @ts-ignore
      carePlan.period.start = this.dlgSrv.getFHIRDateString(this.periodStart);
    }
    if (this.periodEnd !== undefined) {
      console.log(this.periodEnd);
      // @ts-ignore
      carePlan.period.end = this.dlgSrv.getFHIRDateString(this.periodEnd);
    }
    if (this.supporting !== undefined && this.supporting.length>0) {
      carePlan.supportingInfo = [];
      this.supporting.forEach( resource => {

        var reference : Reference = {
          type: resource.resourceType,
          reference: resource.resourceType + '/' + resource.id,
          display: this.dlgSrv.getResourceDisplay(resource)
        }
        // @ts-ignore
        carePlan.supportingInfo.push(reference);
      })
    }
    if (this.goals !== undefined && this.goals.length>0) {
      carePlan.goal = [];
      this.goals.forEach( resource => {

        var reference : Reference = {
          type: resource.resourceType,
          reference: resource.resourceType + '/' + resource.id,
          display: this.dlgSrv.getResourceDisplay(resource)
        }
        // @ts-ignore
        carePlan.goal.push(reference);
      })
    }
    console.log(carePlan);
    carePlan.created = this.dlgSrv.getFHIRDateString(new Date());
    this.fhirService.postTIE('/CarePlan', carePlan).subscribe(result => {
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
