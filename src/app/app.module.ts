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
import {MatLegacyCardModule as MatCardModule} from '@angular/material/legacy-card';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {MatLegacyListModule as MatListModule} from '@angular/material/legacy-list';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {CovalentFileModule} from '@covalent/core/file';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatLegacyTableModule as MatTableModule} from '@angular/material/legacy-table';
import {MatStepperModule} from '@angular/material/stepper';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule} from '@angular/material/core';
import {HttpClientModule} from '@angular/common/http';
import {CovalentJsonFormatterModule} from '@covalent/core/json-formatter';
import {MatSortModule} from '@angular/material/sort';
import {MatLegacyChipsModule as MatChipsModule} from '@angular/material/legacy-chips';
import {MatToolbarModule} from '@angular/material/toolbar';
import {LayoutModule} from '@angular/cdk/layout';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatLegacyTooltipModule as MatTooltipModule} from '@angular/material/legacy-tooltip';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatLegacyRadioModule as MatRadioModule} from '@angular/material/legacy-radio';
import {PatientSearchComponent} from './main/patient-find/patient-search/patient-search.component';
import {PatientComponent} from './main/patient-find/patient/patient.component';
import {EprService} from './services/epr.service';
import {PatientFindComponent} from './main/patient-find/patient-find.component';
import {PatientMainComponent} from './patient/patient-main.component';
import {PatientSummaryComponent} from './patient/summary/patient-summary.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import {ConditionComponent} from './patient/summary/condition/condition.component';
import {MatLegacyMenuModule as MatMenuModule} from '@angular/material/legacy-menu';
import {EncounterComponent} from './patient/summary/encounter/encounter.component';
import {CarePlanComponent} from './patient/care-coordination/care-plan/care-plan.component';
import {CareTeamComponent} from './patient/care-coordination/care-team/care-team.component';
import { EpisodeOfCareComponent } from './patient/care-coordination/episode-of-care/episode-of-care.component';
import {ObservationComponent} from './patient/diagnostics/observation/observation.component';
import {MatLegacyDialogModule as MatDialogModule} from '@angular/material/legacy-dialog';
import {MatGridListModule} from '@angular/material/grid-list';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {ResourceDialogComponent} from './dialogs/resource-dialog/resource-dialog.component';
import {MatLegacyTabsModule as MatTabsModule} from '@angular/material/legacy-tabs';
import {DocumentReferenceComponent} from './main/patient/documents/document-reference/document-reference.component';
import {QuestionnaireResponseComponent} from './main/patient/forms/questionnaire-response/questionnaire-response.component';
import { TaskComponent } from './patient/workflow/task/task.component';
import {ReferralRequestComponent} from './patient/workflow/referral-request/referral-request.component';
import {AllergyIntoleranceComponent} from './patient/summary/allergy-intolerance/allergy-intolerance.component';
import {MedicationRequestComponent} from './patient/medications/medication-request/medication-request.component';
import { DiagnosticReportComponent } from './patient/diagnostics/diagnostic-report/diagnostic-report.component';
import {CovalentDialogsModule} from '@covalent/core/dialogs';
import {BinaryComponent} from './main/patient/documents/binary/binary.component';
import { QuestionnaireResponseViewComponent } from './main/patient/forms/questionnaire-response-view/questionnaire-response-view.component';
import { QuestionnaireResponseViewItemComponent } from './main/patient/forms/questionnaire-response-view-item/questionnaire-response-view-item.component';
import {CovalentMessageModule} from '@covalent/core/message';
import {DatePipe} from '@angular/common';
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter} from '@angular/material-moment-adapter';
import {ExchangeTokenComponent} from './exchange-token/exchange-token.component';
import {CovalentLoadingModule} from '@covalent/core/loading';
import { ObservationChartComponent } from './patient/diagnostics/observation-chart/observation-chart.component';
import { CommunicationComponent } from './main/patient/communication/communication/communication.component';
import {MatTreeModule} from '@angular/material/tree';
import {MatLegacyCheckboxModule as MatCheckboxModule} from '@angular/material/legacy-checkbox';
import { TaskCreateComponent } from './patient/workflow/task-create/task-create.component';
import {MatLegacyAutocompleteModule as MatAutocompleteModule} from '@angular/material/legacy-autocomplete';
import { ServiceCreateComponent } from './patient/workflow/service-create/service-create.component';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { CareTeamCreateComponent } from './patient/care-coordination/care-team-create/care-team-create.component';
import { CarePlanCreateComponent } from './patient/care-coordination/care-plan-create/care-plan-create.component';
import { EpisodeOfCareCreateComponent } from './patient/care-coordination/episode-of-care-create/episode-of-care-create.component';
import { CommunicationCreateComponent } from './main/patient/communication/communication-create/communication-create.component';
import {PdfViewerModule} from "ng2-pdf-viewer";
import { ObservationsComponent } from './patient/diagnostics/observations.component';
import {CovalentDynamicMenuModule} from "@covalent/core/dynamic-menu";
import {MatLegacySnackBarModule as MatSnackBarModule} from "@angular/material/legacy-snack-bar";
import { DocumentsComponent } from './main/patient/documents/documents.component';
import { FormsComponent } from './main/patient/forms/forms.component';
import { WorkflowComponent } from './patient/workflow/workflow.component';
import { CoordinatedCareComponent } from './patient/care-coordination/coordinated-care.component';
import { PatientCommunicationComponent } from './main/patient/communication/patient-communication.component';
import { PersonalHealthDeviceComponent } from './main/account/personal-health-device/personal-health-device.component';
import {MatLegacyPaginatorModule as MatPaginatorModule} from "@angular/material/legacy-paginator";
import {CovalentCommonModule} from "@covalent/core/common";
import { DocumentReferenceCreateComponent } from './main/patient/documents/document-reference-create/document-reference-create.component';
import { ObservationDetailComponent } from './patient/diagnostics/observation-detail/observation-detail.component';
import {CovalentBreadcrumbsModule} from "@covalent/core/breadcrumbs";
import { PhysicalActivityDetailComponent } from './patient/diagnostics/physical-activity-detail/physical-activity-detail.component';
import { VitalsDetailComponent } from './patient/diagnostics/vitals-detail/vitals-detail.component';
import { DiagnosticReportDetailComponent } from './patient/diagnostics/diagnostic-report-detail/diagnostic-report-detail.component';
import { GoalCreateComponent } from './patient/care-coordination/goal-create/goal-create.component';
import { GoalComponent } from './patient/care-coordination/goal/goal.component';
import { GoalTargetComponent } from './patient/care-coordination/goal-target/goal-target.component';
import { TaskNoteComponent } from './patient/workflow/task-note/task-note.component';
import { DeleteComponent } from './dialogs/delete/delete.component';
import {A11yModule} from "@angular/cdk/a11y";
import { AboutComponent } from './main/about/about.component';
import { DiagnosticReportCreateComponent } from './patient/diagnostics/diagnostic-report-create/diagnostic-report-create.component';
import { ActivityDefinitionComponent } from './main/journey/activity-definition/activity-definition.component';
import { ActivityDefinitionDetailComponent } from './main/journey/activity-definition-detail/activity-definition-detail.component';
import {ProcedureComponent} from "./patient/summary/procedure/procedure.component";
import {ImmunisationComponent} from "./patient/medications/immunisation/immunisation.component";
import { PlanDefinitionComponent } from './main/journey/plan-definition/plan-definition.component';
import { PlanDefinitionActionComponent } from './main/journey/plan-definition-action/plan-definition-action.component';
import { PlanDefinitionDetailComponent } from './main/journey/plan-definition-detail/plan-definition-detail.component';
import { PathwayComponent } from './main/journey/pathway.component';
import {CovalentBaseEchartsModule} from "@covalent/echarts/base";
import {CovalentTreeEchartsModule} from "@covalent/echarts/tree";
import {CovalentTooltipEchartsModule} from "@covalent/echarts/tooltip";
import { ConditionCreateEditComponent } from './patient/summary/condition-create-edit/condition-create-edit.component';
import { MedicationRequestCreateEditComponent } from './patient/medications/medication-request-create-edit/medication-request-create-edit.component';
import { OntologyBrowserComponent } from './ontology/ontology-browser/ontology-browser.component';
import { ConceptDetailComponent } from './ontology/concept-detail/concept-detail.component';
import { EventCreateComponent } from './patient/diagnostics/event-create/event-create.component';
import { StructuredDataCaptueComponent } from './main/patient/forms/structured-data-captue/structured-data-captue.component';

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
  MatSnackBarModule,
    MatTreeModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatButtonToggleModule,
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
    ObservationChartComponent,
    CommunicationComponent,
    TaskCreateComponent,
    ServiceCreateComponent,
    CareTeamCreateComponent,
    CarePlanCreateComponent,
    EpisodeOfCareCreateComponent,
    CommunicationCreateComponent,
    ObservationsComponent,
    DocumentsComponent,
    FormsComponent,
    WorkflowComponent,
    CoordinatedCareComponent,
    PatientCommunicationComponent,
    PersonalHealthDeviceComponent,
    DocumentReferenceCreateComponent,
    ObservationDetailComponent,
    PhysicalActivityDetailComponent,
    VitalsDetailComponent,
    DiagnosticReportDetailComponent,
    GoalCreateComponent,
    GoalComponent,
    GoalTargetComponent,
    TaskNoteComponent,
    DeleteComponent,
    AboutComponent,
    DiagnosticReportCreateComponent,
    ActivityDefinitionComponent,
    ActivityDefinitionDetailComponent,
      ProcedureComponent,
      ImmunisationComponent,
      PlanDefinitionComponent,
      PlanDefinitionActionComponent,
      PlanDefinitionDetailComponent,
      PathwayComponent,
      ConditionCreateEditComponent,
      MedicationRequestCreateEditComponent,
      OntologyBrowserComponent,
      ConceptDetailComponent,
      EventCreateComponent,
      StructuredDataCaptueComponent
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
    CovalentBaseEchartsModule,
    CovalentFileModule,
    CovalentJsonFormatterModule,
    CovalentDialogsModule,
    CovalentMessageModule,
    CovalentLoadingModule,
    CovalentDynamicMenuModule,


    PdfViewerModule,
    MatPaginatorModule,
    CovalentCommonModule,
    CovalentBreadcrumbsModule,
    A11yModule,
    CovalentTreeEchartsModule,
    CovalentTooltipEchartsModule,

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
