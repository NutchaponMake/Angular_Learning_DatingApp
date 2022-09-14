using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Extension;
using AutoMapper;

namespace API.Helpers
{
    public class AutoMapperProfiles : Profile
    {
        public AutoMapperProfiles()
        {
            CreateMap<AppUser, MemberDto>()
                .ForMember(destination => destination.PhotoUrl,
                option => option.MapFrom(
                    soruce => soruce.Photos.FirstOrDefault(x => x.IsMain).Url
                ))
                .ForMember(destination => destination.Age,
                option => option.MapFrom(
                    soruce => soruce.DateOfBirth.CalculateAge()
                ));

            CreateMap<Photo, PhotoDto>();
            CreateMap<MemberUpdateDto, AppUser>();
            CreateMap<RegisterDtoReq, AppUser>();
            CreateMap<Message, MessageDto>()
            .ForMember(destination => destination.SenderPhotoUrl,
                option => option.MapFrom(
                src => src.Sender.Photos.FirstOrDefault(x => x.IsMain).Url
                ))
            .ForMember(destination => destination.RecipientPhotoUrl,
                option => option.MapFrom(
                src => src.Recipient.Photos.FirstOrDefault(x => x.IsMain).Url
                ));
            CreateMap<DateTime, DateTime>().ConvertUsing(d => DateTime.SpecifyKind(d, DateTimeKind.Utc));
        }
    }
}