import {EventEmitter, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, Subscription} from 'rxjs';
import {
  Binary,
  Bundle,
  CapabilityStatement,
  CodeableConcept,
  Coding, Condition,
  Endpoint,
  Identifier, MedicationRequest,
  Quantity, Questionnaire,
  Reference, Resource, ServiceRequest,
  ValueSet
} from 'fhir/r4';
import {environment} from '../../environments/environment';
import {SummaryActivity} from '../models/summary-activity';


export enum Formats {
  JsonFormatted = 'jsonf',
  Json = 'json',
  Xml = 'xml',
  EprView = 'epr'
}

@Injectable({
  providedIn: 'root'
})
export class FhirService {

  private from: Date | undefined;
  private to: Date | undefined;
  private duration = 14;
  private maxTransactionSize = 80;
  pageOn = 7;
  throttle = 3000;
  measurePageMod = 3;

  questionnaires: Questionnaire[] = [];

  private baseUrl = environment.fhirServer ;
  private tieUrl = environment.tieServer;
  private conformanceUrl = environment.conformanceServer;
  private directoryUrl = environment.directoryServer;
  private appId = 'hie_';

  private format: Formats = Formats.JsonFormatted;

  // public smart: SMARTClient;

  public conformance: CapabilityStatement | undefined;

  conformanceChange: EventEmitter<any> = new EventEmitter();

  rootUrlChange: EventEmitter<any> = new EventEmitter();

  formatChange: EventEmitter<any> = new EventEmitter();

  private rootUrl: string | undefined;
  private ontoUrl ='https://r4.ontoserver.csiro.au/fhir' ;

  getToDate(): Date {
    return <Date>this.to;
  }
  getNextToDay(): Date {
    const temp = new Date();
    this.to = new Date();
    const next = new Date();
    next.setDate(temp.getDate() + 1);
    return next;
  }

  constructor(private http: HttpClient) {
    const temp = new Date();
    this.to = new Date();
    // this.to.setDate( temp.getDate() - this.duration - this.duration)
    this.from = new Date();
    this.from.setDate(temp.getDate() - this.duration );
  }

  public getIdentifiers(identifiers: Identifier[] | undefined): string {
    if (identifiers === undefined) { return '' }
    let result = '';
    for (const identifier of identifiers) {
       if (result === '') {
         result = this.getIdentifier(identifier);
       } else {
         result += '<br/>' + this.getIdentifier(identifier);
       }
    }
    return result;
  }
  public getIdentifier(identifier: Identifier): string {
    if (identifier === undefined) { return ''; }
    let name: string | undefined = identifier.system;
    const value: string | undefined = identifier.value;
    let result: string;
    if (name !== undefined) {
      if (name.indexOf('nhs-number') !== -1) {
        name = 'NHS Number';
      } else if (name.indexOf('pas-number') !== -1) {
        name = 'PAS Number';
      } else if (name.indexOf('PPMIdentifier') !== -1) {
        name = 'LTH PPM Id';
      } else if (name.indexOf('ods-organization-code') !== -1) {
        name = 'ODS';
      } else if (name.indexOf('gmp-number') !== -1) {
        name = 'GMP';
      } else if (name.indexOf('gmc-number') !== -1) {
        name = 'GMC';
      }
      result = '<i>' + name + '</i>&nbsp;<b>' + value + '</b>';
    } else {
      result = '' + value + '';
    }
    return result;
  }
  public getReferences(references: Reference[]): string | undefined {
    if (references === undefined) { return undefined; }
    let result = '';
    for (const reference of references) {
      if (result === '') {
        result = this.getReference(reference);
      } else {
        result += '<br/>' + this.getReference(reference);
      }
    }
    return result;
  }

  public getReference(reference: Reference): string {
    if (reference === undefined) { return ''; }
    let result = '';
    if (reference.display !== undefined) { result = reference.display + ' '; }
    if (reference.identifier !== undefined) { result += '(' + this.getIdentifier(reference.identifier) + ')'; }
    return result;
  }
  public getCodeableConcepts(concepts: CodeableConcept[]): string | undefined {
      if (concepts === undefined || concepts.length === 0) { return undefined; }
      let result = '';
      for (const concept of concepts) {
        if (result === '') {
          result = this.getCodeableConcept(concept);
        } else {
          result += '<br/>' + this.getCodeableConcept(concept);
        }
      }
      return result;
    }

