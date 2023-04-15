import { NgModule } from '@angular/core';
import {MainComponent} from '../main/main.component';
import {RouterModule, Routes} from '@angular/router';

import {PatientFindComponent} from '../main/patient-find/patient-find.component';
import {PatientSummaryComponent} from '../main/patient/summary/patient-summary.component';
import {PatientMainComponent} from '../main/patient/patient-main.component';
import {ExchangeTokenComponent} from '../exchange-token/exchange-token.component';
import {ObservationsComponent} from "../main/patient/observations/observations.component";
import {DocumentsComponent} from "../main/patient/documents/documents.component";
import {FormsComponent} from "../main/patient/forms/forms.component";
import {WorkflowComponent} from "../main/patient/referrals/workflow.component";
import {
  PatientCommunicationComponent
} from "../main/patient/communication/patient-communication.component";
import {CoordinatedCareComponent} from "../main/patient/plans-and-goals/coordinated-care.component";
import {PersonalHealthDeviceComponent} from "../main/account/personal-health-device/personal-health-device.component";
import {ObservationDetailComponent} from "../main/patient/observations/observation-detail/observation-detail.component";
import {PhysicalActivityDetailComponent} from "../main/patient/observations/physical-activity-detail/physical-activity-detail.component";
import {VitalsDetailComponent} from "../main/patient/observations/vitals-detail/vitals-detail.component";
import {
  DiagnosticReportDetailComponent
} from "../main/patient/observations/diagnostic-report-detail/diagnostic-report-detail.component";
import {
  QuestionnaireResponseViewComponent
} from "../main/patient/forms/questionnaire-response-view/questionnaire-response-view.component";
import {BinaryComponent} from "../main/patient/documents/binary/binary.component";
import {AboutComponent} from "../main/about/about.component";
import {ActivityDefinitionComponent} from "../main/Management/activity-definition/activity-definition.component";


const routes: Routes = [
  // { path: '', redirectTo: 'fhir', pathMatch: 'full'},
  {
    path: '', component: MainComponent,
    children : [
      { path: '', component: PatientFindComponent},
      { path: 'search', component: PatientFindComponent},
      { path: 'device', component: PersonalHealthDeviceComponent},
      { path: 'activity', component: ActivityDefinitionComponent},
      { path: 'about', component: AboutComponent},
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
