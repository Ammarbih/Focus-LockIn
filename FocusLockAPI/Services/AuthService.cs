using FirebaseAdmin.Auth;
using FocusLockAPI.Models;
using FocusLockAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace FocusLockAPI.Services
{
    public interface IAuthService
    {
        Task<User> VerifyTokenAsync(string token);
        Task<User> CreateUserAsync(string email, string displayName);
    }

    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly FirebaseAuth _firebaseAuth;

        public AuthService(ApplicationDbContext context, FirebaseAuth firebaseAuth)
        {
            _context = context;
            _firebaseAuth = firebaseAuth;
        }

        public async Task<User> VerifyTokenAsync(string token)
        {
            try
            {
                var decodedToken = await _firebaseAuth.VerifyIdTokenAsync(token);
                var userId = decodedToken.Uid;

                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                {
                    var firebaseUser = await _firebaseAuth.GetUserAsync(userId);
                    user = await CreateUserAsync(firebaseUser.Email, firebaseUser.DisplayName);
                }

                user.LastLoginAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return user;
            }
            catch (Exception)
            {
                throw new UnauthorizedAccessException("Invalid token");
            }
        }

        public async Task<User> CreateUserAsync(string email, string displayName)
        {
            var user = new User
            {
                Id = Guid.NewGuid().ToString(),
                Email = email,
                DisplayName = displayName,
                CreatedAt = DateTime.UtcNow,
                LastLoginAt = DateTime.UtcNow,
                FocusSessions = new List<FocusSession>()
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return user;
        }
    }
} 