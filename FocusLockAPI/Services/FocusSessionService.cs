using FocusLockAPI.Models;
using FocusLockAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace FocusLockAPI.Services
{
    public interface IFocusSessionService
    {
        Task<FocusSession> StartSessionAsync(string userId, SessionType type);
        Task<FocusSession> EndSessionAsync(string sessionId);
        Task<IEnumerable<FocusSession>> GetUserSessionsAsync(string userId);
        Task<Dictionary<string, int>> GetUserStatsAsync(string userId);
    }

    public class FocusSessionService : IFocusSessionService
    {
        private readonly ApplicationDbContext _context;

        public FocusSessionService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<FocusSession> StartSessionAsync(string userId, SessionType type)
        {
            var session = new FocusSession
            {
                Id = Guid.NewGuid().ToString(),
                UserId = userId,
                StartTime = DateTime.UtcNow,
                Type = type,
                Completed = false
            };

            _context.FocusSessions.Add(session);
            await _context.SaveChangesAsync();

            return session;
        }

        public async Task<FocusSession> EndSessionAsync(string sessionId)
        {
            var session = await _context.FocusSessions.FindAsync(sessionId);
            if (session == null)
                throw new KeyNotFoundException("Session not found");

            session.EndTime = DateTime.UtcNow;
            session.DurationMinutes = (int)(session.EndTime.Value - session.StartTime).TotalMinutes;
            session.Completed = true;

            await _context.SaveChangesAsync();
            return session;
        }

        public async Task<IEnumerable<FocusSession>> GetUserSessionsAsync(string userId)
        {
            return await _context.FocusSessions
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.StartTime)
                .ToListAsync();
        }

        public async Task<Dictionary<string, int>> GetUserStatsAsync(string userId)
        {
            var sessions = await _context.FocusSessions
                .Where(s => s.UserId == userId && s.Completed)
                .ToListAsync();

            return new Dictionary<string, int>
            {
                { "totalSessions", sessions.Count },
                { "totalMinutes", sessions.Sum(s => s.DurationMinutes) },
                { "completedSessions", sessions.Count(s => s.Completed) },
                { "averageSessionMinutes", sessions.Any() ? (int)sessions.Average(s => s.DurationMinutes) : 0 }
            };
        }
    }
} 