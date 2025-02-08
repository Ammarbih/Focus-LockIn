using System;

namespace FocusLockAPI.Models
{
    public class FocusSession
    {
        public string Id { get; set; }
        public string UserId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public int DurationMinutes { get; set; }
        public bool Completed { get; set; }
        public SessionType Type { get; set; }
        public User User { get; set; }
    }

    public enum SessionType
    {
        Work,
        Break
    }
} 