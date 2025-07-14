import {Component, Input, OnInit} from '@angular/core';
import { Observation} from "fhir/r4";
import {FhirService} from "../../../../services/fhir.service";
import {TdLoadingService} from "@covalent/core/loading";

@Component({
  selector: 'app-observation-expand',
  templateUrl: './observation-expand.component.html',
  styleUrl: './observation-expand.component.scss'
})
export class ObservationExpandComponent implements OnInit {
  @Input() observation: Observation | undefined

  observations: Observation[] = []

  constructor( public fhirService: FhirService,
               private _loadingService: TdLoadingService) {
  }

  ngOnInit() {

    if (this.observation?.id !== undefined) {
      var obs :Observation[] = [];
      if (this.observation?.hasMember !== undefined) {
        for (const result of this.observation?.hasMember) {
          if (result.reference !== undefined) {
            this.fhirService.getResource('/'+result.reference)
                .subscribe(resource => {
                      if (resource.resourceType === 'Observation') {
                        obs.push(resource as Observation);
                        console.log(resource)
                      }
                    if (this.observation?.hasMember?.length == obs.length) {
                        this.observations = obs;
                    }
                    },() => {}, () =>{
                      this._loadingService.resolve('overlayStarSyntax');
                    }
                )
          }
        }
      }
    }
  }
}
