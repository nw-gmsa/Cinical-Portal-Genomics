import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import { Encounter, Patient} from 'fhir/r4';
import {FhirService} from '../../../../services/fhir.service';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {ResourceDialogComponent} from '../../../../dialogs/resource-dialog/resource-dialog.component';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';



@Component({
  selector: 'app-encounter',
  templateUrl: './encounter.component.html',
  styleUrls: ['./encounter.component.css']
})
export class EncounterComponent implements OnInit {

  @Input() encounters: Encounter[] | undefined;
  @Input() showDetail = false;

  @Input() patient: Patient | undefined;

  @Output() encounter = new EventEmitter<any>();


  @Input() patientId: string | undefined;

  @Input() useBundle = false;

  // @ts-ignore
  dataSource: MatTableDataSource<Encounter>;
  @ViewChild(MatSort) sort: MatSort | undefined;

  displayedColumns = ['select', 'start', 'end', 'status', 'class', 'type', 'provider',
    'participant',  'location',  'resource'];

  constructor(public fhirService: FhirService,
              public dialog: MatDialog) { }

  ngOnInit() {
    if (this.patientId !== undefined) {
     // this.dataSource = new EncounterDataSource(this.fhirService, this.patientId, []);
    } else {
      this.dataSource = new MatTableDataSource<Encounter>(this.encounters);
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


  selectEncounter(encounter: Encounter) {
        this.encounter.emit(encounter);
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
