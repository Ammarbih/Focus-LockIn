using System;

namespace FocusLockAPI.Models
{
    public class User
    {
        public string Id { get; set; }
        public string Email { get; set; }
        public string DisplayName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime LastLoginAt { get; set; }
        public List<FocusSession> FocusSessions { get; set; }
    }
} 