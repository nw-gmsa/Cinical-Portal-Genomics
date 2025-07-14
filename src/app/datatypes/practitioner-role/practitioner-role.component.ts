import {Component, Input, OnInit} from '@angular/core';
import {DiagnosticReport, PractitionerRole, Reference} from "fhir/r4";
import {MatTableDataSource} from "@angular/material/table";
import {FhirService} from "../../services/fhir.service";
import {DialogService} from "../../services/dialog.service";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-practitioner-role',
  templateUrl: './practitioner-role.component.html',
  styleUrl: './practitioner-role.component.scss'
})
export class PractitionerRoleComponent implements OnInit {
  constructor(public fhirService: FhirService) { }

  ngOnInit(): void {

  }
  public roles: PractitionerRole[] =[]

  @Input()
  set setRoles(references: Reference[] | undefined) {
    this.roles = []
    if (references !== undefined) {
      for(let reference of references) {
        this.getReference(reference)
      }
    }
  }
  @Input()
  set setRole(reference: Reference | undefined) {
    this.roles = []

    if (reference !== undefined) {
      this.roles = []
      this.getReference(reference)
    } else {

    }
  }

  getReference(reference: Reference) {
    if (reference.reference === undefined) return;

    this.fhirService.getResource('/'+reference.reference).subscribe(result => {
      if (result !== undefined) {
        if (result.resourceType === 'PractitionerRole') {
          this.roles.push(result as PractitionerRole)
        }
      }
      }
    )
  }
}
