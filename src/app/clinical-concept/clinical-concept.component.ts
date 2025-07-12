import {Component, Input} from '@angular/core';
import {CodeableConcept, Coding} from "fhir/r4";


@Component({
  selector: 'app-clinical-concept',
  templateUrl: './clinical-concept.component.html',
  styleUrl: './clinical-concept.component.scss'
})
export class ClinicalConceptComponent {

  public concepts: CodeableConcept[] =[]

  public conceptz: CodeableConcept[] =[]


  @Input()
  set setConcepts(concepts: CodeableConcept[] | undefined) {
    if (concepts !== undefined) {
      this.concepts = concepts
    } else {
      this.concepts = []
    }
  }
  @Input()
  set setConcept(concept: CodeableConcept | undefined) {
    if (concept !== undefined) {
      this.concepts = []
      this.concepts.push(concept)
    } else {
      this.concepts = []
    }
  }
}
