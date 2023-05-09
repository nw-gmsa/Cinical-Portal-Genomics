import { Component, OnInit } from '@angular/core';
import {LoadingMode, LoadingStrategy, LoadingType, TdLoadingService} from "@covalent/core/loading";
import {Observable, Subject} from "rxjs";
import {Bundle, ValueSet, ValueSetExpansionContains} from "fhir/r4";
import {FhirService} from "../../services/fhir.service";
import {catchError, debounceTime, distinctUntilChanged, map, switchMap} from "rxjs/operators";
import {DialogService} from "../../services/dialog.service";


@Component({
  selector: 'app-ontology-browser',
  templateUrl: './ontology-browser.component.html',
  styleUrls: ['./ontology-browser.component.scss']
})
export class OntologyBrowserComponent implements OnInit {
    showFiller = true;
  loadingMode = LoadingMode;
  loadingStrategy = LoadingStrategy;
  loadingType = LoadingType;

  snomed = true;
  concepts$: Observable<ValueSetExpansionContains[]> | undefined;
  valuesSets: ValueSet[] = []
    valueSet: ValueSet | undefined;
  private searchConcepts = new Subject<string>();
    concept: ValueSetExpansionContains = {
        system: 'http://snomed.info/sct',
        code: '138875005',
        display: 'SNOMED CT Concept'
    };

  constructor(private _loadingService: TdLoadingService,
              public fhirService: FhirService,
              public dlgSrv: DialogService) { }

  ngOnInit(): void {
      this.valuesSets = []
      this.fhirService.getConf('/ValueSet').subscribe(
          resource  => {
              console.log(resource)
              if (resource.resourceType === 'Bundle') {
                  var bundle = resource as Bundle
                  if (bundle.entry !== undefined) {
                      for(let entry of bundle.entry) {
                          if (entry.resource !== undefined && entry.resource.resourceType === 'ValueSet') {
                              this.valuesSets.push(entry.resource)
                          }
                      }
                  }
              }
          }
      );
    this.concepts$ = this.searchConcepts.pipe(
        // wait 300ms after each keystroke before considering the term
        debounceTime(300),
        // ignore new term if same as previous term
        distinctUntilChanged(),

        // switch to new search observable each time the term changes
        switchMap((term: string) => {

            if (this.snomed || this.valueSet === undefined) {
                return this.fhirService.searchSNOMEDConcepts(term);
            } else {
                // @ts-ignore
                return this.fhirService.searchConcepts(term, this.valueSet.url);
            }
        }
        ),
        map(resource    => {
              return this.dlgSrv.getContainsExpansion(resource);
            }

        ), catchError(this.dlgSrv.handleError('getReasons', [])));

  }
  search(term: string): void {
    if (this.snomed && term.length > 3) {
      this.searchConcepts.next(term);
    }
      if (!this.snomed && term.length > 1) {
          this.searchConcepts.next(term);
      }
  }



    selected(event: any) {

        this.concept = event
    }

    getMenuDisplay(item: ValueSetExpansionContains) {
        //console.log(item)
        if (item.inactive) return '<i><small>'+item.display+' [inactive]</small></i>'
        if (item.designation !== undefined) {
            for (let designation of item.designation) {
                if (designation.use !== undefined && designation.use.code === '900000000000003001') {

                    var strings = designation.value.split('(')
                    var type = strings[strings.length-1].replace(')','')
                    return item.display + ' <small>('+type+')</small>'
                }
            }
        }
        return item.display
    }
}
