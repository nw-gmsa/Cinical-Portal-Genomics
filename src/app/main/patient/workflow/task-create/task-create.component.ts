import {Component, Inject, OnInit} from '@angular/core';
import { Observable, Subject, of, throwError  } from 'rxjs';
import {
  catchError,
  debounceTime, distinctUntilChanged, map, switchMap
} from 'rxjs/operators';
import {
  CareTeam,
  Coding,
  Organization,
  Practitioner,
  Resource,
  Task,
  ValueSetExpansionContains
} from 'fhir/r4';
import {FhirService} from '../../../../services/fhir.service';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import * as uuid from 'uuid';
import {DialogService} from '../../../../services/dialog.service';
import {MatSelectChange} from "@angular/material/select";
import {TdDialogService} from "@covalent/core/dialogs";

@Component({
  selector: 'app-task-create',
  templateUrl: './task-create.component.html',
  styleUrls: ['./task-create.component.scss']
})
export class TaskCreateComponent implements OnInit {

  code$: Observable<ValueSetExpansionContains[]> | undefined;
  code: ValueSetExpansionContains[] | undefined;

  reason$: Observable<ValueSetExpansionContains[]> | undefined;

  intents: ValueSetExpansionContains[] | undefined;
  priorities: ValueSetExpansionContains[] | undefined;

  private searchReasons = new Subject<string>();

  organisation$: Observable<Organization[]> | undefined;
  careTeams: CareTeam[] = [];
  foci: Resource[] = [];
  practitioner$: Observable<Practitioner[]> | undefined;
  statuses: ValueSetExpansionContains[] | undefined;
  private searchTerms = new Subject<string>();
  private searchTermsOrg = new Subject<string>();
  private searchTermsDoc = new Subject<string>();

  private organisation: Organization | undefined;
  private practitioner: Practitioner | undefined;
  private taskCode: Coding | undefined;
  taskStatus: string = 'requested';
  taskPriority: string = 'routine';
  careIntent: string = 'order'
  reasonCode: Coding | undefined;
  selectedValues: any;
  disabled: boolean = true;
  patientId = undefined;
  nhsNumber :string;
  notes: string | undefined;

  planTeams: CareTeam | undefined;
  planFocus: Resource | undefined;
  description: string | undefined = '';

  taskType = 0;

  task: Task | undefined;
  edit = false;
  patientTask: boolean = false;

