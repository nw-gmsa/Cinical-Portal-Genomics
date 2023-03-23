import {Component, Inject, Input, OnInit, ViewContainerRef} from '@angular/core';

import {ActivatedRoute} from '@angular/router';
import { TdDialogService} from '@covalent/core/dialogs';

import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Binary, DocumentReference} from "fhir/r4";

@Component({
  selector: 'app-binary',
  templateUrl: './binary.component.html',
  styleUrls: ['./binary.component.css']
})
export class BinaryComponent implements OnInit {


  @Input() binary: Binary;
  @Input() document:
    DocumentReference;

  public docType: string | undefined;

  pdfSrc: string = '';

  html: string = '';

  image: string |undefined

  page = 1;
  totalPages: number | undefined;
  isLoaded = false;



  constructor(
              private _dialogService: TdDialogService,
              private _viewContainerRef: ViewContainerRef,
              private route: ActivatedRoute,
  @Inject(MAT_DIALOG_DATA) data: any) {
    this.binary = data.binary;
    this.document = data.documentReference
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
    console.log(this.binary)
    if (this.binary !== undefined) {
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
