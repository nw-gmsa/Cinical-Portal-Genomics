import {Component, Inject, Input, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Coding, FhirResource, Parameters, ParametersParameter, ValueSetExpansionContains} from "fhir/r4";
import {FhirService} from "../../services/fhir.service";

interface Concept {
  name: string;
  code: ValueSetExpansionContains
  children: Concept[];
}

interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}
@Component({
  selector: 'app-concept-dialog',
  templateUrl: './concept-dialog.component.html',
  styleUrls: ['./concept-dialog.component.scss']
})
export class ConceptDialogComponent implements OnInit{
  @Input() concept: Coding | undefined;

  parameters: Parameters | undefined;
  synonyms: string[] = [];
  fullName: string | undefined
  preferred: string | undefined
  tags: string | undefined

  conceptData : Concept[] = [];
  constructor(
      public fhirService: FhirService,
      public dialogRef: MatDialogRef<ConceptDialogComponent>,
      @Inject(MAT_DIALOG_DATA) data: any) {
    this.concept = data.concept;
  }

  ngOnInit(): void {
    if (this.concept !== undefined && this.concept.system !== undefined && this.concept.code !== undefined) {
      this.fhirService.lookup(this.concept.system, this.concept.code).subscribe( params => {

        this.parameters = params

        this.getPropertyRoles()
      } )
    }
  }
  getPropertyRoles() {

    if (this.parameters!==undefined && this.parameters.parameter!==undefined) {
      this.getProperty(this.parameters.parameter, this.conceptData)
      console.log(this.parameters)
    }

  }

  getProperty(parameters : ParametersParameter[], concepts : Concept[]) {
    this.fullName = undefined
    this.preferred = undefined
    this.synonyms = []
    this.tags = undefined
    for (let parameter of parameters) {
      if ((parameter.name === 'property' || parameter.name === 'subproperty') && parameter.part !== undefined) {
        var role: any | undefined = undefined
        var subProperty : ParametersParameter[] = []
        var valueCode : any | undefined = undefined
        for (let it of parameter.part) {
          if (it.name === 'subproperty') {
            subProperty.push(it)
          }
          if (it.name === 'valueCode') {
            valueCode = it
          }
          if (it.name === 'code' && it.valueCode !== undefined ) {
            if (Number(it.valueCode) > 0) {
              role = it
            }
          }
        }
        if (role !== undefined) {
          var concept: Concept | undefined = undefined;
          /// find existing concept
          for (let it of concepts) {
            if (it.code.code === role.valueCode) {
              concept = it
            }
          }
          // add if concept not found
          if (concept === undefined) {
            concept = {
              name: role.valueCode,
              code: {
                code: role.valueCode
              },
              children: []
            }
            concepts.push(concept)
            this.getName(concept)

          }
          if (subProperty.length>0) {
            this.getProperty(subProperty,concept.children)
          }
          if (valueCode !== undefined) {
            var valueConcept = {
              name: valueCode.valueCode,
              code: {
                code: valueCode.valueCode
              },
              children: []
            }
            concept.children.push(valueConcept)
            this.getName(valueConcept)
          }
        }
      }
      if (parameter.name === 'designation') {
        if (parameter.part !== undefined) {
          var use: string | undefined
          var value : string | undefined
          for (let part of parameter.part) {
            if (part.name=='use' && part.valueCoding !== undefined) {
              use = part.valueCoding.code
            }
            if (part.name=='value' && part.valueString !== undefined) {
              value = part.valueString
            }
          }
          if (use !== undefined && value !== undefined) {
            if (use === '900000000000003001') {
              this.fullName = value
              var strings = value.split('(')
              this.tags = strings[strings.length-1].replace(')','')
            }
            if (use === '900000000000013009') this.synonyms.push(value)
            if (use === 'preferredForLanguage') this.preferred = value

          }
        }
      }
    }
  }

  getName(concept : Concept) {
    if (concept.code.code !== undefined) {

      this.fhirService.lookup('http://snomed.info/sct', concept.code.code).subscribe(params => {
        var display = this.getParameter("display", params)
        if (display !== undefined) {
          concept.name = display
          concept.code.display = concept.name
        //  this.dataSource.data = this.conceptData
        }
      })
    }
  }

  getParameter(code : string, params : Parameters | undefined) : string | undefined {
    if (params === undefined) params = this.parameters
    if (params !== undefined && params.parameter !== undefined) {
      for (let param of params.parameter){
        var name = undefined
        var value: string | undefined = undefined
        if (param.name === code) {
          if (param.valueBoolean !== undefined) return param.valueBoolean ? 'true' : 'false'
          if (param.valueString !== undefined) return param.valueString
          if (param.valueCode !== undefined) return param.valueCode
        }
        if (param.part !== undefined) {

          for (let part of param.part) {
            if (part.name === 'code') {
              name = part.valueCode

            }
            if (part.name === 'value') {

              if (part.valueBoolean !== undefined) value = part.valueBoolean ? 'true' : 'false'
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

  getParameters(code: string) : string[] {
    var results: string[] = []
    if (this.parameters !== undefined && this.parameters.parameter !== undefined) {
      for (let param of this.parameters.parameter){
        var name = undefined
        var value: string | undefined = undefined
        if (param.name === code) {
          if (param.valueBoolean !== undefined) results.push(String(param.valueBoolean))
          if (param.valueString !== undefined) results.push(param.valueString)
          if (param.valueCode !== undefined) results.push(param.valueCode)
        }
        if (param.part !== undefined) {

          for (let part of param.part) {
            if (part.name === 'code') {
              name = part.valueCode

            }
            if (part.name === 'value') {

              if (part.valueBoolean !== undefined) value = String(part.valueBoolean)
              if (part.valueString !== undefined) value = part.valueString
              if (part.valueCode !== undefined) value = part.valueCode
            }

          }
        }
        if (name !== undefined && name === code && value !== undefined) results.push(value)
      }
    }
    //console.log(results)
    return results
  }
}
