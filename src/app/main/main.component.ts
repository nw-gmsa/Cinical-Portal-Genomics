import { Component, OnInit } from '@angular/core';
import {MatSelectChange} from '@angular/material/select';
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
  triggerCare: IMenuTrigger = {
    id: 'triggerbutton',
    icon: 'list',
    text: 'Care Records',
  };

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
      icon: 'flash_on',
      link: '/search',
      newTab: false,
    }
    ];
  itemsCare: IMenuItem[] = [
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
    },
    {
      // Grouping label
      id: 'patientcare',
      text: 'Patient Care Records',
    },
    {
      id: 'summary',
      text: 'Summary',
      icon: 'view_cozy',
      action: 'summary'
    },
    {
      id: 'obs',
      text: 'Observations',
      icon: 'view_kanban',
      action: 'observations'
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
      id: 'coordination',
      text: 'Patient Care Coordination',
    },
    {
      id: 'workflow',
      text: 'Requests and Tasks',
      icon: 'assignment',
      action: 'workflow'
    },
    {
      id: 'coordination',
      text: 'Care Planning',
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
        console.log('Got Patient')
      } else {
        this.patientId = undefined;
      }
    })
  }
  goToLink(url: string): void {
    window.open(url, '_blank');
  }

  reportClick(event: ITdDynamicMenuLinkClickEvent): void {
    console.log(event.text)
    console.log(event.action)
    if (event.action !== undefined && this.patientId !== undefined) {
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
