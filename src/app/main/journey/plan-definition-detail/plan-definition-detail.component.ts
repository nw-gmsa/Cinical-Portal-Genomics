import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewContainerRef} from '@angular/core';
import {PlanDefinition, PlanDefinitionAction} from "fhir/r4";
import {TdDialogService} from "@covalent/core/dialogs";
import {FhirService} from "../../../services/fhir.service";
import {EprService} from "../../../services/epr.service";
import {ActivatedRoute} from "@angular/router";




@Component({
  selector: 'app-plan-definition-detail',
  templateUrl: './plan-definition-detail.component.html',
  styleUrls: ['./plan-definition-detail.component.scss'],
 // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanDefinitionDetailComponent implements OnInit {

  selectedTheme!: string;

  @Input()
  plan : PlanDefinition | undefined;

  intro = `
  In the diagram below, the lines connecting each activity or action indicate would be in FHIR the exchange of a [FHIR Task](http://hl7.org/fhir/R4/task.html).
      It is expected other methods would generally be used, including verbal communication, SMS, emails, task/work managers, etc.

  The \`inputs\` and \`outputs\` are expected to be shared, this can be via [application sharing](https://en.wikipedia.org/wiki/Application_sharing) or via API's. The recommended API approach is to use [FHIR RESTful APIs](http://hl7.org/fhir/R4/http.html) following a \`Query API\` frameworks such as [UK Core FHIR Access](https://build.fhir.org/ig/HL7-UK/UK-Core-Access/) and/or [IHE QEDm](https://wiki.ihe.net/index.php/Query_for_Existing_Data_for_Mobile_(QEDm))
      (both can be considered FHIR R4 versions of [Care Connect API](https://nhsconnect.github.io/CareConnectAPI/)). These APIs are expected to be implemented on existing systems (not FHIR based systems).
      
  It is not recommended to use either HL7 v3 or it's FHIR equivalent ([FHIR Messaging](http://hl7.org/fhir/R4/messaging.html)) to send this information as an alternative to either sharing approach, operational circumstances (i.e. urgent or emergency care) dictate otherwise.
  
  Providers exchanging this information via documents (using email, MESH, etc) are encouraged to instead using document sharing systems such as [IHE XDS](https://wiki.ihe.net/index.php/Cross-Enterprise_Document_Sharing) or [EDMS](https://en.wikipedia.org/wiki/Document_management_system) and share these documents using a \`document\` FHIR API framework such as [IHE MHD](https://profiles.ihe.net/ITI/MHD/index.html)
 
  It is likely that both clinical and health administration events will be generated at all stages on this pathway. This is not discussed here, approaches can be found [HL7 FHIR Subscription](http://hl7.org/fhir/R4B/subscription.html) and [HL7 v2 ADT](https://github.com/NHSDigital/NHSEngland-FHIR-ImplementationGuide/blob/master/documents/HSCIC%20ITK%20HL7%20V2%20Message%20Specifications.pdf). Both of these approaches complement pathway (and [FHIR Workflow](http://hl7.org/fhir/R4/workflow.html)), they are not expected to be the method for performing pathway communication/interactions. 
 `

  planData : any = [];
  data = [
    ];

  planid: string | undefined;
  patientId: string = '';
  constructor(
      private _dialogService: TdDialogService,
      private _viewContainerRef: ViewContainerRef,
      public fhirService: FhirService,
      private eprService: EprService,
      private route: ActivatedRoute,
      private _cdr: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
   // console.log(this.themes)
    this.selectedTheme = 'this.themeSelector.selected;'
    this._cdr.markForCheck();
    const planid= this.route.snapshot.paramMap.get('plan');
    if (planid != null) {
      this.planid = planid;
      this.getRecords()
    }
    let patient = this.eprService.getPatient()
    if (patient !== undefined) {
      if (patient.id !== undefined) {
        this.patientId = patient.id
      }
    }
    this.eprService.patientChangeEvent.subscribe(patient => {
      if (patient.id !== undefined) this.patientId = patient.id
    });
  }
  selectChartTheme(theme: string): void {
    //this.themeSelector.select(theme);
  }
  private getRecords() {
    this.fhirService.getTIE('/PlanDefinition/'+this.planid).subscribe(result => {
          if (result !== undefined) {
            this.plan = result;
            this.buildPlan();
          }
        }
    );
  }
  buildPlan() {
    this.planData = [];
    if (this.plan !== undefined && this.plan.action !== undefined) {
      for (let action of this.plan.action) {
         this.planData.push(this.getNode(action))
      }
    }
    this.data = this.planData;
  }

  private getNode(action: PlanDefinitionAction) : any {
      let node : any = {
        name: action.title,
        value: action,
        children: []
      }
      if (action.action !== undefined) {
        for (let children of action.action) {
          let childNode = this.getNode(children)
          node.children.push(childNode)
        }
      }
      return node;
  }
}
