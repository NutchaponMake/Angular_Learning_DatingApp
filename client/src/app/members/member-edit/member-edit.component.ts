import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';
import { Member } from 'src/app/_model/member';
import { User } from 'src/app/_model/user';
import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';

@Component({
  selector: 'app-member-edit',
  templateUrl: './member-edit.component.html',
  styleUrls: ['./member-edit.component.css']
})
export class MemberEditComponent implements OnInit {

  @ViewChild('editForm') editForm: NgForm;

  member: Member;
  user: User;

  @HostListener('window:beforeunload', ['$event']) unloadNotification($event: any) {
    if (this.editForm.dirty) {
      $event.returnValue = true;
    }
  }

  constructor(private accountService: AccountService,
    private membersService: MembersService,
    private toastr: ToastrService) {
    this.accountService.currentUser$.pipe(take(1))
      .subscribe({
        next: (res) => { this.user = res },
        error: (error) => { console.log(error.error) }
      });
  }

  ngOnInit(): void {
    this.loadMember();
  }

  loadMember() {
    this.membersService.getMember(this.user.userName).subscribe({
      next: (res) => { this.member = res },
      error: (error) => { console.log(error.error) }
    })
  }

  updateMember() {
    this.membersService.updateMember(this.member).subscribe({
      complete: () => {
        this.toastr.success('Profile updated successfully');
        this.editForm.reset(this.member);
      }
    });
  }
}
