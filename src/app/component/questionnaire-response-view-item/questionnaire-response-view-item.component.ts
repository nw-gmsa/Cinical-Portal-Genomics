import {Component, Input, OnInit} from '@angular/core';
import {QuestionnaireResponse, QuestionnaireResponseItem, QuestionnaireResponseItemAnswer} from 'fhir/r4';
import {FhirService} from '../../services/fhir.service';
import {Moment} from 'moment';

@Component({
  selector: 'app-questionnaire-response-view-item',
  templateUrl: './questionnaire-response-view-item.component.html',
  styleUrls: ['./questionnaire-response-view-item.component.scss']
})
export class QuestionnaireResponseViewItemComponent implements OnInit {

  @Input() item: QuestionnaireResponseItem | undefined;
  constructor(public fhir: FhirService) { }
  ngOnInit(): void {
  }

  getDate(valueDateTime: string): moment.Moment | null {
    return null;
  }
}
