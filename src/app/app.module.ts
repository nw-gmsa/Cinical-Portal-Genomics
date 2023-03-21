import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {CovalentLayoutModule} from '@covalent/core/layout';
import {CovalentMarkdownModule} from '@covalent/markdown';
import {CovalentDynamicFormsModule} from '@covalent/dynamic-forms';
import {RouterModule} from '@angular/router';
import { MainComponent } from './main/main.component';
import {MatIconModule} from '@angular/material/icon';
import {AppRoutingModule} from './app-routing/app-routing.module';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatListModule} from '@angular/material/list';
import {MatInputModule} from '@angular/material/input';
import {CovalentFileModule} from '@covalent/core/file';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatTableModule} from '@angular/material/table';
import {MatStepperModule} from '@angular/material/stepper';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule} from '@angular/material/core';
import {HttpClientModule} from '@angular/common/http';
import {CovalentJsonFormatterModule} from '@covalent/core/json-formatter';
import {MatSortModule} from '@angular/material/sort';
import {MatChipsModule} from '@angular/material/chips';
import {MatToolbarModule} from '@angular/material/toolbar';
import {LayoutModule} from '@angular/cdk/layout';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatRadioModule} from '@angular/material/radio';
import {PatientSearchComponent} from './component/patient-search/patient-search.component';
import {PatientComponent} from './component/patient/patient.component';
import {EprService} from './services/epr.service';
import {PatientFindComponent} from './main/patient-find/patient-find.component';
import {PatientMainComponent} from './main/patient-main/patient-main.component';
import {PatientSummaryComponent} from './main/patient-main/patient-summary/patient-summary.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import {ConditionComponent} from './component/condition/condition.component';
import {MatMenuModule} from '@angular/material/menu';
import {EncounterComponent} from './component/encounter/encounter.component';
import {CarePlanComponent} from './component/care-plan/care-plan.component';
import {CareTeamComponent} from './component/care-team/care-team.component';
import { EpisodeOfCareComponent } from './component/episode-of-care/episode-of-care.component';
import {ObservationComponent} from './component/observation/observation.component';
import {ObservationChartDialogComponent} from './dialogs/observation-chart-dialog/observation-chart-dialog.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatGridListModule} from '@angular/material/grid-list';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {ResourceDialogComponent} from './dialogs/resource-dialog/resource-dialog.component';
import {MatTabsModule} from '@angular/material/tabs';
import {DocumentReferenceComponent} from './component/document-reference/document-reference.component';
import {QuestionnaireResponseComponent} from './component/questionnaire-response/questionnaire-response.component';
import { TaskComponent } from './component/task/task.component';
import {ReferralRequestComponent} from './component/referral-request/referral-request.component';
import {AllergyIntoleranceComponent} from './component/allergy-intolerance/allergy-intolerance.component';
import {MedicationRequestComponent} from './component/medication-request/medication-request.component';
import { DiagnosticReportComponent } from './component/diagnostic-report/diagnostic-report.component';
import {CovalentDialogsModule} from '@covalent/core/dialogs';
import {BinaryComponent} from './component/binary/binary.component';
import { QuestionnaireResponseViewComponent } from './component/questionnaire-response-view/questionnaire-response-view.component';
import { QuestionnaireResponseViewItemComponent } from './component/questionnaire-response-view-item/questionnaire-response-view-item.component';
import {CovalentMessageModule} from '@covalent/core/message';
import {DatePipe} from '@angular/common';
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter} from '@angular/material-moment-adapter';
import {ExchangeTokenComponent} from './exchange-token/exchange-token.component';
import {CovalentLoadingModule} from '@covalent/core/loading';
import { PhysicalActivityComponent } from './main/diaglogs/physical-activity/physical-activity.component';
import { ObservationChartComponent } from './component/observation-chart/observation-chart.component';
import { News2Component } from './main/diaglogs/news2/news2.component';
import { CommunicationComponent } from './component/communication/communication.component';
import {MatTreeModule} from '@angular/material/tree';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { TaskCreateComponent } from './dialogs/task-create/task-create.component';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { ServiceCreateComponent } from './dialogs/service-create/service-create.component';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { CareTeamCreateComponent } from './dialogs/care-team-create/care-team-create.component';
import { CarePlanCreateComponent } from './dialogs/care-plan-create/care-plan-create.component';
import { EpisodeOfCareCreateComponent } from './dialogs/episode-of-care-create/episode-of-care-create.component';
import { CommunicationCreateComponent } from './dialogs/communication-create/communication-create.component';
import { QuestionnaireResponseCreateComponent } from './dialogs/questionnaire-response-create/questionnaire-response-create.component';
import {PdfViewerModule} from "ng2-pdf-viewer";
import { ObservationsComponent } from './main/patient-main/observations/observations.component';

const modules = [
  MatIconModule,
  MatCardModule,
  MatFormFieldModule,
  MatSelectModule,
  MatListModule,
  MatInputModule,
  MatNativeDateModule,
  MatSortModule,
  MatChipsModule,
  MatStepperModule,
  MatToolbarModule,
  MatExpansionModule,
  MatTooltipModule,
  MatDatepickerModule,
  MatRadioModule,
  MatSidenavModule,
  MatMenuModule,
  MatButtonModule,
  MatTableModule,
  MatDialogModule,
  MatGridListModule,
  MatTabsModule
];

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    PatientSearchComponent,
    PatientComponent,
    PatientFindComponent,
    PatientMainComponent,
    PatientSummaryComponent,
    ConditionComponent,
    EncounterComponent,
    CarePlanComponent,
    CareTeamComponent,
    EpisodeOfCareComponent,
    ObservationComponent,
    ObservationChartDialogComponent,
    DocumentReferenceComponent,
    QuestionnaireResponseComponent,
    ReferralRequestComponent,
    AllergyIntoleranceComponent,
    MedicationRequestComponent,
    ResourceDialogComponent,
    TaskComponent,
    DiagnosticReportComponent,
    BinaryComponent,
    QuestionnaireResponseViewComponent,
    QuestionnaireResponseViewItemComponent,
    ExchangeTokenComponent,
    PhysicalActivityComponent,
    ObservationChartComponent,
    News2Component,
    CommunicationComponent,
    TaskCreateComponent,
    ServiceCreateComponent,
    CareTeamCreateComponent,
    CarePlanCreateComponent,
    EpisodeOfCareCreateComponent,
    CommunicationCreateComponent,
    QuestionnaireResponseCreateComponent,
    ObservationsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    RouterModule,
    ...modules,

    ReactiveFormsModule,
    FormsModule,

    NgxChartsModule,

    HttpClientModule,
    LayoutModule,

    CovalentLayoutModule,
    CovalentMarkdownModule,
    CovalentDynamicFormsModule,
    CovalentFileModule,
    CovalentJsonFormatterModule,
    CovalentDialogsModule,
    CovalentMessageModule,
    CovalentLoadingModule,
    MatTreeModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatButtonToggleModule,
    PdfViewerModule
  ],
  exports: [...modules],
  providers: [
    EprService,
    DatePipe,
    {provide: MAT_DATE_LOCALE
      , useValue: 'en-GB'},

    // `MomentDateAdapter` and `MAT_MOMENT_DATE_FORMATS` can be automatically provided by importing
    // `MatMomentDateModule` in your applications root module. We provide it at the component level
    // here, due to limitations of our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
  ],

  bootstrap: [AppComponent]
})
export class AppModule { }
