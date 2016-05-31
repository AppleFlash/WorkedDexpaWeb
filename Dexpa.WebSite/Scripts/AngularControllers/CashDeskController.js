DexpaApp.controller('BalanceCtrl', function ($scope, $http, $filter) {
    $scope.balanceList = [];
    $scope.totalRent = 0;
    $scope.totalLimit = 0;
    $scope.totalBalance = 0;

    $scope.driverStates = [];
    $scope.driverWCs = [];

    $scope.selectedStatus = {
        name: "Все",
        state: -1
    };

    $scope.selectedWC = {
        name: "Все",
        id: -1
    };

    $scope.queryParams = [];

    $scope.init = function (driverId, operation) {
        DRIVERID = driverId;
        OPERATION = operation;
        getDriverStates();
        $scope.queryParams = GetBrowserHistory();

        if ($scope.queryParams.length != 0) {
            for (var i = 0; i < $scope.queryParams.length; i++) {
                switch ($scope.queryParams[i].text) {
                    case "workConditions":
                        $scope.selectedWC = { id: $scope.queryParams[i].value };
                        break;
                    case "driverState":
                        $scope.selectedStatus = { state: $scope.queryParams[i].value };
                        break;
                    default:
                }
            }
        }
    }

    function getDriverStates() {
        $.ajax({
            url: ApiServerUrl + 'helpdictionaries/DriverStates',
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.driverStates.push({
                name: "Все",
                state: -1
            });
            $scope.driverStates = $scope.driverStates.concat(data);

            getDriverWCs();
        }).error(function (msg) {
            console.error(msg);
        });
    };

    function getDriverWCs() {
        $.ajax({
            url: ApiServerUrl + 'DriverWorkConditions/Light',
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.driverWCs.push({
                name: "Все",
                id: -1
            });
            $scope.driverWCs = $scope.driverWCs.concat(data);

            getBalanceList();
        }).error(function (msg) {
            console.error(msg);
        });
    };

    function getBalanceList() {
        $.ajax({
            url: ApiServerUrl + 'BalanceReport?includeFired=true',
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.balanceList = data;

            for (var i = 0; i < data.length; i++) {
                $scope.totalRent += data[i].rentCost;
                $scope.totalLimit += data[i].moneyLimit;
                $scope.totalBalance += data[i].balance;
            }

            $scope.totalRent = $scope.totalRent.toFixed(2);
            $scope.totalLimit = $scope.totalLimit.toFixed(2);
            $scope.totalBalance = $scope.totalBalance.toFixed(2);

            for (var i = 0; i < data.length; i++) {
                data[i].phone = $filter("formatManyPhones")(data[i].phone);
                data[i].phone = data[i].phone.join(", ");
                for (var j = 0; j < $scope.driverStates.length; j++) {
                    if (data[i].driverState == $scope.driverStates[j].state) {
                        data[i].driverState = $scope.driverStates[j];
                        break;
                    }
                }
                for (var j = 0; j < $scope.driverWCs.length; j++) {
                    if (data[i].workConditions == $scope.driverWCs[j].id) {
                        data[i].workConditions = $scope.driverWCs[j];
                        break;
                    }
                }
            }
            $scope.$apply();

            $("#loader").hide();
            $("#main_part").show();
        }).error(function (msg) {
            //showModal("Ошибка!", "Ошибка при загрузке данных");
            showNotification('danger', "Ошибка при получении данных");
            console.error(msg);
        });
    };

    $scope.filterByStatus = function(row) {
        if ($scope.selectedStatus.state == -1)
            return true;
        if ($scope.selectedStatus.state == row.driverState.state) {
            return true;
        }
        return false;
    }

    $scope.filterByWC = function(row) {
        if ($scope.selectedWC.id == -1)
            return true;
        if (row.workConditions != null && $scope.selectedWC.id == row.workConditions.id) {
            return true;
        }
        return false;
    }

    $scope.selectWC = function() {
        var wcFound = false;
        var index = null;
        for (var i = 0; i < $scope.queryParams.length; i++) {
            index = i;
            if ($scope.queryParams[i].text == "workConditions") {
                wcFound = true;
                break;
            }
        }
        if (wcFound) {
            $scope.queryParams[index].value = $scope.selectedWC.id;
        } else {
            $scope.queryParams.push({ text: "workConditions", value: $scope.selectedWC.id });
        }
        AddBrowserHistory($scope.queryParams);
    };

    $scope.selectDriverState = function () {
        var stateFound = false;
        var index = null;
        for (var i = 0; i < $scope.queryParams.length; i++) {
            index = i;
            if ($scope.queryParams[i].text == "driverState") {
                stateFound = true;
                break;
            }
        }
        if (stateFound) {
            $scope.queryParams[index].value = $scope.selectedStatus.state;
        } else {
            $scope.queryParams.push({ text: "driverState", value: $scope.selectedStatus.state });
        }
        AddBrowserHistory($scope.queryParams);
    };

    $scope.goTo = function (pageURI, id) {
        location.href = pageURI + id;
    };

    $scope.exportReport = function(type) {
        var token = GetHeaders().Authorization;
        var url = "/CashDesk/ExportReport?type=" + type + "&token=" + token;

        if ($scope.sortColumn != null && $scope.sortDirection != null) {
            url += "&sortColumn=" + $scope.sortColumn + "&sortDirection=" + $scope.sortDirection;
        }
         
        window.open(url);
    };

    /*START SORTING*/

    $scope.sortColumn = null;
    $scope.sortDirection = null;

    $scope.sortBy = function (predicate) {
        var orderBy = $filter('orderBy');
        sortingInitialisation($scope.balanceList, orderBy);
        $scope.balanceList = sortBy(predicate);
        $scope.sortColumn = predicate.charAt(0).toUpperCase() + predicate.substr(1);
        $scope.sortDirection = getSortDirection();
    };

    /*END SORTING*/

});