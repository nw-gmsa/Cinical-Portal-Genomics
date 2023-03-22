import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';

import {FhirService} from '../../services/fhir.service';
import {Extension, Observation} from 'fhir/r4';
import {ObservationChartDialogComponent} from '../../dialogs/observation-chart-dialog/observation-chart-dialog.component';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {ResourceDialogComponent} from '../../dialogs/resource-dialog/resource-dialog.component';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';




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
  displayedColumns = ['effectiveDateTime', 'code', 'tags', 'category',  'value', 'chart', 'performer', 'resource'];


  constructor(public fhirService: FhirService,
              public dialog: MatDialog) { }

  ngOnInit(): void {

    if (this.patientId !== undefined) {
     // this.dataSource = new ObservationDataSource(this.fhirService, this.patientId, []);
    } else {
      this.dataSource = new MatTableDataSource<Observation>(this.observations);
      // this.dataSource = new ObservationDataSource(this.fhirService, undefined, this.observations);
    }

    // this.dataSource.connect(this.patientId);
  }

  ngAfterViewInit(): void {
    if (this.sort !== undefined) {
      this.sort.sortChange.subscribe((event) => {
        console.log(event);
      });
      // @ts-ignore
      this.dataSource.sort = this.sort;
    } else {
      console.log('SORT UNDEFINED');
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

        if (observation !== undefined) {
            const dialogConfig = new MatDialogConfig();
            dialogConfig.disableClose = true;
            dialogConfig.autoFocus = true;
            dialogConfig.height = '75%';
            dialogConfig.width = '90%';
            dialogConfig.data = {
                resource: observation
            };

            // @ts-ignore
          console.log(observation.subject.reference);

            this.dialog.open(ObservationChartDialogComponent, dialogConfig);
        }
    }

  getTag(ext: Extension): string {
    let retStr = '';
    if (ext.valueCodeableConcept !== undefined && ext.valueCodeableConcept && ext.valueCodeableConcept.coding !== undefined) {
      retStr += ext.valueCodeableConcept.coding[0].display + ' ';
    }
    return retStr.trim();
  }
}
