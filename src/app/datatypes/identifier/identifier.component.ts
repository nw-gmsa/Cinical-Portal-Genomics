import {Component, Input, ViewEncapsulation} from '@angular/core';
import {CodeableConcept, Identifier} from "fhir/r4";

@Component({
  selector: 'app-identifier',
  templateUrl: './identifier.component.html',
  styleUrl: './identifier.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class IdentifierComponent {
  identifiers: Identifier[] = [];

  @Input()
  set setIdentifiers(identifiers: Identifier[] | undefined) {
    if (identifiers !== undefined) {
      this.identifiers = identifiers
    } else {
      this.identifiers = []
    }
  }
  @Input()
  set setIdentifier(identifier: Identifier | undefined) {
    if (identifier !== undefined) {
      this.identifiers = []
      this.identifiers.push(identifier)
    } else {
      this.identifiers = []
    }
  }

  getDisplay(type: CodeableConcept) {
    if (type.text !== undefined) return type.text;
    return "";
  }
}
