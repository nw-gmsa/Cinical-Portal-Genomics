import {Component, Input, OnInit, SimpleChanges} from '@angular/core';
import { Parameters, ValueSetExpansionContains} from "fhir/r4";
import {FhirService} from "../../services/fhir.service";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {ResourceDialogComponent} from "../../dialogs/resource-dialog/resource-dialog.component";


@Component({
  selector: 'app-concept-detail',
  templateUrl: './concept-detail.component.html',
  styleUrls: ['./concept-detail.component.scss']
})
export class ConceptDetailComponent implements OnInit {

  @Input()
  concept : ValueSetExpansionContains | undefined
  parameters: Parameters | undefined;
  parentList: ValueSetExpansionContains[]=[];
  childList: ValueSetExpansionContains[]=[];
  constructor(public fhirService: FhirService,
              public dialog: MatDialog,) { }

  ngOnInit(): void {

      this.getData()
  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes['concept']) this.getData()
  }

  getData() {

    this.parentList = []
    this.childList = []
    if (this.concept !== undefined && this.concept.system !== undefined && this.concept.code !== undefined) {
      this.fhirService.lookup(this.concept.system, this.concept.code).subscribe( params => {

        this.parameters = params
        var children = this.getParameters("child")
        for(let child of children) {
          // @ts-ignore
          this.fhirService.lookup(this.concept.system, child).subscribe(params => {
            this.childList.push( {
              system: this.concept?.system,
              code: child,
              display: this.getParameter("display", params)
            })

          })
        }
        var parents = this.getParameters("parent")
        for(let parent of parents) {
          // @ts-ignore
          this.fhirService.lookup(this.concept.system, parent).subscribe(params => {
            this.parentList.push( {
              system: this.concept?.system,
              code: parent,
              display: this.getParameter("display", params)
            })

          })
        }

      } )
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

  select(resource: any): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      id: 1,
      resource
    };
    const resourceDialog: MatDialogRef<ResourceDialogComponent> = this.dialog.open( ResourceDialogComponent, dialogConfig);
  }
}
