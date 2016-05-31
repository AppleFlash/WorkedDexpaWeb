using Dexpa.WebSite.Models;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;

namespace Dexpa.WebSite.Migrations
{
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Migrations;
    using System.Linq;

    internal sealed class Configuration : DbMigrationsConfiguration<Dexpa.WebSite.Models.ApplicationDbContext>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = false;
            ContextKey = "Dexpa.WebSite.Models.ApplicationDbContext";
        }

        protected override void Seed(Dexpa.WebSite.Models.ApplicationDbContext context)
        {
            var roleStore = new RoleStore<IdentityRole>(context);
            var roleManager = new RoleManager<IdentityRole>(roleStore);
            var store = new UserStore<User>(context);
            var userManager = new UserManager<User>(store);

            if (!context.Roles.Any(r => r.Name == "�������������"))
            {
                roleManager.Create(new IdentityRole { Name = "�������������" });
            }

            if (!context.Roles.Any(r => r.Name == "������"))
            {
                roleManager.Create(new IdentityRole { Name = "������" });
            }

            if (!context.Roles.Any(r => r.Name == "���������"))
            {
                roleManager.Create(new IdentityRole { Name = "���������" });
            }

            if (!context.Roles.Any(r => r.Name == "���.���������"))
            {
                roleManager.Create(new IdentityRole { Name = "���.���������" });
            }

            if (!context.Roles.Any(r => r.Name == "�������"))
            {
                roleManager.Create(new IdentityRole { Name = "�������" });
            }

            if (!context.Roles.Any(r => r.Name == "��������"))
            {
                roleManager.Create(new IdentityRole { Name = "��������" });
            }

            if (!context.Users.Any(u => u.UserName == "admin"))
            {
                var user = new User
                {
                    UserName = "admin",
                    LastName = "",
                    Name = "",
                    MiddleName = "",
                    PhoneNumber = "",
                    Email = "",
                    HasAccess = true
                };

                userManager.Create(user, "123456");
                userManager.AddToRole(user.Id, "�������������");
            }

        }
    }
}