  constructor(public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) data: any,
              public fhirService: FhirService,
              public dlgSrv: DialogService,
              private _dialogService: TdDialogService,
              private diaglogRef: MatDialogRef<TaskCreateComponent>) {
    this.patientId = data.patientId;
    this.nhsNumber = data.nhsNumber;
    this.task = data.task;
    this.taskType = data.taskType
    if (this.task !== undefined) this.edit = true;
    if (data.focus !== undefined) {
       this.planFocus = data.focus;
    }
  }

  ngOnInit(): void {
    if (this.task !== undefined) {
      this.description = this.task.description
      // leave for now.... allow new new notes if (this.task.note !== undefined && this.task.note.length > 0)
      if (this.task.code !== undefined && this.task.code.coding !== undefined && this.task.code.coding.length>0) {
        const code = this.task.code.coding[0]
        this.taskCode = code
      }
      if (this.task.reasonCode !== undefined && this.task.reasonCode.coding !== undefined) {
        this.reasonCode = this.task.reasonCode.coding[0]
      }
    }

    this.fhirService.getConf('/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/task-status').subscribe(
      resource  => {
        this.statuses = this.dlgSrv.getContainsExpansion(resource);
        if (this.task !== undefined) {
          this.statuses.forEach(status => {
            if (status.code === this.task?.status) {
           //   console.log('Match')
              // @ts-ignore
              this.taskStatus = status.code.toString()
            } else {
             // console.log(status.code + ' - ' + this.task?.status)
            }
          })
        }
      }
    );
    this.fhirService.getConf('/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/task-intent').subscribe(
      resource  => {
        this.intents = this.dlgSrv.getContainsExpansion(resource);
        if (this.task !== undefined) {
          this.intents.forEach(intent => {
            if (intent.code === this.task?.intent) {
            //  console.log('Match')
              // @ts-ignore
              this.careIntent = intent.code.toString()
            } else {
              // console.log(status.code + ' - ' + this.task?.status)
            }
          })
        }
      }
    );
    this.fhirService.getConf('/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/request-priority').subscribe(
      resource  => {
        this.priorities = this.dlgSrv.getContainsExpansion(resource);
        if (this.task !== undefined) {
          this.priorities.forEach(priority => {
            if (priority.code === this.task?.intent) {
              console.log('Match')
              // @ts-ignore
              this.taskPriority = priority.code.toString()
            } else {
              // console.log(status.code + ' - ' + this.task?.status)
            }
          })
        }
      }
    );
    this.fhirService.getConf('/ValueSet/$expand?url=https://fhir.nhs.uk/ValueSet/NHSDigital-task-code').subscribe(
        resource  => {
          this.code = this.dlgSrv.getContainsExpansion(resource);
        }
    );
    this.fhirService.get('/MedicationRequest?patient=' + this.patientId).subscribe(bundle => {
        if (bundle.entry !== undefined) {
          for (const entry of bundle.entry) {
            if (entry.resource !== undefined && entry.resource.resourceType === 'MedicationRequest') { this.foci.push(entry.resource); }
          }
        }
      }
    );
    if (this.taskType === 2 || this.taskType === 0 ) {
      this.fhirService.get('/ServiceRequest?status=active,on-hold,draft&patient=' + this.patientId).subscribe(bundle => {
            if (bundle.entry !== undefined) {
              for (const entry of bundle.entry) {
                if (entry.resource !== undefined && entry.resource.resourceType === 'ServiceRequest') {
                  this.foci.push(entry.resource);
                }
              }
            }
          }
      );
    }
    if (this.taskType === 3 || this.taskType === 0) {
      this.fhirService.getTIE('/ActivityDefinition').subscribe(bundle => {
            if (bundle.entry !== undefined) {
              for (const entry of bundle.entry) {
                if (entry.resource !== undefined && entry.resource.resourceType === 'ActivityDefinition') {
                  this.foci.push(entry.resource);
                }
              }
            }
          }
      );
    }
    if (this.taskType === 1) {
      this.fhirService.getTIE('/Questionnaire').subscribe(bundle => {
            if (bundle.entry !== undefined) {
              for (const entry of bundle.entry) {
                if (entry.resource !== undefined && entry.resource.resourceType === 'Questionnaire') {
                  this.foci.push(entry.resource);
                }
              }
            }
          }
      );
    }
    this.fhirService.getTIE('/CareTeam?patient=' + this.patientId).subscribe(bundle => {
        if (bundle.entry !== undefined) {
          for (const entry of bundle.entry) {
            if (entry.resource !== undefined && entry.resource.resourceType === 'CareTeam') { this.careTeams.push(entry.resource as CareTeam); }
          }
        }
      }
    );

    this.code$ = this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => {
          return this.fhirService.searchConcepts(term, 'https://fhir.nhs.uk/ValueSet/NHSDigital-action-code');
        }
      ),
      map(resource    => {
          return this.dlgSrv.getContainsExpansion(resource);
      }

    ), catchError(this.dlgSrv.handleError('getPatients', [])));

    this.reason$ = this.searchReasons.pipe(
      // wait 300ms after each keystroke before considering the term
      debounceTime(300),
      // ignore new term if same as previous term
      distinctUntilChanged(),

      // switch to new search observable each time the term changes
      switchMap((term: string) => {
          console.log(term);
          return this.fhirService.searchConcepts(term, 'https://fhir.hl7.org.uk/ValueSet/UKCore-ServiceRequestReasonCode');
        }
      ),
      map(resource    => {
        return this.dlgSrv.getContainsExpansion(resource);
        }

    ), catchError(this.dlgSrv.handleError('getReasons', [])));


    this.practitioner$ = this.searchTermsDoc.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => {
          console.log(term);
          return this.fhirService.getDirectory('/Practitioner?name=' + term);
        }
      ),
      map(resource    => {
          return this.dlgSrv.getContainsPractitoner(resource);
        }

    ), catchError(this.dlgSrv.handleError('getPractitioner', [])));

    this.organisation$ = this.searchTermsOrg.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => {
          return this.fhirService.getDirectory('/Organization?name=' + term);
        }
      ),
      map(resource    => {
          return this.dlgSrv.getContainsOrganisation(resource);
        }

    ), catchError(this.dlgSrv.handleError('getPractitioner', [])));
  }

  search(term: string): void {
    if (term.length > 3) {
      this.searchTerms.next(term);
    }
  }
  searchDoc(term: string): void {
    if (term.length > 3) {
      this.searchTermsDoc.next(term);
    }
  }
  searchOrg(term: string): void {
    if (term.length > 3) {
      this.searchTermsOrg.next(term);
    }
  }

  searchReason(term: string): void {
    if (term.length > 3) {
      this.searchReasons.next(term);
    }
  }


  selectedTask(event: MatAutocompleteSelectedEvent): void {
    this.taskCode = {
      system: event.option.value.system,
      code: event.option.value.code,
      display: event.option.value.display,
    };
    console.log(this.taskCode);
    this.checkSubmit();
  }
  selectedTaskC(event: MatSelectChange) {
    this.taskCode = event.value
    this.checkSubmit()
  }

  selectedReason(event: MatAutocompleteSelectedEvent): void {
    this.reasonCode = {
      system: event.option.value.system,
      code: event.option.value.code,
      display: event.option.value.display,
    };
    this.checkSubmit();
  }



  selectedOrg(event: MatAutocompleteSelectedEvent): void {
    console.log(event.option.value);
    this.organisation = event.option.value;
    this.checkSubmit();
  }

  selectedDr(event: MatAutocompleteSelectedEvent): void {
    console.log(event.option.value);
    this.practitioner = event.option.value;
    this.checkSubmit();
  }

  selectedStatus(): void {
    console.log(this.taskStatus);
   // this.taskStatus = status.value;
    this.checkSubmit();
  }

  checkSubmit(): void {
    this.disabled = true;
    console.log(this.patientTask)
    if ((this.taskCode !== undefined || this.hasCode()) &&
      (this.hasOwner() || this.patientTask || this.practitioner !== undefined || this.organisation !== undefined || (this.careTeams !== undefined && this.careTeams.length > 0)) &&
      this.taskStatus !== undefined) {
      this.disabled = false;
    }
  }
  hasOwner(): boolean {

    if (this.task !== undefined && this.task.owner !== null) {
    //  console.log('Has Owner')
      return true
    }
    return false;
  }
  hasReason(): boolean {
    if (this.task !== undefined && this.task.reasonCode !== null) {
      //  console.log('Has Owner')
      return true
    }
    return false;
  }
  hasCode(): boolean {
    if (this.task !== undefined && this.task.code !== null) {
    //  console.log('Has Code')
      return true
    }
    return false;
  }

  submit(): void {
    const task: Task = {
      intent: 'order',
      identifier: [{
        system: 'https://tools.ietf.org/html/rfc4122',
        value: uuid.v4()
      }],
      resourceType: 'Task',
      status: 'requested',
      note: []
    };
    if (this.task !== undefined && this.task.identifier !== undefined && this.task.identifier?.length>0) {
      task.identifier = this.task.identifier
    }
    if (this.hasCode()) {
      // Add in the original code if defined
      // @ts-ignore
      task.code = this.task.code
    }
    if (this.taskCode !== undefined) {
      task.code = {
        coding: [
          this.taskCode
        ]
      }
    }
    // Put the old owner back in
    if (this.hasOwner()) {
      // @ts-ignore
      task.owner = this.task.owner
    }
    if (this.organisation !== undefined) {
      task.owner = {
        reference: 'Organization/' + this.organisation.id,
        display : this.organisation.name
      };
      if (this.organisation.identifier !== undefined && this.organisation.identifier.length > 0) {
        task.owner.identifier = this.organisation.identifier[0];
      }
    }
    if (this.practitioner !== undefined) {
      task.owner = {
        reference: 'Practitioner/' + this.practitioner.id
      };
      if (this.practitioner.identifier !== undefined && this.practitioner.identifier.length > 0) {
        task.owner.identifier = this.practitioner.identifier[0];
      }
      if (this.practitioner.name !== undefined && this.practitioner.name.length > 0) {
        task.owner.display = this.practitioner.name[0].prefix + ' ' +this.practitioner.name[0].family
      }
    }
    if (this.planTeams !== undefined) {
      task.owner = {
        reference: 'CareTeam/' + this.planTeams.id,
        display: this.planTeams.name
      };
    }

    if (this.edit && this.hasReason()) {
      task.reasonCode = this.task?.reasonCode
    }
    if (this.reasonCode !== undefined) {
      task.reasonCode = {
        coding: [
          this.reasonCode
        ]
      };
    }

    if (this.taskPriority !== undefined) {
      switch (this.taskPriority) {
        case 'routine': {
          task.priority = 'routine';
          break;
        }
        case 'urgent': {
          task.priority = 'urgent';
          break;
        }
        case 'asap': {
          task.priority = 'asap';
          break;
        }
        case 'stat': {
          task.priority = 'stat';
          break;
        }
      }
    }

      switch (this.careIntent) {
        case 'proposal': {
          task.intent = 'proposal';
          break;
        }
        case 'plan': {
          task.intent = 'plan';
          break;
        }
        case 'order': {
          task.intent = 'order';
          break;
        }
        case 'option': {
          task.intent = 'option';
          break;
        }
        case 'instance-order': {
          task.intent = 'instance-order';
          break;
        }
        case 'filler-order': {
          task.intent = 'filler-order';
          break;
        }
        case 'reflex-order': {
          task.intent = 'reflex-order';
          break;
        }
        case 'original-order': {
          task.intent = 'original-order';
          break;
        }
        case 'unknown': {
          task.intent = 'unknown';
          break;
        }
      }



      switch (this.taskStatus) {
        case 'requested' : {
          task.status = 'requested';
          break;
        }
        case 'completed' : {
          task.status = 'completed';
          break;
        }
        case 'accepted' : {
          task.status = 'accepted';
          break;
        }
        case 'on-hold' : {
          task.status = 'on-hold';
          break;
        }
        case 'failed' : {
          task.status = 'failed';
          break;
        }
        case 'ready' : {
          task.status = 'ready';
          break;
        }
        case 'in-progress' : {
          task.status = 'in-progress';
          break;
        }
        case 'entered-in-error' : {
          task.status = 'entered-in-error';
          break;
        }
        case 'draft' : {
          task.status = 'draft';
          break;
        }
        case 'rejected' : {
          task.status = 'rejected';
          break;
        }
        case 'cancelled' : {
          task.status = 'cancelled';
          break;
        }
      }

   if (this.task !== undefined && this.task.for !== undefined ) {
      // @ts-ignore
      task.for = this.task.for
    } else {
     task.for = {
       reference: 'Patient/' + this.patientId,
       identifier: {
         system: 'https://fhir.nhs.uk/Id/nhs-number',
         value: this.nhsNumber
       }
     };
   }
   if (this.patientTask) {
     task.owner = {
       reference: 'Patient/' + this.patientId,
       identifier: {
         system: 'https://fhir.nhs.uk/Id/nhs-number',
         value: this.nhsNumber
       }
     };
   }

    if (this.task !== undefined && this.task.note !== undefined) {
      task.note = this.task.note
    }
    if (this.notes !== undefined) {
     // console.log('Adding new note '+ this.notes.trim())
      task.note?.push(
        {
          time: new Date().toISOString(),
          text: this.notes.trim()
        });
    } else {
      if (this.task !== undefined) {
      //  console.log('Adding updated note')
        task.note?.push(
            {
              time: new Date().toISOString(),
              text: 'Task updated ('+this.taskStatus+')'
            });
      }
    }
   // console.log(task.note)
    if (this.edit && this.task !== undefined) task.description = this.task.description;
    if (this.description != undefined && this.description.trim() !== '') {
      task.description = this.description.trim()
    }

    if (this.planFocus !== undefined) {
      task.focus = {
        reference: this.planFocus.resourceType + '/' + this.planFocus.id,
        display: this.dlgSrv.getResourceDisplay(this.planFocus),
        type: this.planFocus.resourceType
      };
    } else {
      // edit
      if (this.task !== undefined && this.task.focus !== undefined) {
        task.focus = this.task.focus
      }
    }

    task.lastModified = new Date().toISOString();

    if (this.task !== undefined && this.task.authoredOn !== undefined) {
      task.authoredOn = this.task.authoredOn
    } else {
      task.authoredOn = new Date().toISOString();
    }

    if (this.task === undefined || this.task.identifier === undefined || this.task.identifier.length ===0) {
      this.fhirService.postTIE('/Task', task).subscribe(result => {
        this.diaglogRef.close(result);
       },  error => {
        console.log(JSON.stringify(error))
        this._dialogService.openAlert({
          title: 'Alert',
          disableClose: true,
          message:
              this.fhirService.getErrorMessage(error),
        });
      });
    } else {
      this.fhirService.putTIE('/Task?identifier='+encodeURI(this.task.identifier[0].system + '|' + this.task.identifier[0].value) , task).subscribe(result => {

        this.diaglogRef.close(result);

      }, error => {
        console.log(JSON.stringify(error))
        this._dialogService.openAlert({
          title: 'Alert',
          disableClose: true,
          message:
              this.fhirService.getErrorMessage(error),
        });
      });
    }
  }



}
