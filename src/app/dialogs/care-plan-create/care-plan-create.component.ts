import {Component, Inject, OnInit} from '@angular/core';
import {Moment} from 'moment/moment';
import {CarePlan, CareTeam, Coding, Condition, ContactPoint, Extension, Reference, ValueSetExpansionContains} from 'fhir/r4';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {FhirService} from '../../services/fhir.service';
import {DialogService} from '../dialog.service';
import {Observable, Subject} from 'rxjs';
import {catchError, debounceTime, distinctUntilChanged, map, switchMap} from 'rxjs/operators';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import * as uuid from 'uuid';


@Component({
  selector: 'app-care-plan-create',
  templateUrl: './care-plan-create.component.html',
  styleUrls: ['./care-plan-create.component.scss']
})
export class CarePlanCreateComponent implements OnInit {
  disabled: boolean | undefined;
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
  private carePlanStatus: Coding | undefined;
  private carePlanIntent: Coding | undefined;
  private category: Coding | undefined;
  private condition: Coding | undefined;
  private searchCategories = new Subject<string>();
  private searchConditions = new Subject<string>();

  planTeams: CareTeam[] | undefined;
  planConditions: Condition[] | undefined;

  constructor(public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) data: any,
              public fhirService: FhirService,
              public dlgSrv: DialogService,
              private diaglogRef: MatDialogRef<CarePlanCreateComponent>) {
    this.patientId = data.patientId;
    this.nhsNumber = data.nhsNumber;
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
      )
    ), catchError(this.dlgSrv.handleError('getReasons', []));

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
      )
    ), catchError(this.dlgSrv.handleError('getReasons', []));
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
    if (value.length > 3) {
      this.searchCategories.next(value);
    }
  }
  searchCondition(value: string): void {
    if (value.length > 3) {
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
      switch (this.carePlanStatus.code) {
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
      switch (this.carePlanIntent.code) {
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
        identifier: {
          system: 'https://fhir.nhs.uk/Id/nhs-number',
          value: this.nhsNumber
        }
      };
    if (this.notes !== undefined) {
      carePlan.note = [
        {
          text: this.notes.trim()
        }
      ];
    }
    if (this.planTitle !== undefined) {
      carePlan.title = this.planTitle.trim();
    }
    if (this.planDescription !== undefined) {
      carePlan.description = this.planDescription.trim();
    }
    if (this.periodStart !== undefined) {
      console.log(this.periodStart);
      // @ts-ignore
      carePlan.period.start = this.periodStart.toISOString();
    }
    if (this.periodEnd !== undefined) {
      console.log(this.periodEnd);
      // @ts-ignore
      carePlan.period.end = this.periodEnd.toISOString();
    }
    console.log(carePlan);
    carePlan.created = new Date().toISOString();
    this.fhirService.postTIE('/CarePlan', carePlan).subscribe(result => {
      this.diaglogRef.close();
      this.dialog.closeAll();
    });
  }
}
