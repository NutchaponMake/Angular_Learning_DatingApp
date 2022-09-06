using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace API.Controllers
{
    // [Route("[controller]")]
    public class AdminController : BaseAPIController
    {
        private readonly UserManager<AppUser> _userManager;
        public AdminController(UserManager<AppUser> userManager)
        {
            _userManager = userManager;
        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpGet("users-with-roles")]
        public async Task<ActionResult> GetUsersWithRoles()
        {
            var users = await _userManager.Users
                .Include(r => r.UserRoles)
                .ThenInclude(r => r.Role)
                .OrderBy(u => u.UserName)
                .Select(u => new
                {
                    u.Id,
                    Username = u.UserName,
                    Roles = u.UserRoles.Select(r => r.Role.Name).ToList()
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpPost("edit-roles/{username}")]
        public async Task<ActionResult> EditRoles(string username, [FromQuery] string roles)
        {
            var selectedRoles = roles.Split(",").ToArray();
            var user = await _userManager.FindByNameAsync(username);
            if (user == null) return NotFound("Culd not find user.");

            var currentUserRoles = await _userManager.GetRolesAsync(user);
            ///เพิ่ม Roles ใหม่ ที่ไม่ใช่ Roles เก่าในระบบ
            var resultUpdatedRoles = await _userManager.AddToRolesAsync(user, selectedRoles.Except(currentUserRoles));
            if (!resultUpdatedRoles.Succeeded) return BadRequest("Failed to added a new role(s).");

            ///ลบ Roles เก่า ที่ไม่ใช่ Roles ใหม่ที่ขอเข้ามา
            resultUpdatedRoles = await _userManager.RemoveFromRolesAsync(user, currentUserRoles.Except(selectedRoles));
            if (!resultUpdatedRoles.Succeeded) return BadRequest("Failed to remove a current role(s).");

            return Ok(await _userManager.GetRolesAsync(user));
        }


        [Authorize(Policy = "ModeratePhotoRole")]
        [HttpGet("photos-to-moderate")]
        public ActionResult GetPhotosForModeration()
        {
            return Ok("Admins or Moderators can see this.");
        }
    }
}