  public getCoding(code: Coding): string
  {
    if (code === undefined) { return ''; }
    let result = '';
    if (code.display !== undefined) { result += '<b>' + code.display + '</b>'; }

    if (code.system !== undefined || code.code !== undefined) {
      result += ' (';
      if (code.system !== undefined) {
        if (code.system.includes('snomed')) { result += '<i>SNOMED CT</i> '; }
        if (code.system.includes('loinc.org')) { result += '<i>LOINC</i> '; }
      }
      if (code.code !== undefined) {
        result += code.code;
      }
      result += ')';
    }
    return result;
  }
  public getCodingValue(code: Coding): string
  {
    if (code === undefined) { return ''; }
    const result = '';
    if (code.display !== undefined) { return code.display; }
    if (code.code !== undefined) { return code.code; }
    return result;
  }

  public getCodeableConcept(concept: CodeableConcept | undefined): string {
    if (concept === undefined) { return ''; }
    let result = '';
    if (concept.text !== undefined) { result += ' <b>' + concept.text + '</b>'; }
    if (concept.coding !== undefined) {
      for (const code of concept.coding) {
        if (result !== '') { result += '<br/>'; }
        result += this.getCoding(code);
      }
    }
    return result;
  }
  public getCodeableConceptValue(concept?: CodeableConcept): string {
    if (concept === undefined) { return ''; }
    let result = '';
    if (concept.text !== undefined) { result += ' <b>' + concept.text + '</b>'; }
    if (concept.coding !== undefined) {
      for (const code of concept.coding) {
        if (result !== '') { result += ', '; }
        result += this.getCodingValue(code);
      }
    }

    return result;
  }



  public getCodeableConceptResourceValue(condition: Resource) : string {
    if (condition !== undefined && (condition.resourceType === 'Condition')) return this.getCodeableConceptValue((condition as Condition).code)
    if (condition !== undefined && (condition.resourceType === 'ServiceRequest')) return this.getCodeableConceptValue((condition as ServiceRequest).code)
    if (condition !== undefined && (condition.resourceType === 'MedicationRequest')) return this.getCodeableConceptValue((condition as MedicationRequest).medicationCodeableConcept)
    return '';
  }

  public oauth2Required(): boolean {


    if (this.conformance !== undefined) {
      // @ts-ignore
      for (const rest of this.conformance.rest) {
        if (rest.security !== undefined && rest.security.service !== undefined) {
          for (const service of rest.security.service) {
            if (service.coding !== undefined && service.coding.length > 0) {
              if (service.coding[0].system === 'SMART-on-FHIR') {

                return true;
              }
            }
          }
        }
      }
    }
    return false;
  }


  storeBaseUrl(baseUrl: string): void {
    console.log('Setting storeBaseUrl ' + baseUrl);
    localStorage.setItem(this.appId + 'baseUrl', baseUrl);

    if (this.baseUrl !== baseUrl) {
      this.baseUrl = baseUrl;
      this.conformance = undefined;
      this.getConformance();
    }
  }

  getStoredBaseUrl(): string {
    // @ts-ignore
    return localStorage.getItem(this.appId + 'baseUrl');
  }



  public getBaseUrl(): string {

    if (this.getStoredBaseUrl() !== undefined && this.getStoredBaseUrl() !== null) {
      this.baseUrl = this.getStoredBaseUrl();
      return this.baseUrl;
    }

    return this.baseUrl;
  }

  public setRootUrl(rootUrl: string): void {
    this.storeBaseUrl(rootUrl);
    this.rootUrl = rootUrl;
    this.baseUrl = rootUrl;
    this.rootUrlChange.emit(rootUrl);
  }


  public getRootUrlChange(): EventEmitter<any> {
    return this.rootUrlChange;
  }

  public getConformanceChange(): EventEmitter<any> {
    return this.conformanceChange;
  }

  public getFormatChange(): EventEmitter<any> {
    return this.formatChange;
  }

  public getFormat(): string {
    return this.format;
  }

  public getFHIRServerBase(): string {
    return this.getBaseUrl();
  }


  public setFHIRServerBase(server: string): void {
    this.baseUrl = server;
    this.storeBaseUrl(server);

  }


  getHeaders(contentType: boolean = true): HttpHeaders {

    let headers = new HttpHeaders(
    );
    if (contentType) {
      headers = headers.append('Content-Type', 'application/fhir+json');
      headers = headers.append('Accept', 'application/fhir+json');
    }
    return headers;
  }


  getEPRHeaders(contentType: boolean = true): HttpHeaders {

    const headers = this.getHeaders(contentType);

    return headers;
  }

  public setOutputFormat(outputFormat: Formats): void {
    this.format = outputFormat;
    this.formatChange.emit(outputFormat);
  }

