import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import { Goal} from "fhir/r4";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {ResourceDialogComponent} from "../../../../dialogs/resource-dialog/resource-dialog.component";
import {FhirService} from "../../../../services/fhir.service";

@Component({
  selector: 'app-goal',
  templateUrl: './goal.component.html',
  styleUrls: ['./goal.component.scss']
})
export class GoalComponent implements OnInit {

  @Input() goals: Goal[] | undefined;

  @Output() goal = new EventEmitter<any>();

  @Input() patientId: string | undefined;

  @Input() useBundle = false;

  // @ts-ignore
  dataSource : MatTableDataSource<Goal>;
  @ViewChild(MatSort) sort: MatSort | undefined;

  displayedColumns = [ 'start', 'status', 'achievement', 'category', 'priority', 'description', 'targets', 'resource'];


  constructor(

      public fhirService: FhirService,
      public dialog: MatDialog) { }

  ngOnInit(): void {

    if (this.patientId !== undefined) {
      // this.dataSource = new CarePlanDataSource(this.fhirService, this.patientId, []);
    } else {
      this.dataSource = new MatTableDataSource<Goal>(this.goals);

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
}
