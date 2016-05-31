DexpaApp.controller('AccountManageCtrl', ["$scope", "$filter", "$http",function ($scope, $filter, $http) {

    $scope.account = {};
    $scope.roles = [];

    getRoles();

    $scope.initUpdateAccount = function(userName) {
        getAccount(userName);
    };

    $scope.registerAccount = function(account) {
        account.PhoneNumber = $filter('deformatPhone')(account.PhoneNumber);
        if (account.Role != undefined) {
            account.RoleName = account.Role.Name;
        }

        $.ajax({
            url: '/Account/Register/',
            method: 'POST',
            data: account,
            cache: false,
            headers: GetHeaders()
        }).success(function (data) {
            if (data.Error == "") {
                document.location.href = "/Home";
            } else {
                account.PhoneNumber = $filter('formatPhone')(account.PhoneNumber);
                showNotification('danger', data.Error);
            }
        }).error(function (msg) {
            account.PhoneNumber = $filter('formatPhone')(account.PhoneNumber);
            var error = errorHandling(msg);
            showNotification('danger', error);
            console.error(msg);
        });
    }

    $scope.updateAccount = function (account) {
        account.PhoneNumber = $filter('deformatPhone')(account.PhoneNumber);
        account.RoleName = account.Role.Name;

        $.ajax({
            url: '/Account/Manage/',
            method: 'POST',
            data: account,
            cache: false,
            headers: GetHeaders()
        }).success(function (data) {
            if (data.Error == "") {
                document.location.href = "/Home";
            } else {
                account.PhoneNumber = $filter('formatPhone')(account.PhoneNumber);
                showNotification('danger', data.Error);
            }
        }).error(function (msg) {
            account.PhoneNumber = $filter('formatPhone')(account.PhoneNumber);
            var error = errorHandling(msg);
            showNotification('danger', error);
            console.error(msg);
        });
    };

    $scope.formatPhone = function(phone) {
        $scope.account.PhoneNumber = $filter('formatPhone')(phone);
    };

    $scope.checkEmail = function (email) {
        if (email == null || email == "")
            return;

        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!re.test(email)) {
            showNotification('danger', "Неправильный E-mail");
        }
    };

    function getRoles() {
        $http.get("/Admin/GetRoles").success(function(result) {
            $scope.roles = result;
        }).error(function (msg) {
            showNotification('danger', "Ошибка при получении данных");
            console.error(msg);
        });
    };

    function getAccount(userName) {
        $.ajax({
            url: "/Account/GetAccount/?userName=" + userName,
            method: 'GET',
            cache: false,
            headers: GetHeaders()
        }).success(function (result) {
            result.PhoneNumber = $filter('formatPhone')(result.PhoneNumber);
            $scope.account = result;
        }).error(function (msg) {
            showNotification('danger', "Ошибка при получении данных");
            console.error(msg);
        });
    };

}]);
