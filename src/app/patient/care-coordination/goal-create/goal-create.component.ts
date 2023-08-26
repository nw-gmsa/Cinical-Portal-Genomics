import {Component, Inject, OnInit} from '@angular/core';
import {Coding, Goal, GoalTarget, ValueSetExpansionContains} from "fhir/r4";
import {FhirService} from "../../../services/fhir.service";
import {DialogService} from "../../../services/dialog.service";
import * as uuid from "uuid";
import {catchError, debounceTime, distinctUntilChanged, map, switchMap} from "rxjs/operators";
import {Observable, Subject} from "rxjs";
import {Moment} from "moment";
import {TdDialogService} from "@covalent/core/dialogs";
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {MatTableDataSource} from "@angular/material/table";
import {MatSelectChange} from "@angular/material/select";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";

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

  description$: Observable<ValueSetExpansionContains[]> | undefined;
  description: Coding | undefined;
  private searchDescriptions = new Subject<string>();

  target: Coding | undefined;
  achievement: Coding | undefined;
  categories:  ValueSetExpansionContains[] | undefined;
  category: Coding[] = [];
  priority:  Coding| undefined;
  priorities: ValueSetExpansionContains[] | undefined;

  target$: Observable<ValueSetExpansionContains[]> | undefined;
  private searchTargets = new Subject<string>();


  goalStart: Moment | undefined;
  targetValue: string | undefined;

  goalTarget: GoalTarget[] = [];
  // @ts-ignore
  dataSource : MatTableDataSource<GoalTarget>;
  displayedColumns = ['measure','value'];
  goalStatusDate: Moment | undefined;
  statusReason: string | undefined;
  continuous: boolean = false;

  constructor(public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) data: any,
              public fhirService: FhirService,
              public dlgSrv: DialogService,
              private _dialogService: TdDialogService,
              private diaglogRef: MatDialogRef<GoalCreateComponent>) {
    this.patientId = data.patientId;
    this.nhsNumber = data.nhsNumber;
  }

  ngOnInit(): void {

    this.dataSource = new MatTableDataSource<GoalTarget>(this.goalTarget);

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

    ), catchError(this.dlgSrv.handleError('getReasons', [])));
    this.target$ = this.searchTargets.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term: string) => {
          return this.fhirService.searchConceptsInternational(term, 'http://hl7.org/fhir/ValueSet/observation-codes');
             // return this.fhirService.searchConcepts(term, 'https://fhir.hl7.org.uk/ValueSet/UKCore-ObservationType');
            }
        ),
        map(resource    => {
              return this.dlgSrv.getContainsExpansion(resource);
            }

    ), catchError(this.dlgSrv.handleError('getReasons', [])));
  }



  checkSubmit(): void {
    this.disabled = true;
    if (this.goalStatus !== undefined
       && this.description !== undefined
    ) {
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
    if (this.continuous) {

    }
    if (this.goalTarget.length > 0 ) {
      goal.target = [];
      this.goalTarget.forEach( (goalTarget) => {
        goal.target?.push(goalTarget)
      })

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
      goal.startDate = this.dlgSrv.getFHIRDateString(this.goalStart).split('T')[0];
    }
    if (this.goalStatusDate !== undefined) {

      // @ts-ignore
      goal.statusDate = this.dlgSrv.getFHIRDateString(this.goalStatusDate).split('T')[0];
    }
    if (this.statusReason !== undefined) {
      goal.statusReason = this.statusReason.trim()
    }

    goal.subject = {
      reference: 'Patient/' + this.patientId,
    };
    if (this.nhsNumber !== undefined) {
      goal.subject.identifier = {
        system: 'https://fhir.nhs.uk/Id/nhs-number',
            value: this.nhsNumber
      }
    }

    console.log(JSON.stringify(goal));
    this.fhirService.postTIE('/Goal', goal).subscribe(goal => {

      this.diaglogRef.close(goal);
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

  isDisabled() {
    if (this.target !== undefined && this.targetValue !== undefined) return false;
    return true;
  }

  addTarget() {
    if (this.target !== undefined) {
      let goalTarget: GoalTarget = {
        measure: {
          coding: [
            this.target
          ]
        },
        detailString: this.targetValue?.trim()
      }
      this.target = undefined;
      this.targetValue = undefined;
      this.dataSource = new MatTableDataSource<GoalTarget>(this.goalTarget);
      this.goalTarget.push(goalTarget)
    }
  }
}
