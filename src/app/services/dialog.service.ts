import {Injectable} from '@angular/core';
import {
  ActivityDefinition,
  Bundle, CarePlan, CareTeam, Condition, DiagnosticReport, DocumentReference, Goal,
  Organization,
  Practitioner,
  Questionnaire, QuestionnaireResponse,
  Resource, ServiceRequest,
  ValueSet,
  ValueSetExpansionContains
} from 'fhir/r4';
import {debounceTime, distinctUntilChanged, map, switchMap} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {FhirService} from './fhir.service';
import {Observable, of} from 'rxjs';
import {DatePipe} from "@angular/common";

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(private fhirService: FhirService) { }
  getDisplay(concept: ValueSetExpansionContains): string {
    // console.log(concept);
    return <string>concept.display;
  }

  public getSystem(system: string | undefined) : string {
    if (system === 'http://loinc.org') return 'LOINC'
    if (system === 'http://read.info/readv2') return 'Read v2'
    if (system === 'http://snomed.info/sct') return 'SCT'
    if (system?.includes('openehr')) return 'openEHR'
    return '?'
  }

  getResourceDisplay(resource: Resource): string{

    if (resource.resourceType === 'Questionnaire') {
      const questionnaire = resource as Questionnaire;
      if (questionnaire.title !== null) return <string>questionnaire.title;
    }

    if (resource.resourceType === 'ServiceRequest') {
      const serviceRequest = resource as ServiceRequest;
      if (serviceRequest.code !== undefined) return this.fhirService.getCodeableConceptValue(serviceRequest.code)
      if (serviceRequest.category !== undefined && serviceRequest.category.length >0) return this.fhirService.getCodeableConceptValue(serviceRequest.category[0])
    }
    if (resource.resourceType === 'DocumentReference') {
      const documentReference = resource as DocumentReference;
      if (documentReference.type !== undefined) return this.fhirService.getCodeableConceptValue(documentReference.type)
      if (documentReference.category !== undefined && documentReference.category.length >0) return this.fhirService.getCodeableConceptValue(documentReference.category[0])
    }
    if (resource.resourceType === 'Goal') {
      const goal = resource as Goal;
      if (goal.description !== undefined) return this.fhirService.getCodeableConceptValue(goal.description)
    }
    if (resource.resourceType === 'CarePlan') {
      const carePlan = resource as CarePlan;
      if (carePlan.title !== undefined) return carePlan.title
      if (carePlan.description !== undefined) return carePlan.description
      if (carePlan.category !== undefined && carePlan.category.length>0) return this.fhirService.getCodeableConceptValue(carePlan.category[0])
    }
    if (resource.resourceType === 'QuestionnaireResponse') {
      const questionnaireResponse = resource as QuestionnaireResponse;
      if (questionnaireResponse.questionnaire !== undefined) {
        var questionnaire = this.fhirService.getQuestionnaire(questionnaireResponse.questionnaire)
        if (questionnaire !== undefined) {
          if (questionnaire.title !== undefined) return questionnaire.title + ' ' + questionnaireResponse.authored?.split('T')[0];
        }
      }
    }
    if (resource.resourceType === 'Practitioner') {
      const practitioner = resource as Practitioner
      if (practitioner.name !== undefined) {
        let name = '';
        if (practitioner.name[0].family !== undefined) { name += practitioner.name[0].family; }
        if (practitioner.name[0].given !== undefined) { name += ', ' + practitioner.name[0].given[0]; }
        if (practitioner.identifier !== undefined) { name += ' (' + practitioner.identifier[0].value + ')'; }
        return name;
      }
      return 'Unknown';
    }
    if (resource.resourceType === 'Organization') {
      const organization = resource as Organization;
      if (organization.identifier === undefined) { return <string>organization.name; }
      return organization.name + ' (' + organization.identifier[0].value + ')';
    }
    if (resource.resourceType === 'Condition') {
      const condition = resource as Condition;

      if (condition.code !== undefined) {
        if (condition.code.text !== undefined) return <string>condition.code.text;
        if (condition.code.coding !== undefined && condition.code.coding[0].display !== undefined) return condition.code.coding[0].display
      }
    }
    if (resource.resourceType === 'DiagnosticReport') {
      const diagnosticReport = resource as DiagnosticReport;
      if (diagnosticReport.code !== undefined) {
        if (diagnosticReport.code.text !== undefined) return <string>diagnosticReport.code.text;
        if (diagnosticReport.code.coding !== undefined && diagnosticReport.code.coding[0].display !== undefined) return diagnosticReport.code.coding[0].display
      }
    }
    if (resource.resourceType === 'CareTeam') {
      const careTeam = resource as CareTeam;
      if (careTeam.name !== null) return <string>careTeam.name;
    }
    if (resource.resourceType === 'ActivityDefinition') {
      const activityDefinition = resource as ActivityDefinition;
      if (activityDefinition.title !== null) return <string>activityDefinition.title;
    }
    console.log(resource)
    return this.fhirService.getCodeableConceptResourceValue(resource)
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

  getFHIRDateString(date : Date) : string {
    var datePipe = new DatePipe('en-GB');
    //2023-05-12T13:22:31.964Z
    var utc = datePipe.transform(date, 'yyyy-MM-ddTHH:mm:ss.SSSZZZZZ');
    if (utc!= null) return utc
    return date.toISOString()
  }

}
