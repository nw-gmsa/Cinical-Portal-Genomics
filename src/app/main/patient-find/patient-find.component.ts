import { Component, OnInit } from '@angular/core';

import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {EprService} from '../../services/epr.service';
import {Patient} from 'fhir/r4';


@Component({
  selector: 'app-patient-find',
  templateUrl: './patient-find.component.html',
  styleUrls: ['./patient-find.component.css']
})
export class PatientFindComponent implements OnInit {

  constructor(private _formBuilder: FormBuilder, private router: Router, private eprService: EprService) { }

  ngOnInit() {
    this.eprService.setTitle('Patient Find');

      this.triageFormGroup = this._formBuilder.group({
          breathingCtrl: ['', Validators.required]
      });
  }

    triageFormGroup: FormGroup | undefined;

    yesno = [
        {name: 'Yes', viewValue: 0},
        {name: 'No', viewValue: 1}
    ];
    sexes = [
        {name: 'Female', viewValue: 'female'},
        {name: 'Male', viewValue: 'male'}
    ];

    disabled: boolean = false;


    selectPatient(patient: Patient) {
        console.log('Patient change - '+patient.id);
        this.router.navigateByUrl('patient/' + patient.id  );

    }


}
