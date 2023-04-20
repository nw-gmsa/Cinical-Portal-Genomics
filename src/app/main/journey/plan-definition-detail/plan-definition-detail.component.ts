import {Component, Input, OnInit, ViewContainerRef} from '@angular/core';
import {PlanDefinition} from "fhir/r4";
import {TdDialogService} from "@covalent/core/dialogs";
import {FhirService} from "../../../services/fhir.service";
import {EprService} from "../../../services/epr.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-plan-definition-detail',
  templateUrl: './plan-definition-detail.component.html',
  styleUrls: ['./plan-definition-detail.component.scss']
})
export class PlanDefinitionDetailComponent implements OnInit {


  @Input()
  plan : PlanDefinition | undefined;

  planid: string | undefined;
  patientId: string = '';
  constructor(
      private _dialogService: TdDialogService,
      private _viewContainerRef: ViewContainerRef,
      public fhirService: FhirService,
      private eprService: EprService,
      private route: ActivatedRoute) {
  }

  ngOnInit() {
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

  private getRecords() {
    this.fhirService.getTIE('/PlanDefinition/'+this.planid).subscribe(result => {
          if (result !== undefined) {
            this.plan = result;
          }
        }
    );
  }

}
