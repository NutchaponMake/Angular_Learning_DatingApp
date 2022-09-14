import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GalleryItem, ImageItem } from 'ng-gallery';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { take } from 'rxjs';
import { Member } from 'src/app/_model/member';
import { Message } from 'src/app/_model/message';
import { User } from 'src/app/_model/user';
import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';
import { MessageService } from 'src/app/_services/message.service';
import { PresenceService } from 'src/app/_services/presence.service';
import { MemberMessagesComponent } from '../member-messages/member-messages.component';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css'],
  template: `<gallery [items]="images"></gallery>`
})
export class MemberDetailComponent implements OnInit, OnDestroy {
  @ViewChild('memberTabs', { static: true }) memberTabs: TabsetComponent;

  member: Member;
  images: GalleryItem[];
  activeTab: TabDirective;
  messages: Message[] = [];
  user: User;

  constructor(public presence: PresenceService,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private accountService: AccountService,
    private router: Router) {
    this.accountService.currentUser$.pipe(take(1)).subscribe(
      {
        next: res => { this.user = res }
      });

    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnInit(): void {

    this.route.data.subscribe({
      next: res => { this.member = res.member }
    });
    //this.loadMember();

    this.route.queryParams.subscribe({
      next: res => {
        res.tab ? this.toTab(res.tab) : this.toTab(0);
      }
    });

    this.images = this.loadImages();
  }

  // loadMember() {
  //   this.memberService.getMember(this.route.snapshot.paramMap.get('username'))
  //     .subscribe({
  //       next: (res: Member) => {
  //         this.member = res
  //         this.images = this.loadImages();
  //       }
  //     });
  // }

  loadImages(): GalleryItem[] {
    const imageUrls = [];
    for (const photo of this.member.photos) {
      imageUrls.push(
        new ImageItem({
          src: photo?.url,
          thumb: photo?.url
        })
      );
    }
    return imageUrls;
  }

  loadMessages() {
    this.messageService.getMessageThread(this.member.userName).subscribe({
      next: res => { console.log(res); this.messages = res; }
    })
  }

  toTab(tabId: number) {
    this.memberTabs.tabs[tabId].active = true;
  }

  onTabActivated(data: TabDirective) {
    this.activeTab = data;
    if (this.activeTab.heading === 'Messages' && this.messages.length === 0) {
      this.messageService.createHubConnection(this.user, this.member.userName)
      //this.loadMessages();
    } else {
      this.messageService.stopHubConnection();
    }
  }

  ngOnDestroy(): void {
    this.messageService.stopHubConnection();
  }
}
