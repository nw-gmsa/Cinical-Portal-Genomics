import {Component, Inject, Input, OnInit, ViewContainerRef} from '@angular/core';

import {ActivatedRoute} from '@angular/router';
import { TdDialogService} from '@covalent/core/dialogs';
import {Binary, DocumentReference} from "fhir/r4";
import {EprService} from "../../../../services/epr.service";
import {FhirService} from "../../../../services/fhir.service";

@Component({
  selector: 'app-binary',
  templateUrl: './binary.component.html',
  styleUrls: ['./binary.component.css']
})
export class BinaryComponent implements OnInit {


  binary: Binary | undefined;
  document: DocumentReference | undefined;

  public docType: string | undefined;

  pdfSrc: string = '';

  html: string = '';

  image: string |undefined

  page = 1;
  totalPages: number | undefined;
  isLoaded = false;
  patientId: string = '';
  private docid: string | undefined = undefined;

  constructor(
              private _dialogService: TdDialogService,
              private _viewContainerRef: ViewContainerRef,
              public fhirService: FhirService,
              private eprService: EprService,
              private route: ActivatedRoute) {
  }

  nextPage() {
    this.page++;
  }

  prevPage() {
    this.page--;
  }
  afterLoadComplete(pdfData: any) {
    this.totalPages = pdfData.numPages;
    this.isLoaded = true;
  }


  ngOnInit() {
    const docid= this.route.snapshot.paramMap.get('docid');
    if (docid != null) {
      this.docid = docid;
      this.getRecords()
    }
    if (this.eprService.patient !== undefined) {
      if (this.eprService.patient.id !== undefined) {
        this.patientId = this.eprService.patient.id;
      }

    }
    this.eprService.patientChangeEvent.subscribe(patient => {
      if (patient.id !== undefined) this.patientId = patient.id
    });
  }

  private getRecords() {
    this.fhirService.getResource('/DocumentReference/'+this.docid).subscribe(documentReference => {
          if (documentReference !== undefined) {
            this.document = documentReference;
            if (documentReference.content !== undefined && documentReference.content.length > 0 && documentReference.content[0].attachment !== undefined
                && documentReference.content[0].attachment.url !== undefined) {

              this.fhirService.getBinary(documentReference.content[0].attachment.url).subscribe(result => {
                this.binary = result;
                this.processBinary();
              })
            }
          }
        }
    );
  }
  processBinary() {
    if (this.binary !== undefined && this.document !== undefined) {
      if (this.binary.contentType === 'application/fhir+xml'
          || this.binary.contentType === 'application/fhir+json') {
        //this.docType = 'fhir';
      } else if (this.binary.contentType === 'application/pdf') {
        /* var decode = atob(this.binary.data);
         var mediaSource = new Blob([decode], { type: 'application/pdf' });
         const fileURL = URL.createObjectURL(mediaSource);*/
        if (this.document.content[0].attachment.url !== undefined) this.pdfSrc = this.document.content[0].attachment.url;
        this.docType = 'pdf';
        this.isLoaded = true;
      }
      else if (this.binary.contentType.indexOf('html') !== -1) {
        this.docType = 'html';
        if (typeof this.binary.data === "string") {
          this.html = atob(this.binary.data);
        }
      }
      else if (this.binary.contentType.indexOf('image') !== -1) {
        console.log(this.document.content[0].attachment.url)
        this.image = this.document.content[0].attachment.url
        this.docType = 'image';
      }
    }
  }
}
