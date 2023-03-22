import { NgModule } from '@angular/core';
import {MainComponent} from '../main/main.component';
import {RouterModule, Routes} from '@angular/router';

import {PatientFindComponent} from '../main/patient-find/patient-find.component';
import {PatientSummaryComponent} from '../main/patient-main/patient-summary/patient-summary.component';
import {PatientMainComponent} from '../main/patient-main/patient-main.component';
import {ExchangeTokenComponent} from '../exchange-token/exchange-token.component';
import {ObservationsComponent} from "../main/patient-main/observations/observations.component";
import {DocumentsComponent} from "../main/patient-main/documents/documents.component";
import {FormsComponent} from "../main/patient-main/forms/forms.component";
import {WorkflowComponent} from "../main/patient-main/workflow/workflow.component";
import {
  PatientCommunicationComponent
} from "../main/patient-main/patient-communication/patient-communication.component";
import {CoordinatedCareComponent} from "../main/patient-main/coordinated-care/coordinated-care.component";
import {PersonalHealthDeviceComponent} from "../main/account/personal-health-device/personal-health-device.component";


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
