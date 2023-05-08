import {Component, Input, OnInit, SimpleChanges} from '@angular/core';
import {Parameters, ParametersParameter, ValueSetExpansionContains} from "fhir/r4";
import {FhirService} from "../../services/fhir.service";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {ResourceDialogComponent} from "../../dialogs/resource-dialog/resource-dialog.component";
import {MatTreeFlatDataSource, MatTreeFlattener} from "@angular/material/tree";
import {FlatTreeControl} from "@angular/cdk/tree";


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
  selector: 'app-concept-detail',
  templateUrl: './concept-detail.component.html',
  styleUrls: ['./concept-detail.component.scss']
})
export class ConceptDetailComponent implements OnInit {
  private _transformer = (node: Concept, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      data: node.code,
      level: level,
    };
  };

  treeControl = new FlatTreeControl<ExampleFlatNode>(
      node => node.level,
      node => node.expandable,
  );

  treeFlattener = new MatTreeFlattener(
      this._transformer,
      node => node.level,
      node => node.expandable,
      node => node.children,
  );

  // @ts-ignore
  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;


  @Input()
  concept : ValueSetExpansionContains = {

  }
  parameters: Parameters | undefined;
  parentList: ValueSetExpansionContains[]=[];
  childList: ValueSetExpansionContains[]=[];

  conceptData : Concept[] = [];
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
        this.getPropertyRoles()
        var parentConcept :Concept = {
          code: {
          },
          name: 'Parent',
          children: []
        }
        var childConcept :Concept = {
          code: {
          },
          name: 'Child',
          children: []
        }
        this.conceptData.push(parentConcept)
        this.conceptData.push(childConcept)
        var children = this.getParameters("child")
        for(let child of children) {
          // @ts-ignore
          this.fhirService.lookup(this.concept.system, child).subscribe(params => {
            /*
            this.childList.push( {
              system: this.concept?.system,
              code: child,
              display: this.getParameter("display", params)
            })

             */
            // @ts-ignore
            childConcept.children.push({ name: this.getParameter("display", params),
              code: {
                system: 'http://snomed.info/sct',
                code: child,
                display: this.getParameter("display", params)
              },
              children:[]
            })
            this.dataSource.data = this.conceptData
          })
        }
        var parents = this.getParameters("parent")
        for(let parent of parents) {
          // @ts-ignore
          this.fhirService.lookup(this.concept.system, parent).subscribe(params => {
            /*
            this.parentList.push( {
              system: this.concept?.system,
              code: parent,
              display: this.getParameter("display", params)
            })

             */
            // @ts-ignore
            parentConcept.children.push({ name: this.getParameter("display", params),
              code: {
                system: 'http://snomed.info/sct',
                code: parent,
                display : this.getParameter("display", params)
              },
              children:[]
            })
            this.dataSource.data = this.conceptData
          })
        }

      } )
    }
  }

  getPropertyRoles() {
    this.conceptData=[]
    if (this.parameters!==undefined && this.parameters.parameter!==undefined) {
          this.getProperty(this.parameters.parameter, this.conceptData)
    }
    this.dataSource.data = this.conceptData
  }
  getProperty(parameters : ParametersParameter[], concepts : Concept[]) {
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
    }
  }

  getName(concept : Concept) {
    if (concept.code.code !== undefined) {
      this.fhirService.lookup('http://snomed.info/sct', concept.code.code).subscribe(params => {
        var display = this.getParameter("display", params)
        if (display !== undefined) {
          concept.name = display + ' ('+concept.code.code +')'
          this.dataSource.data = this.conceptData
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

    selected(parent: ValueSetExpansionContains) {
        this.concept = parent
        this.getData()
    }

  selectedN(node :any) {

    if (node.data.system !== undefined) {
      this.concept = node.data
      this.getData()
    }
  }
}
