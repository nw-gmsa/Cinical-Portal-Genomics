import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {DiagnosticReport} from 'fhir/r4';
import {FhirService} from '../../../services/fhir.service';
import {ResourceDialogComponent} from '../../../dialogs/resource-dialog/resource-dialog.component';
import {MatSort} from '@angular/material/sort';
import {Router} from "@angular/router";
import {DialogService} from "../../../services/dialog.service";
import {DeleteComponent} from "../../../dialogs/delete/delete.component";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {MatPaginator} from "@angular/material/paginator";
import {MatTableDataSource} from "@angular/material/table";
import {environment} from "../../../../environments/environment";
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

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;

  displayedColumns = ['effectiveDateTime', 'code',  'category', 'status', 'performer',  'resource'];

  constructor(public fhirService: FhirService,
              public dlgSrv: DialogService,
              private router: Router,
              public dialog: MatDialog) { }

  ngOnInit() {

    if (this.patientId !== undefined) {
     // this.dataSource = new DiagnosticReportDataSource(this.fhirService, this.patientId, []);
    } else {
      this.dataSource = new MatTableDataSource<DiagnosticReport>(this.diagnosticReports);
      this.dataSource.filterPredicate = (data: DiagnosticReport, filter: string) => {
        const search = this.fhirService.getCodeableConceptValue(data.code).toLowerCase();
        return search.indexOf(filter) != -1;
      }
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
    if (this.dataSource !== undefined && this.paginator !== undefined) this.dataSource.paginator = this.paginator;
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'effectiveDateTime': {
          if (item.effectiveDateTime !== undefined) {

            return item.effectiveDateTime
          }
          if (item.effectivePeriod !== undefined) {

            if (item.effectivePeriod?.end !== undefined) {
              return item.effectivePeriod?.end

            }
            if (item.effectivePeriod?.start !== undefined) { // @ts-ignore

              return item.effectivePeriod?.start
            }
          }
          return '';
        }
        case 'code': {
          return this.fhirService.getCodeableConceptValue(item.code)
        }
        default: {
          return ''
        }
      };
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
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

  delete(diagnosticReport: DiagnosticReport) {
    let dialogRef = this.dialog.open(DeleteComponent, {
      width: '250px',
      data:  diagnosticReport
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        this.fhirService.deleteTIE('/DiagnosticReport/'+diagnosticReport.id).subscribe(result => {

          if (this.diagnosticReports !== undefined) {
            this.diagnosticReports.forEach((taskIt, index) => {
              if (taskIt.id === diagnosticReport.id) {
                // @ts-ignore
                this.diagnosticReports.splice(index, 1);
              }
            })
            this.dataSource = new MatTableDataSource<DiagnosticReport>(this.diagnosticReports);
          }
        })
      }
    });
  }

    selecReport(diagnosticReport : DiagnosticReport) {

      if (diagnosticReport.code.coding !== undefined) {
        this.router.navigate(['/patient', diagnosticReport.subject?.reference?.replace('Patient/',''), 'report', diagnosticReport.id])
      }

    }

  protected readonly performance = performance;
  protected readonly environment = environment;
}
