import {Component, OnInit} from '@angular/core';
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {Observable, of, Subject} from "rxjs";
import {Bundle, Patient, Questionnaire} from "fhir/r4";
import {catchError, debounceTime, distinctUntilChanged, map, switchMap} from "rxjs/operators";
import {EprService} from "../../services/epr.service";
import {FhirService} from "../../services/fhir.service";
import {TdLoadingService} from "@covalent/core/loading";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-form-definition',
  templateUrl: './form-definition.component.html',
  styleUrls: ['./form-definition.component.scss']
})
export class FormDefinitionComponent implements OnInit{
  questionnaire$: Observable<Questionnaire[]> | undefined;
  questionnaireLOINC$: Observable<Questionnaire[]> | undefined;
  searchString: string = '';
  questionnaire : Questionnaire | undefined
  private searchQuestionnaires = new Subject<string>();
  private searchQuestionnairesLOINC = new Subject<string>();
  private loinc: boolean = false;

  constructor(
              private fhirService: FhirService,
              private _loadingService: TdLoadingService,
              private route: ActivatedRoute,
              private router: Router

  ) {}


  selectedQuestionnaire(event: MatAutocompleteSelectedEvent) {
    this.loinc = false;
    this.questionnaire = event.option.value
    // @ts-ignore
    this.router.navigate(['form', this.questionnaire.id])

  }
  selectedQuestionnaireLOINC(event: MatAutocompleteSelectedEvent) {
    this.loinc = true;
    this.questionnaire = undefined
    this.fhirService.getLOINCResource('/Questionnaire/' + event.option.value.id).subscribe(resource => {
      if (resource !== undefined && resource.resourceType === 'Questionnaire') {
        this.questionnaire = resource
      }
    })
    // @ts-ignore
    this.router.navigate(['form', event.option.value.id])

  }

  searchQuestionnaire(value: string) {

    if (value.length>1) {
      try {
        this.searchQuestionnaires.next(value);
      } catch (error) {
        this._loadingService.resolve('overlayStarSyntax');
        console.log(error)
      }
    }
  }

  searchQuestionnaireLOINC(value: string) {

    if (value.length>1) {
      try {
        this.searchQuestionnairesLOINC.next(value);
      } catch (error) {
        this._loadingService.resolve('overlayStarSyntax');
        console.log(error)
      }
    }
  }

  ngOnInit(): void {

    const formid= this.route.snapshot.paramMap.get('formid');
    if (formid != null) {
      if (formid.length > 10) {
        this.loinc = false;
        this.fhirService.getTIEResource('/Questionnaire/' + formid).subscribe(resource => {
          if (resource !== undefined && resource.resourceType === 'Questionnaire') {
            this.questionnaire = resource
          }
        })
      } else {
        this.loinc = true;
        this.fhirService.getLOINCResource('/Questionnaire/' + formid).subscribe(resource => {
          if (resource !== undefined && resource.resourceType === 'Questionnaire') {
            this.questionnaire = resource
          }
        })
      }
    }

    this.questionnaireLOINC$ = this.searchQuestionnairesLOINC.pipe(
        // wait 300ms after each keystroke before considering the term
        debounceTime(300),

        // ignore new term if same as previous term
        distinctUntilChanged(),

        // switch to new search observable each time the term changes
        switchMap((term: string) => {

              //  this._loadingService.register('overlayStarSyntax');
              return this.fhirService.searchQuestionnaireLOINC(term.replace(',', ''));
            }

        ),

        map(resource    => {
          this._loadingService.resolve('overlayStarSyntax');
          const bundle = resource as Bundle;
          const temp: Questionnaire[] = [];
          if (bundle !== undefined && bundle.entry !== undefined) {
            // @ts-ignore
            for (let entry of bundle.entry) {
              {
                if (entry.resource !== undefined && entry.resource.resourceType === 'Questionnaire') {

                  temp.push(entry.resource as Questionnaire);
                }
              }
            }
          }
          return temp; }
        ),
        catchError(err => {
          console.log('Handling error locally ...', err);
          this._loadingService.resolve('overlayStarSyntax');
          return of([]);
        })
    )

    this.questionnaire$ = this.searchQuestionnaires.pipe(
        // wait 300ms after each keystroke before considering the term
        debounceTime(300),

        // ignore new term if same as previous term
        distinctUntilChanged(),

        // switch to new search observable each time the term changes
        switchMap((term: string) => {

              //  this._loadingService.register('overlayStarSyntax');
              return this.fhirService.searchQuestionnaire(term.replace(',', ''));
            }

        ),

        map(resource    => {
          this._loadingService.resolve('overlayStarSyntax');
          const bundle = resource as Bundle;
          const temp: Questionnaire[] = [];
          if (bundle !== undefined && bundle.entry !== undefined) {
            // @ts-ignore
            for (let entry of bundle.entry) {
              {
                if (entry.resource !== undefined && entry.resource.resourceType === 'Questionnaire') {

                  temp.push(entry.resource as Questionnaire);
                }
              }
            }
          }
          return temp; }
        ),
        catchError(err => {
          console.log('Handling error locally ...', err);
          this._loadingService.resolve('overlayStarSyntax');
          return of([]);
        })
    )
  }

  getTitle() {
    if (!this.loinc && this.questionnaire !== undefined && this.questionnaire.title !== undefined) return this.questionnaire.title
    return '';
  }
  getTitleLOINC() {
    if (this.loinc && this.questionnaire !== undefined && this.questionnaire.title !== undefined) return this.questionnaire.title
    return '';
  }
}
