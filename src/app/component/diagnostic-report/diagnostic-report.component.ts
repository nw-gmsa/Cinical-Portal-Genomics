import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {DiagnosticReport, Observation} from 'fhir/r4';
import {FhirService} from '../../services/fhir.service';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {ResourceDialogComponent} from '../../dialogs/resource-dialog/resource-dialog.component';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';

@Component({
  selector: 'app-diagnostic-report',
  templateUrl: './diagnostic-report.component.html',
  styleUrls: ['./diagnostic-report.component.scss']
})
export class DiagnosticReportComponent implements OnInit {

  @Input() diagnosticReports: DiagnosticReport[] | undefined;

  @Input() showDetail = false;

  @Input() patientId: string | undefined;

  @Output() diagnosticReport = new EventEmitter<any>();


  @Input() useBundle = false;

  // @ts-ignore
  dataSource: MatTableDataSource<DiagnosticReport>;
  @ViewChild(MatSort) sort: MatSort | undefined;

  displayedColumns = ['date', 'code',  'category', 'status', 'performer', 'resource'];

  constructor(public fhirService: FhirService,
              public dialog: MatDialog) { }

  ngOnInit() {

    if (this.patientId !== undefined) {
     // this.dataSource = new DiagnosticReportDataSource(this.fhirService, this.patientId, []);
    } else {
      this.dataSource = new MatTableDataSource<DiagnosticReport>(this.diagnosticReports);
      //this.dataSource = new DiagnosticReportDataSource(this.fhirService, undefined, this.diagnosticReports);
    }

    // this.dataSource.connect(this.patientId);
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
