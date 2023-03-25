import { NgModule } from '@angular/core';
import {MainComponent} from '../main/main.component';
import {RouterModule, Routes} from '@angular/router';

import {PatientFindComponent} from '../main/patient-find/patient-find.component';
import {PatientSummaryComponent} from '../main/patient/patient-summary/patient-summary.component';
import {PatientMainComponent} from '../main/patient/patient-main.component';
import {ExchangeTokenComponent} from '../exchange-token/exchange-token.component';
import {ObservationsComponent} from "../main/patient/observations/observations.component";
import {DocumentsComponent} from "../main/patient/documents/documents.component";
import {FormsComponent} from "../main/patient/forms/forms.component";
import {WorkflowComponent} from "../main/patient/workflow/workflow.component";
import {
  PatientCommunicationComponent
} from "../main/patient/patient-communication/patient-communication.component";
import {CoordinatedCareComponent} from "../main/patient/coordinated-care/coordinated-care.component";
import {PersonalHealthDeviceComponent} from "../main/account/personal-health-device/personal-health-device.component";
import {ObservationDetailComponent} from "../main/patient/observations/observation-detail/observation-detail.component";


const routes: Routes = [
  // { path: '', redirectTo: 'fhir', pathMatch: 'full'},
  {
    path: '', component: MainComponent,
    children : [
      { path: '', component: PatientFindComponent},
      { path: 'search', component: PatientFindComponent},
      { path: 'device', component: PersonalHealthDeviceComponent},
      {
        path: 'patient/:patientid', component: PatientMainComponent,
        children: [
          {path: '', component: PatientSummaryComponent},
          {path: 'summary', component: PatientSummaryComponent},
          {path: 'exchange_token', component: ExchangeTokenComponent},
          {path: 'observations', component: ObservationsComponent},
          {path: 'observations/:code', component: ObservationDetailComponent},
          {path: 'documents', component: DocumentsComponent},
          {path: 'forms', component: FormsComponent},
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
