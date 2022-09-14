using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.SignalR
{
    public class PresenceTracker
    {
        private static readonly Dictionary<string, List<string>> OnlineUsersDict
        = new Dictionary<string, List<string>>();

        public Task<bool> UserConnected(string username, string connectionId)
        {
            bool isOnline = false;
            lock (OnlineUsersDict)
            {
                if (OnlineUsersDict.ContainsKey(username))
                {
                    OnlineUsersDict[username].Add(connectionId);
                }
                else
                {
                    OnlineUsersDict.Add(username, new List<string> { connectionId });
                    isOnline = true;
                }
            }

            return Task.FromResult(isOnline);
        }

        public Task<bool> UserDisconnected(string username, string connectionId)
        {
            bool isOffline = false;
            lock (OnlineUsersDict)
            {
                if (!OnlineUsersDict.ContainsKey(username)) return Task.FromResult(isOffline);

                OnlineUsersDict[username].Remove(connectionId);

                if (OnlineUsersDict[username].Count == 0)
                {
                    OnlineUsersDict.Remove(username);
                    isOffline = true;
                }
            }

            return Task.FromResult(isOffline);
        }

        public Task<string[]> GetOnlineUsers()
        {
            string[] onlineUsersArr;
            lock (OnlineUsersDict)
            {
                onlineUsersArr = OnlineUsersDict.OrderBy(k => k.Key).Select(k => k.Key).ToArray();
            }

            return Task.FromResult(onlineUsersArr);
        }

        public Task<List<string>> GetConnectionForUser(string username)
        {
            List<string> connectionId;
            lock (OnlineUsersDict)
            {
                connectionId = OnlineUsersDict.GetValueOrDefault(username);
            }

            return Task.FromResult(connectionId);
        }
    }
}