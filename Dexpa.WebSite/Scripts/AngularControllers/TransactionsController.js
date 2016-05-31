﻿DexpaApp.controller('TransactionsCtrl', function ($scope, $http, $filter) {

    $scope.transactions = [];

    var DRIVER = {};


    var DRIVERID = "";
    var OPERATION = "";

    $scope.todoFunction;

    $scope.queryParams = [];

    $scope.init = function (driverId, operation) {
        DRIVERID = driverId;
        OPERATION = operation;

        $scope.queryParams = GetBrowserHistory();

        $scope.getDrivers();
        var fromDate = $scope.getDate("-",3);
        var toDate = $scope.getDate("+", 1);

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
                            $scope.selectedDriverId = null;
                        }
                        break;
                    default:
                }
            }
        }

        if ($scope.selectedDriverId == null) {
            $scope.getTransactions(fromDate, toDate);
        } else {
            $scope.getDriverTransactions(fromDate, toDate, $scope.selectedDriverId);
        }
        initialization("driver"); //dropdownPanel events initialization
        $scope.getBalanceList();
        toDate = $scope.getDate("+", 0);
        $scope.datapickerInit(fromDate, toDate);
        $scope.getTransactionsTypes();
        $scope.getPaymentMethods();
        $scope.getTransactionGroups();
        dropdownHide("driver");
        $("#yesAnswer").bind("click", function() {
            addTransaction();
        });
        $scope.todoFunction = $scope.TransactionDriverSelector;
    };

    $scope.addTranInit = function() {
        $scope.todoFunction = $scope.AddTransactionDriverSelector;
    };

    $scope.datapickerInit = function (fromDate, toDate) {

        if ($scope.queryParams.length == 0) {
            var param = [];

            param[0] = { text: "fromDate", value: fromDate };
            param[1] = { text: "toDate", value: toDate };

            $scope.queryParams = param;

            AddBrowserHistory(param);
        }

        $scope.fromDate = $scope.formattingDate(fromDate, '-');
        $scope.toDate = $scope.formattingDate(toDate, '-');
        var datetimepickerOptions = {
            lang: 'ru',
            format: 'd.m.Y',
            dayOfWeekStart: 1,
            timepicker: false,
            validateOnBlur: false,
            mask: true,
            onSelectDate: function () {
                fromDate = $("#filterFromDate").val();
                toDate = $("#filterToDate").val();
                console.log(toDate);
                fromDate = fromDate.split('.');
                fromDate = fromDate[2].trim() + "-" + fromDate[1] + "-" + fromDate[0];
                toDate = toDate.split('.');
                console.log(toDate);
                toDate = toDate[2].trim() + "-" + toDate[1] + "-" + toDate[0];
                console.log(toDate);

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

                $scope.getTransactions(fromDate, toDate);
            }
        };
        jQuery('#filterFromDate').datetimepicker(datetimepickerOptions);
        jQuery('#filterToDate').datetimepicker(datetimepickerOptions);
        jQuery('#filterDate').datetimepicker({
            lang: 'ru',
            format: 'd.m.Y',
            dayOfWeekStart: 1,
            timepicker: false,
            validateOnBlur: false,
            mask: true,
            onSelectDate: function () {
                var fromDate = $("#filterDate").val();
                fromDate = fromDate.split('.');
                fromDate = fromDate[2].trim() + "-" + fromDate[1] + "-" + fromDate[0];
                var toDate = new Date(fromDate);
                var year = toDate.getFullYear();
                var month = toDate.getMonth();
                month += 1;
                var day = toDate.getDate();
                toDate = year + "-" + (month < 10 ? '0' : '') + month + "-" + (day < 10 ? '0' : '') + day;
                $scope.getTransactions(fromDate, toDate);
            }
        });
    };

    $scope.getTransactions = function (fromDate, toDate) {
        $.ajax({
            url:ApiServerUrl + 'Transaction?fromDate=' + fromDate + '&toDate=' + addDayToStringData(toDate),
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.transactions = [];
            for (var i = data.length - 1; i > -1; i--) {

                var amount = data[i].amount;

                amount = amount.toFixed(2);

                data[i].amount = amount;


                    $scope.transactions.push(data[i]);
            }
            console.log($scope.transactions);

            $scope.$apply();
            $("#loader").hide();
            $("#main_part").show();
        }).error(function (msg) {
            //showModal("Ошибка!", "Ошибка при загрузке данных");
            showNotification('danger', "Ошибка при получении данных");
            console.error(msg);
        });
    };

    function addDayToStringData(oldData) {
        var arr = oldData.split('-');
        var data = new Date(arr[0], arr[1] - 1, arr[2]);
        data.setDate(data.getDate() + 1);
        var day = (parseInt(data.getDate(), 10) < 10) ? ('0' + data.getDate()) : (data.getDate());
        return (data.getFullYear() + "-" + (data.getMonth() + 1)+ "-"+ day);
    }

    $scope.getTransactionsByPeriod = function(period) {
        var fromDate = $scope.getDate("-", period);
        var toDate = $scope.getDate("+", 1);

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

        if ($scope.selectedDriverId == null) {
            $scope.getTransactions(fromDate, toDate);
        } else {
            $scope.getDriverTransactions(fromDate, toDate, driverId);
        }
    };

    $scope.getDate = function(symbol,days) {
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth();
        var day = date.getDate();
        switch (symbol) {
            case '-':
                date = new Date(moment([year, month, day]).subtract("days", days));
                year = date.getFullYear();
                month = date.getMonth();
                month++;
                day = date.getDate();
                break;
            case '+':
                date = new Date(moment([year, month, day]).add("days", days));
                year = date.getFullYear();
                month = date.getMonth();
                month++;
                day = date.getDate();
                break;
            default:
                break;
        }
        return year + "-" + (month < 10 ? '0' : '') + month + "-" + (day < 10 ? '0' : '') + day;
    };

    $scope.selectedTransaction = null;

    $scope.addTransaction = function (transaction) {
        $scope.selectedTransaction = transaction;
        if (transaction.check) {
            addTransaction();
        } else {
            $(".modal-title").text("Внимание!");
            $(".modal-body").text("Вы подтверждаете, что данные введены верно и проверены?");
            $('#checkModal').modal({
                keyboard: false
            });
        }
    };

    function addTransaction() {
        if (validateForm("transactionForm")) {
            var transaction = $scope.selectedTransaction;
            $("#transactionAction").hide();
            transaction.driver = DRIVER;
            transaction.amount = transaction.amount.split(',')[0];
            //var reg = /^\d[0-9]+\d$/;
            var amount = transaction.amount.split(",");
            amount = amount[0];
            console.log(amount);
            //console.log(reg.test(amount));
            console.log(transaction);
            if (amount > 0) {
                for (var i = 0; i < $scope.transactionsTypes.length; i++) {
                    if (transaction.type == $scope.transactionsTypes[i].name) {
                        transaction.type = $scope.transactionsTypes[i];
                    }
                }
                for (var i = 0; i < $scope.paymentMethods.length; i++) {
                    if (transaction.paymentMethod == $scope.paymentMethods[i].name) {
                        transaction.paymentMethod = $scope.paymentMethods[i];
                    }
                }
                for (var i = 0; i < $scope.transactionGroups.length; i++) {
                    if (transaction.group == $scope.transactionGroups[i].name) {
                        transaction.group = $scope.transactionGroups[i];
                    }
                }
                console.log(transaction);
                $.ajax({
                    url: ApiServerUrl + 'Transaction',
                    method: 'POST',
                    data: transaction,
                    headers: GetHeaders()
                }).success(function (data) {
                    transaction.driver = "[" + transaction.driver.callsign + "]" + " - " + transaction.driver.lastName + " " + transaction.driver.firstName + " " + transaction.driver.middleName;
                    $scope.$apply();
                    console.log(data);
                    location.href = "/Transactions/";
                }).error(function (msg) {
                    console.error(msg);
                });
            } else {
                $('#checkModal').modal('hide');
                transaction.driver = "[" + DRIVER.callsign + "] - " + DRIVER.lastName + " " + DRIVER.firstName + " " + DRIVER.middleName;
                showNotification('danger', "Поле \"Сумма\" должно содержать только положительные числа");
                return false;
            }
        }
    };

    $scope.transactionsTypes = [];

    $scope.getTransactionsTypes = function() {
        $.ajax({
            url: ApiServerUrl + 'helpdictionaries/TransactionTypes',
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.transactionsTypes = data;
            $scope.$apply();
            $scope.$apply();
        }).error(function (msg) {
            console.error(msg);
        });
    };

    $scope.paymentMethods = [];

    $scope.getPaymentMethods = function() {
        $.ajax({
            url: ApiServerUrl + 'helpdictionaries/TransactionMethods',
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.paymentMethods = data;
            $scope.$apply();
        }).error(function (msg) {
            console.error(msg);
        });
    };

    $scope.transactionGroups = [];

    $scope.getTransactionGroups = function() {
        $.ajax({
            url: ApiServerUrl + 'helpdictionaries/TransactionGroups',
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.transactionGroups = data;
            $scope.$apply();
        }).error(function (msg) {
            console.error(msg);
        });
    };

    $scope.changeClass = function (transaction) {
        switch (transaction.type) {
            case "Пополнение":
                transaction.typeClass = "plus";
                transaction.symbol = "";
                history.pushState('', '', "replenishment");
                break;
            case "Списание":
                transaction.typeClass = "minus";
                transaction.symbol = "-";
                history.pushState('', '', "withdrawal");
                break;
            default:
        }
    };

    $scope.formattingAmount = function (transaction) {
        var amountBuffer = transaction.amount;
        amountBuffer = amountBuffer.replace(',', '.');
        var amount = parseFloat(amountBuffer);
        amount = amount.toFixed(2);
        transaction.amount = amount;
    };

    $scope.formattingDate = function (date, timeParam){
        var datetime = date.split('T');
        var newDate = datetime[0];
        var time = datetime[1];
        newDate = newDate.split('-');
        newDate = newDate[2] + "." + newDate[1] + "." + newDate[0] + " ";
        if (timeParam == '+') {
            newDate += time;
        }
        return newDate;
    };

    $scope.selectDriver = function (driver) {
        var fromDate, toDate;
        fromDate = $("#filterFromDate").val();
        toDate = $("#filterToDate").val();
        if (fromDate != undefined && toDate != undefined) {
            fromDate = fromDate.split('.');
            fromDate = fromDate[2].trim() + "-" + fromDate[1] + "-" + fromDate[0];
            toDate = toDate.split('.');
            toDate = toDate[2].trim() + "-" + toDate[1] + "-" + toDate[0];

            var param = [];

            param[0] = { text: "fromDate", value: fromDate };
            param[1] = { text: "toDate", value: toDate };

            AddBrowserHistory(param);
        }

        if (driver == undefined) {
            $("#driver").val("");
            DRIVER = {};
            $scope.getTransactions(fromDate, toDate);
        } else {
            console.log(driver);
            var driverId = driver.id;
            for (var i = 0; i < $scope.balanceList.length; i++) {
                if (driverId == $scope.balanceList[i].driverId) {
                    $("#balance").text($scope.balanceList[i].balance.toFixed(2));
                }
            }
            $("#driver").val(driver.name);
            DRIVER = driver;
            $scope.getDriverTransactions(fromDate, toDate, driverId);
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
    };

    $scope.addTransactionSelectDriver = function(driver) {
        $("#driver").val(driver.name);
        DRIVER = driver;
        dropdownHide("driver");
    };


    $scope.drivers = [];

    $scope.getDrivers = function () {
        $("#main_part").hide();
        $.ajax({
            url: ApiServerUrl + 'Drivers/SimpleDriversList',
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.drivers = data;
            dropdownLoaderHide();
            if (DRIVERID != "") {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].id == DRIVERID) {
                        $scope.selectDriver(data[i]);
                    }
                }
            }
            $scope.$apply();
            KeysNavigation("driver", "driverDropDownPanel", $scope.todoFunction);
        }).error(function (msg) {
            //showModal("Ошибка!", "Ошибка при загрузке данных");
            showNotification('danger', "Ошибка при получении данных");
            console.error(msg);
        });
    };

    $scope.TransactionDriverSelector = function(item) {
        var driver = null;
        if (item.attributes["driverId"] != undefined) {
            var id = item.attributes["driverId"].value;
            if (id == null) {
                $scope.selectDriver();
            } else {
                driver = $scope.getDriverById(id);
                $scope.selectDriver(driver);
            }
        }
    };

    $scope.AddTransactionDriverSelector = function (item) {
        var driver = null;
        if (item.attributes["driverId"] != undefined) {
            var id = item.attributes["driverId"].value;
            if (id == null) {
                $scope.selectDriver();
            } else {
                driver = $scope.getDriverById(id);
                $scope.addTransactionSelectDriver(driver);
            }
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

    $scope.balanceList = [];

    $scope.getBalanceList = function () {
        $.ajax({
            url: ApiServerUrl + 'BalanceReport',
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.balanceList = data;

            $("#loader").hide();
            $("#main_part").show();
        }).error(function (msg) {
            //showModal("Ошибка!", "Ошибка при загрузке данных");
            showNotification('danger', "Ошибка при получении данных");
            console.error(msg);
        });
    };

    $scope.filterTransactionsByDriver = function (transaction) {
        if (DRIVER.id != undefined) {
            if (transaction.driver.id == DRIVER.id) {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    }

    $scope.transaction = { type: null };

    $scope.setOperation = function () {
        var url = location.href;
        var operation = url.split('/')[5];
        if (operation.indexOf('?') + 1) {
            operation = operation.split('&');
            operation = operation[0].split('=');
            operation = operation[1];
        }
        if (operation == "withdrawal") {
            $scope.operationWithDrawalSelected = true;
            $scope.transaction.type = "Списание";
        } else {
            $scope.operationReplenishmentSelected = true;
            $scope.transaction.type = "Пополнение";
        }
        $scope.changeClass($scope.transaction);
    };

    $scope.setDriver = function() {
        for (var i = 0; i < $scope.drivers.length; i++) {
            if ($scope.drivers[i].id == DRIVERID) {
                $scope.selectDriver($scope.drivers[i]);
                break;
            }
        }
    };

    $scope.goTo = function (pageURI, id) {
        location.href = pageURI + id;
    };

    $scope.DriverTransactionsInit = function (driverId) {

        $scope.queryParams = GetBrowserHistory();

        $.ajax({
            url:ApiServerUrl + 'Drivers/' +driverId,
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {

            /*if (data.photo.normalSize == null) {
                data.photo.normalSize = "/Content/Images/no-photo.png";
            }*/

            $scope.drivers = [];
            $scope.drivers.push(data);
            $scope.$apply();
            $("#loader").hide();
            $("#main_part").show();
            }).error(function (msg) {
            //showModal("Ошибка!", "Ошибка при загрузке данных");
            showNotification('danger', "Ошибка при получении данных");
            console.error(msg);
        });
        var fromDate = $scope.getDate("-", 3);
        var toDate = $scope.getDate("+", 1);

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

        $scope.getDriverTransactions(fromDate, toDate, driverId);
        $scope.datapickerForDriversInit(fromDate, toDate);
    };

    $scope.getDriverTransactionsByPeriod = function (period, driverId) {
        var fromDate = $scope.getDate("-", period);
        var toDate = $scope.getDate("+", 1);

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

        $scope.getDriverTransactions(fromDate, toDate, driverId);
    };

    $scope.getDriverTransactions = function (fromDate, toDate, driverId) {
        $.ajax({
            url: ApiServerUrl + 'Transaction/Driver?driverId=' + driverId + '&fromDate=' + fromDate + '&toDate=' + addDayToStringData(toDate),
            method: 'GET',
            headers: GetHeaders()
        }).success(function(data) {
            $scope.transactions = [];
            for (var i = data.length - 1; i > -1; i--) {
                var amount = data[i].amount;
                amount = amount.toFixed(2);
                data[i].amount = amount;
                $scope.transactions.push(data[i]);
            }
            console.log($scope.transactions);

            $scope.$apply();
            $("#loader").hide();
            $("#main_part").show();
        }).error(function(msg) {
            showNotification('danger', "Ошибка при получении данных");
            console.error(msg);
        });
    };

    $scope.datapickerForDriversInit = function (fromDate, toDate) {

        if ($scope.queryParams.length == 0) {
            var param = [];

            param[0] = { text: "fromDate", value: fromDate };
            param[1] = { text: "toDate", value: toDate };

            $scope.queryParams = param;

            AddBrowserHistory(param);
        }

        $scope.fromDate = $scope.formattingDate(fromDate, '-');
        $scope.toDate = $scope.formattingDate(toDate, '-');
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
                fromDate = fromDate.split('.');
                fromDate = fromDate[2].trim() + "-" + fromDate[1] + "-" + fromDate[0];
                toDate = toDate.split('.');
                toDate = toDate[2].trim() + "-" + toDate[1] + "-" + toDate[0];

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

                $scope.getDriverTransactions(fromDate, toDate, DRIVER_ID);
            }
        };
        jQuery('#filterFromDate').datetimepicker(datetimepickerOptions);
        jQuery('#filterToDate').datetimepicker(datetimepickerOptions);
        jQuery('#filterDate').datetimepicker({
            lang: 'ru',
            format: 'd.m.Y',
            dayOfWeekStart: 1,
            timepicker: false,
            validateOnBlur: false,
            mask: true,
            onSelectDate: function() {
                var fromDate = $("#filterDate").val();
                fromDate = fromDate.split('.');
                fromDate = fromDate[2].trim() + "-" + fromDate[1] + "-" + fromDate[0];
                var toDate = new Date(fromDate);
                var year = toDate.getFullYear();
                var month = toDate.getMonth();
                month += 1;
                var day = toDate.getDate();
                day += 1;
                toDate = year + "-" + (month < 10 ? '0' : '') + month + "-" + (day < 10 ? '0' : '') + day;
                $scope.getDriverTransactions(fromDate, toDate, DRIVER_ID);
            }
        });
    };

    /*START SORTING*/

    $scope.sortBy = function (predicate) {
        var orderBy = $filter('orderBy');
        sortingInitialisation($scope.transactions, orderBy);
        $scope.transactions = sortBy(predicate);
    };

    /*END SORTING*/

});