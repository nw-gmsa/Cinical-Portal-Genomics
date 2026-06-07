import { HttpInterceptorFn } from '@angular/common/http';


// https://angular.dev/guide/http/interceptors
// https://justangular.com/blog/migrate-angular-interceptors-to-function-based-interceptors

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log(req.url);
  return next(req);
};
