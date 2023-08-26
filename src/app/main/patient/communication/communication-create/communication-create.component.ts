import {Component, Inject, OnInit} from '@angular/core';
import {
  Coding,
  Communication,
  DocumentReference,
  Organization, Practitioner,
  Reference,
  ValueSetExpansionContains
} from 'fhir/r4';
// @ts-ignore
import * as uuid from 'uuid';
import {FhirService} from '../../../../services/fhir.service';
import {DialogService} from '../../../../services/dialog.service';
import {Observable, Subject} from 'rxjs';
import {catchError, debounceTime, distinctUntilChanged, map, switchMap} from 'rxjs/operators';
import {TdDialogService} from "@covalent/core/dialogs";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {MatSelectChange} from "@angular/material/select";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";

@Component({
  selector: 'app-communication-create',
  templateUrl: './communication-create.component.html',
  styleUrls: ['./communication-create.component.scss']
})
export class CommunicationCreateComponent implements OnInit {
  categories: ValueSetExpansionContains[] | undefined;
  private category: Coding | undefined;

  patientId = undefined;
  nhsNumber = undefined;
  disabled = false;
  notes: string | undefined;
  chosenItem = '1';

  organisation$: Observable<Organization[]> | undefined;
  practitioner$: Observable<Practitioner[]> | undefined;
  documents: DocumentReference[] = [];
  private organisation: Organization | undefined;
  private practitioner: Practitioner | undefined;
  private searchTermsOrg = new Subject<string>();
  private searchTermsDoc = new Subject<string>();
  selectedFoods: any;
  // @ts-ignore
  constructor(public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) data,
              public fhirService: FhirService,
              public dlgSrv: DialogService,
              private _dialogService: TdDialogService,
              private diaglogRef: MatDialogRef<CommunicationCreateComponent>) {
    this.patientId = data.patientId;
    this.nhsNumber = data.nhsNumber;
  }

  ngOnInit(): void {
    this.fhirService.getConf('/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/communication-category').subscribe(
      resource  => {
        this.categories = this.dlgSrv.getContainsExpansion(resource);
      }
    );
    this.fhirService.get('/DocumentReference?patient=' + this.patientId).subscribe(bundle => {
        if (bundle.entry !== undefined) {
          for (const entry of bundle.entry) {
            if (entry.resource !== undefined && entry.resource.resourceType === 'DocumentReference') {
               this.documents.push(entry.resource);
            }
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
    , catchError(this.dlgSrv.handleError('getPractitioner', [])));

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

  selectedCategory(status: MatSelectChange): void {
    this.category = status.value;
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

  selectedOrg(event: MatAutocompleteSelectedEvent): void {
    this.organisation = event.option.value;
    this.checkSubmit();
  }

  selectedDr(event: MatAutocompleteSelectedEvent): void {
    this.practitioner = event.option.value;
    this.checkSubmit();
  }

  checkSubmit(): void {
    // console.log(this.chosenItem);
    // if (this.chosenItem === '1') console.log('Is string 1');
    // if (this.chosenItem === 1) console.log('Is number 1');
    this.disabled = true;
    if (this.notes === undefined && (this.practitioner === undefined || this.organisation === undefined)) {
      this.disabled = false;
    }
  }

  submit(): void {
    const communication: Communication = {
      subject: undefined,
      identifier: [{
        system: 'https://tools.ietf.org/html/rfc4122',
        value: uuid.v4()
      }],
      category: [],
      recipient: [],
      resourceType: 'Communication',
      status: 'completed',
    };
    communication.subject = {
      reference: 'Patient/' + this.patientId,
      identifier: {
        system: 'https://fhir.nhs.uk/Id/nhs-number',
        value: this.nhsNumber
      }
    };
    if (this.category !== undefined) {
      // @ts-ignore
      communication.category.push({
        coding : [
          this.category
        ]
      });
    }
    if (this.chosenItem === '1') {
      if (this.organisation !== undefined) {
        const reference: Reference = {
          reference: 'Organization/' + this.organisation.id
        };
        if (this.organisation.identifier !== undefined && this.organisation.identifier.length > 0) {
          reference.identifier = this.organisation.identifier[0];
        }
        // @ts-ignore
        communication.recipient.push(reference);
      }
      if (this.practitioner !== undefined) {
        const reference: Reference = {
          reference: 'Practitioner/' + this.practitioner.id
        };
        if (this.practitioner.identifier !== undefined && this.practitioner.identifier.length > 0) {
          reference.identifier = this.practitioner.identifier[0];
        }
        // @ts-ignore
        communication.recipient.push(reference);
      }
      communication.sender = {
        reference: 'Patient/' + this.patientId,
        identifier: {
          system: 'https://fhir.nhs.uk/Id/nhs-number',
          value: this.nhsNumber
        }
      };
    } else {
      if (this.organisation !== undefined) {
        const reference: Reference = {
          reference: 'Organization/' + this.organisation.id
        };
        if (this.organisation.identifier !== undefined && this.organisation.identifier.length > 0) {
          reference.identifier = this.organisation.identifier[0];
        }
        communication.sender = reference;
      }
      if (this.practitioner !== undefined) {
        const reference: Reference = {
          reference: 'Practitioner/' + this.practitioner.id
        };
        if (this.practitioner.identifier !== undefined && this.practitioner.identifier.length > 0) {
          reference.identifier = this.practitioner.identifier[0];
        }
        communication.sender = reference;
      }
      // @ts-ignore
      communication.recipient.push({
        reference: 'Patient/' + this.patientId,
        identifier: {
          system: 'https://fhir.nhs.uk/Id/nhs-number',
          value: this.nhsNumber
        }
      });
    }
    // @ts-ignore
    communication. payload = [{ contentString: this.notes.trim() }];

    console.log(this.selectedFoods);
    if (this.selectedFoods !== undefined && this.selectedFoods.length > 0) {
      for (const resource of this.selectedFoods) {
        const document = resource as DocumentReference;
        // @ts-ignore
        // @ts-ignore
        const reference: Reference = {
          reference: 'DocumentReference/' + document.id
        };
        if (document.date !== undefined && document.category !== undefined) {
          reference.display = document.date.split('T')[0] + ' ' + this.fhirService.getCodeableConceptValue(document.category[0])
        }
        communication.payload.push({
          contentReference: reference
        });
      }
    }

    console.log(communication);
    communication.sent = this.dlgSrv.getFHIRDateString(new Date());
    this.fhirService.postTIE('/Communication', communication).subscribe(result => {
      this.diaglogRef.close();
      this.dialog.closeAll();
    },
        error => {
          console.log(JSON.stringify(error))
          this._dialogService.openAlert({
            title: 'Alert',
            disableClose: true,
            message:
                this.fhirService.getErrorMessage(error),
          });
        });

  }

  getName(doc: DocumentReference): string {
    let result = '';
    if (doc.date !== undefined) {
      result  += doc.date.split('T')[0];
    }
    if (doc.category !== undefined) {
      for (const cat of doc.category) {
        result += this.fhirService.getCodeableConceptValue(cat)
      }
    }
    return result;
  }
}
