import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {FhirService} from "../../../services/fhir.service";
import {EprService} from "../../../services/epr.service";
import {TdDialogService} from "@covalent/core/dialogs";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {CarePlan, CareTeam, EpisodeOfCare, Patient} from "fhir/r4";
import {CareTeamCreateComponent} from "../../../dialogs/care-team-create/care-team-create.component";
import {CarePlanCreateComponent} from "../../../dialogs/care-plan-create/care-plan-create.component";
import {EpisodeOfCareCreateComponent} from "../../../dialogs/episode-of-care-create/episode-of-care-create.component";

@Component({
  selector: 'app-coordinated-care',
  templateUrl: './coordinated-care.component.html',
  styleUrls: ['./coordinated-care.component.scss']
})
export class CoordinatedCareComponent implements OnInit {
  episodes: EpisodeOfCare[] = [];
  careTeams: CareTeam[] = [];
  carePlans: CarePlan[] = [];
  patientid: string | null = null;
  public nhsNumber: string | undefined;
  constructor( private fhirSrv: FhirService,
               private eprService: EprService,
               private dialogService: TdDialogService,
               public dialog: MatDialog,
               private viewContainerRef: ViewContainerRef) { }

  ngOnInit(): void {
    if (this.eprService.patient !== undefined) {
      if (this.eprService.patient.id !== undefined) {
        this.patientid = this.eprService.patient.id;
        this.getRecords(this.eprService.patient);
      }

    }
    this.eprService.patientChangeEvent.subscribe(patient => {
      if (patient.id !== undefined) this.patientid = patient.id

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
    this.fhirSrv.get('/EpisodeOfCare?patient=' + this.patientid + '&status=active,waitlist').subscribe(bundle => {
          if (bundle.entry !== undefined) {
            for (const entry of bundle.entry) {
              if (entry.resource !== undefined && entry.resource.resourceType === 'EpisodeOfCare') { this.episodes.push(entry.resource as EpisodeOfCare); }
            }
          }
        }
    );


    this.fhirSrv.getTIE('/CarePlan?patient=' + this.patientid).subscribe(bundle => {
          if (bundle.entry !== undefined) {
            for (const entry of bundle.entry) {
              if (entry.resource !== undefined && entry.resource.resourceType === 'CarePlan') { this.carePlans.push(entry.resource as CarePlan); }
            }
          }
        }
    );

    this.fhirSrv.getTIE('/CareTeam?patient=' + this.patientid).subscribe(bundle => {
          if (bundle.entry !== undefined) {
            for (const entry of bundle.entry) {
              if (entry.resource !== undefined && entry.resource.resourceType === 'CareTeam') { this.careTeams.push(entry.resource as CareTeam); }
            }
          }
        }
    );
  }

  addCareTeam(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = '80%';
    dialogConfig.width = '50%';

    dialogConfig.data = {
      id: 1,
      patientId: this.patientid,
      nhsNumber: this.nhsNumber
    };
    this.dialog.open( CareTeamCreateComponent, dialogConfig);
  }
  addCarePlan(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = '80%';
    dialogConfig.width = '50%';

    dialogConfig.data = {
      id: 1,
      patientId: this.patientid,
      nhsNumber: this.nhsNumber
    };
    this.dialog.open( CarePlanCreateComponent, dialogConfig);
  }

  addStay(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = '80%';
    dialogConfig.width = '50%';

    dialogConfig.data = {
      id: 1,
      patientId: this.patientid,
      nhsNumber: this.nhsNumber
    };
    this.dialog.open( EpisodeOfCareCreateComponent, dialogConfig);
  }


}
