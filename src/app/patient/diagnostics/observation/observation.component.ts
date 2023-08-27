import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';

import {FhirService} from '../../../services/fhir.service';
import {Extension, Observation} from 'fhir/r4';
import {ResourceDialogComponent} from '../../../dialogs/resource-dialog/resource-dialog.component';
import {MatSort, Sort} from '@angular/material/sort';
import {LiveAnnouncer} from "@angular/cdk/a11y";
import {Router} from "@angular/router";
import {DeleteComponent} from "../../../dialogs/delete/delete.component";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";

@Component({
  selector: 'app-observation',
  templateUrl: './observation.component.html',
  styleUrls: ['./observation.component.css']
})
export class ObservationComponent implements OnInit {

  @Input() observations: Observation[] | undefined;

  @Input() showDetail = false;

  @Input() patientId: string | undefined;

  @Output() observation = new EventEmitter<any>();


  @Input() useBundle = false;

  // @ts-ignore
  dataSource: MatTableDataSource<Observation> ;
  @ViewChild(MatSort) sort: MatSort | undefined;
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  displayedColumns = ['effectiveDateTime', 'code', 'tags', 'category',  'value', 'performer', 'resource'];


  constructor(public fhirService: FhirService,
              public dialog: MatDialog,
              private router: Router,
              private _liveAnnouncer: LiveAnnouncer) { }

  ngOnInit(): void {

    if (this.patientId !== undefined) {
     // this.dataSource = new ObservationDataSource(this.fhirService, this.patientId, []);
    } else {
      this.dataSource = new MatTableDataSource<Observation>(this.observations);
      this.dataSource.filterPredicate = (data: Observation, filter: string) => {
        const search = this.fhirService.getCodeableConceptValue(data.code).toLowerCase();
        return search.indexOf(filter) != -1;
      }
    }

    // this.dataSource.connect(this.patientId);
  }

  ngAfterViewInit(): void {
    if (this.sort !== undefined) {
      this.sort.sortChange.subscribe((event) => {
       // console.log(event);
      });
      // @ts-ignore
      this.sort.sort(({ id: 'effectiveDateTime', start: 'desc'}) as MatSortable);
      this.dataSource.sort = this.sort;
    } else {
      console.log('SORT UNDEFINED');
    }
    if (this.dataSource !== undefined && this.paginator !== undefined) this.dataSource.paginator = this.paginator;
    // @ts-ignore
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
          return undefined;
        }
        case 'code': {
          return this.fhirService.getCodeableConceptValue(item.code)
        }
        default: {
          return undefined
        }
      };
    };

    // this.dataSource.sort = this.sort;
    //  console.log(this.dataSource.sort);

  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  getValue(observation: Observation): string {
    // console.log("getValue called" + observation.valueQuantity.value);
    if (observation === undefined) {
        return '';
    }

    if (observation.valueQuantity !== undefined ) {
      // console.log(observation.valueQuantity.value);
      return this.fhirService.getQuantity(observation.valueQuantity);
    }

    if (observation.valueCodeableConcept !== undefined ) {
          return this.fhirService.getCodeableConcept(observation.valueCodeableConcept);
      }

    if (observation.valueString !== undefined ) {
      return observation.valueString
    }
    if (observation.valueDateTime !== undefined ) {
      return observation.valueDateTime
    }
    if (observation.valueBoolean !== undefined ) {
      return String(observation.valueBoolean)
    }

      if (observation.component === undefined || observation.component.length < 2) {
        return '';
    }
    // Only coded for blood pressures at present
    if (observation.component[0].valueQuantity === undefined ) {
        return '';
    }
    if (observation.component[1].valueQuantity === undefined ) {
        return '';
    }
    let unit0 = '';
    let unit1 = '';

    if (observation.component[0].code !== undefined && observation.component[0].code.coding !== undefined
        && observation.component[0].code.coding.length > 0) {
      // @ts-ignore
      unit0 = observation.component[0].code.coding[0].display;
    }
    if (observation.component[1].code !== undefined && observation.component[1].code.coding !== undefined
        && observation.component[1].code.coding.length > 0) {
      // @ts-ignore
      unit1 = observation.component[1].code.coding[0].display;
    }
    if (observation.component[0].valueQuantity.unit !== undefined) {
      unit0 = observation.component[0].valueQuantity.unit;
    }
    if (observation.component[1].valueQuantity.unit !== undefined) {
      unit1 = observation.component[1].valueQuantity.unit;
    }

    if (unit0 === unit1 || unit1 === '') {
      return observation.component[0].valueQuantity.value + '/' + observation.component[1].valueQuantity.value + ' ' + unit0;
    } else {
      return observation.component[0].valueQuantity.value + '/' + observation.component[1].valueQuantity.value + ' ' + unit0 + '/' + unit1;
    }

  }


  select(resource: any): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      resource
    };
    const resourceDialog: MatDialogRef<ResourceDialogComponent> = this.dialog.open( ResourceDialogComponent, dialogConfig);
  }


    selectChart(observation: Observation): void {
       if (observation.code.coding !== undefined) {
         this.router.navigate(['/patient', observation.subject?.reference?.replace('Patient/',''), 'observations', observation.code.coding[0].code])
       }
    }

  getTag(ext: Extension): string {
    let retStr = '';
    if (ext.valueCodeableConcept !== undefined && ext.valueCodeableConcept && ext.valueCodeableConcept.coding !== undefined) {
      retStr += ext.valueCodeableConcept.coding[0].display + ' ';
    }
    return retStr.trim();
  }

  announceSortChange(sortState: Sort) {
    // This example uses English messages. If your application supports
    // multiple language, you would internationalize these strings.
    // Furthermore, you can customize the message to add additional
    // details about the values being sorted.
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  delete(observation : Observation) {
      let dialogRef = this.dialog.open(DeleteComponent, {
        width: '250px',
        data:  observation
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {

          this.fhirService.deleteTIE('/Observation/'+observation.id).subscribe(result => {

            if (this.observations !== undefined) {
              this.observations.forEach((taskIt, index) => {
                if (taskIt.id === observation.id) {
                  // @ts-ignore
                  this.observations.splice(index, 1);
                }
              })
              this.dataSource = new MatTableDataSource<Observation>(this.observations);
            }
          })
        }
      });
    }
}
