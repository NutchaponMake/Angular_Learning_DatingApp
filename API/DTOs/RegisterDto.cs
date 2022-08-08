using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs
{
    public class RegisterDtoReq
    {
        [Required(ErrorMessage = "Please enter UserName.")]
        public string UserName { get; set; }

        [Required(ErrorMessage = "Please enter Password.")]
        [StringLength(8, MinimumLength = 4)]
        public string Password { get; set; }
    }



    public class RegisterDtoRes
    {
        public string status { get; set; }
        public string message { get; set; }
        public UserDto data { get; set; }
    }
}