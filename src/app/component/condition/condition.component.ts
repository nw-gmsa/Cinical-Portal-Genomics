import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {Condition, Reference} from 'fhir/r4';
import {FhirService} from '../../services/fhir.service';
import {ResourceDialogComponent} from '../../dialogs/resource-dialog/resource-dialog.component';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';

@Component({
  selector: 'app-condition',
  templateUrl: './condition.component.html',
  styleUrls: ['./condition.component.css']
})
export class ConditionComponent implements OnInit {

  @Input() conditions: Condition[] | undefined;

  @Output() condition = new EventEmitter<Condition>();

  @Output() encounter = new EventEmitter<Reference>();

  @Input() patientId: string | undefined;

  @Input() useBundle :boolean = false;

  // @ts-ignore
  dataSource : MatTableDataSource<Condition>;
  @ViewChild(MatSort) sort: MatSort | undefined;

  displayedColumns = ['asserted','onset','clinicalstatus', 'code','category', 'verificationstatus', 'asserter', 'resource'];

  constructor(
              public dialog: MatDialog,
              public fhirService: FhirService) { }

  ngOnInit() {
    if (this.patientId !== undefined) {
     // this.dataSource = new ConditionDataSource(this.fhirService, this.patientId, []);
    } else {
      this.dataSource = new MatTableDataSource<Condition>(this.conditions);
     // this.dataSource = new ConditionDataSource(this.fhirService, undefined, this.conditions);
    }
  }
  ngAfterViewInit() {
    if (this.sort != undefined) {
      this.sort.sortChange.subscribe((event) => {
        console.log(event);
      });
      // @ts-ignore
      this.dataSource.sort = this.sort;
    } else {
      console.log('SORT UNDEFINED');
    }
  }
  select(resource: any) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      id: 1,
      resource: resource
    };
    this.dialog.open( ResourceDialogComponent, dialogConfig);
  }



}
