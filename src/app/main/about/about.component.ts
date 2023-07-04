import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  markdown = `
      ## Overview
      
      This aim of this application is to demonstrate the use of [HL7 FHIR R4 RESTful](http://hl7.org/fhir/R4/http.html) API's using [UK Core](https://simplifier.net/guide/ukcoreversionhistory?version=current) FHIR Profiles to provide a:
      
      ## Vendor Neutral open API
      
      Note: This is not a definition for EHR Records or demonstration of user interface standards. Example use cases include:
      - 3rd party application access to EPR, PAS, EHR, EDMS, etc systems
      - Sharing patient data in an enterprise (e.g. LHCR, ICS or NHS Trust)
      
      ### Patient Search 
      
      [IHE Patient Demographics Query for Mobile (PDQm)](https://profiles.ihe.net/ITI/PDQm/index.html) which describes a common way of searching patient demographics records. See also [HL7 UK Core Access](https://build.fhir.org/ig/HL7-UK/UK-Core-Access/)
      
      ### Document Sharing
      
      [IHE Mobile Health Document Sharing (MHDS)](https://profiles.ihe.net/ITI/MHDS/index.html) which describes a common way of sharing patient/citizen/health/social care documents. IHE MHD is also modernisation of [IHE XDS](https://en.wikipedia.org/wiki/Cross_Enterprise_Document_Sharing) XML/SOAP API's, it is not a replacement for IHE XDS. 
       
      ### Forms/Template/Archetype Sharing
      
      [HL7 FHIR Structured Data Capture](http://hl7.org/fhir/uv/sdc/) which describes methods sharing form definitions, completed forms and pre-population of forms (using IHE QEDm)    
      
      ### Sharing Existing Data
      
      [IHE Query for Existing Data for Mobile (QEDm)](http://build.fhir.org/ig/IHE/QEDm/branches/master/index.html) which describes a common way of querying patient/citizen health records. See also [HL7 UK Core Access](https://build.fhir.org/ig/HL7-UK/UK-Core-Access/). This is the FHIR R4 version of [FHIR STU3 INTEROPen CareConnectAPI](https://nhsconnect.github.io/CareConnectAPI/). This is not a replacement for [NHS England ITK HL7 V2 Message Specifications](https://github.com/NHSDigital/IOPS-Frameworks/blob/main/documents/HSCIC%20ITK%20HL7%20V2%20Message%20Specifications.pdf)
      
      ## Other Implementation Guides
     
      - **Referrals and Interventions** follows [HL7 FHIR Workflow](http://hl7.org/fhir/R4/workflow.html) which describes how providers, practitioners and patients can coordinate care on a patient journey. 
      - **Care Plan and Goals** is based on guidance from [US Physical Activity](http://build.fhir.org/ig/HL7/physical-activity/index.html). With additional framework guidance from [IHE Dynamic Care Planning (DCP)](https://wiki.ihe.net/index.php/Dynamic_Care_Planning_(DCP)) and [IHE Dynamic Care Team Management (DCTM)](https://wiki.ihe.net/index.php/Dynamic_Care_Team_Management_(DCTM)). For Care Plan assessments see \`forms\` and for sharing existing patient records see \`IHE QEDm\` and \`IHE MHDS\`.
      - **Patient Summary** has been based on [FHIR International Patient Summary](https://build.fhir.org/ig/HL7/fhir-ips/), at present this is being used for the layout of the screen but may in future be updated to support record extraction in [HL7 FHIR Documents](http://hl7.org/fhir/R4/documents.html) format.
      - **Terminology** This application uses the [NHS England Terminology Server](https://digital.nhs.uk/services/terminology-servers) in conjunction with \`UK Core\`. The use of this server is generally seen in picklists and code lookups when adding data in the application.
      - **EHR Record Standards** [openEHR](https://www.openehr.org/). Note this also includes data model standards. Many openEHR systems will expose archetypes/care data using the FHIR based IHE QEDm.
      - **Clinical Requirements** is based on guidance from [PRSB Standards](https://theprsb.org/standards/) and is demonstrated using the \`Technical Frameworks\`
     
      This application uses an off the shelf FHIR server which has been constrained to match the \`Technical Frameworks\` using a [facade pattern](https://en.wikipedia.org/wiki/Facade_pattern) which is expected to mirror how this interoperability later is implemented.
      
  `;

  constructor() { }

  ngOnInit(): void {
  }

}
