import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {QuestionnaireResponse} from 'fhir/r4';
import {ResourceDialogComponent} from '../../../../dialogs/resource-dialog/resource-dialog.component';
import {FhirService} from '../../../../services/fhir.service';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {QuestionnaireResponseViewComponent} from '../questionnaire-response-view/questionnaire-response-view.component';

@Component({
  selector: 'app-questionnaire-response',
  templateUrl: './questionnaire-response.component.html',
  styleUrls: ['./questionnaire-response.component.css']
})
export class QuestionnaireResponseComponent implements OnInit {

    @Input() forms: QuestionnaireResponse[] | undefined;

    @Input() showDetail = false;

    @Input() patientId: string | undefined;

    @Output() form = new EventEmitter<any>();

    @Input() useBundle = false;

  // @ts-ignore
    dataSource: MatTableDataSource<QuestionnaireResponse>;
  @ViewChild(MatSort) sort: MatSort | undefined;

    displayedColumns = ['date', 'open', 'questionnaire', 'status',  'source', 'author',  'resource'];

    constructor(
                public dialog: MatDialog,
                public fhirService: FhirService
    ) { }

    ngOnInit(): void {

        if (this.patientId !== undefined) {
          //  this.dataSource = new QuestionnaireResponseDataSource(this.fhirService, this.patientId, []);
        } else {
          this.dataSource = new MatTableDataSource<QuestionnaireResponse>(this.forms);
        }

    }
  ngAfterViewInit(): void {
    if (this.sort !== undefined) {
      this.sort.sortChange.subscribe((event) => {
        console.log(event);
      });
      // @ts-ignore
        this.dataSource.sort = this.sort;
    } else {
      console.log('SORT UNDEFINED');
    }
  }




    select(resource: any): void {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.data = {
            id: 1,
            resource
        };
        const resourceDialog: MatDialogRef<ResourceDialogComponent> = this.dialog.open( ResourceDialogComponent, dialogConfig);
    }

  selectForm(form : QuestionnaireResponse): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '40%';
    dialogConfig.data = {
      id: 1,
      resource: form
    };
    const resourceDialog: MatDialogRef<QuestionnaireResponseViewComponent> =
      this.dialog.open( QuestionnaireResponseViewComponent, dialogConfig);

  }

  getName(questionnaire: string ): string {

      if (questionnaire === undefined ) {
        return '';
      }
      if (questionnaire.includes('d4fe68ff-7ed9-47f6-862e-c994dada56a0')) { return 'About Me'; }
      if (questionnaire.includes('0d9fccea-9c98-4e61-b3e0-bc9b3a9db675')) { return 'Vital Signs'; }
      if (questionnaire.includes('6fba39d5-618f-4aef-ab09-97e601ac9dbb')) { return 'PROMs EQ Healthcare Questionnaire'; }
      if (questionnaire.includes('56969434-1980-4262-b6a7-ed1c8aca5ec2')) { return 'Kansas City Cardiomyopathy Questionnaire - 12 item [KCCQ-12]'; }
      if (questionnaire.includes('185a1edc-f0ea-4176-8a9d-035313326124')) { return 'Covid-19 Community Oxygen Weaning Virtual Ward Referral Form'; }
      return questionnaire;
  }
}
