import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { User } from './_model/user';
import { AccountService } from './_services/account.service';

@Component({
  selector: 'app-root', /// ใช้เลือกว่า component นี้จะไปแทนส่วนไหนใน template
  templateUrl: './app.component.html', ///ใช้อ้างอิง template ที่จะยิง component ไป (มันคือ view นั้นแหละ)
  styleUrls: ['./app.component.css']  ///ใช้อ้างอิงไฟล์ css
})
export class AppComponent implements OnInit {
  title = 'The Dating App';


  constructor(private accountService: AccountService) { } ///ประกาศ constractor httpclient ให้สามารถใช้งาน http request ต่างๆได้

  ngOnInit() { // OnInit เป็นส่วนนึงของ lifecycle ของ page  (คิดว่าน่าจะเป็นเหมือน onload ใน javascript)
    this.setCurrentUser();
  }

  setCurrentUser() {
    const user: User = JSON.parse(localStorage.getItem('user'));
    this.accountService.setCurrentUser(user);
  }


}
