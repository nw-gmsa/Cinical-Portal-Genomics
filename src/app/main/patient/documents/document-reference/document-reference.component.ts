import {Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewContainerRef} from '@angular/core';
import {Router} from "@angular/router";


import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {DocumentReference} from 'fhir/r4';
import {FhirService} from '../../../../services/fhir.service';
import {ResourceDialogComponent} from '../../../../dialogs/resource-dialog/resource-dialog.component';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';

@Component({
  selector: 'app-document-reference',
  templateUrl: './document-reference.component.html',
  styleUrls: ['./document-reference.component.css']
})
export class DocumentReferenceComponent implements OnInit {

  @Input() documents: DocumentReference[] | undefined;

  @Input() documentsTotal: number | undefined;

  @Input() patientId: string | undefined;

  @Output() documentReference = new EventEmitter<any>();



  // @ts-ignore
  dataSource: MatTableDataSource<DocumentReference>;

  @ViewChild(MatSort) sort: MatSort | undefined;

  displayedColumns = ['open', 'created','category', 'type', 'setting', 'author', 'custodian',  'mime', 'status', 'resource'];

  constructor(private router: Router,
              private _viewContainerRef: ViewContainerRef,
              public fhirService: FhirService,
              public dialog: MatDialog) { }

  ngOnInit() {
    if (this.patientId !== undefined) {
      //this.dataSource = new DocumentReferenceDataSource(this.fhirService, this.patientId, []);
    } else {
      this.dataSource = new MatTableDataSource<DocumentReference>(this.documents);
    }
  }

  ngAfterViewInit() {
    if (this.sort != undefined) {
      this.sort.sortChange.subscribe((event) => {
        console.log(event);
      });
      // @ts-ignore
      this.dataSource.sort = this.sort;
    } else {
      console.log('SORT UNDEFINED');
    }
  }

  selectDocument(document: DocumentReference) {

    this.documentReference.emit(document);

  }




  getMime(mimeType: string) {

    switch (mimeType) {
        case 'application/fhir+xml':
        case 'application/fhir+json':
          return 'FHIR Document';

        case 'application/pdf':
          return 'PDF';
        case 'image/jpeg':
          return 'Image';
    }
    return mimeType;
  }

  select(resource: any) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      id: 1,
      resource: resource
    };
    const resourceDialog: MatDialogRef<ResourceDialogComponent> = this.dialog.open( ResourceDialogComponent, dialogConfig);
  }
}
