import { Component, OnInit } from '@angular/core';
import {LoadingMode, LoadingStrategy, LoadingType, TdLoadingService} from "@covalent/core/loading";
import {Observable, Subject} from "rxjs";
import {ValueSetExpansionContains} from "fhir/r4";
import {FhirService} from "../../services/fhir.service";
import {catchError, debounceTime, distinctUntilChanged, map, switchMap} from "rxjs/operators";
import {DialogService} from "../../services/dialog.service";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {MatCheckboxChange} from "@angular/material/checkbox";

@Component({
  selector: 'app-ontology-browser',
  templateUrl: './ontology-browser.component.html',
  styleUrls: ['./ontology-browser.component.scss']
})
export class OntologyBrowserComponent implements OnInit {

  loadingMode = LoadingMode;
  loadingStrategy = LoadingStrategy;
  loadingType = LoadingType;

  snomed = true;
  concepts$: Observable<ValueSetExpansionContains[]> | undefined;
  private searchConcepts = new Subject<string>();
    concept: ValueSetExpansionContains | undefined;

  constructor(private _loadingService: TdLoadingService,
              public fhirService: FhirService,
              public dlgSrv: DialogService) { }

  ngOnInit(): void {
    this.concepts$ = this.searchConcepts.pipe(
        // wait 300ms after each keystroke before considering the term
        debounceTime(300),
        // ignore new term if same as previous term
        distinctUntilChanged(),

        // switch to new search observable each time the term changes
        switchMap((term: string) => {

            if (this.snomed) {
                return this.fhirService.searchSNOMEDConcepts(term);
            } else {
                return this.fhirService.searchConcepts(term, 'https://fhir.hl7.org.uk/ValueSet/UKCore-ServiceRequestReasonCode');
            }
        }
        ),
        map(resource    => {
              return this.dlgSrv.getContainsExpansion(resource);
            }

        ), catchError(this.dlgSrv.handleError('getReasons', [])));

  }
  search(term: string): void {
    if (term.length > 3) {
      this.searchConcepts.next(term);
    }
  }



    selected(event: any) {

        this.concept = event
    }

}
