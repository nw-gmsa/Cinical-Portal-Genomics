import {Component, Inject, Input, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {QuestionnaireResponse, QuestionnaireResponseItem} from 'fhir/r4';
import {MatTreeNestedDataSource} from '@angular/material/tree';
import {NestedTreeControl} from '@angular/cdk/tree';
import {FhirService} from '../../../../services/fhir.service';

@Component({
  selector: 'app-questionnaire-response-view',
  templateUrl: './questionnaire-response-view.component.html',
  styleUrls: ['./questionnaire-response-view.component.scss']
})
export class QuestionnaireResponseViewComponent implements OnInit {

  dataSource = new MatTreeNestedDataSource<QuestionnaireResponseItem>();
  treeControl = new NestedTreeControl<QuestionnaireResponseItem>(node => node.item);
  @Input() resource: QuestionnaireResponse | undefined;
  hasChild = (_: number, node: QuestionnaireResponseItem) => !!node.item && node.item.length > 0;
  constructor(public fhir: FhirService,
              @Inject(MAT_DIALOG_DATA) data: any) {
    this.resource = data.resource;
    // @ts-ignore
    this.dataSource.data = this.resource.item;
  }

  ngOnInit(): void {
  }

}
