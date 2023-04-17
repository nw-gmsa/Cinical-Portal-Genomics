import {Component, EventEmitter, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {FhirService} from "../../../../services/fhir.service";
import {DialogService} from "../../../../services/dialog.service";
import {
  Binary,
  Coding,
  DocumentReference,
  Organization,
  Practitioner,
  Reference,
  ValueSetExpansionContains
} from "fhir/r4";
import * as uuid from "uuid";
import {Observable, Subject} from "rxjs";
import {catchError, debounceTime, distinctUntilChanged, map, switchMap} from "rxjs/operators";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {Moment} from "moment/moment";
import {MatSelectChange} from "@angular/material/select";
import {environment} from "../../../../../environments/environment";

var Fhir = require('fhir').Fhir;

@Component({
  selector: 'app-document-reference-create',
  templateUrl: './document-reference-create.component.html',
  styleUrls: ['./document-reference-create.component.scss']
})
export class DocumentReferenceCreateComponent implements OnInit {

  patientId: string | null = null;
  public nhsNumber: string | undefined;
  disabled: boolean = true;

  metadataStatus: string = 'current';
  metadataDocStatus: string = 'final';
  private metadataCategory: Coding | undefined;
  private typeCode: Coding | undefined;
  private organisation: Organization | undefined;
  private practitioner: Practitioner | undefined;

  types$: Observable<ValueSetExpansionContains[]> | undefined;
  careSetting$: Observable<ValueSetExpansionContains[]> | undefined;
  organisation$: Observable<Organization[]> | undefined;
  practitioner$: Observable<Practitioner[]> | undefined;
  private searchTypes = new Subject<string>();
  private searchCareSettings = new Subject<string>();
  private searchTermsOrg = new Subject<string>();
  private searchTermsDoc = new Subject<string>();
  statuses: ValueSetExpansionContains[] | undefined;
  careSettings: ValueSetExpansionContains[] | undefined;

  docstatuses: ValueSetExpansionContains[] | undefined;
  categories: ValueSetExpansionContains[] | undefined;
  metadataCreated: Moment | undefined;
  url: string | undefined;
  private metadataSetting: Coding | undefined;
  files: File | FileList | undefined;
  public fileLoaded: EventEmitter<any> = new EventEmitter();

  constructor(public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) data: any,
              public fhirService: FhirService,
              public dlgSrv: DialogService,
              private diaglogRef: MatDialogRef<DocumentReferenceCreateComponent>) {
    this.patientId = data.patientId;
    this.nhsNumber = data.nhsNumber;
  }

  ngOnInit(): void {
    this.fhirService.getConf('/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/document-reference-status').subscribe(
        resource  => {
          this.statuses = this.dlgSrv.getContainsExpansion(resource);
        }
    );
    this.fhirService.getConf('/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/composition-status').subscribe(
        resource  => {
          this.docstatuses = this.dlgSrv.getContainsExpansion(resource);
        }
    );
    this.fhirService.getConf('/ValueSet/$expand?url=https://fhir.nhs.uk/ValueSet/NHSDataModelAndDictionary-clinical-specialty').subscribe(
        resource  => {
          this.careSettings = this.dlgSrv.getContainsExpansion(resource);
        }
    );
    this.fhirService.getConf('/ValueSet/$expand?url=https://fhir.nhs.uk/ValueSet/DocumentCategory').subscribe(
        resource  => {
          this.categories = this.dlgSrv.getContainsExpansion(resource);
        }
    );
    this.careSetting$ = this.searchCareSettings.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term: string) => {
              return this.fhirService.searchConcepts(term, 'https://fhir.hl7.org.uk/ValueSet/UKCore-CareSettingType');
            }
        ),
        map(resource    => {
              return this.dlgSrv.getContainsExpansion(resource);
            }
        )
    ), catchError(this.dlgSrv.handleError('getPatients', []));
    this.practitioner$ = this.searchTermsDoc.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term: string) => {
              return this.fhirService.getDirectory('/Practitioner?name=' + term);
            }
        ),
        map(resource    => {
              return this.dlgSrv.getContainsPractitoner(resource);
            }
        )
    ), catchError(this.dlgSrv.handleError('getPractitioner', []));

    this.types$ = this.searchTypes.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term: string) => {
              return this.fhirService.searchConcepts(term, 'https://fhir.hl7.org.uk/ValueSet/UKCore-DocumentType');
            }
        ),
        map(resource    => {
              return this.dlgSrv.getContainsExpansion(resource);
            }
        )
    ), catchError(this.dlgSrv.handleError('getPatients', []));

    this.organisation$ = this.searchTermsOrg.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term: string) => {
              return this.fhirService.getDirectory('/Organization?name=' + term);
            }
        ),

        map(resource    => {
              return this.dlgSrv.getContainsOrganisation(resource);
            }
        )
    ), catchError(this.dlgSrv.handleError('getPractitioner', []));
  }

  checkSubmit(): void {
    this.disabled = true;
    if (
        this.metadataStatus !== undefined
        && this.metadataCategory !== undefined
        && this.url !== undefined
    ) {
      this.disabled = false;
    }
  }

  selectedStatus(status: MatSelectChange): void {
    this.metadataStatus = status.value;
    this.checkSubmit();
  }
  selectedDocStatus(status: MatSelectChange) {
    this.metadataDocStatus = status.value;
    this.checkSubmit();
  }

  selectedCategory(status: any): void {
    this.metadataCategory = status.value;
    this.checkSubmit();
  }
  selectedSetting(status: MatSelectChange) {
    console.log(status.value)
    this.metadataSetting = status.value;
    this.checkSubmit();
  }

  searchType(term: string) {
    if (term.length > 3) {
      this.searchTypes.next(term);
    }
  }
  searchOrg(value: string): void {
    if (value.length > 3) {
      this.searchTermsOrg.next(value);
    }
  }
  searchDoc(term: string): void {
    if (term.length > 3) {
      this.searchTermsDoc.next(term);
    }
  }
  selectedSettings(event: MatAutocompleteSelectedEvent) {
    this.metadataSetting = event.option.value;
    this.checkSubmit();
  }
  selectedDr(event: MatAutocompleteSelectedEvent): void {
    console.log(event.option.value)
    this.practitioner = event.option.value;
    this.checkSubmit();
  }

  searchCareSetting(value: string) {
    if (value.length > 1) {
      this.searchCareSettings.next(value);
    }
  }
  selectedOrg(event: MatAutocompleteSelectedEvent): void {
    this.organisation = event.option.value;
    this.checkSubmit();
  }

  selectedType(event: MatAutocompleteSelectedEvent) {
    this.typeCode = {
      system: event.option.value.system,
      code: event.option.value.code,
      display: event.option.value.display,
    };
    console.log(this.typeCode);
    this.checkSubmit();
  }


  submit(): void {
    const metadata: DocumentReference = {
      content: [],
      subject: {},
      category: [],
      author: [],
      identifier: [{
        system: 'https://tools.ietf.org/html/rfc4122',
        value: uuid.v4()
      }],
      resourceType: 'DocumentReference',
      status: 'current'
    };



      switch (this.metadataStatus) {
        case 'current' : {
          metadata.status = 'current';
          break;
        }
        case 'superseded' : {
          metadata.status = 'superseded';
          break;
        }
        case 'entered-in-error' : {
          metadata.status = 'entered-in-error';
          break;
        }
      }


      switch (this.metadataDocStatus) {
        //  | final | amended | entered-in-error
        case 'preliminary' : {
          metadata.docStatus = 'preliminary';
          break;
        }
        case 'final' : {
          metadata.docStatus = 'final';
          break;
        }
        case 'amended' : {
          metadata.docStatus = 'amended';
          break;
        }
        case 'entered-in-error' : {
          metadata.docStatus = 'entered-in-error';
          break;
        }
      }


    metadata.subject = {
      reference: 'Patient/' + this.patientId,
      identifier: {
        system: 'https://fhir.nhs.uk/Id/nhs-number',
        value: this.nhsNumber
      }
    };
    if (this.metadataCategory !== undefined && metadata.category !== undefined) {
      metadata.category.push({
        coding: [
          this.metadataCategory
        ]
      });
    }
    if (this.url !== undefined) {
      metadata.content = [{
        attachment: {
          url: this.url
        }
      }];
    }
    if (this.typeCode !== undefined) {
      metadata.type = {
        coding: [
          this.typeCode
        ]
      }
    }
    if (this.metadataSetting !== undefined) {
      metadata.context = {
        practiceSetting: {
          coding:[
            this.metadataSetting
          ]
        }
      }
    }
    if (this.organisation !== undefined ) {
      metadata.custodian = {
        reference: 'Organization/' + this.organisation.id,
        display: this.organisation.name
      };
      if (this.organisation.identifier !== undefined && this.organisation.identifier.length>0) {
        metadata.custodian.identifier = {
          system: this.organisation.identifier[0].system,
          value: this.organisation.identifier[0].value,
        }
      }
    }
    if (this.metadataCreated !== undefined) {
      metadata.date = this.metadataCreated.toISOString();
    }
    if (this.practitioner !== undefined ) {
      const reference : Reference = {
        reference: 'Practitioner/' + this.practitioner.id,
        display: this.fhirService.getIdentifiers(this.practitioner.identifier)
      };
      if (this.practitioner.identifier !== undefined
          && this.practitioner.identifier.length>0
      //    && metadata.author !== undefined
      ) {
        reference.identifier = {
          system: this.practitioner.identifier[0].system,
          value: this.practitioner.identifier[0].value,
        }
      }
      console.log(reference);
      metadata.author= [ reference ];
    }

    console.log(metadata);
    this.fhirService.postTIE('/DocumentReference', metadata).subscribe(result => {
      this.diaglogRef.close(result);

    });
  }
  selectEvent(files: FileList | File): void {
    // see also https://github.com/nhsconnect/careconnect-document-viewer/blob/master/web/src/app/modules/document-load/load-document.component.ts
    if (files instanceof FileList) {
      console.log('filelist')
    } else {
      this.postBinary(files)
    }
  };
  postBinary(file : File) {
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    this.fileLoaded.subscribe( (data) => {
          var binary : Binary = {
            resourceType: 'Binary',
            contentType: file.type,
            data: data
          }
          if (file.type == 'application/json') {
            // This is probably a fault on the backend server. It needs to be able to post json
            binary.contentType = 'text/plain'
          }
          this.fhirService.postTIE('/Binary',binary).subscribe(response => {
            this.url = environment.tieServer + '/Binary/'+ response.id
          });
        }
    );
    const me = this;
    reader.onload = (event: Event) => {
      if (reader.result instanceof ArrayBuffer) {
        console.log('array buffer');

        // @ts-ignore
        me.fileLoaded.emit(btoa(String.fromCharCode.apply(null, reader.result)));
      } else {
        console.log('not a buffer');
        if (reader.result !== null) me.fileLoaded.emit(btoa(reader.result));
      }
    };
    reader.onerror = function (error) {
      console.log('Error: ', error);
    };
  }

}
