import {Component, Input} from '@angular/core';
import {Reference, ServiceRequest} from "fhir/r4";
import {Router} from "@angular/router";
import {FhirService} from "../../../../services/fhir.service";

@Component({
  selector: 'app-service-request-expand',
  standalone: false,
  templateUrl: './service-request-expand.component.html',
  styleUrl: './service-request-expand.component.scss'
})

export class ServiceRequestExpandComponent {
  constructor(
      private router: Router,
      public fhirService: FhirService) {
  }
  @Input() serviceRequest: ServiceRequest | undefined;
  @Input() patientId: string | undefined;

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
