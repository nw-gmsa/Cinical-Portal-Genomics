import { Component, OnInit } from '@angular/core';
import {TestingService} from '../services/testing.service';
import {ActivatedRoute, Router} from '@angular/router';
import {IMenuItem, IMenuTrigger, ITdDynamicMenuLinkClickEvent} from "@covalent/core/dynamic-menu";
import {MatSnackBar} from "@angular/material/snack-bar";
import {EprService} from "../services/epr.service";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  selected = 'https://raw.githubusercontent.com/NHSDigital/IOPS-FHIR-Testing/main/oas/fhirrest.json';
  public patientId : string | undefined;
  triggerPatient: IMenuTrigger = {
    id: 'triggerPatient',
    icon: 'account_circle',
    text: 'Patient',
  };

  private themeWrapper = document.querySelector('body');

  triggerApps: IMenuTrigger = {
    id: 'triggerApps',
    icon: 'apps',
    text: 'Apps',
  };
  triggerCare: IMenuTrigger = {
    id: 'triggerbutton',
    icon: 'list',
    text: 'Care Records',
  };

  triggerAccount: IMenuTrigger = {
    id: 'triggerutility',
    icon: 'manage_accounts',
    text: 'Account',
  };

  itemsAccount: IMenuItem[] = [
    {
      // Grouping label
      id: 'acc_menu',
      text: 'Simulated Role',
    },
    {
      // Submenu trigger
      id: 'roles',
      text: 'Role Picker',
      icon: 'perm_identity',
      action: 'roles',
      newTab: false,
    },
      {
      // Grouping label
      id: 'devices',
      text: 'Personal Health Device',
    },
    {
      // Submenu trigger
      id: 'phrapps',
      text: 'Connected PHR Applications',
      icon: 'app_shortcut',
      action: 'device',
      newTab: false,
    }
    ];

  itemsPatient: IMenuItem[] = [
    {
      // Grouping label
      id: 'platform',
      text: 'Patient',
    },
    {
      // Submenu trigger
      id: 'patientfind',
      text: 'Patient Find',
      icon: 'find_in_page',
      action: 'search'
    }
    ];

  itemsApps: IMenuItem[] = [
    {
      // Grouping label
      id: 'platform',
      text: 'Structure Data Capture',
    },
    {
      id: 'quickstartlink',
      text: 'NLM Form Builder',
      link: 'https://lhcformbuilder.nlm.nih.gov/',
      newTab: true
    }
  ];
  itemsCare: IMenuItem[] = [
    {
      // Grouping label
      id: 'patientcare',
      text: 'Patient Care Records',
    },
    {
      id: 'summary',
      text: 'Summary Record',
      icon: 'view_cozy',
      action: 'summary'
    },
    {
      id: 'docs',
      text: 'Document',
      icon: 'view_timeline',
      action: 'documents'
    },
    {
      id: 'forms',
      text: 'Forms',
      icon: 'dataset',
      action: 'forms'
    },
    {
      // Grouping label
      id: 'patientobservations',
      text: 'Observations',
    },
    {
      id: 'obs',
      text: 'All Observations',
      icon: 'view_kanban',
      action: 'observations',
    },
    {
      id: 'activity',
      text: 'Physical Activity',
      icon: 'directions_walk',
      action: 'activity',
    },
    {
      id: 'vitals',
      text: 'Vital Signs',
      icon: 'local_hospital',
      action: 'vitals',
    },
    {
      // Grouping label
      id: 'coordination',
      text: 'Patient Care Coordination',
    },
    {
      id: 'workflow',
      text: 'Referrals and Interventions',
      icon: 'assignment',
      action: 'workflow'
    },
    {
      id: 'coordination',
      text: 'Plans and Goals',
      icon: 'map',
      action: 'coordination'
    },
    {
      id: 'communication',
      text: 'Communication',
      icon: 'question_answer',
      action: 'communication'
    },
  ];


  constructor( private testingService: TestingService,
               private route: ActivatedRoute,
               private epr: EprService,
               private router: Router,private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.epr.patientChangeEvent.subscribe(patient => {
      if (patient!==undefined) {
        this.patientId = patient.id;
        console.log('Patient record active')
      } else {
        this.patientId = undefined;
      }
    })
  }
  goToLink(url: string): void {
    window.open(url, '_blank');
  }

  reportClick(event: ITdDynamicMenuLinkClickEvent): void {

    if (event.action !== undefined) {

    if (this.patientId !== undefined) {
      switch (event.action) {
        case 'observations': {
          this.router.navigateByUrl('/patient/'+this.patientId+'/observations');
          break;
        }
        case 'summary': {
          this.router.navigateByUrl('/patient/'+this.patientId+'/summary');
          break;
        }
        case 'documents': {
          this.router.navigateByUrl('/patient/'+this.patientId+'/documents');
          break;
        }
        case 'forms': {
          this.router.navigateByUrl('/patient/'+this.patientId+'/forms');
          break;
        }
        case 'workflow': {
          this.router.navigateByUrl('/patient/'+this.patientId+'/workflow');
          break;
        }
        case 'communication': {
          this.router.navigateByUrl('/patient/'+this.patientId+'/communication');
          break;
        }
        case 'coordination': {
          this.router.navigateByUrl('/patient/'+this.patientId+'/coordination');
          break;
        }
        case 'activity': {
          this.router.navigateByUrl('/patient/'+this.patientId+'/activity');
          break;
        }
        case 'vitals': {
          this.router.navigateByUrl('/patient/'+this.patientId+'/vitals');
          break;
        }
        case 'device': {
          this.router.navigateByUrl('/device');
          break;
        }
        case 'roles': {
          // @ts-ignore
          this.themeWrapper.style.setProperty('$primary', define-palette(mat.$red-palette, 700));
          break;
        }
      }
    }
    // These don't require an active patient
    switch (event.action) {
        case 'search': {
          this.router.navigateByUrl('/search');
          break;
        }
      }
    }

   /* this._snackBar.open(
        `Item "${event.text}:${event.action}" clicked`,
        undefined,
        { duration: 2000 }
    );

    */
  }

/*
    runTestPackage() {
      this.router.navigateByUrl('/runtest');
    }

 */
}
