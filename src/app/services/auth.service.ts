import {EventEmitter, Injectable} from '@angular/core';
import {Observable, Subject} from "rxjs";
import {JwtHelperService} from "@auth0/angular-jwt";


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public isLoggedIn: boolean = false;

  private accessToken: string | undefined = undefined;

  private refreshingToken = false;

  public currentUser: any = undefined;

  private _authState: Subject<any> = new Subject<any>();
  authState: Observable<any> = this._authState.asObservable();

  public static SIGN_IN = 'signIn';
  public static SIGN_OUT = 'signOut';

  tokenChange: EventEmitter<any> = new EventEmitter();


  constructor() {

  }




  getAccessToken(): string | undefined {
    if (localStorage.getItem('awsToken') != undefined) {
      var token: any = JSON.parse(<string>localStorage.getItem('awsToken'));

      const helper = new JwtHelperService();
      if (this.isTokenExpired(token)) {

        console.log('aws Token expired');
        this.accessToken = undefined;
        this.getRefreshToken();
        return undefined;
      }
      if (token != undefined) {
        this.accessToken = token.jwtToken;
        return this.accessToken;

      }
    }
    return undefined;
  }

  public getRefreshToken() {

    if (this.refreshingToken) return;
    this.refreshingToken = true;
    console.log('AWS Refresh Token');

  }

  private isTokenExpired(
    token: any,
    offsetSeconds?: number
  ): boolean {
    if (!token || token === "") {
      return true;
    }
    const date = this.getTokenExpirationDate(token);
    offsetSeconds = offsetSeconds || 0;

    // console.log('aws expiry date '+date);
    if (date === null) {
      return false;
    }

    return !(date.valueOf() > new Date().valueOf() + offsetSeconds * 1000);
  }

  private getTokenExpirationDate(
    decoded: any
  ): Date | null {

    const date = new Date(0);
    date.setUTCSeconds(decoded.payload.exp);

    return date;
  }


}
