import {Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {Condition, Reference} from 'fhir/r4';
import {FhirService} from '../../../services/fhir.service';
import {ResourceDialogComponent} from '../../../dialogs/resource-dialog/resource-dialog.component';
import {MatLegacyTableDataSource as MatTableDataSource} from '@angular/material/legacy-table';
import {MatSort} from '@angular/material/sort';
import {DeleteComponent} from "../../../dialogs/delete/delete.component";
import {TaskCreateComponent} from "../../workflow/task-create/task-create.component";
import {ConditionCreateEditComponent} from "../condition-create-edit/condition-create-edit.component";
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
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

  displayedColumns = ['recorded','onset','abatement', 'clinicalstatus', 'code','severity', 'verificationstatus', 'resource'];

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

  ngOnChanges(changes: SimpleChanges) {

    if (changes['conditions'] !== undefined) {
      this.dataSource = new MatTableDataSource<Condition>(this.conditions);
    } else {

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


  delete(condition: Condition) {
    let dialogRef = this.dialog.open(DeleteComponent, {
      width: '250px',
      data:  condition
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('The dialog was closed ' + result);
        this.fhirService.deleteTIE('/Condition/'+condition.id).subscribe(result => {
          // @ts-ignore
          this.conditions.forEach((taskIt,index)=> {
            if (taskIt.id === condition.id) {
              // @ts-ignore
              this.conditions.splice(index, 1);
            }
          })
          this.dataSource = new MatTableDataSource<Condition>(this.conditions);
        })
      }
    });
  }

  edit(condition: Condition) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = '85%';
    dialogConfig.width = '50%';

    dialogConfig.data = {
      id: 1,
      patientId: this.patientId,
      condition: condition
    };
    const dialogRef = this.dialog.open( ConditionCreateEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      //console.log(result)
      if (result !== undefined && result.resourceType !== undefined) {
        // TODO need to update the local copy of this event
          this.condition.emit(result)
      }
    })
  }
}
