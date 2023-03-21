import { NgModule } from '@angular/core';
import {MainComponent} from '../main/main.component';
import {RouterModule, Routes} from '@angular/router';

import {PatientFindComponent} from '../main/patient-find/patient-find.component';
import {PatientSummaryComponent} from '../main/patient-main/patient-summary/patient-summary.component';
import {PatientMainComponent} from '../main/patient-main/patient-main.component';
import {ExchangeTokenComponent} from '../exchange-token/exchange-token.component';
import {ObservationsComponent} from "../main/patient-main/observations/observations.component";


const routes: Routes = [
  // { path: '', redirectTo: 'fhir', pathMatch: 'full'},
  {
    path: '', component: MainComponent,
    children : [
      { path: '', component: PatientFindComponent},
      { path: 'search', component: PatientFindComponent},
      {
        path: 'patient/:patientid', component: PatientMainComponent,
        children: [
          {path: '', component: PatientSummaryComponent,
            children: [
              {path: 'summary', component: PatientSummaryComponent},
              {path: 'exchange_token', component: ExchangeTokenComponent},
              {path: 'observations', component: ObservationsComponent}
            ]}
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
