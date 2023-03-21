import { Injectable, EventEmitter } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class ConfigService {
  constructor(private http: HttpClient) { }
}

@Injectable({
  providedIn: 'root'
})
export class TestingService {

  constructor() { }

  oasChange: EventEmitter<any> = new EventEmitter();
  private oasLocation = 'https://3cdzg7kbj4.execute-api.eu-west-2.amazonaws.com/poc/Conformance/v3/api-docs';

  public getOOAS() : string {
    return this.oasLocation
  }
  public setOAS(oasLocation: string) {

    if (oasLocation !== undefined && oasLocation !== this.oasLocation) {
      this.oasLocation = oasLocation
      this.oasChange.emit(this.oasLocation)
    }
  }
}
