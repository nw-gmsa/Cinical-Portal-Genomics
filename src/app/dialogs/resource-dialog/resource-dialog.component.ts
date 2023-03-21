import {Component, Inject, Input, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FhirResource} from "fhir/r4";


declare var $: any;

@Component({
  selector: 'app-resource-viewer',
  templateUrl: './resource-dialog.component.html',
  styleUrls: ['./resource-dialog.component.css']
})
export class ResourceDialogComponent implements OnInit {



  constructor(
    public dialogRef: MatDialogRef<ResourceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any) {
    this.resource = data.resource;
  }

  @Input() resource: FhirResource | undefined;


  entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#39;',
    '/': '&#x2F;'
  };

  ngOnInit(): void {
    console.log('Init Called TREE');
  }

  escapeHtml(source: string): string {
    // @ts-ignore
    return String(source).replace(/[&<>"'\/]/g, s => this.entityMap[s]);
  }


 }


