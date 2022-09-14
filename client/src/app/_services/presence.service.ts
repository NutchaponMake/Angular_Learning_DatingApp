import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HubConnection } from '@microsoft/signalr';
import { HubConnectionBuilder } from '@microsoft/signalr/dist/esm/HubConnectionBuilder';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../_model/user';

@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  hubUrl = environment.hubUrl;
  private hubConnection: HubConnection;
  private onlineUsersSource = new BehaviorSubject<string[]>([]);
  onlineUser$ = this.onlineUsersSource.asObservable();

  constructor(private toastr: ToastrService, private router: Router) { }

  createHubConnection(user: User) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'presence', {
        accessTokenFactory: () => user.token
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .catch(error => console.log(error));

    this.hubConnection.on('UserIsOnline', username => {
      // this.toastr.info(username + ' has connected');
      this.onlineUser$.pipe(take(1)).subscribe({
        next: resUsernames => { this.onlineUsersSource.next([...resUsernames, username]) }
      })
    });

    this.hubConnection.on('UserIsOffline', username => {
      //this.toastr.warning(username + ' has disconnected');
      this.onlineUser$.pipe(take(1)).subscribe({
        next: resUsernames => { this.onlineUsersSource
          .next([...resUsernames.filter(x => x !== username)]) }
      })
    });

    this.hubConnection.on('GetOnlineUsers', (usernames: string[]) => {
      this.onlineUsersSource.next(usernames);
    });

    this.hubConnection.on("NewMessageReceived", ({ username, knownAs }) => {
      this.toastr.info(knownAs + ' has sent you a new message')
        .onTap
        .pipe(take(1))
        .subscribe({
          next: () => { this.router.navigateByUrl('/members/' + username + '?tab=3') }
        })
    });
  }

  stopHubConnecction() {
    this.hubConnection.stop().catch(error => console.log(error));
  }
}
