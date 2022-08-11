import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, take } from 'rxjs';
import { AccountService } from '../_services/account.service';
import { User } from '../_model/user';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(private accountService: AccountService, private toastr: ToastrService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let currentUser: User;
    this.accountService.currentUser$.pipe(take(1))
      .subscribe({
        next: (response) => {
          currentUser = response;
        },
        error: (error) => {
          console.log(error);
          this.toastr.error(error.error);
        }
      });

    if (currentUser) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${currentUser.token}`
        }
      })
    }


    return next.handle(request);
  }
}
