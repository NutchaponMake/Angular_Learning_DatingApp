import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReplaySubject, using } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { LoginRes, RegisterRes, User } from '../_model/user';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  baseUrl = environment.apiUrl;
  private currentUserSource = new ReplaySubject<User>(1);
  currentUser$ = this.currentUserSource.asObservable();

  constructor(private http: HttpClient) { }

  login(model: LoginRes) {
    return this.http.post(this.baseUrl + 'account/login', model)
      .pipe(
        map((res: LoginRes) => {
          const user = res.data
          if (user) {
            this.setCurrentUser(user);
          }
          return res;
        })
      );
  }

  register(model: any) {
    return this.http.post(this.baseUrl + 'account/register', model)
      .pipe(
        map((res: RegisterRes) => {
          const user = res.data
          if (user) {
            this.setCurrentUser(user);
          }
          return res;
        })
      );
  }

  setCurrentUser(user: User) {
    user.roles = [];
    const roles = this.getDecodedToken(user.token).role;
    Array.isArray(roles) ? user.roles = roles : user.roles.push(roles);
    
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSource.next(user);
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUserSource.next(null);
  }

  getDecodedToken(token: string) {
    return JSON.parse(atob(token.split('.')[1]));
    //return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  }
}
