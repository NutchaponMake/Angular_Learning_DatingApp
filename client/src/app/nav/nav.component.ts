import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../_model/user';
import { AccountService } from '../_services/account.service';


@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  model: any = {}

  constructor(public accountService: AccountService) { }

  ngOnInit(): void {
  }

  login() {
    this.accountService.login(this.model)
      .subscribe({
        next: (response) => {
          console.log(response);
        },
        error: (error) => { console.log(error); },
        complete: () => { console.log('complete login') }
      });
  }

  logout() {
    this.accountService.logout();
    console.log('complete logout')
  }
}