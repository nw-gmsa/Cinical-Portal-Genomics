import {Component, Input, OnInit} from '@angular/core';
import {GoalTarget} from "fhir/r4";
import {MatTableDataSource} from "@angular/material/table";
import {FhirService} from "../../../../services/fhir.service";

@Component({
  selector: 'app-goal-target',
  templateUrl: './goal-target.component.html',
  styleUrls: ['./goal-target.component.scss']
})
export class GoalTargetComponent implements OnInit {
  @Input()
  goalTarget: GoalTarget[] = [];
  // @ts-ignore
  dataSource : MatTableDataSource<GoalTarget>;
  displayedColumns = ['measure','value'];
  constructor(
      public fhirService: FhirService
  ) { }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<GoalTarget>(this.goalTarget);
  }

}
