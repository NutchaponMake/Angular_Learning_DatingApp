using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class AccountController : BaseAPIController
    {
        private readonly DataContext _context;
        private readonly ITokenService _tokenservice;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        public AccountController(DataContext context, ITokenService tokenservice
        , IUserRepository userRepository, IMapper mapper)
        {
            _mapper = mapper;
            _userRepository = userRepository;
            _tokenservice = tokenservice;
            _context = context;
        }

        [HttpPost("register")]
        public async Task<ActionResult<RegisterDtoRes>> Register(RegisterDtoReq registerDtoReq)
        {
            RegisterDtoRes res = new RegisterDtoRes();
            UserDto userDto = new UserDto();

            ////เช็ค username ว่ามีในระบบแล้วหรือยัง ถ้ามีแล้ว return BadRequest (เป็น http response อย่างนึง) กลับไปหา user
            if (await UserExists(registerDtoReq.UserName)) return BadRequest("Username has been taken.");

            var user = _mapper.Map<AppUser>(registerDtoReq);
            using var hmac = new HMACSHA512();

            user.UserName = registerDtoReq.UserName.ToLower();
            user.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDtoReq.Password));
            user.PasswordSalt = hmac.Key;

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            res.status = "success";
            res.message = "Registeration completed";
            userDto.UserName = user.UserName;
            userDto.Token = _tokenservice.CreateToken(user);
            userDto.KnownAs = user.KnownAs;
            userDto.Gender = user.Gender;
            res.data = userDto;
            return res;
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginDtoRes>> Login(LoginDtoReq loginDtoReq)
        {
            LoginDtoRes res = new LoginDtoRes();
            UserDto userDto = new UserDto();

            var user = await _userRepository.GetUsersByUsernameAsync(loginDtoReq.UserName);
            if (user == null) return Unauthorized("Invalid Username.");

            //// หา username ใน DB ถ้าไม่เจอให้ส่ง Unauthorized กลับไป
            // var user = await _context.Users
            //     .SingleOrDefaultAsync(x => x.UserName == loginDtoReq.UserName);
            // if (user == null) return Unauthorized("Invalid Username.");


            using var hmac = new HMACSHA512(user.PasswordSalt);
            var computeHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDtoReq.Password));

            for (int i = 0; i < computeHash.Length; i++)
            {
                if (computeHash[i] != user.PasswordHash[i]) return Unauthorized("Invalid Password");
            }

            res.status = "success";
            res.message = "Login completed";
            userDto.UserName = user.UserName;
            userDto.Token = _tokenservice.CreateToken(user);
            userDto.PhotoUrl = user.Photos.FirstOrDefault(x => x.IsMain)?.Url;
            userDto.KnownAs = user.KnownAs;
            userDto.Gender = user.Gender;
            res.data = userDto;
            return res;

        }

        ///เช็ค Username ว่ามีอยู่ใน DB แล้วหรือไม่ผ่านคำสั่ง entity
        private async Task<bool> UserExists(string username)
        {
            return await _context.Users.AnyAsync(x => x.UserName == username.ToLower());
        }
    }
}