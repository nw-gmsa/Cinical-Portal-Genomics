import {Component, Input} from '@angular/core';
import {Coding, Questionnaire, QuestionnaireItem, QuestionnaireItemAnswerOption} from "fhir/r4";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {ResourceDialogComponent} from "../../../dialogs/resource-dialog/resource-dialog.component";
import {ConceptDialogComponent} from "../../../dialogs/concept-dialog/concept-dialog.component";
import {DialogService} from "../../../services/dialog.service";

@Component({
  selector: 'app-questionnaire-item',
  templateUrl: './questionnaire-item.component.html',
  styleUrls: ['./questionnaire-item.component.scss']
})
export class QuestionnaireItemComponent {
  // @ts-ignore
  @Input() item: QuestionnaireItem;

  constructor(public dialog: MatDialog,
              public dlgservice: DialogService
  ){ }
  getUnitOption() : Coding[] {
    var answer:Coding[] = []
    if (this.item !== undefined && this.item.extension !== undefined) {
      for (let extension of this.item.extension) {
        if (extension.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-unitOption' && extension.valueCoding !== undefined) {
          answer.push(extension.valueCoding)
        }
      }
    }
    return answer
  }

  getUnitRanges(unit : String | undefined) : String {
    if (unit === undefined) return ''
    var answer = ' '
    if (this.item !== undefined && this.item.extension !== undefined) {
      for (let extension of this.item.extension) {
        if (extension.url === 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-minQuantity' && extension.valueQuantity !== undefined) {
        //  console.log(' - ' + extension.valueQuantity.code)
          if (extension.valueQuantity.code === unit) answer = answer + 'min ' + extension.valueQuantity.value
        }
        if (extension.url === 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-maxQuantity' && extension.valueQuantity !== undefined) {
         // console.log(' - ' + extension.valueQuantity.code)
          if (extension.valueQuantity.code === unit) answer = answer + ' - max ' + extension.valueQuantity.value
        }
      }
    }
    return answer
  }

  getSDCExtract(): boolean {
    if (this.item !== undefined && this.item.extension !== undefined) {
      for (let extension of this.item.extension) {
        if (extension.url === 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-observationExtract' && extension.valueBoolean !== undefined) {
          return extension.valueBoolean
        }
      }
    }
    return false
  }

  getSDCPopulate() {
    if (this.item !== undefined && this.item.extension !== undefined) {
      for (let extension of this.item.extension) {
        if (extension.url === 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-observationLinkPeriod' && extension.valueDuration !== undefined) {
          return '$populate last '+ extension.valueDuration.value + ' ' + extension.valueDuration.unit
        }
      }
    }
    return undefined
  }

  getDisplay(): string {
    if (this.item.code !== undefined && this.item.code.length>0) {
      var display = this.item.code[0].display
      if (this.item.code[0].system === 'http://snomed.info/sct') display = 'SNOMED CT ' + display
      if (this.item.code[0].system === 'http://loinc.org') display = 'LOINC ' + display
      return <string>display;
    }
    return ''
  }


    getName(answerValueSet: string): string {
        var split = answerValueSet.split('/')
      if (split.length>0) {
        return split[split.length-1]
      }
        return 'Not found'
    }

  extractOpen() {
    window.open("https://build.fhir.org/ig/HL7/sdc/extraction.html","_blank")
  }
  populateOpen() {
    window.open("https://build.fhir.org/ig/HL7/sdc/populate.html","_blank")
  }

    selectConcept(concept: Coding | undefined) {
      if (concept !== undefined && concept.system !== undefined && (concept.system === 'http://snomed.info/sct' || concept.system === 'http://loinc.org')) {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.data = {
          concept
        };
        const resourceDialog: MatDialogRef<ConceptDialogComponent> = this.dialog.open(ConceptDialogComponent, dialogConfig);
      }
    }

  getScore(option: QuestionnaireItemAnswerOption) {
    if (option !== undefined && option.extension !== undefined) {
      for (let extension of option.extension) {
        if (extension.url === 'http://hl7.org/fhir/StructureDefinition/ordinalValue' && extension.valueDecimal !== undefined) {
          return ' Score ['+ extension.valueDecimal + ']'
        }
      }
    }
    return undefined
  }
}
