import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {FhirService} from "../../../services/fhir.service";
import {EprService} from "../../../services/epr.service";
import {TdDialogService} from "@covalent/core/dialogs";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {Communication, Patient} from "fhir/r4";
import {CommunicationCreateComponent} from "./communication-create/communication-create.component";

@Component({
  selector: 'app-patient-communication',
  templateUrl: './patient-communication.component.html',
  styleUrls: ['./patient-communication.component.scss']
})
export class PatientCommunicationComponent implements OnInit {

  public communications: Communication[] = [];
  patientId: string | null = null;
  private nhsNumber: string | undefined;
  constructor( private fhirService: FhirService,
               private eprService: EprService,
               private dialogService: TdDialogService,
               public dialog: MatDialog,
               private viewContainerRef: ViewContainerRef) { }

  ngOnInit(): void {
    if (this.eprService.patient !== undefined) {
      if (this.eprService.patient.id !== undefined) {
        this.patientId = this.eprService.patient.id;
        this.getRecords(this.eprService.patient);
      }

    }
    this.eprService.patientChangeEvent.subscribe(patient => {
      if (patient.id !== undefined) this.patientId = patient.id

      this.getRecords(patient);
    });
  }

  private getRecords(patient : Patient) {
    if (patient !== undefined) {
      if (patient.identifier !== undefined) {
        for (const identifier of patient.identifier) {
          if (identifier.system !== undefined && identifier.system.includes('nhs-number')) {
            this.nhsNumber = identifier.value;
          }
        }
      }
    }
    this.fhirService.getTIE('/Communication?_sort=sent&patient=' + this.patientId).subscribe(bundle => {
          if (bundle.entry !== undefined) {
            for (const entry of bundle.entry) {
              if (entry.resource !== undefined && entry.resource.resourceType === 'Communication') { this.communications.push(entry.resource as Communication); }
            }
          }
        }
    );
  }

  addCommunication(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = '80%';
    dialogConfig.width = '50%';

    dialogConfig.data = {
      id: 1,
      patientId: this.patientId,
      nhsNumber: this.nhsNumber
    };
    this.dialog.open( CommunicationCreateComponent, dialogConfig);
  }

}
