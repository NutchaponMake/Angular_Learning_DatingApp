import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GalleryItem, ImageItem } from 'ng-gallery';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { Member } from 'src/app/_model/member';
import { Message } from 'src/app/_model/message';
import { MembersService } from 'src/app/_services/members.service';
import { MessageService } from 'src/app/_services/message.service';
import { MemberMessagesComponent } from '../member-messages/member-messages.component';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css'],
  template: `<gallery [items]="images"></gallery>`
})
export class MemberDetailComponent implements OnInit {
  @ViewChild('memberTabs', { static: true }) memberTabs: TabsetComponent;

  member: Member;
  images: GalleryItem[];
  activeTab: TabDirective;
  messages: Message[] = [];

  constructor(private memberService: MembersService,
    private route: ActivatedRoute,
    private messageService: MessageService) { }

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
      this.loadMessages();
    }
  }
}
