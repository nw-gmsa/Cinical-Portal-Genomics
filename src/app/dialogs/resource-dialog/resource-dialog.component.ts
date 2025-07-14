import {Component, Inject, Input, OnInit} from '@angular/core';
import {FhirResource} from "fhir/r4";
import {Fhir} from "fhir";
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";

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
    //console.log('Init Called TREE');
  }

  escapeHtml(source: string): string {
    // @ts-ignore
    return String(source).replace(/[&<>"'\/]/g, s => this.entityMap[s]);
  }


    protected readonly JSON = JSON;

    getXML(resource: FhirResource) {
      var fhir = new Fhir();
      return this.formatXml(fhir.jsonToXml(JSON.stringify(resource)));
    }

  formatXml(xml: string, tab?: string) { // tab = optional indent value, default is tab (\t)
    var formatted = '', indent= '';
    if (tab === undefined) tab = '\t';
    xml.split(/>\s*</).forEach(function(node) {
      if (node.match( /^\/\w/ )) { // @ts-ignore
        indent = indent.substring(tab.length);
      } // decrease indent by one 'tab'
      formatted += indent + '<' + node + '>\r\n';
      if (node.match( /^<?\w[^>]*[^\/]$/ )) indent += tab;              // increase indent
    });
    return formatted.substring(1, formatted.length-3);
  }
}


