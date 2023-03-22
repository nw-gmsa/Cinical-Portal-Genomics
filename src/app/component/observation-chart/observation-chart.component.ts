import {Component, Input, OnInit} from '@angular/core';
import {TdDigitsPipe} from '@covalent/core/common';
import {Bundle, Observation} from 'fhir/r4';
import {FhirService} from '../../services/fhir.service';

@Component({
  selector: 'app-observation-chart',
  templateUrl: './observation-chart.component.html',
  styleUrls: ['./observation-chart.component.scss']
})
export class ObservationChartComponent implements OnInit {

  @Input()
  patentId: string ='';

  @Input()
  observationCode: string ='';

  @Input()
  title = 'Observation Chart';

  @Input()
  showRange = false;

  showXAxis = true;
  showYAxis = true;
  gradient = true;
  showLegend = false;
  showXAxisLabel = true;
  xAxisLabel = '';
  showYAxisLabel = true;
  timeline = false;
  yAxisLabel: string = 'Value';
  animations = false;

  colorScheme: any = {
    domain: ['#1565C0', '#03A9F4', '#FFA726', '#FFCC80'],
  };

  // line, area
  autoScale = true;
  searchRange = 1;

  multi: any[] = [];

  constructor(public fhirService: FhirService) {
  }

  ngOnInit(): void {
    this.refreshResult();
  }

  refreshResult(): void {
    const end = this.fhirService.getToDate();
    const from = new Date();
    switch (this.searchRange) {
      case 12: {
        from.setDate(end.getDate() - 365 );
        break;
      }
      case 6: {
        from.setDate(end.getDate() - 180 );
        break;
      }
      default: {
        from.setDate(end.getDate() - 28 );
      }
    }


    this.fhirService.get('/Observation?patient=' + this.patentId + '&code=' + this.observationCode
        + '&date=gt' + from.toISOString().split('T')[0]
        + '&_count=400').subscribe(
        bundle => {
          //   console.log(bundle);
          const observations: Bundle = bundle as Bundle;
          this.yAxisLabel = 'Value';
          const multiNew: any[] = [];

          if (observations.entry !== undefined && observations.entry.length > 0) {

            // Attempt to set up the series. This is not that robust

            const firstObservation = observations.entry[0].resource as Observation;
            if (firstObservation.valueQuantity !== undefined) {
              // @ts-ignore
              this.yAxisLabel = firstObservation.valueQuantity.unit;
              // @ts-ignore
              multiNew.push({name: firstObservation.code.coding[0].display, series: [],
              });
            }
            if (firstObservation.component !== undefined) {
              // @ts-ignore
              this.yAxisLabel = firstObservation.component[0].valueQuantity.unit;
              for (const component of firstObservation.component) {
                // @ts-ignore
                multiNew.push({name: component.code.coding[0].display, series: []});
              }
            }
            if (this.observationCode === '66440-9') {
              this.yAxisLabel = 'Avg Hear Rate';
              multiNew.push(
                  {
                    name: 'Sleep Avg Hear Rate',
                    series: [],
                  }
              );
            }

            // console.log(multi);

            for (const entry of observations.entry) {
              if (entry.resource !== undefined && entry.resource.resourceType === 'Observation') {
                const observation: Observation = entry.resource as Observation;
                if (observation.valueQuantity !== undefined && observation.valueQuantity.value !== undefined) {
                  if (observation.effectiveDateTime !== undefined) {
                    //    console.log(observation.effectiveDateTime);
                    multiNew[this.getSeriesNum(observation)].series.push({
                      value: observation.valueQuantity.value,
                      name: new Date(observation.effectiveDateTime)
                    });
                  }
                  if (observation.effectivePeriod !== undefined) {
                    //    .log(observation.effectivePeriod.start);
                    // @ts-ignore
                    multiNew[this.getSeriesNum(observation)].series.push({value: observation.valueQuantity.value, name: new Date(observation.effectivePeriod.start)
                    });
                  }
                }
                if (observation.component !== undefined && observation.component.length > 0) {
                  for (const component of observation.component) {

                    let seriesId;
                    let cont = 0;
                    for (; cont < multiNew.length; cont++) {
                      // console.log('series name = ' + multi[cont].name);
                      //  console.log('component name ' + component.code.coding[0].display);
                      // @ts-ignore
                      if (multiNew[cont].name === component.code.coding[0].display) {
                        seriesId = cont;
                      }
                    }
                    if (seriesId !== undefined) {
                      if (observation.effectiveDateTime !== undefined ) {
                        //     console.log(observation.effectiveDateTime);
                        const vl = component.valueQuantity?.value;
                        if (vl !== undefined) {
                          multiNew[seriesId].series.push({
                            value: vl,
                            name: new Date(observation.effectiveDateTime)
                          });
                        }
                      }
                      if (observation.effectivePeriod !== undefined) {

                        // @ts-ignore
                        multiNew[seriesId].series.push({value: component.valueQuantity.value, name: new Date(observation.effectivePeriod.start)
                        });
                      }
                    }
                  }
                }
              }


            }
            this.multi = multiNew;
            //    console.log(this.multi);

          }
        }
    );

  }

  getSeriesNum(observation: Observation): number {
    if (observation.code !== undefined && observation.code.coding !== undefined && observation.code.coding.length > 0) {
      if (observation.effectiveDateTime !== undefined) {
        if (observation.code.coding[0].code === '66440-9') {
          if (observation.extension !== undefined) {
            for(const extension of observation.extension) {
              if (extension.url === 'http://hl7.org/fhir/us/vitals/StructureDefinition/SleepStatusExt') {
                if (extension.valueCodeableConcept !== undefined && extension.valueCodeableConcept.coding !== undefined &&
                    extension.valueCodeableConcept.coding[0].code === '248220008') {
                  return 1;
                }
              }
            }
          }
        }
      }
    }
    return 0;
  }
  axisDigits(val: any): any {
    return new TdDigitsPipe().transform(val);
  }

  change(num: number): void {
    this.searchRange = num;
    this.refreshResult();
  }
}
