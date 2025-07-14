import {Component, Input, OnInit} from '@angular/core';
import {Observation, Reference, ServiceRequest} from "fhir/r4";
import {Router} from "@angular/router";
import {FhirService} from "../../../../services/fhir.service";
import {TdLoadingService} from "@covalent/core/loading";

@Component({
  selector: 'app-service-request-expand',
  standalone: false,
  templateUrl: './service-request-expand.component.html',
  styleUrl: './service-request-expand.component.scss'
})

export class ServiceRequestExpandComponent implements OnInit {
  constructor(
      private router: Router,
      public fhirService: FhirService,
      private _loadingService: TdLoadingService) {
  }
  @Input() serviceRequest: ServiceRequest | undefined;
  @Input() patientId: string | undefined;

  observations: Observation[] | undefined;

  ngOnInit() {

    if (this.serviceRequest?.id !== undefined) {
      var obs :Observation[] = [];
      if (this.serviceRequest?.supportingInfo !== undefined) {
        for (const result of this.serviceRequest?.supportingInfo) {
          if (result.reference !== undefined) {
            this.fhirService.getResource('/'+result.reference)
                .subscribe(resource => {
                      if (resource.resourceType === 'Observation') {
                        obs.push(resource as Observation);
                        console.log(resource)
                      }
                      this.observations = obs;

                    },() => {}, () =>{
                      this._loadingService.resolve('overlayStarSyntax');
                    }
                )
          }
        }
      }
    }
  }

  onClick(reference: Reference) {
    if (reference.type !== undefined && reference.reference !== undefined) {
      const id = reference.reference.split('/')[1];
      console.log(id);
      if (reference.type === 'DocumentReference') this.router.navigate(['/patient', this.patientId, 'documents', id])
      if (reference.type === 'QuestionnaireResponse') this.router.navigate(['/patient', this.patientId, 'forms', id])
      if (reference.type === 'DiagnosticReport') this.router.navigate(['/patient', this.patientId, 'report', id])
    }
  }
}
