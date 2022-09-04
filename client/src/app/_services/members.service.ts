import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, of, take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LikedParams } from '../_model/likedParams';
import { Member } from '../_model/member';
import { PaginatedResult } from '../_model/pagination';
import { User } from '../_model/user';
import { UserParams } from '../_model/userParams';
import { AccountService } from './account.service';
import { getPaginatedResult, getPaginationHeaders } from './paginationHelper';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  baseUrl = environment.apiUrl
  members: Member[] = [];
  memberCache = new Map();
  user: User;
  userParams: UserParams
  likedParams: LikedParams;
  likedMemberCache = new Map();

  constructor(private http: HttpClient, private accountService: AccountService) {
    this.accountService.currentUser$.pipe(take(1)).subscribe(
      {
        next: res => {
          this.user = res;
          this.userParams = new UserParams(res);
          this.likedParams = new LikedParams();
        }
      }
    )
  }

  //#region Member-list
  getUserParams() {
    return this.userParams;
  }

  setUserParams(params: UserParams) {
    this.userParams = params;
  }

  resetUserParams() {
    this.userParams = new UserParams(this.user);
    return this.userParams;
  }

  getMembers(userParams: UserParams) {
    var hasCache = this.memberCache.get(Object.values(userParams).join('-'));
    if (hasCache) {
      return of(hasCache);
    }
    let params = getPaginationHeaders(userParams.pageNumber, userParams.pageSize);
    params = params.append('minAge', userParams.minAge.toString());
    params = params.append('maxAge', userParams.maxAge.toString());
    params = params.append('gender', userParams.gender.toString());
    params = params.append('orderBy', userParams.orderBy.toString());
    //if (this.members.length > 0) return of(this.members);
    // return this.http.get<Member[]>(this.baseUrl + 'users').pipe(
    //   map(res => {
    //     this.members = res
    //     return res;
    //   })
    // );

    return getPaginatedResult<Member[]>(this.baseUrl + 'users', params, this.http)
      .pipe(map(res => {
        this.memberCache.set(Object.values(userParams).join('-'), res);
        return res;
      }));

  }

  getMember(username: string) {
    // const member = this.members.find(x => x.username === username);
    // if (member !== undefined) return of(member);
    console.log(this.memberCache);
    console.log('===================');
    const member = [...this.memberCache.values()]
    console.log(member);
    console.log('===================');
    const member2 = [...this.memberCache.values()]
      .reduce((arr, el) => arr.concat(el.result), []);
    console.log(member2);
    console.log('===================');
    const member3 = [...this.memberCache.values()]
      .reduce((arr, el) => arr.concat(el.result), [])
      .find((member: Member) => member.userName === username);
    console.log(member3);
    console.log('===================');

    if (member3) return of(member3);

    return this.http.get<Member>(this.baseUrl + 'users/' + username);
  }
  //#endregion

  //#region member-config
  updateMember(member: Member) {
    return this.http.put(this.baseUrl + 'users', member).pipe(
      map(() => {
        const idx = this.members.indexOf(member);
        this.members[idx] = member;
      })
    );
  }

  setMainPhoto(photoId: number) {
    return this.http.put(this.baseUrl + 'users/set-main-photo/' + photoId, {});
  }

  deletePhoto(photoId: number) {
    return this.http.delete(this.baseUrl + 'users/delete-photo/' + photoId);
  }

  //#endregion

  //#region Liked
  getLikedParams() {
    return this.likedParams;
  }

  setLikedParams(params: LikedParams) {
    this.likedParams = params;
  }

  resetLikedParams() {
    this.likedParams = new LikedParams();
    return this.likedParams;
  }

  addLike(username: string) {
    return this.http.post(this.baseUrl + 'likes/' + username, {});
  }

  getLikes(likeParams: LikedParams) {
    var hasCache = this.likedMemberCache.get(Object.values(likeParams).join('-'));
    if (hasCache) {
      return of(hasCache);
    }
    let params = getPaginationHeaders(likeParams.pageNumber, likeParams.pageSize);
    params = params.append('predicate', likeParams.predicate);

    return getPaginatedResult<Partial<Member[]>>(this.baseUrl + 'likes', params, this.http)
      .pipe(map(res => {
        this.likedMemberCache.set(Object.values(likeParams).join('-'), res);
        return res;
      }));

    //return this.http.get<Partial<Member[]>>(this.baseUrl + 'likes?predicate=' + predicate);
  }
  //#endregion
}
