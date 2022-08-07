import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReplaySubject, using } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoginRes, RegisterRes, User } from '../_model/user';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  baseUrl = 'https://localhost:5001/api/';
  private currentUserSource = new ReplaySubject<User>(1);
  currentUser$ = this.currentUserSource.asObservable();

  constructor(private http: HttpClient) { }

  login(model: LoginRes) {
    return this.http.post(this.baseUrl + 'account/login', model)
      .pipe(
        map((res: LoginRes) => {
          const user = res.data
          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            this.currentUserSource.next(user);
          }
          return res;
        })
      );
  }

  setCurrentUser(user: User) {
    this.currentUserSource.next(user);
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUserSource.next(null);
  }

  register(model: any) {
    return this.http.post(this.baseUrl + 'account/register', model)
      .pipe(
        map((res: RegisterRes) => {
          const user = res.data
          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            this.currentUserSource.next(user);
          }
          return res;
        })
      );
  }

}
