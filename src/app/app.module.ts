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
import {PatientSearchComponent} from './main/patient-find/patient-search/patient-search.component';
import {PatientComponent} from './main/patient-find/patient/patient.component';
import {EprService} from './services/epr.service';
import {PatientFindComponent} from './main/patient-find/patient-find.component';
import {PatientMainComponent} from './main/patient/patient-main.component';
import {PatientSummaryComponent} from './main/patient/patient-summary/patient-summary.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import {ConditionComponent} from './main/patient/patient-summary/condition/condition.component';
import {MatMenuModule} from '@angular/material/menu';
import {EncounterComponent} from './main/patient/patient-summary/encounter/encounter.component';
import {CarePlanComponent} from './main/patient/coordinated-care/care-plan/care-plan.component';
import {CareTeamComponent} from './main/patient/coordinated-care/care-team/care-team.component';
import { EpisodeOfCareComponent } from './main/patient/coordinated-care/episode-of-care/episode-of-care.component';
import {ObservationComponent} from './main/patient/observations/observation/observation.component';
import {ObservationChartDialogComponent} from './main/patient/observations/observation-chart-dialog/observation-chart-dialog.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatGridListModule} from '@angular/material/grid-list';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {ResourceDialogComponent} from './dialogs/resource-dialog/resource-dialog.component';
import {MatTabsModule} from '@angular/material/tabs';
import {DocumentReferenceComponent} from './main/patient/documents/document-reference/document-reference.component';
import {QuestionnaireResponseComponent} from './main/patient/forms/questionnaire-response/questionnaire-response.component';
import { TaskComponent } from './main/patient/workflow/task/task.component';
import {ReferralRequestComponent} from './main/patient/workflow/referral-request/referral-request.component';
import {AllergyIntoleranceComponent} from './main/patient/patient-summary/allergy-intolerance/allergy-intolerance.component';
import {MedicationRequestComponent} from './main/patient/patient-summary/medication-request/medication-request.component';
import { DiagnosticReportComponent } from './main/patient/observations/diagnostic-report/diagnostic-report.component';
import {CovalentDialogsModule} from '@covalent/core/dialogs';
import {BinaryComponent} from './main/patient/documents/binary/binary.component';
import { QuestionnaireResponseViewComponent } from './main/patient/forms/questionnaire-response-view/questionnaire-response-view.component';
import { QuestionnaireResponseViewItemComponent } from './main/patient/forms/questionnaire-response-view-item/questionnaire-response-view-item.component';
import {CovalentMessageModule} from '@covalent/core/message';
import {DatePipe} from '@angular/common';
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter} from '@angular/material-moment-adapter';
import {ExchangeTokenComponent} from './exchange-token/exchange-token.component';
import {CovalentLoadingModule} from '@covalent/core/loading';
import { PhysicalActivityComponent } from './main/diaglogs/physical-activity/physical-activity.component';
import { ObservationChartComponent } from './main/patient/observations/observation-chart/observation-chart.component';
import { News2Component } from './main/diaglogs/news2/news2.component';
import { CommunicationComponent } from './main/patient/patient-communication/communication/communication.component';
import {MatTreeModule} from '@angular/material/tree';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { TaskCreateComponent } from './main/patient/workflow/task-create/task-create.component';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { ServiceCreateComponent } from './main/patient/workflow/service-create/service-create.component';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { CareTeamCreateComponent } from './main/patient/coordinated-care/care-team-create/care-team-create.component';
import { CarePlanCreateComponent } from './main/patient/coordinated-care/care-plan-create/care-plan-create.component';
import { EpisodeOfCareCreateComponent } from './main/patient/coordinated-care/episode-of-care-create/episode-of-care-create.component';
import { CommunicationCreateComponent } from './main/patient/patient-communication/communication-create/communication-create.component';
import { QuestionnaireResponseCreateComponent } from './main/patient/forms/questionnaire-response-create/questionnaire-response-create.component';
import {PdfViewerModule} from "ng2-pdf-viewer";
import { ObservationsComponent } from './main/patient/observations/observations.component';
import {CovalentDynamicMenuModule} from "@covalent/core/dynamic-menu";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import { DocumentsComponent } from './main/patient/documents/documents.component';
import { FormsComponent } from './main/patient/forms/forms.component';
import { WorkflowComponent } from './main/patient/workflow/workflow.component';
import { CoordinatedCareComponent } from './main/patient/coordinated-care/coordinated-care.component';
import { PatientCommunicationComponent } from './main/patient/patient-communication/patient-communication.component';
import { PersonalHealthDeviceComponent } from './main/account/personal-health-device/personal-health-device.component';
import {MatPaginatorModule} from "@angular/material/paginator";
import {CovalentCommonModule} from "@covalent/core/common";
import { DocumentReferenceCreateComponent } from './main/patient/documents/document-reference-create/document-reference-create.component';

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
  MatTabsModule,
  MatSnackBarModule
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
    ObservationsComponent,
    DocumentsComponent,
    FormsComponent,
    WorkflowComponent,
    CoordinatedCareComponent,
    PatientCommunicationComponent,
    PersonalHealthDeviceComponent,
    DocumentReferenceCreateComponent
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
        CovalentDynamicMenuModule,
        MatTreeModule,
        MatCheckboxModule,
        MatAutocompleteModule,
        MatButtonToggleModule,
        PdfViewerModule,
        MatPaginatorModule,
        CovalentCommonModule
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
