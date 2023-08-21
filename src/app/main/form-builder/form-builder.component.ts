import { Component } from '@angular/core';
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-form-builder',
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.scss']
})
export class FormBuilderComponent {
  markdown = `
      
      ### Form Builder
      
      At present there is no UK Form Builder and the recommended option is to use the [US National Library of Medicine - LHC FHIR Tools](https://lhcforms.nlm.nih.gov/) 
      
      To use the NLM Form Builder and edit an existing form on this server:
      
      1. Click on the Launch Button below.
      2. Accept the Terms and Conditions
      3. Select *Start with existing form*
      4. Select *Import from FHIR Server* and click continue
      5. Select *Add your FHIR server...* and enter <mark>https://3cdzg7kbj4.execute-api.eu-west-2.amazonaws.com/poc/events/FHIR/R4</mark>
      
      This FHIR Server is configured to use [NHS England Ontology Server](https://digital.nhs.uk/services/terminology-servers) and UK ValueSets from [UK Core](https://simplifier.net/guide/uk-core-implementation-guide/Home).
      
      This FHIR Server is a prototype and so subject to change, so ensure you back up any Questionnaires you create.
  `;

  launch() {
    window.open('https://lhcformbuilder.nlm.nih.gov//', '_blank');
  }
}
