using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs
{
    public class RegisterDtoReq
    {
        [Required(ErrorMessage = "Please enter Gender.")]
        public string Gender { get; set; }
        [Required(ErrorMessage = "Please enter KnownAs.")]
        public string KnownAs { get; set; }
        [Required(ErrorMessage = "Please enter DateOfBirth.")]
        public DateTime DateOfBirth { get; set; }
        [Required(ErrorMessage = "Please enter City.")]
        public string City { get; set; }
        [Required(ErrorMessage = "Please enter Country.")]
        public string Country { get; set; }

        [Required(ErrorMessage = "Please enter UserName.")]
        public string UserName { get; set; }

        [Required(ErrorMessage = "Please enter Password.")]
        [StringLength(10, MinimumLength = 4)]
        public string Password { get; set; }
    }



    public class RegisterDtoRes
    {
        public string status { get; set; }
        public string message { get; set; }
        public UserDto data { get; set; }
    }
}