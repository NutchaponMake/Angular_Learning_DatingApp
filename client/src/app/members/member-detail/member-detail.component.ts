import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Gallery, GalleryItem, ImageItem } from 'ng-gallery';
import { Member } from 'src/app/_model/member';
import { MembersService } from 'src/app/_services/members.service';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css'],
  template: `<gallery [items]="images"></gallery>`
})
export class MemberDetailComponent implements OnInit {
  member: Member;
  images: GalleryItem[];

  constructor(private memberService: MembersService, private route: ActivatedRoute, private gallery: Gallery) { }

  ngOnInit(): void {
    this.loadMember();
  }

  loadMember() {
    this.memberService.getMember(this.route.snapshot.paramMap.get('username'))
      .subscribe({
        next: (res: Member) => {
          this.member = res
          this.images = this.loadImages();
        },
        error: (error: any) => { console.log(error.error) }
      });

  }

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
}
