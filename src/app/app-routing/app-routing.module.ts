import { NgModule } from '@angular/core';
import {MainComponent} from '../main/main.component';
import {RouterModule, Routes} from '@angular/router';
import {ValidateFhirComponent} from '../main/validate-fhir/validate-fhir.component';
import {ViewTestReportsComponent} from '../main/view-test-reports/view-test-reports.component';
import {RunPackageTestComponent} from '../main/run-package-test/run-package-test.component';
import {PatientFindComponent} from '../main/patient-find/patient-find.component';
import {PatientSummaryComponent} from '../main/patient-summary/patient-summary.component';
import {PatientMainComponent} from '../main/patient-main/patient-main.component';
import {ExchangeTokenComponent} from '../exchange-token/exchange-token.component';


const routes: Routes = [
  // { path: '', redirectTo: 'fhir', pathMatch: 'full'},
  {
    path: '', component: MainComponent,
    children : [
      { path: '', component: PatientFindComponent},
      { path: 'validate', component: ValidateFhirComponent},
      { path: 'reports', component: ViewTestReportsComponent},
      { path: 'runtest', component: RunPackageTestComponent},
      { path: 'search', component: PatientFindComponent},
      {
        path: 'patient/:patientid', component: PatientMainComponent,
        children: [
          {path: '', component: PatientSummaryComponent,
            children: [
              {path: 'exchange_token', component: ExchangeTokenComponent}
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
