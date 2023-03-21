import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';

import {AllergyIntolerance, Observation} from 'fhir/r4';
import {FhirService} from '../../services/fhir.service';
import {ResourceDialogComponent} from '../../dialogs/resource-dialog/resource-dialog.component';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';


@Component({
  selector: 'app-allergy-intolerance',
  templateUrl: './allergy-intolerance.component.html',
  styleUrls: ['./allergy-intolerance.component.css']
})
export class AllergyIntoleranceComponent implements OnInit {

  @Input() allergies: AllergyIntolerance[] | undefined;

  @Output() allergy = new EventEmitter<any>();

  @Input() patientId: string | undefined;

  // @ts-ignore
  dataSource: MatTableDataSource<AllergyIntolerance>;
  @ViewChild(MatSort) sort: MatSort | undefined;
  displayedColumns = ['asserted','onset', 'code','category','type','reaction', 'clinicalstatus','verificationstatus', 'resource'];

  constructor(
              public dialog: MatDialog,
            public fhirService: FhirService
  ) { }

  ngOnInit() {
    if (this.patientId !== undefined) {
     // this.dataSource = new AllergyIntoleranceDataSource(this.fhirService, this.patientId, []);
    } else {
      this.dataSource = new MatTableDataSource<AllergyIntolerance>(this.allergies);
    }
  }

  ngAfterViewInit() {
    if (this.sort != undefined) {
      this.sort.sortChange.subscribe((event) => {
        console.log(event);
      });
      if (this.dataSource !== undefined) this.dataSource.sort = this.sort;
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
    const resourceDialog: MatDialogRef<ResourceDialogComponent> = this.dialog.open( ResourceDialogComponent, dialogConfig);
  }
}
