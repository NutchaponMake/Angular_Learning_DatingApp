import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { HomeComponent } from '../home/home.component';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  // @Input() usersFromHomeComponent: any ///Recieving from Parent
  @Output() cancelRegister = new EventEmitter(); ///Sending to parent

  model: any = {};
  constructor(public accountService: AccountService, private toastr: ToastrService) { }

  ngOnInit(): void {
  }

  register() {
    this.accountService.register(this.model)
      .subscribe({
        next: (response) => {
          console.log(response);
          this.cancel();
        },
        error: (error) => {
          console.log(error);
          this.toastr.error(error.error);
        }
      });
  }

  cancel() {
    this.cancelRegister.emit(false);
  }
}
