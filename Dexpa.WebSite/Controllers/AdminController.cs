using System;
using System.Collections;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Security;
using System.Security.Cryptography.X509Certificates;
using System.Security.Policy;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Helpers;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using System.Web.UI;
using Dexpa.WebSite.Helpers;
using Dexpa.WebSite.Models;
using Dexpa.WebSite.Models.Reports;
using iTextSharp.text;
using Newtonsoft.Json;
using System.Linq.Dynamic;

namespace Dexpa.WebSite.Controllers
{
    [Authorize(Roles = "Администратор, Механик, Диспетчер, Кассир, Тех.поддержка")]
    public class AdminController : BasicCustomController
    {
        private const string EXPORT_ERROR_MESSAGE = "Нельзя экспортировать пустой отчет";
        //
        // GET: /Admin/
        [Authorize(Roles = "Администратор, Тех.поддержка")]
        public ActionResult Index()
        {
            return View();
        }

        [Authorize(Roles = "Администратор, Тех.поддержка")]
        public ActionResult WorkingConditions()
        {
            return View();
        }

        [Authorize(Roles = "Администратор, Тех.поддержка")]
        public ActionResult AddWorkCondition()
        {
            return View();
        }

        [Authorize(Roles = "Администратор, Тех.поддержка")]
        public ActionResult EditWorkCondition(string id)
        {
            ViewData["id"] = id;
            return View();
        }

        [Authorize(Roles = "Администратор, Диспетчер, Тех.поддержка")]
        public ActionResult Tariffs()
        {
            return View();
        }

        [Authorize(Roles = "Администратор, Тех.поддержка")]
        public ActionResult RobotHistory(string fromDate = null, string toDate = null)
        {
            return View();
        }

        [Authorize(Roles = "Администратор, Тех.поддержка")]
        public ActionResult AddTarif()
        {
            return View();
        }

        [Authorize(Roles = "Администратор, Тех.поддержка, Диспетчер")]
        public ActionResult EditTarif(string id)
        {
            ViewData["id"] = id;
            return View();
        }

        [Authorize(Roles = "Администратор, Диспетчер, Кассир, Тех.поддержка")]
        public ActionResult DriversReport(string fromDate=null, string toDate=null, long? driverId=null, long? workConditionsId=null)
        {
            return View();
        }

        public ActionResult DriverTimeReport(string fromDate = null, string toDate = null, long? driverId=null)
        {
            return View();
        }

        [Authorize(Roles = "Администратор, Кассир, Диспетчер, Тех.поддержка")]
        public ActionResult OrdersReport(string fromDate=null, string toDate=null)
        {
            return View();
        }

        [Authorize(Roles = "Администратор, Кассир, Диспетчер, Тех.поддержка")]
        public ActionResult AllOrdersReport(string fromDate = null, string toDate = null, long? driverId=null, long? type=null, long? source = null)
        {
            return View();
        }

        [Authorize(Roles = "Администратор, Кассир, Диспетчер, Тех.поддержка")]
        public ActionResult DispatchersReport()
        {
            return View();
        }

        [Authorize(Roles = "Администратор, Кассир, Диспетчер, Тех.поддержка")]
        public ActionResult OrganizationOrdersReport()
        {
            return View();
        }

        [Authorize(Roles = "Администратор, Кассир, Диспетчер, Тех.поддержка")]
        public ActionResult YandexOrdersReport(string fromDate= null, string toDate = null, long? driverId = null)
        {
            return View();
        }
        
        [Authorize(Roles = "Администратор")]
        public ActionResult RatingReport()
        {
            return View();
        }

        [Authorize(Roles = "Администратор, Механик, Тех.поддержка")]
        public ActionResult Tracks()
        {
            return View();
        }

        [Authorize(Roles = "Администратор, Механик, Тех.поддержка")]
        public ActionResult NewTracks()
        {
            return View();
        }

        [Authorize(Roles = "Администратор, Тех.поддержка")]
        public async Task<JsonResult> GetUsers()
        {
            var model = new AdminViewModel();
            model.UsersList = new List<UserRow>();

            using (var context = new ApplicationDbContext())
            {
                var usrs = context.Users.ToList();
                foreach (var user in usrs)
                {
                    var role = user.Roles.FirstOrDefault();
                    if (role != null && role.Role.Name == "Водитель")
                    {
                        continue;
                    }

                    var u = new UserRow
                    {
                        Role = role != null ? role.Role.Name : string.Empty,
                        UserName = user.UserName,
                        LastName = user.LastName,
                        Name = user.Name,
                        MiddleName = user.MiddleName,
                        PhoneNumber = user.PhoneNumber,
                        Email = user.Email,
                        HasAccess = user.HasAccess,
                        Id = user.Id,
                    };
                    model.UsersList.Add(u);
                }
                return Json(model.UsersList, JsonRequestBehavior.AllowGet);
            }
        }