  public getConformance(): CapabilityStatement | undefined {
    if (this.conformance !== undefined) {
      return this.conformance;
    }

    if (this.baseUrl !== undefined) {
      this.http.get<any>(this.getBaseUrl() + '/metadata', {headers: this.getHeaders(true)}).subscribe(capabilityStatement => {
        this.conformance = capabilityStatement;

        this.conformanceChange.emit(capabilityStatement);
      }, () => {
        this.conformance = undefined;
        this.conformanceChange.emit(undefined);
      });
    }
    return  undefined;
  }


  public postAny(url: string, body: string, httpHeaders: HttpHeaders): Observable<any> {
    return this.http.post<any>(url, body, {headers: httpHeaders});
  }

  public post(resource: string, body: any): Observable<any> {

    const headers: HttpHeaders = this.getEPRHeaders(false);
    headers.append('Content-Type', 'application/fhir+json');
    headers.append('Prefer', 'return=representation');
    return this.http.post<any>(this.getFHIRServerBase() + resource, body, {headers});
  }
  public postTIE(resource: string, body: any): Observable<any> {
    const headerDict = {
      'Content-Type': 'application/fhir+json',
      'Accept': 'application/fhir+json',
      'Prefer': 'return=representation'
    }
    const headers = new HttpHeaders(headerDict)
    console.log(this.tieUrl + resource)
    console.log(headers)
    return this.http.post<any>(this.tieUrl + resource, body, {headers});
  }
  public putTIE(resource: string, body: any): Observable<any> {
    const headers: HttpHeaders = this.getEPRHeaders(false);
    headers.append('Content-Type', 'application/fhir+json');
    headers.append('Prefer', 'return=representation');
    return this.http.put<any>(this.tieUrl + resource, body, {headers});
  }
  public put(resource: string, body: any): Observable<any> {

    const headers: HttpHeaders = this.getEPRHeaders(false);
    headers.append('Content-Type', 'application/fhir+json');
    headers.append('Prefer', 'return=representation');
    const url = this.getFHIRServerBase() + resource;

    return this.http.put<Endpoint>(url, body, {headers});
  }

  public get(search: string): Observable<Bundle> {

    const url: string = this.getBaseUrl() + search;
    const headers = new HttpHeaders();

    return this.http.get<any>(url, {headers});
  }
  public getTIE(search: string): Observable<any> {
    const url: string = this.getTIEUrl() + search;
    const headers = new HttpHeaders();

    return this.http.get<any>(url, {headers});
  }

  deleteTIE(resource: string): Observable<any> {
    const headers: HttpHeaders = this.getEPRHeaders(false);
    headers.append('Content-Type', 'application/fhir+json');
    headers.append('Prefer', 'return=representation');
    return this.http.delete<any>(this.tieUrl + resource, {headers});
  }

  public getConf(search: string): Observable<any> {
    const url: string = this.conformanceUrl + search;
    const headers = new HttpHeaders();
    return this.http.get<any>(url, {headers});
  }
  public getDirectory(search: string): Observable<any> {
    const url: string = this.directoryUrl + search;
    const headers = new HttpHeaders();
    return this.http.get<any>(url, {headers});
  }

  public getResource(search: string): Observable<any> {

    const url = this.getFHIRServerBase() + search;
    let headers = new HttpHeaders(
    );

    if (this.format === 'xml') {
      headers = headers.append('Content-Type', 'application/fhir+xml');
      headers = headers.append('Accept', 'application/fhir+xml');
      return this.http.get(url, {headers, responseType: 'blob' as 'blob'});
    } else {
      return this.http.get<any>(url, {headers: this.getHeaders(true)});
    }
  }



  public getResults(url: string): Observable<Bundle> {

      return this.http.get<any>(url, {headers: this.getHeaders(true)});

  }

  getBinary(url: string): Observable<Binary> {
    return this.http.get<Binary>(url, {headers: this.getEPRHeaders(true)});
  }

  getBinaryRaw(url: string): Observable<any> {

    // const url = this.getBaseUrl() + `/Binary/${id}`;

    return this.http.get(url, {headers: this.getEPRHeaders(false), responseType: 'blob'});

  }

  getCompositionDocumentHTML(url: string): Observable<any> {

    // const url = this.getBaseUrl() + `/Binary/${id}`;

    let headers = this.getEPRHeaders(false);
    headers = headers.append('Content-Type', 'text/html');

    return this.http
      .get(url, {headers, responseType: 'text' as 'text'});
  }

  getCompositionDocumentPDF(url: string): Observable<any> {

    // const url = this.getBaseUrl() + `/Binary/${id}`;

    let headers = this.getEPRHeaders(false);
    headers = headers.append(
      'Content-Type', 'application/pdf');

    return this.http
      .get(url, {headers, responseType: 'blob' as 'blob'});
  }

