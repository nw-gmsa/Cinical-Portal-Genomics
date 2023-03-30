import {Component, Inject, OnInit} from '@angular/core';
import {Coding, Goal, ValueSetExpansionContains} from "fhir/r4";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {FhirService} from "../../../../services/fhir.service";
import {DialogService} from "../../../../dialogs/dialog.service";
import * as uuid from "uuid";
import {MatSelectChange} from "@angular/material/select";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {catchError, debounceTime, distinctUntilChanged, map, switchMap} from "rxjs/operators";
import {Observable, Subject} from "rxjs";
import {Moment} from "moment";

@Component({
  selector: 'app-goal-create',
  templateUrl: './goal-create.component.html',
  styleUrls: ['./goal-create.component.scss']
})
export class GoalCreateComponent implements OnInit {

  disabled: boolean = true;
  patientId: string |  undefined;
  nhsNumber: string | undefined;
  statuses: ValueSetExpansionContains[] | undefined;
  achievements: ValueSetExpansionContains[] | undefined;
  goalStatus: string = 'active' ;
  description: Coding | undefined;
  target: Coding | undefined;
  achievement: Coding | undefined;
  categories:  ValueSetExpansionContains[] | undefined;
  category: Coding[] = [];
  priority:  Coding| undefined;
  priorities: ValueSetExpansionContains[] | undefined;
  description$: Observable<ValueSetExpansionContains[]> | undefined;
  target$: Observable<ValueSetExpansionContains[]> | undefined;
  private searchTargets = new Subject<string>();
  private searchDescriptions = new Subject<string>();

  goalStart: Moment | undefined;
  targetValue: string | undefined;

  constructor(public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) data: any,
              public fhirService: FhirService,
              public dlgSrv: DialogService,
              private diaglogRef: MatDialogRef<GoalCreateComponent>) {
    this.patientId = data.patientId;
    this.nhsNumber = data.nhsNumber;
  }

  ngOnInit(): void {
    this.fhirService.getConf('/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/goal-status').subscribe(
        resource  => {
          this.statuses = this.dlgSrv.getContainsExpansion(resource);
        }
    );
    this.fhirService.getConf('/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/goal-achievement').subscribe(
        resource  => {
          this.achievements = this.dlgSrv.getContainsExpansion(resource);
        }
    );
    this.fhirService.getConf('/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/goal-category').subscribe(
        resource  => {
          this.categories = this.dlgSrv.getContainsExpansion(resource);
        }
    );
    this.fhirService.getConf('/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/goal-priority').subscribe(
        resource  => {
          this.priorities = this.dlgSrv.getContainsExpansion(resource);
        }
    );
    this.description$ = this.searchDescriptions.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term: string) => {
              return this.fhirService.searchConcepts(term, 'http://hl7.org/fhir/ValueSet/clinical-findings');
            }
        ),
        map(resource    => {
              return this.dlgSrv.getContainsExpansion(resource);
            }
        )
    ), catchError(this.dlgSrv.handleError('getReasons', []));
    this.target$ = this.searchTargets.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term: string) => {
              return this.fhirService.searchConcepts(term, 'https://fhir.hl7.org.uk/ValueSet/UKCore-ObservationType');
            }
        ),
        map(resource    => {
              return this.dlgSrv.getContainsExpansion(resource);
            }
        )
    ), catchError(this.dlgSrv.handleError('getReasons', []));
  }



  checkSubmit(): void {
    this.disabled = true;
    if (
        this.goalStatus !== undefined && this.description !== undefined ) {
      this.disabled = false;
    }
  }

  submit(): void {
    const goal: Goal = {
      subject: {},
      identifier: [{
        system: 'https://tools.ietf.org/html/rfc4122',
        value: uuid.v4()
      }],
      resourceType: 'Goal',
      lifecycleStatus: 'active',
      description : {
      },
      target: [
      {}]
    };



    switch (this.goalStatus) {
      case 'active' : {
        goal.lifecycleStatus = 'active';
        break;
      }
      case 'proposed' : {
        goal.lifecycleStatus = 'proposed';
        break;
      }
      case 'planned' : {
        goal.lifecycleStatus = 'planned';
        break;
      }
      case 'accepted' : {
        goal.lifecycleStatus = 'accepted';
        break;
      }
      case 'on-hold' : {
        goal.lifecycleStatus = 'on-hold';
        break;
      }
      case 'completed' : {
        goal.lifecycleStatus = 'completed';
        break;
      }
      case 'cancelled' : {
        goal.lifecycleStatus = 'cancelled';
        break;
      }
      case 'entered-in-error' : {
        goal.lifecycleStatus = 'entered-in-error';
        break;
      }
      case 'rejected' : {
        goal.lifecycleStatus = 'rejected';
        break;
      }
    }
    
    if (this.achievement !== undefined) {
      goal.achievementStatus = {
        coding: [
        this.achievement
      ]
      }
    }
    if (this.category.length > 0) {
      goal.category = []
      for (const cat of this.category) {
          goal.category.push({
            coding: [
                cat
            ]
          })
      }
    }
    if (this.description !== undefined) {
      goal.description = {
        coding: [
            this.description
        ]
      }
    }
    if (this.target !== undefined && this.targetValue !== undefined) {
      // @ts-ignore
      goal.target[0] = {
        measure: {
          coding: [
            this.target
          ]
        },
        detailString: this.targetValue
      }
    }

    if (this.priority !== undefined) {
      goal.priority = {
        coding: [
          this.priority
        ]
      }
    }
    if (this.goalStart !== undefined) {

      // @ts-ignore
      goal.startDate = this.goalStart.toISOString().split('T')[0];
    }

    goal.subject = {
      reference: 'Patient/' + this.patientId,
      identifier: {
        system: 'https://fhir.nhs.uk/Id/nhs-number',
        value: this.nhsNumber
      }
    };

    console.log(JSON.stringify(goal));
    this.fhirService.postTIE('/Goal', goal).subscribe(result => {
      this.diaglogRef.close();
      this.dialog.closeAll();
    });
  }



  selectedCategory(status: MatSelectChange) {
    this.category = status.value;
    this.checkSubmit();
  }

  searchDescription(value: string) {
    if (value.length > 2) {
      this.searchDescriptions.next(value);
    }
  }
  searchTarget(value: string) {
    if (value.length > 2) {
      this.searchTargets.next(value);
    }
  }

  selectedDescription(event: MatAutocompleteSelectedEvent) {
    this.description = {
      system: event.option.value.system,
      code: event.option.value.code,
      display: event.option.value.display,
    };
    this.checkSubmit();
  }
  selectedTarget(event: MatAutocompleteSelectedEvent) {
    this.target = {
      system: event.option.value.system,
      code: event.option.value.code,
      display: event.option.value.display,
    };
    this.checkSubmit();
  }
}
