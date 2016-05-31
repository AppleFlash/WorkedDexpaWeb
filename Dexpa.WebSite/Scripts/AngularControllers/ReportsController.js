DexpaApp.controller('ReportsCtrl', ['$scope', '$controller', '$filter', function ($scope, $http, $filter) {

    getOrderStates();
    getWorkConditions();
    getOrderSources();

    initialization("driver"); //dropdownPanel events initialization

    $scope.yearList = [];

    $scope.filterOrderState = {
        name: "Завершен",
        type: 5
    };

    $scope.filterOrderSource = null;

    $scope.todoFunction = null;

    $scope.queryParams = [];

    $scope.init = function (report) {
        var toDate = new Date();
        var year = toDate.getFullYear();
        var month = toDate.getMonth();
        var day = toDate.getDate();
        toDate = moment().format("YYYY-MM-DDTHH:mm:ss");
        var fromDate = new Date(moment([year, month, day]).subtract("days", 1));
        fromDate = moment(fromDate).format("YYYY-MM-DDTHH:mm:ss");
        jQuery('#filterFromDate').val(fromDate);
        jQuery('#filterToDate').val(toDate);
        $scope.getDrivers();
        $scope.driverQuery = "-";
        dropdownHide("driver");
        switch (report) {
            case "drivers":
                $scope.queryParams = GetBrowserHistory();

                if ($scope.queryParams.length != 0) {
                    for (var i = 0; i < $scope.queryParams.length; i++) {
                        switch ($scope.queryParams[i].text) {
                            case "fromDate":
                                fromDate = $scope.queryParams[i].value;
                                break;
                            case "toDate":
                                toDate = $scope.queryParams[i].value;
                                break;
                            case "driverId":
                                $scope.selectedDriverId = $scope.queryParams[i].value;
                                break;
                            case "workConditionsId":
                                $scope.workConditionId = $scope.queryParams[i].value;
                                break;
                            default:
                        }
                    }
                }
                $scope.datapickerInit(fromDate, toDate);
                $scope.getDriversReport(fromDate, toDate);
                $scope.todoFunction = $scope.DriverReportDriverSelector;
                break;
            case "orders":
                $scope.filterMonthFrom = 1;
                $scope.filterMonthTo = 12;
                var year = new Date();
                $scope.filterYear = year.getFullYear();
                for (var i = 2010; i < 2021; i++) {
                    $scope.yearList.push(i);
                }
                var fromDate = new Date();
                fromDate = moment([fromDate.getFullYear(), "00", "01"]).format("YYYY-MM-DDTHH:mm:ss");
                var toDate = new Date();
                toDate = moment([toDate.getFullYear(), "11", "01"]).format("YYYY-MM-DDTHH:mm:ss");

                $scope.queryParams = GetBrowserHistory();

                if ($scope.queryParams.length != 0) {
                    for (var i = 0; i < $scope.queryParams.length; i++) {
                        switch ($scope.queryParams[i].text) {
                            case "fromDate":
                                fromDate = $scope.queryParams[i].value;
                                $scope.exportFromDate = fromDate;
                                break;
                            case "toDate":
                                toDate = $scope.queryParams[i].value;
                                $scope.exportToDate = toDate;
                                break;
                            default:
                        }
                    }
                }

                $scope.filterYear = $scope.exportFromDate.split('T');
                $scope.filterYear = $scope.filterYear[0].split('-');
                $scope.filterYear = $scope.filterYear[0];

                $scope.filterMonthFrom = $scope.exportFromDate.split('T');
                $scope.filterMonthFrom = $scope.filterMonthFrom[0].split('-');
                $scope.filterMonthFrom = parseInt($scope.filterMonthFrom[1]);

                $scope.filterMonthTo = $scope.exportToDate.split('T');
                $scope.filterMonthTo = $scope.filterMonthTo[0].split('-');
                $scope.filterMonthTo = parseInt($scope.filterMonthTo[1]);

                if ($scope.queryParams.length == 0) {
                    var param = [];

                    param[0] = { text: "fromDate", value: fromDate };
                    param[1] = { text: "toDate", value: toDate };

                    $scope.queryParams = param;

                    AddBrowserHistory(param);
                }

                $scope.getOrdersReport(fromDate, toDate);
                break;
            case "dispatchers":
                $scope.getDispatchersReport();
                break;
            case "allOrders":

                $scope.queryParams = GetBrowserHistory();

                var fromDate, toDate;

                if ($scope.queryParams.length != 0) {
                    for (var i = 0; i < $scope.queryParams.length; i++) {
                        switch ($scope.queryParams[i].text) {
                            case "fromDate":
                                fromDate = $scope.queryParams[i].value;
                                break;
                            case "toDate":
                                toDate = $scope.queryParams[i].value;
                                break;
                            case "driverId":
                                $scope.selectedDriverId = $scope.queryParams[i].value;
                                if ($scope.selectedDriverId == "null") {
                                    $scope.selectedDriver = null;
                                } else {
                                    $scope.selectedDriver = { id: $scope.selectedDriverId };
                                }
                                break;
                            case "type":
                                $scope.filterOrderState = { type: $scope.queryParams[i].value };
                                break;
                            case "source":
                                $scope.filterOrderSource = { source: $scope.queryParams[i].value };
                                break;
                            default:
                        }
                    }
                }

                $scope.datapickerInit(fromDate, toDate);
                $scope.getAllOrdersReport(fromDate, toDate, $scope.selectedDriver, $scope.filterOrderState, $scope.filterOrderSource);
                $scope.todoFunction = $scope.AllOrdersDriverSelector;
                break;

            case "organizationsOrders":
                $scope.getOrganizationsOrders();
                break;
            case "yandex-orders":
                $scope.getDrivers();
                $("#loader").hide();
                $("#main_part").show();
                var datetimepickerOptions = {
                    lang: 'ru',
                    format: 'd.m.Y H:i',
                    dayOfWeekStart: 1,
                    validateOnBlur: false,
                    mask: true,
                    onChangeDateTime: function () {
                        $scope.fromDate = jQuery('#filterFromDate').val();
                        $scope.toDate = jQuery('#filterToDate').val();

                        if ($scope.queryParams.length != 0) {
                            for (var i = 0; i < $scope.queryParams.length; i++) {
                                if ($scope.queryParams[i].text == "fromDate") {
                                    $scope.queryParams[i].value = $scope.fromDate;
                                }
                                if ($scope.queryParams[i].text == "toDate") {
                                    $scope.queryParams[i].value = $scope.toDate;
                                }
                            }
                            AddBrowserHistory($scope.queryParams);
                        }

                        $scope.getYandexReport();
                    }
                };
                jQuery('#filterFromDate').datetimepicker(datetimepickerOptions);
                jQuery('#filterToDate').datetimepicker(datetimepickerOptions);

                $scope.queryParams = GetBrowserHistory();

                if ($scope.queryParams.length != 0) {
                    for (var i = 0; i < $scope.queryParams.length; i++) {
                        switch ($scope.queryParams[i].text) {
                            case "fromDate":
                                $scope.fromDate = $scope.queryParams[i].value.replace('%20',' ');
                                break;
                            case "toDate":
                                $scope.toDate = $scope.queryParams[i].value.replace('%20', ' ');
                                break;
                            case "driverId":
                                $scope.selectedDriverId = parseInt($scope.queryParams[i].value);
                                break;
                            default:
                        }
                    }
                }

                if ($scope.queryParams.length == 0) {
                    var toDate = new Date();
                    var year = toDate.getFullYear();
                    var month = toDate.getMonth();
                    var day = toDate.getDate();
                    $scope.fromDate = moment([year, month, day]).subtract("days", 1).format('DD.MM.YYYY HH:mm');
                    $scope.toDate = moment([year, month, day]).add("days", 1).format('DD.MM.YYYY HH:mm');
                    $scope.selectedDriverId = null;

                    $scope.queryParams.push({ text: "fromDate", value: $scope.fromDate });
                    $scope.queryParams.push({ text: "toDate", value: $scope.toDate });
                    $scope.queryParams.push({ text: "driverId", value: $scope.selectedDriverId });

                    AddBrowserHistory($scope.queryParams);

                }
                $scope.driver = "-";
                $scope.getYandexReport();
                $scope.todoFunction = $scope.YandexReportDriverSelector;
                break;

            case "driver-time":

                $scope.queryParams = GetBrowserHistory();

                if ($scope.queryParams.length != 0) {
                    for (var i = 0; i < $scope.queryParams.length; i++) {
                        switch ($scope.queryParams[i].text) {
                        case "fromDate":
                            $scope.fromDate = $scope.queryParams[i].value;
                            break;
                        case "toDate":
                            $scope.toDate = $scope.queryParams[i].value;
                            break;
                        case "driverId":
                            $scope.selectedDriverId = parseInt($scope.queryParams[i].value);
                            break;
                        default:
                        }
                    }
                } else {
                    var toDate = new Date();
                    var year = toDate.getFullYear();
                    var month = toDate.getMonth();
                    var day = toDate.getDate();
                    $scope.fromDate = moment([year, month, day]).format('DD.MM.YYYY');
                    $scope.toDate = moment([year, month, day]).add("days", 1).format('DD.MM.YYYY');

                    $scope.queryParams.push({ text: "fromDate", value: $scope.fromDate });
                    $scope.queryParams.push({ text: "toDate", value: $scope.toDate });
                    AddBrowserHistory($scope.queryParams);
                }

                var datetimepickerOptions = {
                    lang: 'ru',
                    format: 'd.m.Y',
                    dayOfWeekStart: 1,
                    validateOnBlur: false,
                    mask: true,
                    onSelectDate: function () {
                        $scope.fromDate = jQuery('#filterFromDate').val();
                        $scope.toDate = jQuery('#filterToDate').val();

                        if ($scope.queryParams.length != 0) {
                            for (var i = 0; i < $scope.queryParams.length; i++) {
                                if ($scope.queryParams[i].text == "fromDate") {
                                    $scope.queryParams[i].value = $scope.fromDate;
                                }
                                if ($scope.queryParams[i].text == "toDate") {
                                    $scope.queryParams[i].value = $scope.toDate;
                                }
                            }

                            AddBrowserHistory($scope.queryParams);
                        }

                        $scope.getDriverTimeReport();
                    }
                };
                jQuery('#filterFromDate').datetimepicker(datetimepickerOptions);
                jQuery('#filterToDate').datetimepicker(datetimepickerOptions);
                
                $scope.getDriverTimeReport();
                $scope.todoFunction = $scope.DriverTimeReportDriverSelector;
                break;
            case "rating":
                $scope.getRatingReport();
                break;
            default:
        }
    };

    $scope.getRatingReport = function () {
        var url = ApiServerUrl + "report/GetRatingReport";
        if ($scope.selectedDriver != null) {
            url += "?driverId=" + $scope.selectedDriverId;
        }
        $.ajax({
            url: url,
            method: 'GET',
            headers: GetHeaders()
        }).success(function(data) {
            $scope.reports = data;
            $scope.$apply();
            $("#loader").hide();
            $("#main_part").show();
        }).error(function(msg) {
            console.error(msg);
            showNotification('danger', "Ошибка при получении данных");
        });
    };

    $scope.getDriverTimeReport = function() {
        var fromDate = formatDate($scope.fromDate);
        var toDate = formatDate($scope.toDate);
        if ($scope.selectedDriver == null) {
            $scope.firstColumnName = "Водитель";
            $scope.secondColumnName = "Среднее время в сутки, часов";
        } else {
            $scope.firstColumnName = "Дата";
            $scope.secondColumnName = "Время, часов";
        }
        $.ajax({
            url: ApiServerUrl + "report/GetDriverTimeReport?dateFrom=" + fromDate + "&dateTo=" + toDate + "&driverId=" + $scope.selectedDriverId,
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            if ($scope.selectedDriver == null) {
                for (var i = 0; i < data.length; i++) {
                    data[i].firstColumn = data[i].driverName;
                }
            } else {
                for (var i = 0; i < data.length; i++) {
                    data[i].firstColumn = dateToNormal(data[i].date);
                }
            }
            for (var i = 0; i < data.length; i++) {
                if (data[i].freeTime == 0 && data[i].onOrderTime == 0) {
                    data[i].efficiency = "-";
                }
            }
            $scope.reports = data;
            $scope.$apply();
            $("#loader").hide();
            $("#main_part").show();
        }).error(function(msg) {
            console.log(msg);
            showNotification('danger', "Ошибка при получении данных");
        });
    };

    function dateToNormal(date) {
        if (date != null) {
            var bufferDate = date.split('T');
            bufferDate = bufferDate[0].split('-');
            return bufferDate[2] + "." + bufferDate[1] + "." + bufferDate[0];
        }
        return "";
    }

    $scope.datapickerInit = function (fromDate, toDate) {

        if ($scope.queryParams.length == 0) {
            var param = [];

            param[0] = { text: "fromDate", value: fromDate };
            param[1] = { text: "toDate", value: toDate };

            $scope.queryParams = param;

            AddBrowserHistory(param);
        }

        $scope.fromDate = moment(fromDate).format("DD.MM.YYYY");
        $scope.toDate = moment(toDate).format("DD.MM.YYYY");
        var datetimepickerOptions = {
            lang: 'ru',
            format: 'd.m.Y',
            dayOfWeekStart: 1,
            timepicker: false,
            validateOnBlur: false,
            mask: true,
            onSelectDate: function() {
                fromDate = $("#filterFromDate").val();
                toDate = $("#filterToDate").val();
                if (fromDate != "") {
                    fromDate = fromDate.split('.');
                    fromDate = fromDate[2].trim() + "-" + fromDate[1] + "-" + fromDate[0];
                    toDate = toDate.split('.');
                    toDate = toDate[2] + "-" + toDate[1] + "-" + toDate[0];

                    if ($scope.queryParams.length != 0) {
                        for (var i = 0; i < $scope.queryParams.length; i++) {
                            if ($scope.queryParams[i].text == "fromDate") {
                                $scope.queryParams[i].value = fromDate;
                            }
                            if ($scope.queryParams[i].text == "toDate") {
                                $scope.queryParams[i].value = toDate;
                            }
                        }
                        AddBrowserHistory($scope.queryParams);
                    }
                }
                console.log(fromDate + " - " + toDate);
            }
        };
        jQuery('#filterFromDate').datetimepicker(datetimepickerOptions);
        jQuery('#filterToDate').datetimepicker(datetimepickerOptions);

        jQuery('#searchFromDate').datetimepicker(datetimepickerOptions);
        jQuery('#searchToDate').datetimepicker(datetimepickerOptions);
    };

    $scope.reports = [];

    $scope.getYandexReport = function () {
        $("#reportLoader").show();
        $scope.reports = [];
        var dateFrom = formatDateTime($scope.fromDate);
        var dateTo = formatDateTime($scope.toDate);
        var urlData = {
            driverId: $scope.selectedDriverId,
            dateTimeFrom:dateFrom,
            dateTimeTo: dateTo
        };
        $.ajax({
            url: ApiServerUrl + 'report/GetYandexOrdersReport',
            method: 'GET',
            data: urlData,
            headers: GetHeaders()
        }).success(function (data) {
            $scope.reports = [];
            $scope.reports.push(data);
            $scope.$apply();
            $("#reportLoader").hide();
        }).error(function (msg) {
            $("#reportLoader").hide();
            console.error(msg);
            showNotification('danger', "Ошибка при получении данных");
        });
    };

    function formatDateTime(date) {
        if (date != null) {
            date = date.split(' ');
            var bufferDate = date[0].split('.');
            bufferDate = bufferDate[2] + "-" + bufferDate[1] + "-" + bufferDate[0];
            return bufferDate + "T" + date[1];
        }
    }

    function formatDate(date) {
        if (date != null) {
            var date = date.split('.');
            return date[2] + "-" + date[1] + "-" + date[0];
        }
    }


    $scope.getDriversReport = function (fromDate, toDate) {
        //$scope.selectedWorkCondition = "Все";
        $scope.reports = [];
        $("#loader").show();
        var url = ApiServerUrl + 'report/GetDriversReport?dateTimeFrom=' + fromDate + '&dateTimeTo=' + toDate;
        if ($scope.selectedDriverId != null) {
            url += "&driverId=" + $scope.selectedDriverId;
        }
        if ($scope.workConditionId != null) {
            url += "&workConditionsId=" + $scope.workConditionId;
        }
        $.ajax({
            url: url,
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.driverCount = data.length;
            $scope.allAmount = 0;
            $scope.rentAmount = 0;
            $scope.techSupportAmount = 0;
            $scope.taxometrAmount = 0;
            $scope.allOrdersCount = 0;
            $scope.doneOrdersCount = 0;
            $scope.clientCanceledOrdersCount = 0;
            $scope.driverCanceledOrdersCount = 0;
            for (var i = 0; i < data.length; i++) {
                $scope.allAmount += parseFloat(data[i].amount);
                $scope.rentAmount += parseFloat(data[i].rent);
                $scope.techSupportAmount += parseFloat(data[i].techSupport);
                $scope.taxometrAmount += parseFloat(data[i].taxometrAmount);
                $scope.allOrdersCount += parseInt(data[i].allOrders);
                $scope.doneOrdersCount += parseInt(data[i].doneOrders);
                $scope.clientCanceledOrdersCount += parseInt(data[i].clientCanceled);
                $scope.driverCanceledOrdersCount += parseInt(data[i].driverCanceled);
            }
            $scope.reports = data;
            $scope.$apply();
            $("#loader").hide();
            $("#main_part").show();
        }).error(function (msg) {
            console.log(msg);
            showNotification('danger', "Ошибка при получении данных");
        });
    };

    $scope.formatWC = function(wc) {
        return wc.name;
    }

    $scope.goTo = function (pageURI, id) {
        location.href = pageURI + id;
    };

    $scope.getAllOrdersReport = function (fromDate, toDate, driver, state, source) {
        $scope.reports = [];
        $("#loader").show();
        var driverQuery = "";
        if (driver != null)
            driverQuery = '&driverId=' + driver.id;

        var stateQuery = "";
        if (state != null && state.type != 999)
            stateQuery = '&state=' + state.type;

        var sourceQuery = "";
        if (source !=null && source.source != 999)
            sourceQuery = '&source=' + source.source;

        var completeOnly = '&completeOnly=true';

        $.ajax({
            url: ApiServerUrl + 'report/AllOrdersReport/Light?dateTimeFrom=' + fromDate + '&dateTimeTo=' + toDate + driverQuery + stateQuery + sourceQuery + completeOnly,
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.reports = formatOrdersReport(data);
            $scope.$apply();

            $("#loader").hide();
            $("#main_part").show();
        }).error(function (msg) {
            console.log(msg);
            showNotification('danger', "Ошибка при получении данных");
        });
    };

    function formatOrdersReport(data) {
        for (var i = 0; i < data.length; i++) {
            data[i].customer = {
                name: data[i].cutomerName,
                phone: data[i].customerPhone
            };
            data[i].driver = {
                name: data[i].driverName,
                callsign: data[i].driverCallsign,
                phones: data[i].driverPhone
            };

            for (var j = 0; j < $scope.orderStatesList.length; j++) {
                if (data[i].state == $scope.orderStatesList[j].type) {

                    data[i].driverApproved = false;

                    var oState = data[i].state;
                    if (oState == 3 || oState == 4 || oState == 2 || oState == 5 || oState == 7 || oState == 8) {
                        data[i].driverApproved = true;
                    }

                    data[i].state = {
                        name: $scope.orderStatesList[j].name,
                        type: $scope.orderStatesList[j].type
                    };
                }
            }
        }
        return data;
    }

    $scope.getOrdersReport = function (fromDate, toDate) {
        $scope.exportFromDate = fromDate;
        $scope.exportToDate = toDate;
        console.log(ApiServerUrl + 'report/GetOrdersReport?dateFrom=' + fromDate + "&dateTo=" + toDate);
        $.ajax({
            url: ApiServerUrl + 'report/GetOrdersReport?dateFrom=' + fromDate + "&dateTo=" + toDate,
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.reports = data;
            $scope.$apply();
            $("#loader").hide();
            $("#main_part").show();
        }).error(function (msg) {
            console.log(msg);
            showNotification('danger', "Ошибка при получении данных");
        });
    };

    $scope.getDispatchersReport = function () {
        $.ajax({
            url: ApiServerUrl + 'report/GetDispatcherReport',
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.reports = data;
            $scope.$apply();
            $("#loader").hide();
            $("#main_part").show();
        }).error(function (msg) {
            console.log(msg);
            showNotification('danger', "Ошибка при получении данных");
        });
    };
    
    $scope.getOrganizationsOrders = function() {
        $.ajax({
            url: ApiServerUrl + 'report/GetOrganizationOrdersReport',
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.reports = data;
            $scope.$apply();
            $("#loader").hide();
            $("#main_part").show();
        }).error(function (msg) {
            console.log(msg);
            showNotification('danger', "Ошибка при получении данных");
        });
    };


    /*START SORTING*/

    $scope.sortColumn = null;
    $scope.sortDirection = null;

    $scope.sortBy = function (predicate) {
        var orderBy = $filter('orderBy');
        sortingInitialisation($scope.reports, orderBy);
        $scope.reports = sortBy(predicate);
        $scope.sortColumn = predicate.charAt(0).toUpperCase() + predicate.substr(1);
        $scope.sortDirection = getSortDirection();
    };

    /*END SORTING*/

    $scope.drivers = [];

    $scope.getDrivers = function () {
        $.ajax({
            url: ApiServerUrl + 'Drivers/SimpleDriversList',
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.drivers = data;
            $scope.driverQuery = "";
            $("#driver").val("");
            $scope.$apply();
            dropdownLoaderHide();
            KeysNavigation("driver", "driverDropDownPanel", $scope.todoFunction);
        }).error(function (msg) {
            console.error(msg);
        });
    };

    $scope.DriverTimeReportDriverSelector = function(item) {
        var driver = null;
        if (item.attributes["driverId"] != undefined) {
            var id = item.attributes["driverId"].value;
            driver = $scope.getDriverById(id);
            $scope.selectDriver(driver, true);
            $scope.getDriverTimeReport();
        }
    };

    $scope.YandexReportDriverSelector = function(item) {
        var driver = null;
        if (item.attributes["driverId"] != undefined) {
            var id = item.attributes["driverId"].value;
            driver = $scope.getDriverById(id);
            $scope.selectDriver(driver, true);
            $scope.getYandexReport();
        }
    };

    $scope.AllOrdersDriverSelector = function(item) {
        var driver = null;
        if (item.attributes["driverId"] != undefined) {
            var id = item.attributes["driverId"].value;
            driver = $scope.getDriverById(id);
            $scope.filterAllOrderReport(driver, true);
        }
    };

    $scope.DriverReportDriverSelector = function (item) {
        var driver = null;
        if (item.attributes["driverId"] != undefined) {
            var id = item.attributes["driverId"].value;
            driver = $scope.getDriverById(id);
            $scope.getReportByDriver(driver, true);
        }
    };

    $scope.getDriverById = function (id) {
        var driver = null;
        if (id == null) {
            driver = undefined;
        } else {
            for (var i = 0; i < $scope.drivers.length; i++) {
                if ($scope.drivers[i].id == id) {
                    driver = $scope.drivers[i];
                }
            }
        }
        return driver;
    };

    $scope.selectedDriver = null;
    $scope.selectedDriverId = null;

    $scope.selectDriver = function (driver, isDriverChange) {
        if (isDriverChange) {
            if (driver == undefined) {
                $scope.selectedDriver = null;
                $scope.selectedDriverId = null;
                $scope.driverQuery = "-";
                $("#driver").val("-");
            } else {
                $scope.selectedDriver = driver;
                $scope.selectedDriverId = driver.id;
                $("#driver").val($scope.selectedDriver.name);
            }

            var driverIdFound = false;
            var index = null;
            for (var i = 0; i < $scope.queryParams.length; i++) {
                index = i;
                if ($scope.queryParams[i].text == "driverId") {
                    driverIdFound = true;
                    break;
                }
            }
            if (driverIdFound) {
                if (driver != undefined) {
                    $scope.queryParams[index].value = driver.id;
                } else {
                    $scope.queryParams[index].value = null;
                }
            } else {
                if (driver != undefined) {
                    $scope.queryParams.push({ text: "driverId", value: driver.id });
                } else {
                    $scope.queryParams.push({ text: "driverId", value: null });
                }
            }
            AddBrowserHistory($scope.queryParams);

            dropdownHide("driver");
        }
    };

    $scope.oldReport = [];

    $scope.getReportByDriver = function (driver, isDriverChange) {
        $scope.selectDriver(driver, isDriverChange);

        var fromDate = $("#filterFromDate").val();
        var toDate = $("#filterToDate").val();
        fromDate = fromDate.split('.');
        fromDate = fromDate[2].trim() + "-" + fromDate[1] + "-" + fromDate[0];
        toDate = toDate.split('.');
        toDate = toDate[2] + "-" + toDate[1] + "-" + toDate[0];
        $scope.getDriversReport(fromDate, toDate);
        /*if (driver == null) {
            if ($scope.oldReport.length != 0) {
                $scope.reports = $scope.oldReport;
                $("#driver").val("");
                showDropDown = false;
                dropdownHide("driver");
                $("#driver").val("Все");
            }
        } else {
            if ($scope.oldReport.length == 0) {
                $scope.oldReport = $scope.reports;
            } else {
                $scope.reports = $scope.oldReport;
            }
            var reports = [];
            $scope.selectDriver(driver, false);
            driver = $("#driver").val();
            console.log(driver);
            driver = driver.split('-');
            driver = driver[1].trim();
            for (var i = 0; i < $scope.reports.length; i++) {
                var report = $scope.reports[i];
                var name = report.driverName;
                if (driver == name) {
                    reports.push(report);
                }
            }
            $scope.reports = [];
            $scope.reports = reports;
            console.log($scope.reports);
        }*/
    };

    $scope.workConditions = [];

    function getWorkConditions() {
        $.ajax({
            url: ApiServerUrl + 'DriverWorkConditions',
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.workConditions = data;
            $scope.selectedWorkCondition = 'Все';
            $scope.workConditions.unshift({ name: 'Все' });
            $scope.$apply();
        }).error(function (msg) {
            console.error(msg);
        });
    };

    $scope.orderSourcesList = [];

    function getOrderSources() {
        $.ajax({
            url: ApiServerUrl + 'helpdictionaries/OrdersSources',
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.orderSourcesList.push({
                source: 999,
                name: "Все"
            });
            $scope.orderSourcesList = $scope.orderSourcesList.concat(data);
            $scope.filterOrderSource = $scope.orderSourcesList[0];
            $scope.$apply();
        }).error(function (msg) {
            console.error(msg);
        });
    };

    $scope.orderStatesList = [];
    
    function getOrderStates() {
        $.ajax({
            url: ApiServerUrl + 'helpdictionaries/OrdersStates',
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.orderStatesList.push({
                type: 999,
                name: "Все"
            });
            $scope.orderStatesList = $scope.orderStatesList.concat(data);
            $scope.$apply();
        }).error(function (msg) {
            console.error(msg);
        });
    };

    $scope.getDriversReportDate = function() {
        var fromDate = $("#filterFromDate").val();
        var toDate = $("#filterToDate").val();
        fromDate = fromDate.split('.');
        fromDate = fromDate[2].trim() + "-" + fromDate[1] + "-" + fromDate[0];
        toDate = toDate.split('.');
        toDate = toDate[2] + "-" + toDate[1] + "-" + toDate[0];
        $scope.getDriversReport(fromDate, toDate);
    }

    $scope.oldReports = [];

    $scope.workCondition = null;
    $scope.workConditionId = null;

    $scope.filterByWC = function () {
        console.log($scope.selectedWorkCondition);
        if ($scope.selectedWorkCondition==null) {
            $scope.workConditionId = null;
        } else {
            //for (var i = 0; i < $scope.workConditions.length; i++) {
            //    if ($scope.selectedWorkCondition == $scope.workConditions[i].name) {
            //        $scope.workConditionId = $scope.workConditions[i].id;
            //    }
            //}
            $scope.workConditionId = $scope.selectedWorkCondition.id;
        }

        var wcIdFound = false;
        var index = null;
        for (var i = 0; i < $scope.queryParams.length; i++) {
            index = i;
            if ($scope.queryParams[i].text == "workConditionsId") {
                wcIdFound = true;
                break;
            }
        }
        if (wcIdFound) {
            if ($scope.selectedWorkCondition != null) {
                $scope.queryParams[index].value = $scope.selectedWorkCondition.id;
            } else {
                $scope.queryParams[index].value = null;
            }
        } else {
            if ($scope.selectedWorkCondition.id != null) {
                $scope.queryParams.push({ text: "workConditionsId", value: $scope.selectedWorkCondition.id });
            } else {
                $scope.queryParams.push({ text: "workConditionsId", value: null });
            }
        }
        AddBrowserHistory($scope.queryParams);

        var fromDate = $("#filterFromDate").val();
        var toDate = $("#filterToDate").val();
        
        if ($scope.queryParams.length != 0) {
            for (var i = 0; i < $scope.queryParams.length; i++) {
                switch ($scope.queryParams[i].text) {
                    case "fromDate":
                        fromDate = $scope.queryParams[i].value;
                        break;
                    case "toDate":
                        toDate = $scope.queryParams[i].value;
                        break;
                    default:
                }
            }
        }

        $scope.getDriversReport(fromDate, toDate);
        //if ($scope.selectedWorkCondition == "Все") {
        //    if ($scope.oldReports.length != 0) {
        //        $scope.reports = $scope.oldReports;
        //    }
        //} else {
        //    if ($scope.oldReports.length == 0) {
        //        $scope.oldReports = $scope.reports;
        //    } else {
        //        $scope.reports = $scope.oldReports;
        //    }
        //    var reports = [];
        //    for (var i = 0; i < $scope.reports.length; i++) {
        //        var report = $scope.reports[i];
        //        var workConditions = report.driverWorkConditions;
        //        console.log(workConditions);
        //        console.log($scope.selectedWorkCondition);
        //        if ($scope.selectedWorkCondition == workConditions) {
        //            reports.push(report);
        //        }
        //    }
        //    $scope.reports = [];
        //    $scope.reports = reports;
        //}
        //console.log($scope.oldWC);
        //console.log($scope.workConditions);
    };

    $scope.filterOrderReport = function (type) {
        var year = $scope.filterYear;
        var monthFrom = $scope.filterMonthFrom;
        monthFrom--;
        var monthTo = $scope.filterMonthTo;
        monthTo--;
        var fromDate = moment([year, monthFrom, "01"]).format("YYYY-MM-DDTHH:mm:ss");
        var toDate = moment([year, monthTo, "01"]).format("YYYY-MM-DDTHH:mm:ss");
        $scope.exportFromDate = fromDate;
        $scope.exportToDate = toDate;

        if ($scope.queryParams.length != 0) {

            for (var i = 0; i < $scope.queryParams.length; i++) {
                if ($scope.queryParams[i].text == "fromDate") {
                    $scope.queryParams[i].value = fromDate;
                }
                if ($scope.queryParams[i].text == "toDate") {
                    $scope.queryParams[i].value = toDate;
                }
            }

            AddBrowserHistory($scope.queryParams);

        }

        $scope.getOrdersReport(fromDate, toDate);
    };

    $scope.filterAllOrderReport = function(driver, isDriverChange) {
        $scope.selectDriver(driver, isDriverChange);

        var orderStateFound = false;
        var orderSourceFound = false;

        var orderStateIndex = 0;
        var orderSourceIndex = 0;

        for (var i = 0; i < $scope.queryParams.length; i++) {

            if ($scope.queryParams[i].text == "type") {
                orderStateIndex = i;
                orderStateFound = true;
                continue;
            }

            if ($scope.queryParams[i].text == "source") {
                orderSourceIndex = i;
                orderSourceFound = true;
                continue;
            }

        }

        if (orderStateFound) {
            $scope.queryParams[orderStateIndex].value = $scope.filterOrderState.type;
        } else {
            $scope.queryParams.push({ text: "type", value: $scope.filterOrderState.type });
        }

        if (orderSourceFound) {
            $scope.queryParams[orderSourceIndex].value = $scope.filterOrderSource.source;
        } else {
            $scope.queryParams.push({ text: "source", value: $scope.filterOrderSource.source });
        }

        AddBrowserHistory($scope.queryParams);

        if (jQuery('#filterToDate').val() == "" || jQuery('#filterToDate').val() == "") {
            var toDate = new Date();
            var year = toDate.getFullYear();
            var month = toDate.getMonth();
            var day = toDate.getDate();
            toDate = moment().format("YYYY-MM-DDTHH:mm:ss");
            var fromDate = new Date(moment([year, month, day]).subtract("days", 1));
            fromDate = moment(fromDate).format("YYYY-MM-DDTHH:mm:ss");
            jQuery('#filterFromDate').val(convertDateToString(fromDate));
            jQuery('#filterToDate').val(convertDateToString(toDate));
        } else {
            toDate = convertStringToDate(jQuery('#filterToDate').val());
            toDate = moment(toDate).format("YYYY-MM-DDTHH:mm:ss");
            fromDate = convertStringToDate(jQuery('#filterFromDate').val());
            fromDate = moment(fromDate).format("YYYY-MM-DDTHH:mm:ss");
        }

        var fromDate = jQuery('#filterFromDate').val();
        if (fromDate != "") {
            fromDate = fromDate.split('.');
            fromDate = fromDate[2] + '-' + fromDate[1] + '-' + fromDate[0];
        }

        $scope.getAllOrdersReport(fromDate, toDate, $scope.selectedDriver, $scope.filterOrderState, $scope.filterOrderSource);
    };

    function convertStringToDate(currentDate) {
        currentDate = currentDate.split('.');
        currentDate = new Date(currentDate[2], currentDate[1], currentDate[0]);
        return currentDate.setMonth(currentDate.getMonth() - 1);
    }

    function convertDateToString(currentDate) {
        currentDate = currentDate.split('-');
        return currentDate[2].split('T')[0] + "." + currentDate[1] + "." + currentDate[0];
    }

    $scope.exportOrderURL = "";
    $scope.exportDriverURL = "";
    $scope.exportAllOrderURL = "";
    $scope.exportFromDate = "";
    $scope.exportToDate = "";
    $scope.exportConvertOrderDate = false;

    $scope.Export = function (type, reportType) {
        var token = GetHeaders().Authorization;
        var url;
        switch (reportType) {
            case 'orders':
                /*if (!$scope.exportConvertOrderDate) {
                    $scope.exportFromDate = moment($scope.exportFromDate).format("YYYY-DD-MMTHH:mm:ss");
                    $scope.exportToDate = moment($scope.exportToDate).format("YYYY-DD-MMTHH:mm:ss");
                    $scope.exportConvertOrderDate = true;
                }*/
                url = $scope.exportOrderURL = "/Admin/ExportOrderReport?Type=" + type + "&dateFrom=" + $scope.exportFromDate + "&dateTo=" + $scope.exportToDate + "&token=" + token;
                if ($scope.sortColumn != null && $scope.sortDirection != null) {
                    url += "&sortColumn=" + $scope.sortColumn + "&sortDirection=" + $scope.sortDirection;
                }
                break;
            case 'drivers':
                var fromDate = $("#filterFromDate").val();
                var toDate = $("#filterToDate").val();
                fromDate = fromDate.split('.');
                fromDate = fromDate[2].trim() + "-" + fromDate[1] + "-" + fromDate[0];
                toDate = toDate.split('.');
                toDate = toDate[2] + "-" + toDate[1] + "-" + toDate[0];

                //var driver = $("#driver").val();
                //var WC = $scope.selectedWorkCondition;
                //if (driver != null && driver != "-" && driver != "") {
                //    driver = driver.split('-');
                //    driver = driver[1].trim();
                //    $scope.exportDriverURL = '/Admin/ExportDriverReport?Type=' + type + '&dateFrom=' + fromDate + "&dateTo=" + toDate + "&driver=" + driver;
                //} else {
                //    $scope.exportDriverURL = '/Admin/ExportDriverReport?Type=' + type + '&dateFrom=' + fromDate + "&dateTo=" + toDate;
                //}
                //if (WC != null && WC != "Все" && WC != "") {
                //    $scope.exportDriverURL = '/Admin/ExportDriverReport?Type=' + type + '&dateFrom=' + fromDate + "&dateTo=" + toDate + "&workConditions=" + WC;
                //}
                //if (driver != null && driver != "Все" && driver != "" && WC != null && WC != "Все" && WC != "") {
                //    $scope.exportDriverURL = '/Admin/ExportDriverReport?Type=' + type + '&dateFrom=' + fromDate + "&dateTo=" + toDate + "&driver=" + driver + "&workConditions=" + WC;
                //}
                $scope.exportDriverURL = '/Admin/ExportDriverReport?Type=' + type + '&dateFrom=' + fromDate + "&dateTo=" + toDate + "&driver=" + $scope.selectedDriverId + "&workConditions=" + $scope.workConditionId + "&token=" + token;
                if ($scope.sortColumn != null && $scope.sortDirection != null) {
                    $scope.exportDriverURL += "&sortColumn=" + $scope.sortColumn + "&sortDirection=" + $scope.sortDirection;
                }
                url = $scope.exportDriverURL;
                break;
            case 'allOrders':
                var fromDate = $("#filterFromDate").val();
                var toDate = $("#filterToDate").val();
                fromDate = fromDate.split('.');
                fromDate = fromDate[2].trim() + "-" + fromDate[1] + "-" + fromDate[0];
                toDate = toDate.split('.');
                toDate = toDate[2] + "-" + toDate[1] + "-" + toDate[0];

                var driverQuery = "";
                if ($scope.selectedDriver != null)
                    driverQuery = '&driverId=' + $scope.selectedDriver.id;

                var stateQuery = "";
                if ($scope.filterOrderState != null && $scope.filterOrderState.type != 999)
                    stateQuery = '&stateType=' + $scope.filterOrderState.type;

                var sourceQuery = "";
                if ($scope.filterOrderSource != null && $scope.filterOrderSource.source != 999)
                    sourceQuery = '&sourceType=' + $scope.filterOrderSource.source;

                $scope.exportAllOrderURL = '/Admin/ExportAllOrdersReport?Type=' + type + '&dateFrom=' + fromDate + "&dateTo=" + toDate + driverQuery + stateQuery + sourceQuery + "&token=" + token;

                if ($scope.sortColumn != null && $scope.sortDirection != null) {
                    $scope.exportAllOrderURL += "&sortColumn=" + $scope.sortColumn + "&sortDirection=" + $scope.sortDirection;
                }

                url = $scope.exportAllOrderURL;
                break;
            case 'organizationOrders':
                url = "/Admin/ExportOrganizationOrderReport?Type=" + type + "&token=" + token;
                break;
            case 'driver-time':
                var fromDate = $("#filterFromDate").val();
                var toDate = $("#filterToDate").val();
                fromDate = fromDate.split('.');
                fromDate = fromDate[2].trim() + "-" + fromDate[1] + "-" + fromDate[0];
                toDate = toDate.split('.');
                toDate = toDate[2] + "-" + toDate[1] + "-" + toDate[0];
                url = "/Admin/ExportDriverTimeReport?type=" + type + "&fromDate=" + fromDate + "&toDate=" + toDate;
                if ($scope.selectDriver != null) {
                    url += "&driverId=" + $scope.selectedDriverId;
                }
                url += "&token=" + token;
                if ($scope.sortColumn != null && $scope.sortDirection != null) {
                    url += "&sortColumn=" + $scope.sortColumn + "&sortDirection=" + $scope.sortDirection;
                }
                break;
            default:
        }
        window.open(url);
    };

    $scope.convertDateTime = function (date) {
        if (date !== undefined && date !== null) {
            var bufDate = date.split('T');
            var bufTime = bufDate[1];
            bufDate = bufDate[0].split('-');
            date = bufDate[2] + "." + bufDate[1] + "." + bufDate[0] + " " + bufTime;
            return date;
        }
    };

    $scope.convertTime = function(time) {
        if (time !== undefined && time !== null) {
            var bufDate = time.split('T');
            var bufTime = bufDate[1].split(':');
            bufTime = new Date(0, 0, 0, bufTime[0], bufTime[1], bufTime[2]);
            bufTime = (bufTime.getHours() < 10 ? "0" + bufTime.getHours() : bufTime.getHours()) + ":" + (bufTime.getMinutes() < 10 ? "0" + bufTime.getMinutes() : bufTime.getMinutes()) + ":" + (bufTime.getSeconds() < 10 ? "0" + bufTime.getSeconds() : bufTime.getSeconds());
            time = bufTime;
            return time;
        }
    };

    //---------Orders Search----------------
    var isSearch = false;
    $("#searchPanel").hide();

    $scope.searchObj = {
        orderId: "",
        cusPhone: "",
        fromAddr:""
    };

    $scope.openCloseSearchPanel = function() {
        if (isSearch) {
            isSearch = false;
            $("#filterPanel").show(200);
            $("#searchPanel").hide(200);
            $scope.filterAllOrderReport();
        } else {
            isSearch = true;
            $("#searchPanel").show(200);
            $("#filterPanel").hide(200);
            $scope.searchAllOrderReport();
        }
    }

    $scope.searchAllOrderReport = function() {
        if (jQuery('#searchFromDate').val() == "" || jQuery('#searchToDate').val() == "") {
            var toDate = new Date();
            var year = toDate.getFullYear();
            var month = toDate.getMonth();
            var day = toDate.getDate();
            toDate = moment().format("YYYY-MM-DDTHH:mm:ss");
            var fromDate = new Date(moment([year, month, day]).subtract("days", 1));
            fromDate = moment(fromDate).format("YYYY-MM-DDTHH:mm:ss");
            jQuery('#searchFromDate').val(convertDateToString(fromDate));
            jQuery('#searchToDate').val(convertDateToString(toDate));
        } else {
            toDate = convertStringToDate(jQuery('#searchToDate').val());
            toDate = moment(toDate).format("YYYY-MM-DDTHH:mm:ss");
            fromDate = convertStringToDate(jQuery('#searchFromDate').val());
            fromDate = moment(fromDate).format("YYYY-MM-DDTHH:mm:ss");
        }

        $scope.searchObj.dateTimeFrom = fromDate;
        $scope.searchObj.dateTimeTo = toDate;

        $scope.reports = [];

        $("#loader").show();

        $.ajax({
            url: ApiServerUrl + "report/SearchOrdersReport/Light",
            method: 'POST',
            data: $scope.searchObj,
            headers: GetHeaders()
        }).success(function (data) {
            $scope.reports = formatOrdersReport(data);
            $scope.$apply();

            $("#loader").hide();
        }).error(function (msg) {
            $("#loader").hide();
            console.log(msg);
            showNotification('danger', "Ошибка при получении данных");
        });
    }

    //--------------------------------------
}]);