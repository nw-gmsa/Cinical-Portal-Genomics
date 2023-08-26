import {Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';

import {FhirService} from '../../../services/fhir.service';
import {ResourceDialogComponent} from '../../../dialogs/resource-dialog/resource-dialog.component';
import {MatLegacyTableDataSource as MatTableDataSource} from '@angular/material/legacy-table';
import {MatSort} from '@angular/material/sort';
import {CarePlan, Goal, Patient, Reference} from "fhir/r4";
import {DeleteComponent} from "../../../dialogs/delete/delete.component";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {Router} from "@angular/router";
import {EprService} from "../../../services/epr.service";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-care-plan',
  templateUrl: './care-plan.component.html',
  styleUrls: ['./care-plan.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class CarePlanComponent implements OnInit {

    @Input() carePlans: CarePlan[] = [];

    @Output() carePlan = new EventEmitter<any>();

    goals: Goal[] = [];

    @Input() patientId: string | undefined;
  private nhsNumber: string | undefined;

    @Input() useBundle = false;

  // @ts-ignore
    dataSource : MatTableDataSource<CarePlan>;
  @ViewChild(MatSort) sort: MatSort | undefined;

  expandedElement: null | Goal | undefined;


  displayedColumns = [ 'created', 'start', 'end', 'title', 'category',   'team', 'description','status', 'intent', 'resource'];

  columnsToDisplayWithExpand = [...this.displayedColumns, 'expand'];

  constructor(
      private router: Router,
                   public fhirService: FhirService,
                   public dialog: MatDialog,
      private eprService: EprService) { }

    ngOnInit(): void {
      let patient = this.eprService.getPatient()
      if (patient !== undefined) {
        if (patient.id !== undefined) {
          this.patientId = patient.id
          this.getRecords(patient);
        }

      }
      this.eprService.patientChangeEvent.subscribe(patient => {
        if (patient.id !== undefined) this.patientId = patient.id

        this.getRecords(patient);
      });
        this.dataSource = new MatTableDataSource<CarePlan>(this.carePlans);
    }
  ngAfterViewInit(): void {
    if (this.sort !== undefined) {
      this.sort.sortChange.subscribe((event) => {
        console.log(event);
      });
      if (this.dataSource !== undefined) this.dataSource.sort = this.sort;
    } else {
      console.log('SORT UNDEFINED');
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    console.log('changed')
    if (changes['carePlans'] !== undefined) {
      this.dataSource = new MatTableDataSource<CarePlan>(this.carePlans);
    } else {

    }
  }

  private getRecords(patient : Patient) {
    if (patient !== undefined) {
      this.patientId = patient.id;
      if (patient.identifier !== undefined) {
        for (const identifier of patient.identifier) {
          if (identifier.system !== undefined && identifier.system.includes('nhs-number')) {
            this.nhsNumber = identifier.value;
          }
        }
      }
      this.fhirService.getTIE('/Goal?patient=' + this.patientId).subscribe(bundle => {
            if (bundle.entry !== undefined) {
              for (const entry of bundle.entry) {
                if (entry.resource !== undefined && entry.resource.resourceType === 'Goal') { this.goals.push(entry.resource as Goal); }
              }
            }
          }
      );
    }
  }
  select(resource: any): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      id: 1,
      resource
    };
    const resourceDialog: MatDialogRef<ResourceDialogComponent> = this.dialog.open( ResourceDialogComponent, dialogConfig);
  }

    view(carePlan: CarePlan): void {
        this.carePlan.emit(carePlan);
    }

  delete(carePlan: CarePlan) {
    let dialogRef = this.dialog.open(DeleteComponent, {
      width: '250px',
      data:  carePlan
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('The dialog was closed ' + result);
        this.fhirService.deleteTIE('/CarePlan/'+carePlan.id).subscribe(result => {
          this.carePlans.forEach((taskIt,index)=> {
            if (taskIt.id === carePlan.id) {
              this.carePlans.splice(index, 1);
            }
          })
          this.dataSource = new MatTableDataSource<CarePlan>(this.carePlans);
        })
      }
    });
  }

  onClick(supportingInfo: Reference) {
    if (supportingInfo.type !== undefined && supportingInfo.reference !== undefined) {
      const id = supportingInfo.reference.split('/')[1];
      console.log(id);
      if (supportingInfo.type === 'DocumentReference') this.router.navigate(['/patient', this.patientId, 'documents', id])
      if (supportingInfo.type === 'QuestionnaireResponse') this.router.navigate(['/patient', this.patientId, 'forms', id])
    }
  }

    getTasks(carePlan1: CarePlan) {
        let goals: Goal[] = []
        if (carePlan1.goal !== undefined) {
          carePlan1.goal.forEach(goal => {
            this.goals.forEach( goalResource => {
              if (goal.reference?.includes(<string>goalResource.id)) {
                goals.push(goalResource)
              }
            })
          })
        }
        return goals;
    }
}
