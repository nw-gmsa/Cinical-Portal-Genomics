import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-exchange-token',
  templateUrl: './exchange-token.component.html',
  styleUrls: ['./exchange-token.component.scss']
})
export class ExchangeTokenComponent implements OnInit {

  constructor( private route: ActivatedRoute,

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

  }

}
