DexpaApp.controller("SettingsCtrl", function ($scope) {
    $scope.settings = [];

    $scope.qiwiCheckIntervals = [10, 15, 30, 60, 120];

    $scope.highPriorityOrderTimes = [60, 120, 180, 300, 600];

    $scope.init = function () {
        $.ajax({
            url: ApiServerUrl + "GlobalSettings",
            method: "GET",
            headers: GetHeaders()
        }).success(function (data) {
            $scope.settings.push(data);
            $scope.$apply();
        }).error(function (msg) {
            console.error(msg);
            showNotification('danger', "Ошибка при загрузке данных");
        });
    }

    $scope.initSetting = function (setting) {
        if (validateForm("editSettingsForm")) {
            $.ajax({
                url: ApiServerUrl + "GlobalSettings",
                method: "PUT",
                data: setting,
                headers: GetHeaders()
            }).success(function () {
                document.location.href = "/Settings";
            }).error(function (msg) {
                console.error(msg);
                showNotification('danger', "Ошибка при загрузке данных");
            });
        } else {
            console.log(false);
        }
    }
    $scope.initTimePicker = function () {
        var datetimepickerOptions = {
            lang: 'ru',
            format: 'H:i',
            step: 60,
            dayOfWeekStart: 1,
            datepicker: false,
            validateOnBlur: false,
            onChangeDateTime: $scope.logic,
        };
        $("#timeTrans").datetimepicker(datetimepickerOptions);
    };

    $scope.checkTime = function (time) {
        var regex = "^[0-9]{2}:[0-9]{2}$";
        var regex2 = "^[0-9]{2}:[0-9]{2}:[0-9]{2}$";

        regex = new RegExp(regex);
        regex2 = new RegExp(regex2);

        if (!regex.test(time) && !regex2.test(time)) {
            showNotification('danger', "Неправильное время");
            return false;
        }
        return true;
    };
    $scope.checkSupport = function (sup) {
        var regex = "^[0-9]+$";

        regex = new RegExp(regex);
        if (!regex.test(sup)) {
            showNotification('danger', "Неправильная стоимость ТО");
            return false;
        }
        return true;
    }
});