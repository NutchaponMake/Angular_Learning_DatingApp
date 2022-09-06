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
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class AccountController : BaseAPIController
    {
        private readonly DataContext _context;
        private readonly ITokenService _tokenservice;
        // private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly UserManager<AppUser> _userManager;
        public AccountController(UserManager<AppUser> userManager, SignInManager<AppUser> signInManager, ITokenService tokenservice
        , IMapper mapper)

        // DataContext context,IUserRepository userRepository
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _mapper = mapper;
            _tokenservice = tokenservice;
            //_userRepository = userRepository;
            //_context = context;
        }

        [HttpPost("register")]
        public async Task<ActionResult<RegisterDtoRes>> Register(RegisterDtoReq registerDtoReq)
        {
            ////เช็ค username ว่ามีในระบบแล้วหรือยัง ถ้ามีแล้ว return BadRequest (เป็น http response อย่างนึง) กลับไปหา user
            if (await UserExists(registerDtoReq.UserName))
                return BadRequest("Username has been taken.");

            var user = _mapper.Map<AppUser>(registerDtoReq);
            //using var hmac = new HMACSHA512();

            user.UserName = registerDtoReq.UserName.ToLower();
            // user.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDtoReq.Password));
            // user.PasswordSalt = hmac.Key;

            // _context.Users.Add(user);
            //await _context.SaveChangesAsync();

            var result = await _userManager.CreateAsync(user, registerDtoReq.Password);
            if (!result.Succeeded) return BadRequest(result.Errors);

            var roleResult = await _userManager.AddToRoleAsync(user, "Member");
            if (!roleResult.Succeeded) return BadRequest(roleResult.Errors);

            return new RegisterDtoRes
            {
                status = "success",
                message = "Registeration completed",
                data = new UserDto
                {
                    UserName = user.UserName,
                    Token = await _tokenservice.CreateToken(user),
                    KnownAs = user.KnownAs,
                    Gender = user.Gender,
                }
            };
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginDtoRes>> Login(LoginDtoReq loginDtoReq)
        {

            //var user = await _userRepository.GetUsersByUsernameAsync(loginDtoReq.UserName);

            var user = await _userManager.Users
            .Include(p => p.Photos)
            .SingleOrDefaultAsync(user => user.UserName == loginDtoReq.UserName.ToLower());

            if (user == null) return Unauthorized("Invalid Username.");

            /////// ทำการ sign-in ให้ user โดยเรียกตัว signInManager ในการ login
            var result = await _signInManager
            .CheckPasswordSignInAsync(user, loginDtoReq.Password, false);

            if (!result.Succeeded) return Unauthorized();

            //// หา username ใน DB ถ้าไม่เจอให้ส่ง Unauthorized กลับไป
            // var user = await _context.Users
            //     .SingleOrDefaultAsync(x => x.UserName == loginDtoReq.UserName);
            // if (user == null) return Unauthorized("Invalid Username.");


            // using var hmac = new HMACSHA512(user.PasswordSalt);
            // var computeHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDtoReq.Password));

            // for (int i = 0; i < computeHash.Length; i++)
            // {
            //     if (computeHash[i] != user.PasswordHash[i]) return Unauthorized("Invalid Password");
            // }

            return new LoginDtoRes
            {
                status = "success",
                message = "Login completed",
                data = new UserDto
                {
                    UserName = user.UserName,
                    Token = await _tokenservice.CreateToken(user),
                    PhotoUrl = user.Photos.FirstOrDefault(x => x.IsMain)?.Url,
                    KnownAs = user.KnownAs,
                    Gender = user.Gender
                }
            };
        }

        ///เช็ค Username ว่ามีอยู่ใน DB แล้วหรือไม่ผ่านคำสั่ง entity
        private async Task<bool> UserExists(string username)
        {
            return await _userManager.Users.AnyAsync(x => x.UserName == username.ToLower());
            //return await _context.Users.AnyAsync(x => x.UserName == username.ToLower());
        }
    }
}