﻿DexpaApp.controller('WayBillsCtrl', function ($scope, $http, $filter) {

    $scope.queryParams = [];

    $scope.init = function () {
        initialization("driver");
        initialization("cars");

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
                        $scope.selectedDriverId = $scope.queryParams[i].value;
                        break;
                    case "carId":
                        $scope.selectedCarId = $scope.queryParams[i].value;
                        break;
                    default:
                }
            }
        }

        $scope.driverToDoFunction = $scope.wayBillsDriverSelector;
        $scope.carToDoFunction = $scope.wayBillsCarSelector;

        $scope.datepickerInit();
        $scope.getDrivers();
        $scope.getCars();
        $scope.getWayBills();
        getUsers();

        $scope.driverQuery = "-";
        dropdownHide("driver");
        dropdownHide("cars");

        $("#loader").hide();
        $("#main_part").show();

    };

    $scope.driverToDoFunction;
    $scope.carToDoFunction;

    $scope.initActive = function() {
        initialization("driver");
        initialization("cars");

        $scope.driverToDoFunction = $scope.activeWayBillsDriverSelector;
        $scope.carToDoFunction = $scope.activeWayBillsCarSelector;

        $scope.datepickerInit();
        $scope.getDrivers();
        $scope.getCars();
        $scope.getActiveWayBills();
        getUsers();

        $scope.driverQuery = "-";
        dropdownHide("driver");
        dropdownHide("cars");

        $("#loader").hide();
        $("#main_part").show();
    };

    $scope.datepickerInit = function() {

        if ($scope.queryParams.length == 0) {

            var fromDate = new Date();
            var year = fromDate.getFullYear();
            var month = fromDate.getMonth();
            var day = fromDate.getDate();
            fromDate = moment().format("YYYY-MM-DDTHH:mm:ss");
            var toDate = new Date(moment([year, month, day]).add("days", 1));
            toDate = moment(toDate).format("YYYY-MM-DDTHH:mm:ss");

            $scope.fromDate = moment(fromDate).format("DD.MM.YYYY");
            $scope.toDate = moment(toDate).format("DD.MM.YYYY");

            var param = [];

            param[0] = { text: "fromDate", value: $scope.fromDate };
            param[1] = { text: "toDate", value: $scope.toDate };

            $scope.queryParams = param;

            AddBrowserHistory(param);
        }

        var datetimepickerOptions = {
            lang: 'ru',
            format: 'd.m.Y',
            dayOfWeekStart: 1,
            timepicker: false,
            validateOnBlur: false,
            mask: true,
            onSelectDate: function() {
                $scope.fromDate = $("#filterFromDate").val();
                $scope.toDate = $("#filterToDate").val();

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

                $scope.getWayBills();
            }
        };
        jQuery('#filterFromDate').datetimepicker(datetimepickerOptions);
        jQuery('#filterToDate').datetimepicker(datetimepickerOptions);

    };

    $scope.users = [];

    function getUsers() {
        $http.get("/WayBills/GetUsers").success(function (data) {
            $scope.users = data;
        }).error(function (msg) {
            showNotification('danger', "Ошибка при получении данных");
            console.error(msg);
        });
    }

    $scope.drivers = [];

    $scope.getDrivers = function() {
        $.ajax({
            url: ApiServerUrl + "Drivers/OnlineDrivers",
            method: 'GET',
            headers: GetHeaders()
        }).success(function(data) {
            $scope.drivers = data;
            $scope.$apply();
            $scope.driverKeysNavigation = KeysNavigation("driver", "driverDropDownPanel", $scope.driverToDoFunction);
            $scope.driverKeysNavigation;
        }).error(function(msg) {
            console.error(msg);
            showNotification('danger', "Ошибка при загрузке списка водителей");
        });
    };

    $scope.cars = [];

    $scope.getCars = function () {
        $.ajax({
            url: ApiServerUrl + "car",
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.cars = data;
            $scope.$apply();
            $scope.carKeysNavigation = KeysNavigation("cars", "carDropDownPanel", $scope.carToDoFunction);
        }).error(function (msg) {
            console.error(msg);
            showNotification('danger', "Ошибка при загрузке списка машин");
        });
    };

    $scope.driverKeysNavigation;
    $scope.carKeysNavigation;

    $scope.wayBillsDriverSelector = function(item) {
        var driver = null;
        if (item.attributes["driverId"] != undefined) {
            var id = item.attributes["driverId"].value;
            driver = $scope.getDriverById(id);
            $scope.filterByDriver(driver);
            $scope.getWayBills();
            $("#driver").blur();
            dropdownHide("driver");
        }
    };

    $scope.wayBillsCarSelector = function(item) {
        var car = null;
        if (item.attributes["carId"] != undefined) {
            var id = item.attributes["carId"].value;
            car = $scope.getCarById(id);
            $scope.filterByCar(car);
            $scope.getWayBills();
            $("#cars").blur();
            dropdownHide("cars");
        }
    };

    $scope.activeWayBillsDriverSelector = function (item) {
        var driver = null;
        if (item.attributes["driverId"] != undefined) {
            var id = item.attributes["driverId"].value;
            driver = $scope.getDriverById(id);
            $scope.filterByDriver(driver);
            $scope.getActiveWayBills();
            $("#driver").blur();
            dropdownHide("driver");
        }
    };

    $scope.activeWayBillsCarSelector = function (item) {
        var car = null;
        if (item.attributes["carId"] != undefined) {
            var id = item.attributes["carId"].value;
            car = $scope.getCarById(id);
            $scope.filterByCar(car);
            $scope.getActiveWayBills();
            $("#cars").blur();
            dropdownHide("cars");
        }
    };

    $scope.addWayBillsDriverSelector = function (item) {
        var driver = null;
        if (item.attributes["driverId"] != undefined) {
            var id = item.attributes["driverId"].value;
            driver = $scope.getDriverById(id);
            $scope.filterByDriver(driver);
            $scope.getMaxPeriodForDriver();
            $("#driver").blur();
            dropdownHide("driver");
        }
    };

    $scope.addWayBillsCarSelector = function (item) {
        var car = null;
        if (item.attributes["carId"] != undefined) {
            var id = item.attributes["carId"].value;
            car = $scope.getCarById(id);
            $scope.filterByCar(car);
            $("#cars").blur();
            dropdownHide("cars");
        }
    };

    $scope.getDriverById = function (id) {
        var driver = null;
        if (id == null) {
            driver = null;
        } else {
            for (var i = 0; i < $scope.drivers.length; i++) {
                if ($scope.drivers[i].id == id) {
                    driver = $scope.drivers[i];
                }
            }
        }
        return driver;
    };

    $scope.getCarById = function(id) {
        var car = null;
        if (id == null) {
            car = null;
        } else {
            for (var i = 0; i < $scope.cars.length; i++) {
                if ($scope.cars[i].id == id) {
                    car = $scope.cars[i];
                }
            }
        }
        return car;
    };

    $scope.selectedDriverId = null;
    $scope.selectedCarId = null;
    $scope.isActiveWayBills = false;

    $scope.wayBills = [];

    $scope.getWayBills = function() {
        var url = ApiServerUrl + "WayBills?";
        if ($scope.selectedDriverId != null) {
            url += "driverId=" + $scope.selectedDriverId + "&";
        }
        if ($scope.selectedCarId != null) {
            url += "carId=" + $scope.selectedCarId + "&";
        }
        url += "fromDate=" + convertDateToApiFormat($scope.fromDate) + "&" + "toDate=" + convertDateToApiFormat($scope.toDate) + "&" + "isActive="+$scope.isActiveWayBills;

        $.ajax({
            url: url,
            method: 'GET',
            headers: GetHeaders()
        }).success(function(data) {
            $scope.wayBills = data;
            $scope.$apply();
        }).error(function(msg) {
            console.error(msg);
            showNotification('danger', "Ошибка при загрузке данных");
        });
    };

    $scope.getActiveWayBills = function () {
        $scope.isActiveWayBills = true;
        $scope.getWayBills();
    };

    $scope.getMechanic = function(UserName) {
        for (var i = 0; i < $scope.users.length; i++) {
            var username = $scope.users[i].UserName;
            if (UserName == username) {
                return ($scope.users[i].LastName == null ? " " : $scope.users[i].LastName + " ") + ($scope.users[i].Name[0] == null ? " " : $scope.users[i].Name[0] + ". ") + ($scope.users[i].MiddleName[0] == null ? " " : $scope.users[i].MiddleName[0] + ".");
            }
        }
    };

    $scope.filterByDriver = function(driver) {
        if (driver == null) {
            $scope.selectedDriverId = null;
            //$("#driver").val("-");
            $scope.driver = "";
        } else {
            $scope.selectedDriverId = driver.id;
            $scope.driver = driver.name;
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
            if (driver != null) {
                $scope.queryParams[index].value = driver.id;
            } else {
                $scope.queryParams[index].value = null;
            }
        } else {
            if (driver != null) {
                $scope.queryParams.push({ text: "driverId", value: driver.id });
            } else {
                $scope.queryParams.push({ text: "driverId", value: null });
            }
        }
        AddBrowserHistory($scope.queryParams);
    };

    $scope.filterByCar = function (car) {
        if (car == null) {
            $scope.selectedCarId = null;
            //$("#car").val("-");
            $scope.car = "";
        } else {
            $scope.selectedCarId = car.id;
            $scope.car = "[" + car.callsign + "] - " + car.brand + " " + car.model;
        }
        var carIdFound = false;
        var index = null;
        for (var i = 0; i < $scope.queryParams.length; i++) {
            index = i;
            if ($scope.queryParams[i].text == "carId") {
                carIdFound = true;
                break;
            }
        }
        if (carIdFound) {
            if (car != null) {
                $scope.queryParams[index].value = car.id;
            } else {
                $scope.queryParams[index].value = null;
            }
        } else {
            if (car != null) {
                $scope.queryParams.push({ text: "carId", value: car.id });
            } else {
                $scope.queryParams.push({ text: "carId", value: null });
            }
        }
        AddBrowserHistory($scope.queryParams);
    };

    function convertDateToApiFormat(date) {
        date = date.split('.');
        return date[2] + "-" + date[1] + "-" + date[0];
    }

    function convertDateTimeToApiFormat(date) {
        date = date.split(' ');
        date[0] = date[0].split('.');
        return date[0][2] + "-" + date[0][1] + "-" + date[0][0] + 'T' + date[1];
    }

    $scope.initAddWayBills = function() {
        initialization("driver");
        initialization("cars");

        $scope.showIndicator(false);

        $scope.getDrivers();
        $scope.getCars();

        $scope.driverQuery = "-";
        dropdownHide("driver");
        dropdownHide("cars");

        $("#loader").hide();
        $("#main_part").show();

        $scope.driverToDoFunction = $scope.addWayBillsDriverSelector;
        $scope.carToDoFunction = $scope.addWayBillsCarSelector;
    };

    $scope.initEditWayBills = function(id) {
        $scope.initAddWayBills();
        $scope.getWayBillsById(id);

        $scope.driverToDoFunction = $scope.addWayBillsDriverSelector;
        $scope.carToDoFunction = $scope.addWayBillsCarSelector;
    };

    $scope.getWayBillsById = function(id) {
        $.ajax({
            url: ApiServerUrl + 'WayBills/' + id,
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.driver = "[" + data.driver.callsign + "] - " + data.driver.lastName + " " + data.driver.firstName + " " + data.driver.middleName;
            $scope.selectedDriverId = data.driver.id;
            $scope.car = "[" + data.car.callsign + "] - " + data.car.brand + " " + data.car.model;
            $scope.selectedCarId = data.car.id;
            $scope.selectedDriverId = data.driver.id;
            $scope.driverMaxPeriod = data.period.toFixed(0);
            DRIVER_MAX_PERIOD = data.maxPeriod.toFixed(0);
            data.fromDate = convertDateTimeToNormalFormat(data.fromDate);
            data.toDate = convertDateTimeToNormalFormat(data.toDate);
            $scope.wayBills = data;
            $scope.$apply();
        }).error(function(msg) {
            console.error(msg);
            showNotification('danger', "Ошибка при загрузке данных");
        });
    };

    $scope.driverMaxPeriod = 0;

    var DRIVER_MAX_PERIOD = 0;

    $scope.getMaxPeriodForDriver = function() {
        $.ajax({
            url: ApiServerUrl + "waybills/drivermaxperiod?driverId=" + $scope.selectedDriverId,
            method: 'GET',
            headers: GetHeaders()
        }).success(function(data) {
            if (data != "Infinity") {
                $scope.driverMaxPeriod = data.toFixed(0);
            } else {
                $scope.driverMaxPeriod = 0;
            }
            DRIVER_MAX_PERIOD = $scope.driverMaxPeriod;
            $scope.$apply();
            $scope.initAddDateTimePicker();
        }).error(function(msg) {
            console.error(msg);
        });
    };

    $scope.checkPeriod = function(wayBills) {
        if (parseInt($scope.driverMaxPeriod) > parseInt(DRIVER_MAX_PERIOD)) {
            showNotification('danger', "Период превышает максимальное значение. Максимальное количество дней: " + DRIVER_MAX_PERIOD);
        } else {
            var fromDate = new Date();
            var year = fromDate.getFullYear();
            var month = fromDate.getMonth();
            var day = fromDate.getDate();
            var toDate = new Date(moment([year, month, day]).add("days", $scope.driverMaxPeriod));
            wayBills.toDate = moment(toDate).format("DD.MM.YYYY HH:mm");
        }
    };

    $scope.initAddDateTimePicker = function() {
        var fromDate = new Date();
        var year = fromDate.getFullYear();
        var month = fromDate.getMonth();
        var day = fromDate.getDate();
        fromDate = moment().format("YYYY-MM-DDTHH:mm:ss");
        var toDate = new Date(moment([year, month, day]).add("days", $scope.driverMaxPeriod));
        toDate = moment(toDate).format("YYYY-MM-DDTHH:mm:ss");

        $scope.wayBills.fromDate = moment(fromDate).format("DD.MM.YYYY HH:mm");
        $scope.wayBills.toDate = moment(toDate).format("DD.MM.YYYY HH:mm");
        $scope.$apply();
        var datetimepickerOptions = {
            lang: 'ru',
            format: 'd.m.Y H:i',
            dayOfWeekStart: 1,
            validateOnBlur: false,
            mask: true
        };
        jQuery('#fromDate').datetimepicker(datetimepickerOptions);
        jQuery('#toDate').datetimepicker(datetimepickerOptions);
    };

    $scope.addWayBills = function (wayBills) {
        var oldWayBills = wayBills;
        wayBills = {};
        for (var property in oldWayBills) {
            console.log(property + " - " + oldWayBills[property]);
            wayBills[property] = oldWayBills[property];
        }
        if (validateForm("addWayBillsForm")) {

            wayBills.fromDate = convertDateTimeToApiFormat(wayBills.fromDate);
            wayBills.toDate = convertDateTimeToApiFormat(wayBills.toDate);

            wayBills.driver = { id: $scope.selectedDriverId };
            wayBills.car = { id: $scope.selectedCarId };
            wayBills.maxPeriod = $scope.driverMaxPeriod;

            wayBills.responsible = $("#wayBillsUsername").val();

            if (wayBills.endMileage == null) {
                wayBills.endMileage = 0;
            }

            $scope.showIndicator(true);

            $.ajax({
                url: ApiServerUrl + 'waybills',
                method: 'POST',
                data: wayBills,
                headers: GetHeaders()
            }).success(function(data) {
                location.href = "/waybills/";
            }).error(function (msg) {
                wayBills.fromDate = convertDateTimeToNormalFormat(wayBills.fromDate);
                wayBills.toDate = convertDateTimeToNormalFormat(wayBills.toDate);
                showNotification('danger', 'Ошибка при отправке');
                console.error(msg);
                $scope.showIndicator(false);
                $scope.$apply();
            });

        }
    };

    $scope.editWayBills = function (wayBills, id) {
        var oldWayBills = wayBills;
        wayBills = {};
        for (var property in oldWayBills) {
            console.log(property + " - " + oldWayBills[property]);
            wayBills[property] = oldWayBills[property];
        }
        if (validateForm("addWayBillsForm")) {

            wayBills.fromDate = convertDateTimeToApiFormat(wayBills.fromDate);
            wayBills.toDate = convertDateTimeToApiFormat(wayBills.toDate);

            wayBills.driver = { id: $scope.selectedDriverId };
            wayBills.car = { id: $scope.selectedCarId };

            wayBills.maxPeriod = DRIVER_MAX_PERIOD;

            wayBills.responsible = $("#wayBillsUsername").val();

            $scope.showIndicator(true);

            $.ajax({
                url: ApiServerUrl + 'waybills/' + id,
                method: 'PUT',
                data: wayBills,
                headers: GetHeaders()
            }).success(function (data) {
                location.href = "/waybills/";
            }).error(function (msg) {
                wayBills.fromDate = convertDateTimeToNormalFormat(wayBills.fromDate);
                wayBills.toDate = convertDateTimeToNormalFormat(wayBills.toDate);
                showNotification('danger', 'Ошибка при отправке');
                console.error(msg);
                $scope.showIndicator(false);
                $scope.$apply();
            });

        }
    };


    $scope.initPrintPage = function(id) {
        jQuery("#mainmenu").remove();
        jQuery("#ip_phone_widget_button").remove();
        jQuery("#ip_phone").remove();
        $scope.getWayBillsById(id);
        getUsers();
    };

    $scope.convertDateTimeToNormalFormat = function(date) {
        return convertDateTimeToNormalFormat(date);
    };

    function convertDateTimeToNormalFormat(date) {
        date = date.split('T');
        date[0] = date[0].split('-');
        return date[0][2] + "." + date[0][1] + "." + date[0][0] + " " + date[1];
    }

    $scope.isVisible = false;
    $scope.isDisabled = false;

    $scope.showIndicator = function(state) {
        $scope.isVisible = state;
        $scope.isDisabled = state;
    };

    $scope.selectedWayBillId = 0;

    $scope.selectWayBills = function(wayBill) {
        $scope.selectedWayBillId = wayBill.id;
    };

    $scope.selectedEvent = {};

    $scope.selectEvent = function(event) {
        $scope.selectedEvent.isSelected = false;

        if ($scope.selectedEvent.id == event.id) {
            $scope.selectedEvent = {};
        } else {
            $scope.selectedEvent = event;
            $scope.selectedEvent.isSelected = true;
            $("#controlButtons").css("display","inline-block");
        }
    };

    $scope.DeletePositiveAnswer = function () {
        var id = $scope.selectedWayBillId;
        $.ajax({
            url: ApiServerUrl + 'waybills/' + id,
            method: 'DELETE',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.getWayBills();
            $('#deleteModal').modal('hide');
            showNotification('success', 'Путевой лист успешно удален');
        }).error(function (msg) {
            console.log(msg);
            showNotification('danger', 'Ошибка при удалении');
        });
    }


    $scope.deleteWayBills = function(id) {
        $scope.selectedWayBillId = id;
        $('#deleteModalLabel').text("Удаление");
        $('#deleteModalText').text("Вы действительно хотите удалить путевой лист?");
        $('#deleteModal').modal();
    };

    $scope.cutTime = function(date) {
        date = date.split(' ');
        return date[0];
    };

    $(document).ready(function() {
        $("body").click(function(event) {
            if (event.target.id != "waybillRowElement" && event.target.id != "controlButton") {
                $scope.selectedEvent.isSelected = false;
                $scope.selectedEvent = {};
                $("#controlButtons").hide();
                $scope.$apply();
            }
        });

    });

});

function printWayBills() {
    jQuery("#pageHeader").remove();
    jQuery(".printHeader").css("margin", "0");
    jQuery(".printTable").css("margin", "0");
    jQuery(".containerWithoutPageHeader").css("overflow", "inherit");
    window.print();
};