  searchPatients(term: string): Observable<Bundle> {
    const url = this.getBaseUrl();
    if (!isNaN(parseInt(term))) {
      return this.http.get<Bundle>(url + `/Patient?identifier=${term}`, {headers: this.getEPRHeaders()});
    } else {

      return this.http.get<Bundle>(url + `/Patient?name=${term}`, {headers: this.getEPRHeaders()});

    }
  }

  searchConcepts(term: string, valueSet: string): Observable<ValueSet> {
    const url = this.conformanceUrl;
    return this.http.get<ValueSet>(url +
      `/ValueSet/$expand?url=${valueSet}&filter=${term}`);
  }

  searchConceptsInternational(term: string, valueSet: string): Observable<ValueSet> {
    const url = this.ontoUrl;
    return this.http.get<ValueSet>(url +
        `/ValueSet/$expand?url=${valueSet}&filter=${term}`);
  }

  private getTIEUrl(): string {
     return this.tieUrl;
  }

  getQuantity(valueQuantity: Quantity): string {
    let unit = '';
    if (valueQuantity.unit !== undefined) {
      unit = valueQuantity.unit;
    }
    var str = valueQuantity.value?.toLocaleString('fullwide', { useGrouping: false });
  //  console.log(str);
    return <string>str;
  }
  getQuantityValue(valueQuantity: Quantity): string {
    // @ts-ignore
    var str = valueQuantity.value?.toLocaleString('fullwide', { useGrouping: false });
   //
    // console.log(str);
    return <string>str;
  }
  getQuantityUnit(valueQuantity: Quantity): string {
    if (valueQuantity.unit !== undefined) {
      return valueQuantity.unit;
    }
    return '';
  }


  getEndDate(activity: SummaryActivity): Date {
    const end = new Date(activity.start_date);
    const start = new Date(activity.start_date);
    end.setTime(end.getTime() + (activity.elapsed_time * 1000));
    return end;
  }

  getFromDate(): Date {
    return <Date>this.from;
  }



  getType(type: string): string {
    return type;
  }

  sendTransaction(originalTransaction: Bundle, infoMsg: string): void {
    let trans = this.newTransaction();
    let count = this.maxTransactionSize;
    if (originalTransaction.entry !== undefined) {
      for (const entry of originalTransaction.entry) {
        count--;
        // @ts-ignore
        trans.entry.push(entry);
        if (count < 1) {
          console.log('POST Transaction Batched ' + infoMsg + ' Remaining ' + (originalTransaction.entry.length - count));
          this.sendTransactionInternal(trans, infoMsg);
          count = this.maxTransactionSize;
          trans = this.newTransaction();
        }
      }
      // @ts-ignore
      if (trans.entry.length > 0) {
        this.sendTransactionInternal(trans, infoMsg);
      }
    }
    console.log('POST Transaction End ' + infoMsg);
  }

  newTransaction(): Bundle {
    return {
      resourceType: 'Bundle',
      type: 'transaction',
      entry: []
    };
  }
  private sendTransactionInternal(body: Bundle, infoMsg: string): Subscription{

    const headers = this.getHeaders();

    return this.http.post<any>(this.tieUrl, body, { headers} ).pipe(
        // retry(3)
        // May need to consider this
    ).subscribe(result => {
          // console.log('POSTED ' + infoMsg);
        },
        (err) => {

          if (err.status === 401) {
            console.log('Server Busy for ' + infoMsg);
            // pop onto queue?
          }
          else if (err.status === 504) {
            console.log('Timeout for ' + infoMsg);
            // pop onto queue?
          }else {
            console.log('Http Error for ' + infoMsg);
            console.log(JSON.stringify(body));
            console.log(err);
          }
        });
  }

  public getUKCore(profile: string ) : string {
    return "https://simplifier.net/resolve?target=simplifier&fhirVersion=R4&scope=fhir.r4.ukcore.stu3.currentbuild&canonical="+profile;
  }


  setQuestionnaires(bundle: Bundle) {
     if (bundle.entry !== undefined) {
       bundle.entry.forEach( entry => {
         if (entry.resource !== undefined && entry.resource.resourceType === 'Questionnaire') this.questionnaires.push(entry.resource)

       })
     }
  }
  getQuestionnaire(url : string) : Questionnaire | undefined {
    var questionnaire = undefined;
    this.questionnaires.forEach(form => {
       if (url === form.url) {
         questionnaire = form;
       }
        if (url === ('Questionnaire/' + form.id)) {
          questionnaire = form;
        }
    })
    return questionnaire;
  }

    getErrorMessage(error: any) {
    var errorMsg = ''
      if (error.error !== undefined){

         if (error.error.issue !== undefined) {
          errorMsg += ' ' + error.error.issue[0].diagnostics
        }
      }
      errorMsg += '\n\n ' + error.message
        return errorMsg;
    }
}
