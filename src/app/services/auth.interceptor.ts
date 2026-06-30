import { HttpInterceptorFn } from '@angular/common/http';
import {inject} from "@angular/core";
import {AuthService} from "./auth.service";
import {environment} from "../../environments/environment";


// https://angular.dev/guide/http/interceptors
// https://justangular.com/blog/migrate-angular-interceptors-to-function-based-interceptors

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log(req.url);
 // put back in for OAuth2 const authToken = inject(AuthService).getAccessToken()
  const authToken = "Basic "+btoa(unescape(encodeURIComponent(environment.user + ':' + environment.password)));
  if (authToken != undefined) {
    const newReq = req.clone({
      headers: req.headers.append('Authorization', authToken),
    });
    return next(newReq);
  } else {
    return next(req);
  }

};
