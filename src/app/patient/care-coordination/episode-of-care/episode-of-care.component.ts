import {Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {EpisodeOfCare, Patient} from 'fhir/r4';
import {FhirService} from '../../../services/fhir.service';
import {ResourceDialogComponent} from '../../../dialogs/resource-dialog/resource-dialog.component';
import {MatLegacyTableDataSource as MatTableDataSource} from '@angular/material/legacy-table';
import {MatSort} from '@angular/material/sort';
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
@Component({
  selector: 'app-episode-of-care',
  templateUrl: './episode-of-care.component.html',
  styleUrls: ['./episode-of-care.component.scss']
})
export class EpisodeOfCareComponent implements OnInit {

  @Input() episodes: EpisodeOfCare[] = [];

   @Input() showDetail = false;

  @Input() patient: Patient | undefined;

  @Output() episodeOfCare = new EventEmitter<any>();


  @Input() patientId: string | undefined;

  @Input() useBundle = false;

  // @ts-ignore
  dataSource: MatTableDataSource<EpisodeOfCare>;
  @ViewChild(MatSort) sort: MatSort | undefined;

  displayedColumns = [ 'start', 'end', 'status',  'type', 'diagnosis', 'referral', 'provider', 'manager', 'team',
      'resource'];

  constructor(public fhirService: FhirService,
              public dialog: MatDialog) { }

  ngOnInit(): void {
    if (this.patientId !== undefined) {
    //  this.dataSource = new EpisodeOfCareDataSource(this.fhirService, this.patientId, []);
    } else {
      this.dataSource = new MatTableDataSource<EpisodeOfCare>(this.episodes);
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

    if (changes['episodes'] !== undefined) {
      this.dataSource = new MatTableDataSource<EpisodeOfCare>(this.episodes);
    } else {

    }
  }

  selectEpisodeOfCare(episodeOfCare: EpisodeOfCare): void {
    this.episodeOfCare.emit(episodeOfCare);
  }
  select(resource: any): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      id: 1,
      resource
    };
    this.dialog.open( ResourceDialogComponent, dialogConfig);
  }
}
