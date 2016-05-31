using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Dexpa.WebSite.Controllers
{
    public class TransactionsController : Controller
    {
        //
        // GET: /Transactions/
        [Authorize(Roles = "Администратор, Кассир, Тех.поддержка")]
        public ActionResult Index(string fromDate = null, string toDate = null, long? driverId = null)
        {
            return View();
        }

        [Authorize(Roles = "Администратор, Кассир, Тех.поддержка")]
        public ActionResult AddTransaction(string id=null, string driver=null)
        {
            ViewData["id"] = id ?? "";
            ViewData["driverId"] = driver ?? "";
            return View();
        }

        [Authorize(Roles = "Администратор, Кассир, Тех.поддержка")]
        public ActionResult Driver(string id, string fromDate=null, string toDate = null)
        {
            ViewData["id"] = id ?? "";
            return View();
        }
	}
}