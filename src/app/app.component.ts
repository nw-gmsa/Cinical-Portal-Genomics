import {Component, OnInit} from '@angular/core';
import {NavigationEnd, NavigationError, NavigationStart, Router} from "@angular/router";

declare var $: any;


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit  {
  title = 'FHIR-R4-OAS';
  constructor(private router: Router) {

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        // Show loading indicator
       // console.log(event);
      }

      if (event instanceof NavigationEnd) {
        // Hide loading indicator
      }

      if (event instanceof NavigationError) {
        // Hide loading indicator

        // Present error to user
        console.log(event.error);
      }
    });

  }

  ngOnInit(): void {
    // @ts-ignore
    LForms = window["LForms"]
  }
}
