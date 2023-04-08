import {Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';

import {FhirService} from '../../../../services/fhir.service';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {ResourceDialogComponent} from '../../../../dialogs/resource-dialog/resource-dialog.component';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {CarePlan} from "fhir/r4";
import {DeleteComponent} from "../../../../dialogs/delete/delete.component";


@Component({
  selector: 'app-care-plan',
  templateUrl: './care-plan.component.html',
  styleUrls: ['./care-plan.component.css']
})
export class CarePlanComponent implements OnInit {

    @Input() carePlans: CarePlan[] = [];

    @Output() carePlan = new EventEmitter<any>();

    @Input() patientId: string | undefined;

    @Input() useBundle = false;

  // @ts-ignore
    dataSource : MatTableDataSource<CarePlan>;
  @ViewChild(MatSort) sort: MatSort | undefined;

    displayedColumns = [ 'created', 'start', 'end', 'title', 'category',  'addresses', 'team', 'notes', 'description','status', 'intent', 'resource'];

    constructor(

                   public fhirService: FhirService,
                   public dialog: MatDialog) { }

    ngOnInit(): void {
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
}
