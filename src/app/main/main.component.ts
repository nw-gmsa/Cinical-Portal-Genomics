import { Component, OnInit } from '@angular/core';
import {MatSelectChange} from '@angular/material/select';
import {TestingService} from '../services/testing.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  selected = 'https://raw.githubusercontent.com/NHSDigital/IOPS-FHIR-Testing/main/oas/fhirrest.json';
  oasSpecs  = [
    {value: 'https://raw.githubusercontent.com/NHSDigital/IOPS-FHIR-Testing/main/oas/fhirrest.json', viewValue: 'FHIR Server'},
    {value: 'https://3cdzg7kbj4.execute-api.eu-west-2.amazonaws.com/poc/Conformance/v3/api-docs', viewValue: 'Conformance'},
    {value: 'https://3cdzg7kbj4.execute-api.eu-west-2.amazonaws.com/poc/clinicaldatasharing/v3/api-docs', viewValue: 'Clinical'},
    {value: 'https://3cdzg7kbj4.execute-api.eu-west-2.amazonaws.com/poc/documentsharing/v3/api-docs', viewValue: 'Documents'},
    {value: 'https://3cdzg7kbj4.execute-api.eu-west-2.amazonaws.com/poc/caredirectories/v3/api-docs', viewValue: 'Care Directories'},
    {value: 'https://3cdzg7kbj4.execute-api.eu-west-2.amazonaws.com/poc/events/v3/api-docs', viewValue: 'Events and Patient'}
  ];
  constructor( private testingService: TestingService,
               private router: Router) { }

  ngOnInit(): void {
  }
  goToLink(url: string): void {
    window.open(url, '_blank');
  }

/*
    runTestPackage() {
      this.router.navigateByUrl('/runtest');
    }

 */
}
