import {Component, Input, OnInit} from '@angular/core';
import {Questionnaire, QuestionnaireItem} from "fhir/r4";
import {MatTreeNestedDataSource} from "@angular/material/tree";
import {NestedTreeControl} from "@angular/cdk/tree";

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

  ngOnInit(): void {
    if (this.questionnaire !== undefined && this.questionnaire.item !== undefined) {
      console.log('called')
      this.dataSource.data = this.questionnaire.item;
    }
  }


}
