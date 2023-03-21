import {Injectable} from '@angular/core';
import {Bundle, Organization, Practitioner, ValueSet, ValueSetExpansionContains} from 'fhir/r4';
import {debounceTime, distinctUntilChanged, map, switchMap} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {FhirService} from '../services/fhir.service';
import {Observable, of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(private fhirService: FhirService) { }
  getDisplay(concept: ValueSetExpansionContains): string {
    // console.log(concept);
    return <string>concept.display;
  }
  getDisplayOrg(organization: Organization): string {
    if (organization.identifier === undefined) { return <string>organization.name; }
    return organization.name + ' (' + organization.identifier[0].value + ')';
  }
  getDisplayDoctor(practitioner: Practitioner): string {
    if (practitioner.name !== undefined) {
      let name = '';
      if (practitioner.name[0].family !== undefined) { name += practitioner.name[0].family; }
      if (practitioner.name[0].given !== undefined) { name += ', ' + practitioner.name[0].given[0]; }
      if (practitioner.identifier !== undefined) { name += ' (' + practitioner.identifier[0].value + ')'; }
      return name;
    }
    return 'Unknown';
  }
  getContainsExpansion(resource: any): ValueSetExpansionContains[] {
    const valueSet = resource as ValueSet;
    const contains: ValueSetExpansionContains[] = [];
    if (valueSet !== undefined && valueSet.expansion !== undefined && valueSet.expansion.contains !== undefined) {
      for (const concept of valueSet.expansion.contains) {
        contains.push(concept);
      }
    }
    return contains;
  }
  getContainsPractitoner(resource: any): Practitioner[] {
    const bundle = resource as Bundle;
    const contains: Practitioner[] = [];
    if (bundle !== undefined && bundle.entry !== undefined) {
      for (const entry of bundle.entry) {
        contains.push(entry.resource as Practitioner);
      }
    }
    return contains;
  }
  getContainsOrganisation(resource: any): Organization[] {
    const bundle = resource as Bundle;
    const contains: Organization[] = [];
    if (bundle !== undefined && bundle.entry !== undefined) {
      for (const entry of bundle.entry) {
        contains.push(entry.resource as Organization);
      }
    }
    return contains;
  }
  handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.log('term search ERROR');
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}
