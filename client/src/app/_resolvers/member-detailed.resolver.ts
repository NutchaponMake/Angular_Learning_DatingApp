import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { Member } from '../_model/member';
import { MembersService } from '../_services/members.service';

@Injectable({
  providedIn: 'root'
})

export class MemberDetailedResolver implements Resolve<Member> {

  constructor(private memberService: MembersService) { }

  resolve(route: ActivatedRouteSnapshot): Observable<Member> {
    return this.memberService.getMember(route.paramMap.get('username'));
  }
}
