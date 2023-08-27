import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {StravaService} from "../strava.service";

@Component({
  selector: 'app-exchange-token',
  templateUrl: './exchange-token.component.html',
  styleUrls: ['./exchange-token.component.scss']
})
export class ExchangeTokenComponent implements OnInit {

  constructor( private route: ActivatedRoute,
               private strava: StravaService,
               private router: Router
  ) { }

  ngOnInit(): void {

    this.route.queryParamMap.subscribe(params => {
      console.log(params);
      const code = params.get('code');
      if (code !== null) this.doSetup(code);
    });
  }

  doSetup(authorisationCode: string)  {

    console.log(authorisationCode);

    // Subscribe to the token change
    this.strava.tokenChange.subscribe(
      token => {
        this.router.navigateByUrl('/');
      }
    )
    // this will emit a change when the token is retrieved
    this.strava.getOAuth2AccessToken(authorisationCode);
  }

}
