import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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

  registerForm: FormGroup;
  maxDate: Date;
  validationErrors: string[] = [];

  constructor(public accountService: AccountService, private toastr: ToastrService,
    private formBuilder: FormBuilder, private router: Router) { }

  ngOnInit(): void {
    this.initializeForm();
    this.maxDate = new Date();
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);
  }
  initializeForm() {
    this.registerForm
      = this.formBuilder.group({
        username: [null, Validators.required],
        password: [null, [Validators.required,
        Validators.maxLength(10), Validators.minLength(4)]],
        confirmPassword: [null, [Validators.required,
        Validators.maxLength(10), Validators.minLength(4), this.isMatch('password')]],
        gender: ['male', Validators.required],
        knownAs: [null, Validators.required],
        dateOfBirth: [null, Validators.required],
        city: [null, Validators.required],
        country: [null, Validators.required],
      });
    this.registerForm.controls.password.valueChanges.subscribe({
      next: () => {
        this.registerForm.controls.confirmPassword.updateValueAndValidity();
      }
    });
  }

  isMatch(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      return (control?.value === control?.parent?.controls[matchTo].value)
        ? null : { isMatching: true }
    }
  }

  register() {
    this.accountService.register(this.registerForm.value)
      .subscribe({
        next: (response) => {
          this.router.navigateByUrl('/members');
          console.log(response);
          this.cancel();
        },
        error: (errors) => {
          this.validationErrors = errors;
          console.log(errors);
        }
      });
  }

  cancel() {
    this.cancelRegister.emit(false);
  }
}
