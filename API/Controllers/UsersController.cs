using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extension;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Authorize]
    public class UsersController : BaseAPIController
    {
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        private readonly IPhotoService _photoService;

        public UsersController(IUserRepository userRepository, IPhotoService photoService, IMapper mapper)
        {
            _photoService = photoService;
            _mapper = mapper;
            _userRepository = userRepository;

        }

        [HttpGet(Name = "GetUsers")]
        public async Task<ActionResult<IEnumerable<MemberDto>>> GetUser()
        {
            return Ok(await _userRepository.GetMembersAsync());
        }

        // [HttpGet("{id}")]
        // public async Task<ActionResult<AppUser>> GetUser(int id)
        // {
        //     return Ok(await _userRepository.GetUsersByIdAsync(id));
        // }

        [HttpGet("{username}", Name = "GetUser")]
        public async Task<ActionResult<MemberDto>> GetUser(string username)
        {
            return Ok(await _userRepository.GetMemberAsync(username));
        }

        [HttpPut]
        public async Task<ActionResult> UpdateUser(MemberUpdateDto memberUpdateDto)
        {
            var user = await _userRepository.GetUsersByUsernameAsync(User.GetUsername());

            _mapper.Map(memberUpdateDto, user);

            _userRepository.Update(user);

            if (await _userRepository.SaveAllAsync()) return NoContent();
            return BadRequest("Failed to update member details.");
        }

        [HttpPost("add-photo")]
        public async Task<ActionResult<PhotoDto>> AddPhoto(IFormFile file)
        {
            var user = await _userRepository.GetUsersByUsernameAsync(User.GetUsername());
            var res = await _photoService.AddPhotoAsync(file);

            if (res.Error != null) { return BadRequest(res.Error.Message); }

            var photo = new Photo
            {
                Url = res.SecureUrl.AbsoluteUri,
                PublicId = res.PublicId
            };
            if (user.Photos.Count == 0) { photo.IsMain = true; }

            user.Photos.Add(photo);

            if (await _userRepository.SaveAllAsync())
            {
                return CreatedAtRoute(
                    "GetUser",
                    new { username = user.UserName },
                    _mapper.Map<PhotoDto>(photo)
                );
                //more information about Status201Created go here :
                //https://ochzhen.com/blog/created-createdataction-createdatroute-methods-explained-aspnet-core
                //Created()
                //CreatedAtAction()
            }

            return BadRequest("Unexpected error on upload new photo");
        }


        [HttpPut("set-main-photo/{photoId}")]
        public async Task<ActionResult> SetMainPhoto(int photoId)
        {
            var user = await _userRepository.GetUsersByUsernameAsync(User.GetUsername());
            var selectedPhoto = user.Photos.FirstOrDefault(x => x.Id == photoId);
            if (selectedPhoto.IsMain) return BadRequest("This is already your main photo.");

            var currentMainPhoto = user.Photos.FirstOrDefault(x => x.IsMain == true);
            if (currentMainPhoto != null) currentMainPhoto.IsMain = false;

            selectedPhoto.IsMain = true;

            if (await _userRepository.SaveAllAsync()) return NoContent();

            return BadRequest("Unexpected occur during setting main photo.");
        }

        [HttpDelete("delete-photo/{photoId}")]
        public async Task<ActionResult> DeletePhoto(int photoId)
        {
            var user = await this._userRepository.GetUsersByUsernameAsync(User.GetUsername());
            var photo = user.Photos.FirstOrDefault(x => x.Id == photoId);
            if (photo == null) return NotFound();
            if (photo.IsMain) return BadRequest("You cannot delete your current main photo.");

            if (photo.PublicId != null)
            {
                var res = await _photoService.DeletePhotoAsync(photo.PublicId);
                if (res.Error != null) return BadRequest(res.Error.Message);
            }

            user.Photos.Remove(photo);

            if (await _userRepository.SaveAllAsync()) return Ok();

            return BadRequest("Error occur during a delete photo process");
        }
    }
}
