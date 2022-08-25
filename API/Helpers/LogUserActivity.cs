using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Extension;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc.Filters;

namespace API.Helpers
{
    public class LogUserActivity : IAsyncActionFilter
    {
        ///// ทำการเก็ย log ว่า user คนไหนที่ทำการล็อคอินเข้ามา เวลาไหนวันไหน 
        ///// โดยผ่านการใช้ method OnActionExecutionAsync ซึ่งจะเกิดแน่ๆตอน login 
        ////  เพราะมีการ call async action อยู่ จึงทำให้เก็บค่าวันเวลาของ user คนนั้นๆล่าสุดได้

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            /// next() คือค่าที่จะเกิดขึ้นหลังการ execute task หรือบ้างสิ่งไปแล้ว
            var resultContext = await next();
            /// check ว่า User ที่ login มี token หรือไม่ ถ้าไม่มีก็ return กลับไปเฉยๆไม่ทำอะไร
            if (!resultContext.HttpContext.User.Identity.IsAuthenticated) return;

            /// ถ้า User มี token
            var userId = resultContext.HttpContext.User.GetUserId();
            var repo = resultContext.HttpContext.RequestServices.GetService<IUserRepository>();
            var user = await repo.GetUsersByIdAsync(userId);
            user.LastActive = DateTime.Now;
            repo.Update(user);
            await repo.SaveAllAsync();
        }
    }
}