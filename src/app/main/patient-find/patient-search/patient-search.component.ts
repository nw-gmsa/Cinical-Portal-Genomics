

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

import { Observable, Subject, of, throwError  } from 'rxjs';
import {
  catchError,
  debounceTime, distinctUntilChanged, map, switchMap
} from 'rxjs/operators';

import {HttpErrorResponse} from '@angular/common/http';
import {NEVER} from 'rxjs/internal/observable/never';
import {Bundle, Patient} from 'fhir/r4';
import {EprService} from '../../../services/epr.service';
import {FhirService} from '../../../services/fhir.service';
import {LoadingMode, LoadingStrategy, LoadingType, TdLoadingService} from "@covalent/core/loading";



@Component({
  selector: 'app-patient-search',
  templateUrl: './patient-search.component.html',
  styleUrls: [ './patient-search.component.css' ]
})
export class PatientSearchComponent implements OnInit {


  patients$: Observable<Patient[]> | undefined;
  private searchTerms = new Subject<string>();

  loadingMode = LoadingMode;
  loadingStrategy = LoadingStrategy;
  loadingType = LoadingType;

  @Output() patientSelected : EventEmitter<Patient> = new EventEmitter();

  constructor(private patientChange : EprService,
              private fhirService: FhirService,
              private _loadingService: TdLoadingService

  ) {}



  // Push a search term into the observable stream.
  search(term: string): void {
    if (term.length>3) {
      try {
        this.searchTerms.next(term);
      } catch (error) {
        this._loadingService.resolve('overlayStarSyntax');
        console.log(error)
      }
    }
  }



  ngOnInit(): void {

    this.patients$ = this.searchTerms.pipe(
      // wait 300ms after each keystroke before considering the term
      debounceTime(300),

      // ignore new term if same as previous term
      distinctUntilChanged(),

      // switch to new search observable each time the term changes
      switchMap((term: string) => {

        this._loadingService.register('overlayStarSyntax');
          return this.fhirService.searchPatients(term.replace(',', ''));
      }

      ),

      map(resource    => {
          this._loadingService.resolve('overlayStarSyntax');
          const bundle = resource as Bundle;
          const pat$: Patient[] = [];
          let i;
          if (bundle !== undefined && bundle.hasOwnProperty("entry")) {
            // @ts-ignore
            for (i = 0; i < bundle.entry.length && i < 10; i++) {pat$[i] = (bundle.entry[i].resource as Patient);
            }
          }
          return pat$; }
        ),
        catchError(err => {
          console.log('Handling error locally ...', err);
          this._loadingService.resolve('overlayStarSyntax');
          return of([]);
        })
    )
  }


  selectPatient(patient: Patient): void {

    this.patientChange.setPatient(patient);
    this.patientSelected.emit(patient);
  }

}
