import {Component, Input, OnInit} from '@angular/core';
import {ServiceRequest} from "fhir/r4";

@Component({
  selector: 'app-referral-request-tasks',
  templateUrl: './referral-request-tasks.component.html',
  styleUrls: ['./referral-request-tasks.component.scss']
})
export class ReferralRequestTasksComponent implements OnInit {

  @Input()
  serviceRequest: ServiceRequest | undefined

  constructor() { }

  ngOnInit(): void {
  }

}
