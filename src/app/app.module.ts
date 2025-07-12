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
import {AppRoutingModule} from './app-routing.module';
import {CovalentFileModule} from '@covalent/core/file';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatStepperModule} from '@angular/material/stepper';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule} from '@angular/material/core';
import {HttpClientModule} from '@angular/common/http';
import {CovalentJsonFormatterModule} from '@covalent/core/json-formatter';
import {MatSortModule} from '@angular/material/sort';
import {MatToolbarModule} from '@angular/material/toolbar';
import {LayoutModule} from '@angular/cdk/layout';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {PatientSearchComponent} from './patient/patient-find/patient-search/patient-search.component';
import {PatientComponent} from './patient/patient-find/patient/patient.component';
import {EprService} from './services/epr.service';
import {PatientFindComponent} from './patient/patient-find/patient-find.component';
import {PatientMainComponent} from './patient/patient-main.component';
import {PatientSummaryComponent} from './patient/summary/patient-summary.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import {ConditionComponent} from './patient/summary/condition/condition.component';
import {EncounterComponent} from './patient/summary/encounter/encounter.component';
import {CarePlanComponent} from './patient/care-coordination/care-plan/care-plan.component';
import {CareTeamComponent} from './patient/care-coordination/care-team/care-team.component';
import { EpisodeOfCareComponent } from './patient/care-coordination/episode-of-care/episode-of-care.component';
import {ObservationComponent} from './patient/diagnostics/observation/observation.component';
import {MatGridListModule} from '@angular/material/grid-list';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {ResourceDialogComponent} from './dialogs/resource-dialog/resource-dialog.component';
import {DocumentReferenceComponent} from './patient/documents/document-reference/document-reference.component';
import {QuestionnaireResponseComponent} from './patient/forms/questionnaire-response/questionnaire-response.component';
import { TaskComponent } from './patient/workflow/task/task.component';
import {ReferralRequestComponent} from './patient/workflow/referral-request/referral-request.component';
import {AllergyIntoleranceComponent} from './patient/summary/allergy-intolerance/allergy-intolerance.component';
import {MedicationRequestComponent} from './patient/medications/medication-request/medication-request.component';
import { DiagnosticReportComponent } from './patient/diagnostics/diagnostic-report/diagnostic-report.component';
import {CovalentDialogsModule} from '@covalent/core/dialogs';
import {BinaryComponent} from './patient/documents/binary/binary.component';
import { QuestionnaireResponseViewComponent } from './patient/forms/questionnaire-response-view/questionnaire-response-view.component';
import {CovalentMessageModule} from '@covalent/core/message';
import {DatePipe} from '@angular/common';
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter} from '@angular/material-moment-adapter';
import {ExchangeTokenComponent} from './services/exchange-token/exchange-token.component';
import {CovalentLoadingModule} from '@covalent/core/loading';
import { ObservationChartComponent } from './patient/diagnostics/observation-chart/observation-chart.component';
import { CommunicationComponent } from './patient/communication/communication/communication.component';
import {MatTreeModule} from '@angular/material/tree';
import { TaskCreateComponent } from './patient/workflow/task-create/task-create.component';
import { ServiceCreateComponent } from './patient/workflow/service-create/service-create.component';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { CareTeamCreateComponent } from './patient/care-coordination/care-team-create/care-team-create.component';
import { CarePlanCreateComponent } from './patient/care-coordination/care-plan-create/care-plan-create.component';
import { EpisodeOfCareCreateComponent } from './patient/care-coordination/episode-of-care-create/episode-of-care-create.component';
import { CommunicationCreateComponent } from './patient/communication/communication-create/communication-create.component';
import {PdfViewerModule} from "ng2-pdf-viewer";
import { ObservationsComponent } from './patient/diagnostics/observations.component';
import {CovalentDynamicMenuModule} from "@covalent/core/dynamic-menu";
import { DocumentsComponent } from './patient/documents/documents.component';
import { FormsComponent } from './patient/forms/forms.component';
import { WorkflowComponent } from './patient/workflow/workflow.component';
import { CoordinatedCareComponent } from './patient/care-coordination/coordinated-care.component';
import { PatientCommunicationComponent } from './patient/communication/patient-communication.component';
import { PersonalHealthDeviceComponent } from './patient/personal-health-device/personal-health-device.component';
import {CovalentCommonModule} from "@covalent/core/common";
import { DocumentReferenceCreateComponent } from './patient/documents/document-reference-create/document-reference-create.component';
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
import { ConditionCreateEditComponent } from './patient/summary/condition-create-edit/condition-create-edit.component';
import { MedicationRequestCreateEditComponent } from './patient/medications/medication-request-create-edit/medication-request-create-edit.component';
import { OntologyBrowserComponent } from './main/ontology/ontology-browser/ontology-browser.component';
import { ConceptDetailComponent } from './main/ontology/concept-detail/concept-detail.component';
import { EventCreateComponent } from './patient/diagnostics/event-create/event-create.component';
import { StructuredDataCaptueComponent } from './patient/forms/structured-data-captue/structured-data-captue.component';
import { FormBuilderComponent } from './main/form-builder/form-builder.component';
import { QuestionnaireComponent } from './main/form-definition/questionnaire/questionnaire.component';
import {MatChipsModule} from "@angular/material/chips";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatMenuModule} from "@angular/material/menu";
import {MatDialogModule} from "@angular/material/dialog";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatTableModule} from "@angular/material/table";
import {MatRadioModule} from "@angular/material/radio";
import {MatTabsModule} from "@angular/material/tabs";
import {MatListModule} from "@angular/material/list";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatSelectModule} from "@angular/material/select";
import {MatInputModule} from "@angular/material/input";
import {MatPaginatorModule} from "@angular/material/paginator";
import { QuestionnaireItemComponent } from './main/form-definition/questionnaire-item/questionnaire-item.component';
import { FormDefinitionComponent } from './main/form-definition/form-definition.component';
import { ConceptDialogComponent } from './dialogs/concept-dialog/concept-dialog.component';
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {ClinicalCodingComponent} from "./clinical-coding/clinical-coding.component";

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
      StructuredDataCaptueComponent,
      FormBuilderComponent,
      QuestionnaireComponent,
      QuestionnaireItemComponent,
      FormDefinitionComponent,
      ConceptDialogComponent,
      ClinicalCodingComponent
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
    PdfViewerModule,
    MatPaginatorModule,
    CovalentCommonModule,
    CovalentBreadcrumbsModule,
    A11yModule,
    MatChipsModule,
    MatSlideToggleModule

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
