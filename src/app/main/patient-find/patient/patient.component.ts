
import {Component, OnInit, Input, EventEmitter, Output, ViewChild} from '@angular/core';
import {Observable} from 'rxjs';
import {Patient} from 'fhir/r4';
import {FhirService} from '../../../services/fhir.service';
import {ResourceDialogComponent} from '../../../dialogs/resource-dialog/resource-dialog.component';
import {PatientDataSource} from '../../../datasource/patient-data-source';
import {MatSort} from '@angular/material/sort';
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";


@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.css']
})
export class PatientComponent implements OnInit {

  @Input() patients: Patient[] | undefined;

  @Input() patientsObservable: Observable<Patient[]> | undefined;

  @Input() useObservable = false;

  @Input() showResourceLink = true;

  @Output() patient = new EventEmitter<any>();

  // @ts-ignore
  dataSource: PatientDataSource ;
  @ViewChild(MatSort) sort: MatSort | undefined;


  displayedColumns = ['patient', 'dob', 'gender', 'identifier', 'contact', 'gp',  'resource'];

  constructor( private dialog: MatDialog,
               public fhirService: FhirService) {

  }

  ngOnInit() {
    if (!this.showResourceLink) {
      this.displayedColumns = ['select', 'patient', 'dob', 'gender', 'identifier', 'contact', 'gp', 'resource'];
    }
    if (this.useObservable) {
      this.dataSource = new PatientDataSource(this.fhirService,  [], this.patientsObservable, this.useObservable);
    } else {
      if (this.patients !== undefined) {

      }
    }
  }

  ngAfterViewInit() {
    if (this.sort != undefined) {
      this.sort.sortChange.subscribe((event) => {
        console.log(event);
      });
     // if (this.dataSource !== undefined) this.dataSource.sort = this.sort;
    } else {
      console.log('SORT UNDEFINED');
    }
  }

  getFirstAddress(patient: Patient): String {
    if (patient === undefined) { return ''; }
    if (patient.address === undefined || patient.address.length === 0) {
      return '';
    }
    // @ts-ignore
    return patient.address[0].line.join(', ') + ', ' + patient.address[0].city + ', ' + patient.address[0].postalCode;

  }
  getLastName(patient: Patient): String {
    if (patient === undefined) { return ''; }
    if (patient.name === undefined || patient.name.length === 0) {
      return '';
    }

    let name = '';
    if (patient.name[0].family !== undefined) { name += patient.name[0].family.toUpperCase(); }
   return name;

  }
  getFirstName(patient: Patient): String {
    if (patient === undefined) { return ''; }
    if (patient.name === undefined || patient.name.length === 0) {
      return '';
    }
    // Move to address
    let name = '';
    if (patient.name[0].given !== undefined && patient.name[0].given.length > 0) {
      name += ', ' + patient.name[0].given[0];
    }

    if (patient.name[0].prefix !== undefined && patient.name[0].prefix.length > 0) {
      name += ' (' + patient.name[0].prefix[0] + ')' ;
    }
    return name;

  }

  getFirstTelecom(patient: Patient): String {
    if (patient === undefined) {
      return '';
    }
    if (patient.telecom === undefined || patient.telecom.length === 0) { return ''; }
    // Move to address
    return <String>patient.telecom[0].value;

  }



  getNHSIdentifier(patient: Patient): String {
    if (patient === undefined) { return ''; }
    if (patient.identifier === undefined || patient.identifier.length === 0) { return ''; }
    // Move to address
    let NHSNumber: String = '';
    for (let f = 0; f < patient.identifier.length; f++) {
      // @ts-ignore
      const identifier = patient.identifier[f]
      if (identifier !== undefined && identifier.system !== undefined && identifier.value !== undefined && identifier.system.includes('nhs-number') ) {
        NHSNumber = identifier.value.substring(0, 3) + ' '
          + identifier.value.substring(3, 6) + ' ' + identifier.value.substring(6);
      }
    }
    return NHSNumber;

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


  selectPatient(patient: Patient) {
    this.patient.emit(patient);
  }


}
