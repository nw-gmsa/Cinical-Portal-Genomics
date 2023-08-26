import {Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {Goal, Patient} from "fhir/r4";
import {MatLegacyTableDataSource as MatTableDataSource} from "@angular/material/legacy-table";
import {MatSort} from "@angular/material/sort";
import {ResourceDialogComponent} from "../../../dialogs/resource-dialog/resource-dialog.component";
import {FhirService} from "../../../services/fhir.service";
import {DeleteComponent} from "../../../dialogs/delete/delete.component";
import {EprService} from "../../../services/epr.service";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-goal',
  templateUrl: './goal.component.html',
  styleUrls: ['./goal.component.scss']
})
export class GoalComponent implements OnInit {

  @Input() goals: Goal[] = [];

  @Output() goal = new EventEmitter<any>();
  patientId: string | undefined;
  private nhsNumber: string | undefined;

  @Input() useBundle = false;

  // @ts-ignore
  dataSource : MatTableDataSource<Goal>;
  @ViewChild(MatSort) sort: MatSort | undefined;

  displayedColumns = [ 'start', 'category', 'priority', 'description', 'targets','status', 'achievement',  'resource'];


  constructor(

      public fhirService: FhirService,
      private eprService: EprService,
      public dialog: MatDialog) { }

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
      this.dataSource = new MatTableDataSource<Goal>(this.goals);


  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes['goals'] !== undefined) {
      this.dataSource = new MatTableDataSource<Goal>(this.goals);
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
    }
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
  delete(goal: Goal) {
    let dialogRef = this.dialog.open(DeleteComponent, {
      width: '250px',
      data:  goal
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('The dialog was closed ' + result);
        this.fhirService.deleteTIE('/Goal/'+goal.id).subscribe(result => {
          this.goals.forEach((taskIt,index)=> {
            if (taskIt.id === goal.id) {
              this.goals.splice(index, 1);
            }
          })
          this.dataSource = new MatTableDataSource<Goal>(this.goals);
        })
      }
    });
  }
}
