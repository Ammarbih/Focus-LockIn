using Microsoft.AspNetCore.Mvc;
using FocusLockAPI.Services;
using FocusLockAPI.Models;
using Microsoft.AspNetCore.Authorization;

namespace FocusLockAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class FocusSessionController : ControllerBase
    {
        private readonly IFocusSessionService _focusSessionService;

        public FocusSessionController(IFocusSessionService focusSessionService)
        {
            _focusSessionService = focusSessionService;
        }

        [HttpPost("start")]
        public async Task<IActionResult> StartSession([FromBody] SessionStartDto request)
        {
            var userId = User.FindFirst("uid")?.Value;
            var session = await _focusSessionService.StartSessionAsync(userId, request.Type);
            return Ok(session);
        }

        [HttpPost("{sessionId}/end")]
        public async Task<IActionResult> EndSession(string sessionId)
        {
            try
            {
                var session = await _focusSessionService.EndSessionAsync(sessionId);
                return Ok(session);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpGet("user")]
        public async Task<IActionResult> GetUserSessions()
        {
            var userId = User.FindFirst("uid")?.Value;
            var sessions = await _focusSessionService.GetUserSessionsAsync(userId);
            return Ok(sessions);
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetUserStats()
        {
            var userId = User.FindFirst("uid")?.Value;
            var stats = await _focusSessionService.GetUserStatsAsync(userId);
            return Ok(stats);
        }
    }
} 