        [Authorize(Roles = "Администратор, Тех.поддержка")]
        public JsonResult GetRoles()
        {
            using (var context = new ApplicationDbContext())
            {
                var roles = context.Roles.Where(r => r.Name != "Водитель").ToList();
                return Json(roles, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public void ExportOrderReport(string type, string dateFrom, string dateTo, string token, string sortColumn = null, string sortDirection = null)
        {
            var api = ConfigurationManager.AppSettings["ApiServer"];
            string url = api + "Report/GetOrdersReport?dateFrom=" + dateFrom + "&dateTo=" + dateTo;
            //string json = GetJSON(url, token);

            List<OrderReport> orderReport = GetData<OrderReport>(url, token);

            orderReport = SortReport(orderReport, sortColumn, sortDirection);

            string reportName = "Отчет по заказам";

            var from = FormatDate(dateFrom);
            var to = FormatDate(dateTo);

            var subHeader = "за период: " + from + " по " + to;

            var fileName = "OrderReport";

            MemoryStream output = null;
            if (orderReport.Count > 0)
            {
                DownloadFile(type, output, fileName, orderReport, reportName, subHeader, null);
            }
            else
            {
                Response.Write(EXPORT_ERROR_MESSAGE);
            }

            //return File(output, contentType);
        }

        [HttpGet]
        public void ExportAllOrdersReport(string type, string dateFrom, string dateTo, string token, string stateType = null, string sourceType = null, string driverId = null, string sortColumn = null, string sortDirection=null)
        {
            var api = ConfigurationManager.AppSettings["ApiServer"];

            var stateQuery = stateType != null ? ("&state=" + stateType) : "";
            var sourceQuery = sourceType != null ? "&source=" + sourceType : "";
            var driverQuery = driverId != null ? ("&driverId=" + driverId) : "";

            string url = api + "Report/GetAllOrdersReport?dateTimeFrom=" + dateFrom + "&dateTimeTo=" + dateTo + driverQuery + stateQuery + sourceQuery;
            string reportName = "Отчет по всем заказам";

            List<AllOrdersReport> allOrdersReport = GetData<AllOrdersReport>(url, token);

            allOrdersReport = SortReport(allOrdersReport, sortColumn, sortDirection);

            List<string> SkipFieldsList = new List<string>();
            SkipFieldsList.Add("State");
            SkipFieldsList.Add("Customer");
            SkipFieldsList.Add("Driver");
            SkipFieldsList.Add("Source");

            for (int i = 0; i < allOrdersReport.Count; i++)
            {
                allOrdersReport[i].CustomerNamePhone = allOrdersReport[i].Customer != null
                    ? (allOrdersReport[i].Customer.Name + " " + allOrdersReport[i].Customer.Phone)
                    : "";
                allOrdersReport[i].DriverCallsignPhone = allOrdersReport[i].Driver != null
                    ? (allOrdersReport[i].Driver.Callsign + " " + allOrdersReport[i].Driver.Phones[0])
                    : "";
                allOrdersReport[i].StateName = allOrdersReport[i].State.Name;
                allOrdersReport[i].SourceName = allOrdersReport[i].Source.Name;

                allOrdersReport[i].DepartureDate = allOrdersReport[i].DepartureDate != null
                    ? FormatDateTime(allOrdersReport[i].DepartureDate)
                    : "";
                allOrdersReport[i].StartWaitTime = allOrdersReport[i].StartWaitTime != null
                    ? FormatTime(allOrdersReport[i].StartWaitTime)
                    : "";
                allOrdersReport[i].AcceptTime = allOrdersReport[i].AcceptTime != null
                    ? FormatTime(allOrdersReport[i].AcceptTime)
                    : "";
            }

            var from = FormatDate(dateFrom);
            var to = FormatDate(dateTo);

            var subHeader = "за период: " + from + " по " + to;

            var fileName = "AllOrdersReport";

            MemoryStream output = null;
            if (allOrdersReport.Count > 0)
            {
                DownloadFile(type, output, fileName, allOrdersReport, reportName, subHeader, SkipFieldsList);
            }
            else
            {
                Response.Write(EXPORT_ERROR_MESSAGE);
            }
        }

        [HttpGet]
        public void ExportDriverReport(string type, string dateFrom, string dateTo, string token, long? driver = null, long? workConditions = null, string sortColumn = null, string sortDirection=null)
        {
            var api = ConfigurationManager.AppSettings["ApiServer"];
            string url = api + "Report/GetDriversReport?dateTimeFrom=" + dateFrom + "&dateTimeTo=" + dateTo + "&driverId=" + driver + "&workConditionsId=" + workConditions;
            string reportName = "Отчет по водителям";

            List<DriverReport> driverReport = GetData<DriverReport>(url, token);

            driverReport = SortReport(driverReport, sortColumn, sortDirection);

            List<string> SkipFieldsList = new List<string>();
            SkipFieldsList.Add("Orders");

            var from = FormatDate(dateFrom);
            var to = FormatDate(dateTo);

            var subHeader = "за период: " + from + " по " + to;

            var fileName = "DriverReport";

            MemoryStream output = null;
            if (driverReport.Count > 0)
            {
                DownloadFile(type, output, fileName, driverReport, reportName, subHeader, SkipFieldsList);
            }
            else
            {
                Response.Write(EXPORT_ERROR_MESSAGE);
            }

            //return File(output, contentType);
        }

        [HttpGet]
        public void ExportOrganizationOrderReport(string type, string token, string sortColumn = null, string sortDirection = null)
        {
            var api = ConfigurationManager.AppSettings["ApiServer"];
            string url = api + "Report/GetOrganizationOrdersReport";
            //string json = GetJSON(url);

            List<OrganizationOrderReport> orderReport = GetData<OrganizationOrderReport>(url, token);

            orderReport = SortReport(orderReport, sortColumn, sortDirection);

            List<string> SkipFieldsList = new List<string>();
            SkipFieldsList.Add("OrderState");

            for (int i = 0; i < orderReport.Count; i++)
            {
                orderReport[i].OrderStateName = orderReport[i].OrderState.Name;
            }

            string reportName = "Отчет по заказам";

            var subHeader = "Юридические лица";

            var fileName = "OrderReport";

            MemoryStream output = null;
            if (orderReport.Count > 0)
            {
                DownloadFile(type, output, fileName, orderReport, reportName, subHeader, SkipFieldsList);
            }
            else
            {
                Response.Write(EXPORT_ERROR_MESSAGE);
            }

            //return File(output, contentType);
        }

        [HttpGet]
        public void ExportDriverTimeReport(string type, string fromDate, string toDate, string token, long? driverId, string sortColumn = null, string sortDirection = null)
        {
            var api = ConfigurationManager.AppSettings["ApiServer"];
            string url = api + "Report/GetDriverTimeReport?dateFrom="+fromDate+"&dateTo="+toDate+"&driverId="+driverId;

            List<DriverTimeReport> driverTimeReport = null;
            List<DriverTimeReportByDriver> driverTimeReportByDriver = null;

            if (driverId == null)
            {
                driverTimeReport = GetData<DriverTimeReport>(url, token);
                for (int i = 0; i < driverTimeReport.Count; i++)
                {
                    if (driverTimeReport[i].FreeTime == 0 && driverTimeReport[i].OnOrderTime == 0)
                    {
                        driverTimeReport[i].Efficiency = "-";
                    }
                    driverTimeReport[i].OnlineTime = Math.Round(driverTimeReport[i].OnlineTime, 1);
                    driverTimeReport[i].OnOrderTime = Math.Round(driverTimeReport[i].OnOrderTime, 1);
                    driverTimeReport[i].BusyTime = Math.Round(driverTimeReport[i].BusyTime, 1);
                    driverTimeReport[i].FreeTime = Math.Round(driverTimeReport[i].FreeTime, 1);
                }
                driverTimeReport = SortReport(driverTimeReport, sortColumn, sortDirection);
            }
            else
            {
                driverTimeReportByDriver = GetData<DriverTimeReportByDriver>(url, token);
                for (int i = 0; i < driverTimeReportByDriver.Count; i++)
                {
                    if (driverTimeReportByDriver[i].FreeTime == 0 && driverTimeReportByDriver[i].OnOrderTime == 0)
                    {
                        driverTimeReportByDriver[i].Efficiency = "-";
                    }
                    driverTimeReportByDriver[i].OnlineTime = Math.Round(driverTimeReportByDriver[i].OnlineTime, 1);
                    driverTimeReportByDriver[i].OnOrderTime = Math.Round(driverTimeReportByDriver[i].OnOrderTime, 1);
                    driverTimeReportByDriver[i].BusyTime = Math.Round(driverTimeReportByDriver[i].BusyTime, 1);
                    driverTimeReportByDriver[i].FreeTime = Math.Round(driverTimeReportByDriver[i].FreeTime, 1);
                    driverTimeReportByDriver[i].Date = FormatDate(driverTimeReportByDriver[i].Date);
                }
                driverTimeReportByDriver = SortReport(driverTimeReportByDriver, sortColumn, sortDirection);
            }


            List<string> SkipFieldsList = new List<string>();
            SkipFieldsList.Add("Time");

            string reportName = "Отчет по времени водителя";

            var subHeader = "";

            var fileName = "DriverTimeReport";

            MemoryStream output = null;
            if (driverId == null)
            {
                if (driverTimeReport.Count > 0)
                {
                    DownloadFile(type, output, fileName, driverTimeReport, reportName, subHeader, SkipFieldsList);
                }
                else
                {
                    Response.Write(EXPORT_ERROR_MESSAGE);
                }
            }
            else
            {
                if(driverTimeReportByDriver.Count>0)
                {
                    DownloadFile(type, output, fileName, driverTimeReportByDriver, reportName, subHeader, SkipFieldsList);
                }
                else
                {
                    Response.Write(EXPORT_ERROR_MESSAGE);
                }
            }
        }

        private string GetJSON(string url, string token)
        {
            /*
             * Fix from StackOverFlow http://stackoverflow.com/a/1386568
             */
            ServicePointManager.ServerCertificateValidationCallback =
                delegate(object s, X509Certificate certificate, X509Chain chain, SslPolicyErrors sslPolicyErrors)
                {
                    return true;
                };
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
            request.Headers.Add("Authorization", token);
            HttpWebResponse response = (HttpWebResponse)request.GetResponse();

            string json = null;

            using (StreamReader reader = new StreamReader(response.GetResponseStream(), Encoding.UTF8))
            {
                json = reader.ReadToEnd();
            }
            return json;
        }

        private List<T> GetData<T>(string url, string token)
        {
            string json = GetJSON(url, token);

            List<T> report = JsonConvert.DeserializeObject<List<T>>(json);
            return report;
        }

        private string FormatDate(string date)
        {
            var dateBuffer = date.Split('T');
            var resultDate = dateBuffer[0].Split('-');
            return resultDate[2] + "." + resultDate[1] + "." + resultDate[0];
        }

        private string FormatDateTime(string date)
        {
            var dateBuffer = date.Split('T');
            var resultDate = dateBuffer[0].Split('-');
            var resultTime = dateBuffer[1].Substring(0, dateBuffer[1].LastIndexOf(':'));
            return resultDate[2] + "." + resultDate[1] + "." + resultDate[0] + " " + resultTime;
        }

        private string FormatTime(string date)
        {
            var dateBuffer = date.Split('T');
            var resultTime = dateBuffer[1].Substring(0, dateBuffer[1].LastIndexOf(':'));
            return resultTime;
        }

        private void DownloadFile<T>(string type, MemoryStream output, string fileName, IEnumerable<T> data, string reportName, string subHeader, List<string> SkipFieldsList = null)
        {
            var contentType = "";
            switch (type)
            {
                case "PDF":
                    ExportToPDF exportToPDF = new ExportToPDF();
                    output = exportToPDF.CreatePDF(reportName, subHeader, true, data, SkipFieldsList);
                    fileName = fileName + ".pdf";
                    contentType = "application/pdf";
                    break;
                case "Excel":
                    ExportToExcel exportToExcel = new ExportToExcel();
                    fileName = fileName + ".xlsx";
                    contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                    output = exportToExcel.CreateExcel(fileName, reportName, subHeader, data,
                        SkipFieldsList);
                    break;
            }
            Response.AddHeader("Content-Type", contentType);
            Response.AddHeader("Content-Disposition", "attachment;filename=" + fileName);
            Response.OutputStream.Write(output.ToArray(), 0, (int)output.Length);
            Response.End();
        }

        private List<T> SortReport<T>(List<T> data,string sortColumn, string sortDirection)
        {
            if (sortColumn != null && sortDirection != null)
            {
                switch (sortDirection)
                {
                    case "ASC":
                        data = data.OrderBy(sortColumn, SortDirection.Ascending).ToList();
                        break;
                    case "DESC":
                        var prop = typeof (T).GetProperty(sortColumn);
                        data = data.OrderByDescending(x => prop.GetValue(x, null)).ToList();
                        break;
                }
            }
            return data;
        }
    }
}