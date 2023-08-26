import {Component, Input, OnInit} from '@angular/core';
import {GoalTarget} from "fhir/r4";
import {FhirService} from "../../../services/fhir.service";
import {Router} from "@angular/router";
import {MatTableDataSource} from "@angular/material/table";

@Component({
  selector: 'app-goal-target',
  templateUrl: './goal-target.component.html',
  styleUrls: ['./goal-target.component.scss']
})
export class GoalTargetComponent implements OnInit {
  @Input()
  goalTarget: GoalTarget[] = [];

  @Input()
  patientId: string | undefined;
  // @ts-ignore
  dataSource : MatTableDataSource<GoalTarget>;
  displayedColumns = ['measure','value'];
  constructor(
      private router: Router,
      public fhirService: FhirService
  ) { }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<GoalTarget>(this.goalTarget);
  }

  viewMeasure(goalTarget: GoalTarget) {
    console.log(goalTarget)
    console.log(this.patientId)
    if (this.patientId!==undefined && goalTarget.measure !== undefined && goalTarget.measure.coding !== undefined) {
      this.router.navigate(['/patient', this.patientId, 'observations', goalTarget.measure.coding[0].code])
    }
  }
}
