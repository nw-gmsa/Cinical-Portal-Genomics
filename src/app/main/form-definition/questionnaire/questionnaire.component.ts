import {Component, Input, OnInit, SimpleChanges} from '@angular/core';
import {Coding, Questionnaire, QuestionnaireItem} from "fhir/r4";
import {MatTreeNestedDataSource} from "@angular/material/tree";
import {NestedTreeControl} from "@angular/cdk/tree";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {ResourceDialogComponent} from "../../../dialogs/resource-dialog/resource-dialog.component";
import {FhirService} from "../../../services/fhir.service";
import {Router} from "@angular/router";
import {LiveAnnouncer} from "@angular/cdk/a11y";
import {ConceptDialogComponent} from "../../../dialogs/concept-dialog/concept-dialog.component";
import {DialogService} from "../../../services/dialog.service";

@Component({
  selector: 'app-questionnaire',
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.scss']
})
export class QuestionnaireComponent implements OnInit {

  @Input() questionnaire: Questionnaire | undefined;


  dataSource = new MatTreeNestedDataSource<QuestionnaireItem>();
  treeControl = new NestedTreeControl<QuestionnaireItem>(node => node.item);
  hasChild = (_: number, node: QuestionnaireItem) => !!node.item && node.item.length > 0;

  constructor(public dialog: MatDialog,public dlgservice: DialogService) { }

  ngOnInit(): void {
    if (this.questionnaire !== undefined && this.questionnaire.item !== undefined) {

      this.dataSource.data = this.questionnaire.item;
    }
  }
  ngOnChanges(changes: SimpleChanges) {

    if (changes['questionnaire']) {
      if (this.questionnaire !== undefined && this.questionnaire.item !== undefined) {

        this.dataSource.data = this.questionnaire.item;
      }
    }
  }
  select(resource: any): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      resource
    };
    const resourceDialog: MatDialogRef<ResourceDialogComponent> = this.dialog.open( ResourceDialogComponent, dialogConfig);
  }
  selectConcept(concept: Coding) {
    if (concept !== undefined && concept.system !== undefined && (concept.system === 'http://snomed.info/sct' || concept.system === 'http://loinc.org')) {
      const dialogConfig = new MatDialogConfig();

      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;
      dialogConfig.data = {
        concept
      };
      const resourceDialog: MatDialogRef<ConceptDialogComponent> = this.dialog.open(ConceptDialogComponent, dialogConfig);
    }
  }

}
