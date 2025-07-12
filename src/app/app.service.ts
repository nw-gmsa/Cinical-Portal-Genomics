import {inject, Injectable} from '@angular/core';
import {Coding, QuestionnaireItem} from "fhir/r4";
import {ConceptPopupComponent} from "./dialogs/concept-popup/concept-popup.component";
import {MatDialog} from "@angular/material/dialog";

@Injectable({
  providedIn: 'root'
})
export class AppService {
  readonly dialog = inject(MatDialog);
  //defaultQuestionnaire: string = 'https://raw.githubusercontent.com/project-wildfyre/questionnaire-viewer/refs/heads/main/QuestionnaireExamples/Questionnaire-questionnaire-sdc-profile-example-framingham-hchd-lhc.json';
  defaultQuestionnaire: string = 'https://raw.githubusercontent.com/project-wildfyre/questionnaire-viewer/refs/heads/main/QuestionnaireExamples/Questionnaire-Prescreen-Example.json';
  constructor() { }

  getCoded(code : Coding | undefined) {
    var retStr = ""
    if (code !== undefined && code.code !== undefined) {
      retStr = code.code
    }
    return retStr;
  }

  showSNOMED(code: Coding) {
    const dialogRef = this.dialog.open(ConceptPopupComponent, {
      data: code,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}
