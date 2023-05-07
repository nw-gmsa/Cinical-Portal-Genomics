import {Component, Input, OnInit, SimpleChanges} from '@angular/core';
import { Parameters, ValueSetExpansionContains} from "fhir/r4";
import {FhirService} from "../../services/fhir.service";


@Component({
  selector: 'app-concept-detail',
  templateUrl: './concept-detail.component.html',
  styleUrls: ['./concept-detail.component.scss']
})
export class ConceptDetailComponent implements OnInit {

  @Input()
  concept : ValueSetExpansionContains | undefined
  parameters: Parameters | undefined;
  constructor(public fhirService: FhirService) { }

  ngOnInit(): void {
      console.log(this.concept)
    if (this.concept !== undefined && this.concept.system !== undefined && this.concept.code !== undefined) {
      this.fhirService.lookup(this.concept.system, this.concept.code).subscribe( params => {
        console.log(params)
        this.parameters = params
      } )
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes)

  }

  getParameter(code : string) {
    if (this.parameters !== undefined && this.parameters.parameter !== undefined) {
       for (let param of this.parameters.parameter){
         var name = undefined
         var value = undefined
         if (param.name === code) {
           if (param.valueBoolean !== undefined) return param.valueBoolean
           if (param.valueString !== undefined) return param.valueString
           if (param.valueCode !== undefined) return param.valueCode
         }
         if (param.part !== undefined) {

           for (let part of param.part) {
             if (part.name === 'code') {
               name = part.valueCode

             }
             if (part.name === 'value') {

               if (part.valueBoolean !== undefined) value = part.valueBoolean
               if (part.valueString !== undefined) value = part.valueString
               if (part.valueCode !== undefined) value = part.valueCode
             }

           }
         }
         if (name !== undefined && name === code) return value;
      }
    }
    return undefined
  }
}
