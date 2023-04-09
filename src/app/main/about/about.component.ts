import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  markdown = `
      ## Overview
      
      This aim of this application is to demonstrate interoperability involving serveral providers and the patient/citizen. 
      
      This does not aim to show what user interfaces or applications should look like. It instead focuses on the interactions and data shared between providers and the patient.
      
      This uses a series of data models and frameworks.
      
      ### Data Model
      
      - [HL7 FHIR R4](http://hl7.org/fhir/R4/resourcelist.html) provides the basic data model
      - [UK Core](https://simplifier.net/guide/ukcoreversionhistory?version=current) is the UK wide supplement to this model which adds in UK specific guidance.
      
      ### Interactions 
      
      - All the interactions are [RESTful](https://en.wikipedia.org/wiki/Representational_state_transfer), [resource](https://en.wikipedia.org/wiki/Resource-oriented_architecture) based and follow [HL7 FHIR RESTful API](http://hl7.org/fhir/R4/http.html)
      - The payload format is **JSON** (**XML** can be supported).
  
      ### Technical Frameworks
      
      These frameworks follow a [API First (NHS England)](https://digital.nhs.uk/developer/guides-and-documentation/api-policies-and-best-practice) principle as per [UK Gov - API technical and data standards](https://www.gov.uk/guidance/gds-api-technical-and-data-standards). Providers and suppliers are encouraged to follow this. 
    
      - **Patient Search** Searching follows [IHE Patient Demographics Query for Mobile (PDQm)](https://profiles.ihe.net/ITI/PDQm/index.html) which describes a common way of searching patient demographics records. See also [HL7 UK Core Access](https://build.fhir.org/ig/HL7-UK/UK-Core-Access/)
      - **Observations and other Patient Care Data** follows [IHE Query for Existing Data for Mobile (QEDm)](https://wiki.ihe.net/index.php/Query_for_Existing_Data_for_Mobile_(QEDm)) which describes a common way of querying patient/citizen health records. See also [HL7 UK Core Access](https://build.fhir.org/ig/HL7-UK/UK-Core-Access/)
      - **Documents** follows [IHE Mobile Health Document Sharing (MHDS)](https://profiles.ihe.net/ITI/MHDS/index.html) which describes a common way of sharing patient/citizen/health/social care documents.
      - **Forms** follows [HL7 FHIR Structured Data Capture](http://hl7.org/fhir/uv/sdc/) which describes methods sharing form definitions, completed forms and pre-population of forms (using IHE QEDm)
      - **Referrals and Interventions** follows [HL7 FHIR Workflow](http://hl7.org/fhir/R4/workflow.html) which describes how providers, practitioners and patients can coordinate care on a patient journey. This will often rely on IHE QEDm/IHE MHDS/FHIR SDC to share patient records and/or supporting information (e.g. referrals forms, assessments, etc).
      - **Care Plan and Goals** is based on guidance from [US Physical Activity](http://build.fhir.org/ig/HL7/physical-activity/index.html). With additional framework guidance from [IHE Dynamic Care Planning (DCP)](https://wiki.ihe.net/index.php/Dynamic_Care_Planning_(DCP)) and [IHE Dynamic Care Team Management (DCTM)](https://wiki.ihe.net/index.php/Dynamic_Care_Team_Management_(DCTM)). For Care Plan assessments see \`forms\` and for sharing existing patient records see \`IHE QEDm\` and \`IHE MHDS\`.
  
      ### Patient Summaries and Clinical Requirements
      
      - **Patient Summary** has been based on [FHIR International Patient Summary](https://build.fhir.org/ig/HL7/fhir-ips/), at present this is being used for the layout of the screen but may in future be updated to support record extraction in [HL7 FHIR Documents](http://hl7.org/fhir/R4/documents.html) format.
      - **Clinical Requirements** is based on guidance from [PRSB Standards](https://theprsb.org/standards/) and is demonstrated using the \`Technical Frameworks\`
  
      ### Terminology
      
      This application uses the [NHS England Terminology Server](https://digital.nhs.uk/services/terminology-servers) in conjunction with \`UK Core\`. The use of this server is generally seen in picklists and code lookups when adding data in the application.
      
      ### Reference Implementation 
      
      The standards listed above are designed to provide interoperability layers on top of existing systems. They are not intended to demonstrate how EHR systems are built. Example EHR system standards can be found:
     
      - [openEHR](https://www.openehr.org/). Note this also includes data model standards. Many openEHR systems will expose archetypes/care data using the FHIR based IHE QEDm.
      - [IHE XDS](https://en.wikipedia.org/wiki/Cross_Enterprise_Document_Sharing) Note this is also an XML API standard and includes a data model. IHE MHDS is the FHIR based RESTful+JSON version.
      
      This application uses an off the shelf FHIR server which has been constrained to match the \`Technical Frameworks\` using a [facade pattern](https://en.wikipedia.org/wiki/Facade_pattern) which is expected to mirror how this interoperability later is implemented.
      
  `;

  constructor() { }

  ngOnInit(): void {
  }

}
