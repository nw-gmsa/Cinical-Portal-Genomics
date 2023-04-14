import {Component, EventEmitter, Inject, OnInit} from '@angular/core';
import {
  Attachment,
  Binary, CareTeam,
  Coding,
  DiagnosticReport,
  Organization,
  Practitioner, Reference, Resource,
  ValueSetExpansionContains
} from "fhir/r4";
import * as uuid from "uuid";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {FhirService} from "../../../../services/fhir.service";
import {DialogService} from "../../../../dialogs/dialog.service";
import {Observable, Subject} from "rxjs";
import {catchError, debounceTime, distinctUntilChanged, map, switchMap} from "rxjs/operators";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {Moment} from "moment";
import {environment} from "../../../../../environments/environment";
import {MatSelectChange} from "@angular/material/select";

@Component({
  selector: 'app-diagnostic-report-create',
  templateUrl: './diagnostic-report-create.component.html',
  styleUrls: ['./diagnostic-report-create.component.scss']
})
export class DiagnosticReportCreateComponent implements OnInit {
  disabled: boolean = true;
  patientId: string |  undefined;
  nhsNumber: string | undefined;
  statuses: ValueSetExpansionContains[] | undefined;

  code: Coding | undefined;
  code$: Observable<ValueSetExpansionContains[]> | undefined;
  private searchCode = new Subject<string>();

  status: string = 'final'
  periodStartM: Moment | undefined;
  periodEndM: Moment | undefined;

  files: File | FileList | undefined;
  public fileLoaded: EventEmitter<any> = new EventEmitter();
  binary : Binary | undefined;

  careTeams: CareTeam[] = [];

  organisation$: Observable<Organization[]> | undefined;
  practitioner$: Observable<Practitioner[]> | undefined;
  performers: Resource[] = [];

  private searchTermsOrg = new Subject<string>();
  private searchTermsDoc = new Subject<string>();


  constructor(public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) data: any,
              public fhirService: FhirService,
              public dlgSrv: DialogService,
              private diaglogRef: MatDialogRef<DiagnosticReportCreateComponent>) {
    this.patientId = data.patientId;
    this.nhsNumber = data.nhsNumber;
  }

  ngOnInit(): void {


    this.fhirService.getConf('/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/diagnostic-report-status').subscribe(
        resource  => {
          this.statuses = this.dlgSrv.getContainsExpansion(resource);
        }
    );

    this.code$ = this.searchCode.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term: string) => {
              return this.fhirService.getConf(`/ValueSet/$expandEcl?ecl=descendantOrSelfOf 371525003&filter=${term}&count=30`);
            }
        ),
        map(resource    => {
              return this.dlgSrv.getContainsExpansion(resource);
            }
        )
    ), catchError(this.dlgSrv.handleError('getReasons', []));

    this.fhirService.getTIE('/CareTeam?patient=' + this.patientId).subscribe(bundle => {
          if (bundle.entry !== undefined) {
            for (const entry of bundle.entry) {
              if (entry.resource !== undefined && entry.resource.resourceType === 'CareTeam') { this.careTeams.push(entry.resource as CareTeam); }
            }
          }
        }
    );
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

  selectedOrg(event: MatAutocompleteSelectedEvent): void {
    this.performers.push(event.option.value);
    this.checkSubmit();
  }
  searchDoc(term: string): void {
    if (term.length > 3) {
      this.searchTermsDoc.next(term);
    }
  }
  searchOrg(term: string): void {
    if (term.length > 3) {
      this.searchTermsOrg.next(term);
    }
  }

  selectedDr(event: MatAutocompleteSelectedEvent): void {
    this.performers.push(event.option.value);
    this.checkSubmit();
  }
  selectedCode(event: MatAutocompleteSelectedEvent) {
    this.code = event.option.value;
    this.checkSubmit();
  }
  selectedCareTeam($event: MatSelectChange) {
    //console.log($event)
    this.performers.push($event.value);
  }

  selectEvent(files: FileList | File): void {
    // see also https://github.com/nhsconnect/careconnect-document-viewer/blob/master/web/src/app/modules/document-load/load-document.component.ts
    if (files instanceof FileList) {
      console.log('filelist')
    } else {
      this.postBinary(files)
    }
  };
  checkSubmit(): void {
    this.disabled = true;
    if (this.status !== undefined
        && this.code !== undefined
    ) {
      this.disabled = false;
    }
  }

  submit(): void {
    const diagnosticReport: DiagnosticReport = {
      code: {},
      status: 'final',
      subject: {},
      identifier: [{
        system: 'https://tools.ietf.org/html/rfc4122',
        value: uuid.v4()
      }],
      effectivePeriod : {},
      resourceType: 'DiagnosticReport'
    };

    switch (this.status) {
      case 'registered' : {
        diagnosticReport.status = 'registered'
        break;
      }
      case 'partial' : {
        diagnosticReport.status = 'partial'
        break;
      }
      case 'preliminary' : {
        diagnosticReport.status = 'preliminary'
        break;
      }
      case 'final' : {
        diagnosticReport.status = 'final'
        break;
      }
    }
    if (this.code !== undefined) {
      diagnosticReport.code = {
        coding: [
          this.code
        ]
      }
    }

    diagnosticReport.subject = {
      reference: 'Patient/' + this.patientId,
    };
    diagnosticReport.issued = new Date().toISOString();
    if (this.nhsNumber !== undefined) {
      diagnosticReport.subject.identifier = {
        system: 'https://fhir.nhs.uk/Id/nhs-number',
        value: this.nhsNumber
      }
    }
    if (this.periodStartM !== undefined) {
      // @ts-ignore
      diagnosticReport.effectivePeriod.start = this.periodStartM.toISOString().split('T')[0];
    }
    if (this.periodEndM !== undefined) {
      // @ts-ignore
      diagnosticReport.effectivePeriod.end = this.periodEndM.toISOString().split('T')[0];
    }

    if (this.binary !== undefined) {
      const attachment : Attachment = {
        contentType : this.binary.contentType,
        data : this.binary.data
      }
      diagnosticReport.presentedForm = [
          attachment
      ]
    }

    if (this.performers !== undefined) {
      diagnosticReport.performer = [];
      this.performers.forEach(performer => {
        let reference : Reference = {
          type: performer.resourceType,
          display: this.dlgSrv.getResourceDisplay(performer),
          reference: performer.resourceType + '/' + performer.id
        }
        // @ts-ignore
        if (performer.identifier !== undefined) {
           // @ts-ignore
          reference.identifier = performer.identifier[0]
        }
        diagnosticReport.performer?.push(reference)
      })
    }

    console.log(JSON.stringify(diagnosticReport));
    this.fhirService.postTIE('/DiagnosticReport', diagnosticReport).subscribe(diagnosticReport => {

      this.diaglogRef.close(diagnosticReport);
    });
  }

  searchCodes(value: string) {
    if (value.length > 2) {
      this.searchCode.next(value);
    }
  }



  postBinary(file : File) {
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    this.fileLoaded.subscribe( (data) => {
          var binary : Binary = {
            resourceType: 'Binary',
            contentType: file.type,
            data: data
          }
          this.binary = binary;
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
