import {Component, Input, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {ActivityDefinition} from "fhir/r4";
import {FhirService} from "../../../services/fhir.service";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {TdDialogService} from "@covalent/core/dialogs";
import {EprService} from "../../../services/epr.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-activity-definition-detail',
  templateUrl: './activity-definition-detail.component.html',
  styleUrls: ['./activity-definition-detail.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ActivityDefinitionDetailComponent implements OnInit {

  @Input()
  activity : ActivityDefinition | undefined;

  activityid: string | undefined;
  patientId: string = '';
  constructor(
      private _dialogService: TdDialogService,
      private _viewContainerRef: ViewContainerRef,
      public fhirService: FhirService,
      private eprService: EprService,
      private route: ActivatedRoute) {
  }

  ngOnInit() {
    const activityid= this.route.snapshot.paramMap.get('activity');
    if (activityid != null) {
      this.activityid = activityid;
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
    this.fhirService.getTIE('/ActivityDefinition/'+this.activityid).subscribe(result => {
          if (result !== undefined) {
            this.activity = result;
          }
        }
    );
  }


}
