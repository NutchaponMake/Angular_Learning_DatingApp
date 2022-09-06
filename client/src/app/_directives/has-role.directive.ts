import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { take } from 'rxjs';
import { User } from '../_model/user';
import { AccountService } from '../_services/account.service';

@Directive({
  selector: '[appHasRole]'
  //other directive is look like >> *ngIf , *ngFor , bsRadio
  //this directive will look like >> *appHasRole
})
export class HasRoleDirective implements OnInit {
  @Input() appHasRole: string[];
  user: User;

  constructor(private viewContainerRef: ViewContainerRef,
    private templateRef: TemplateRef<any>, private accountService: AccountService) {
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: res => { this.user = res }
    });
  }

  ngOnInit(): void {
    //clear view if no roles.
    if (!this.user?.roles || this.user == null) {
      this.viewContainerRef.clear();
      return;
    }

    if (this.user?.roles.some(r => this.appHasRole.includes(r))) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    }
    else {
      this.viewContainerRef.clear();
    }
  }

}
