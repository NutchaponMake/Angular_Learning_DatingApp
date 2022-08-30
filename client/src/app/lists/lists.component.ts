import { Component, OnInit } from '@angular/core';
import { LikedParams } from '../_model/likedParams';
import { Member } from '../_model/member';
import { Pagination } from '../_model/pagination';
import { MembersService } from '../_services/members.service';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.css']
})
export class ListsComponent implements OnInit {
  members: Partial<Member[]>;
  likeParams: LikedParams;
  pagination: Pagination;

  constructor(private memberService: MembersService) {
    this.likeParams = this.memberService.getLikedParams();
  }

  ngOnInit(): void {
    this.loadLikes();
  }

  loadLikes() {
    this.memberService.setLikedParams(this.likeParams);
    this.memberService.getLikes(this.likeParams).subscribe({
      next: res => {
        this.members = res.result;
        this.pagination = res.pagination;
      }
    });

  }

  pageChanged(event: any) {
    this.likeParams.pageNumber = event.page;
    this.memberService.setLikedParams(this.likeParams)
    this.loadLikes();
  }

}
