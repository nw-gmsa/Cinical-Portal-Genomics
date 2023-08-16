import { NgModule } from '@angular/core';
import {MainComponent} from '../main/main.component';
import {RouterModule, Routes} from '@angular/router';

import {PatientFindComponent} from '../main/patient-find/patient-find.component';
import {PatientSummaryComponent} from '../patient/summary/patient-summary.component';
import {PatientMainComponent} from '../patient/patient-main.component';
import {ExchangeTokenComponent} from '../exchange-token/exchange-token.component';
import {ObservationsComponent} from "../patient/diagnostics/observations.component";
import {DocumentsComponent} from "../main/patient/documents/documents.component";
import {FormsComponent} from "../patient/structure-data-capture/forms.component";
import {WorkflowComponent} from "../patient/workflow/workflow.component";
import {
  PatientCommunicationComponent
} from "../main/patient/communication/patient-communication.component";
import {CoordinatedCareComponent} from "../patient/care-coordination/coordinated-care.component";
import {PersonalHealthDeviceComponent} from "../main/account/personal-health-device/personal-health-device.component";
import {ObservationDetailComponent} from "../patient/diagnostics/observation-detail/observation-detail.component";
import {PhysicalActivityDetailComponent} from "../patient/diagnostics/physical-activity-detail/physical-activity-detail.component";
import {VitalsDetailComponent} from "../patient/diagnostics/vitals-detail/vitals-detail.component";
import {
  DiagnosticReportDetailComponent
} from "../patient/diagnostics/diagnostic-report-detail/diagnostic-report-detail.component";
import {
  QuestionnaireResponseViewComponent
} from "../patient/structure-data-capture/questionnaire-response-view/questionnaire-response-view.component";
import {BinaryComponent} from "../main/patient/documents/binary/binary.component";
import {AboutComponent} from "../main/about/about.component";
import {PathwayComponent} from "../main/journey/pathway.component";
import {
  ActivityDefinitionDetailComponent
} from "../main/journey/activity-definition-detail/activity-definition-detail.component";
import {PlanDefinitionDetailComponent} from "../main/journey/plan-definition-detail/plan-definition-detail.component";
import {OntologyBrowserComponent} from "../ontology/ontology-browser/ontology-browser.component";
import {
  StructuredDataCaptueComponent
} from "../patient/structure-data-capture/structured-data-captue/structured-data-captue.component";


const routes: Routes = [
  // { path: '', redirectTo: 'fhir', pathMatch: 'full'},
  {
    path: '', component: MainComponent,
    children : [
      { path: '', component: PatientFindComponent},
      { path: 'search', component: PatientFindComponent},
      { path: 'device', component: PersonalHealthDeviceComponent},
      { path: 'pathways', component: PathwayComponent},
      { path: 'ontology', component: OntologyBrowserComponent},
      {path: 'activity/:activity', component: ActivityDefinitionDetailComponent},
      {path: 'plan/:plan', component: PlanDefinitionDetailComponent},
      { path: 'about', component: AboutComponent },
      {
        path: 'patient/:patientid', component: PatientMainComponent,
        children: [
          {path: '', component: PatientSummaryComponent},
          {path: 'summary', component: PatientSummaryComponent},
          {path: 'exchange_token', component: ExchangeTokenComponent},
          {path: 'observations', component: ObservationsComponent},
          {path: 'observations/:code', component: ObservationDetailComponent},
          {path: 'report/:report', component: DiagnosticReportDetailComponent},
          {path: 'physical', component: PhysicalActivityDetailComponent},
          {path: 'vitals', component: VitalsDetailComponent},
          {path: 'documents', component: DocumentsComponent},
          {path: 'documents/:docid', component: BinaryComponent},
          {path: 'forms', component: FormsComponent},
          {path: 'sdc', component: StructuredDataCaptueComponent},
          {path: 'forms/:form', component: QuestionnaireResponseViewComponent},
          {path: 'workflow', component: WorkflowComponent},
          {path: 'coordination', component: CoordinatedCareComponent},
          {path: 'communication', component: PatientCommunicationComponent}
        ]
      }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
