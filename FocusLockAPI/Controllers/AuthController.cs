using Microsoft.AspNetCore.Mvc;
using FocusLockAPI.Services;
using FocusLockAPI.DTOs;

namespace FocusLockAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("verify")]
        public async Task<IActionResult> VerifyToken([FromBody] TokenVerificationDto request)
        {
            try
            {
                var user = await _authService.VerifyTokenAsync(request.Token);
                return Ok(user);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
        }
    }
} 