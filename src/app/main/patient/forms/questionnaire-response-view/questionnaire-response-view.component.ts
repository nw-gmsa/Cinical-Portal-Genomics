import {Component, Inject, Input, OnInit} from '@angular/core';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import {QuestionnaireResponse, QuestionnaireResponseItem} from 'fhir/r4';
import {MatTreeNestedDataSource} from '@angular/material/tree';
import {NestedTreeControl} from '@angular/cdk/tree';
import {FhirService} from '../../../../services/fhir.service';
import {ActivatedRoute} from "@angular/router";
import {EprService} from "../../../../services/epr.service";

@Component({
  selector: 'app-questionnaire-response-view',
  templateUrl: './questionnaire-response-view.component.html',
  styleUrls: ['./questionnaire-response-view.component.scss']
})
export class QuestionnaireResponseViewComponent implements OnInit {
  patientId: string = '';
  dataSource = new MatTreeNestedDataSource<QuestionnaireResponseItem>();
  treeControl = new NestedTreeControl<QuestionnaireResponseItem>(node => node.item);
  @Input() resource: QuestionnaireResponse | undefined;
  hasChild = (_: number, node: QuestionnaireResponseItem) => !!node.item && node.item.length > 0;
  private form: any;
  constructor(public fhir: FhirService,
              private eprService: EprService,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    const form= this.route.snapshot.paramMap.get('form');
    if (form != null) {
      this.form = form;
      this.getRecords()
    }
    let patient = this.eprService.getPatient()
    if (patient !== undefined) {
      if (patient.id !== undefined) {
        this.patientId = patient.id
      }
    }
    this.eprService.patientChangeEvent.subscribe(patient => {
      if (patient.id !== undefined) this.patientId = patient.id
    });

  }
  getRecords() {

    this.fhir.getTIE('/QuestionnaireResponse/' + this.form).subscribe(resource => {
          if (resource !== undefined && resource.resourceType === 'QuestionnaireResponse') {
            this.dataSource.data = resource.item;
          }
        }
    );

  }

}
