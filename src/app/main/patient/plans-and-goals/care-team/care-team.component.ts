import {Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {FhirService} from '../../../../services/fhir.service';
import {ResourceDialogComponent} from '../../../../dialogs/resource-dialog/resource-dialog.component';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {CareTeam} from "fhir/r4";


@Component({
  selector: 'app-care-team',
  templateUrl: './care-team.component.html',
  styleUrls: ['./care-team.component.css']
})
export class CareTeamComponent implements OnInit {

  @Input() careTeams: CareTeam[] = [];

  @Output() careTeam = new EventEmitter<any>();

  @Input() patientId: string | undefined;

  @Input() useBundle = false;

  // @ts-ignore
  dataSource: MatTableDataSource<CareTeam> ;
  @ViewChild(MatSort) sort: MatSort | undefined;

  displayedColumns = [ 'name', 'reason', 'start', 'end', 'members', 'organisation', 'contact',  'notes', 'status', 'resource'];

  constructor(public fhirService: FhirService, public dialog: MatDialog) { }

  ngOnInit(): void {
    if (this.patientId !== undefined) {
   //   this.dataSource = new CareTeamDataSource(this.fhirService, this.patientId, []);
    } else {
      this.dataSource = new MatTableDataSource<CareTeam>(this.careTeams);
     // this.dataSource = new CareTeamDataSource(this.fhirService, undefined, this.careTeams);
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

  ngOnChanges(changes: SimpleChanges) {

    if (changes['careTeams'] !== undefined) {
      this.dataSource = new MatTableDataSource<CareTeam>(this.careTeams);
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

  view(careTeam: CareTeam): void {
    this.careTeam.emit(careTeam);
  }
}
