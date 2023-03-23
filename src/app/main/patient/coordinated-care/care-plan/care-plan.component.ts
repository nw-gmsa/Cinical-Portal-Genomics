import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';

import {FhirService} from '../../../../services/fhir.service';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {ResourceDialogComponent} from '../../../../dialogs/resource-dialog/resource-dialog.component';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {CarePlan} from "fhir/r4";


@Component({
  selector: 'app-care-plan',
  templateUrl: './care-plan.component.html',
  styleUrls: ['./care-plan.component.css']
})
export class CarePlanComponent implements OnInit {

    @Input() carePlans: CarePlan[] | undefined;

    @Output() carePlan = new EventEmitter<any>();

    @Input() patientId: string | undefined;

    @Input() useBundle = false;

  // @ts-ignore
    dataSource : MatTableDataSource<CarePlan>;
  @ViewChild(MatSort) sort: MatSort | undefined;

    displayedColumns = [ 'start', 'end', 'title', 'category', 'status', 'intent', 'addresses', 'team', 'notes', 'description', 'resource'];

    constructor(

                   public fhirService: FhirService,
                   public dialog: MatDialog) { }

    ngOnInit(): void {

        if (this.patientId !== undefined) {
           // this.dataSource = new CarePlanDataSource(this.fhirService, this.patientId, []);
        } else {
          this.dataSource = new MatTableDataSource<CarePlan>(this.carePlans);

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

    view(carePlan: CarePlan): void {
        this.carePlan.emit(carePlan);
    }
}
