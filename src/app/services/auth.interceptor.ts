import { HttpInterceptorFn } from '@angular/common/http';
import {inject} from "@angular/core";
import {AuthService} from "./auth.service";


// https://angular.dev/guide/http/interceptors
// https://justangular.com/blog/migrate-angular-interceptors-to-function-based-interceptors

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log(req.url);
  const authToken = inject(AuthService).getAccessToken()
  if (authToken != undefined) {
    const newReq = req.clone({
      headers: req.headers.append('X-Authentication-Token', authToken),
    });
    return next(newReq);
  } else {
    return next(req);
  }

};
