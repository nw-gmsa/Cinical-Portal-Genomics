import {Component,  OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {MatChip} from '@angular/material/chips';
import {Bundle, FhirResource, Patient} from 'fhir/r4';
import {FhirService} from '../../services/fhir.service';
import {EprService} from '../../services/epr.service';

@Component({
  selector: 'app-patient-details',
  templateUrl: './patient-main.component.html',
  styleUrls: ['./patient-main.component.scss']
})
export class PatientMainComponent implements OnInit {

    patient: Patient | undefined;

    sidenavopen = false;

    lhcrcolor = 'info';
    acutecolor = 'info';
    gpcolor = 'info';
    nrlscolor = 'info';

    bscolour = 'accent';
    bocolour = 'info';
    becolour = 'info';
    bdcolour = 'info';
    bpcolour = 'info';
    btcolour = 'info';
    bicolour = 'info';
    bmcolour = 'info';
    brcolour = 'info';
    aacolour = 'info';

    cards: any[] = [];

     @ViewChild('gpchip', {static: false}) gpchip: MatChip | undefined;




  constructor(private router: Router,
              private fhirSrv: FhirService,
              private route: ActivatedRoute,
              private eprService: EprService) { }

  ngOnInit(): void {

      const patientid = this.route.snapshot.paramMap.get('patientid');

      this.fhirSrv.getResource('/Patient/' + patientid ).subscribe(bundle => {
              if (bundle.resourceType == 'Patient') {
                    this.patient = <Patient> bundle;
                    this.eprService.setPatient(this.patient)
              }
          }
          , () => {
        }

      );


      /*
      if (this.oauth2.isAuthenticated()) {
        this.authService.getClients().subscribe( response => {
          // console.log(clients);
          const clients: any[] = response as any[];
          for (const client of clients) {

            if (client.scope.includes('launch')) {
              let found = false;
              for (const search of this.cards) {
                if (search.clientId === client.clientId) {
                  found = true;
                }
              }
              if (!found) {
                console.log(client);
                const newclient = {
                  id: client.id,
                  name: client.clientName,
                  image: client.logoUri,
                  url: '',
                  notes: client.clientDescription,
                  source: '',
                  clientId: client.clientId
                };
                this.addClient(newclient);
              }
            }
          }

        });
      }

       */
  }

  addClient(client: any): void {
    this.fhirSrv.get('/Endpoint?identifier=' + client.clientId).subscribe( result => {
        const bundle: Bundle = result;
        if (bundle.entry !== undefined) {
          for (const entry of bundle.entry) {
            const resource: FhirResource | undefined = entry.resource;
            if (resource !== undefined && resource.resourceType === 'Endpoint') {
              client.endpoint = resource;
              if (client.endpoint !== undefined && client.endpoint.address !== undefined) {
                this.cards.push(client);
              }
            }
          }
        }
      },
      () => {

      },
      () => {

      });

  }


  onClick(event: any, btn: any): void {
    //  console.log(event);
        this.bscolour = 'info';
        this.bocolour = 'info';
        this.becolour = 'info';
        this.bdcolour = 'info';
        this.bpcolour = 'info';
        this.btcolour = 'info';
        this.bicolour = 'info';
        this.bmcolour = 'info';
      this.aacolour = 'info';
      this.brcolour = 'info';
      switch (btn) {
          case 'aa':
              this.router.navigate(['atmist'], {relativeTo: this.route });
              this.aacolour = 'accent';
              break;
          case 'bs':
              this.router.navigate(['summary'], {relativeTo: this.route });
              this.bscolour = 'accent';
              break;
          case 'bo':
              this.router.navigate(['observation'], {relativeTo: this.route });
              this.bocolour = 'accent';
              break;
          case 'be':
              this.router.navigate(['encounter'], {relativeTo: this.route });
              this.becolour = 'accent';
              break;
          case 'bd':
              this.router.navigate(['document'], {relativeTo: this.route });
              this.bdcolour = 'accent';
              break;
          case 'bp':
              this.router.navigate(['procedure'], {relativeTo: this.route });
              this.bpcolour = 'accent';
              break;
          case 'bi':
          this.router.navigate(['immunisation'], {relativeTo: this.route });
          this.bicolour = 'accent';
          break;
          case 'bm':
              this.router.navigate(['medication'], {relativeTo: this.route });
              this.bmcolour = 'accent';
              break;
          case 'br':
              this.router.navigate(['referral'], {relativeTo: this.route });
              this.brcolour = 'accent';
              break;
      }
    }

    getFirstName(patient: Patient): string {
        if (patient === undefined) {
          return '';
        }
        if (patient.name === undefined || patient.name.length === 0) {
            return '';
        }
        // Move to address
        let name = '';
        if (patient.name[0].given !== undefined && patient.name[0].given.length > 0) {
          name += ', ' + patient.name[0].given[0];
        }

        if (patient.name[0].prefix !== undefined && patient.name[0].prefix.length > 0) {
          name += ' (' + patient.name[0].prefix[0] + ')' ;
        }
        return name;

    }

    getNHSIdentifier(patient: Patient): string {
        if (patient === undefined) {
          return '';
        }
        if (patient.identifier === undefined || patient.identifier.length === 0) {
          return '';
        }
        // Move to address
        let NHSNumber = '';
        for (let f = 0 ; f < patient.identifier.length; f++) {
            const identifier = patient.identifier[f];
            if (identifier !== undefined &&
                identifier.system !== undefined &&
                identifier.value !== undefined) {
                if (identifier.system.includes('nhs-number') ) {
                    NHSNumber = identifier.value.substring(0, 3) + ' ' + identifier.value.substring(3, 6)
                        + ' ' + identifier.value.substring(6);
                }
            }
        }
        return NHSNumber;

    }

    getLastName(patient: Patient): string {
        if (patient === undefined) {
          return '';
        }
        if (patient.name === undefined || patient.name.length === 0) {
          return '';
        }

        let name = '';
        if (patient.name[0].family !== undefined) {
          name += patient.name[0].family.toUpperCase();
        }
        return name;

    }
/*
  smartApp(card) {

    let launch: string;

    console.log('App Lauch ' + card.url);

    if (card.url !== '') {

      this.authService.launchSMART(card.clientId, '4ae23017813e417d937e3ba21974581', this.eprService.patient.id).subscribe(response => {
          launch = response.launch_id;
          console.log('Returned Launch = ' + launch);
        },
        (err) => {
          console.log(err);
        },
        () => {
          window.open(card.url + '?iss=' + this.fhirSrv.getBaseUrl() + '&launch=' + launch, '_blank');
        }
      );
    } else {
      this.fhirSrv.get('/Endpoint?identifier=' + card.clientId).subscribe( result => {
        console.log(result);
        const bundle: Bundle = result;
        if (bundle.entry !== undefined) {
          for (const entry of bundle.entry) {
            const resource: Resource = entry.resource;
            if (resource.resourceType === 'Endpoint') {
              const endpoint: Endpoint = <Endpoint> resource;
              this.authService.launchSMART(card.clientId, '4ae23017813e417d937e3ba21974581', this.eprService.patient.id)
                .subscribe(response => {
                  launch = response.launch_id;
                  console.log('Returned Launch = ' + launch);
                },
                (err) => {
                  console.log(err);
                },
                () => {
                  window.open(endpoint.address + '?iss=' + this.fhirSrv.getBaseUrl() + '&launch=' + launch, '_blank');
                }
              );
            }
          }
        }
      });
    }

  }
  */

  onToggle(event: any): void {
      console.log(this.sidenavopen);

      this.sidenavopen = !this.sidenavopen;
  }

}
