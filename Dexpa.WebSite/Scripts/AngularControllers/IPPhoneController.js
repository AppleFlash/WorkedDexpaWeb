﻿DexpaApp.controller('IPPhoneCtrl', function ($scope, $filter) {

    $scope.OnlineDrivers = true;
    $scope.FiredDrivers = false;
    $scope.IPPhoneDrivers = [];

    $scope.ipPhoneInit = function () {
        $scope.events();
        $scope.getDrivers();
        initialization("ip_phone_driver");
        dropdownHide("ip_phone_driver");
    };

    $scope.getDrivers = function () {
        var url;
        if ($scope.OnlineDrivers) {
            url = "Drivers/OnlineDrivers";
        } else {
            url = "Drivers/FiredDrivers";
        }
        $.ajax({
            url: ApiServerUrl + url,
            method: 'GET',
            headers: GetHeaders()
        }).success(function(data) {
            $scope.IPPhoneDrivers = data;
            dropdownLoaderHide();
            $scope.$apply();
        }).error(function(msg) {
            console.error(msg);
        });
    };

    $scope.selectDriver = function (driver) {
        $("#call-driver-number").val($filter("formatPhone")(driver.phones.split(',')[0]));
        $("#ip_phone_driver").val(driver.name);
    };

    $scope.events = function () {

        function clearDrivers() {
            $("#call-driver-number").val("");
            $("#ip_phone_driver").val("");
            $scope.IPPhoneDrivers = [];
            dropdownLoaderShow();
            $scope.getDrivers();
        }

        $("#ip_phone_online_drivers").bind('click', function() {
            $scope.OnlineDrivers = !$scope.OnlineDrivers;
            if ($scope.FiredDrivers) {
                $scope.FiredDrivers = !$scope.FiredDrivers;
            }
            clearDrivers();
        });

        $("#ip_phone_fired_drivers").bind('click', function () {
            $scope.FiredDrivers = !$scope.FiredDrivers;
            if ($scope.OnlineDrivers) {
                $scope.OnlineDrivers = !$scope.OnlineDrivers;
            }
            clearDrivers();
        });

        var CALL_TAB;

        function outcomingCall(tab, number) {
            if (number === undefined || number === null || number == '') {
                showNotification('warning', 'Пустой номер телефона');
                return false;
            } else {
                call($filter("deformatPhone")(number));
            }
            $("#ip_phone_outcoming_call_number").val($filter("formatPhone")(number));
            CALL_TAB = tab;
            showTab('outcoming_call');
        }

        $("#call-button").bind('click', function () {
            var number = $("#call-number").val();
            outcomingCall('number', $filter("deformatPhone")(number));
        });

        $("#cancel-button").bind('click', function () {
            $("#call-number").val("");
        });

        $("#call-driver").bind('click', function() {
            var number = $("#call-driver-number").val();
            outcomingCall('driver', $filter("deformatPhone")(number));
        });

        $("#cancel-driver").bind('click', function () {
            clearDrivers();
        });

        $("#call-order-client").bind('click', function() {
            var phone = $("#ip_phone_order_client_number").val();
            $("#call-order-number").val($filter("formatPhone")(phone));
            outcomingCall('order', $filter("deformatPhone")(phone));
        });

        $("#call-order-driver").bind('click', function () {
            var phone = $("#ip_phone_order_driver_number").val();
            $("#call-order-number").val($filter("formatPhone")(phone));
            outcomingCall('order', $filter("deformatPhone")(phone));
        });

        $("#cancel-order").bind('click', function () {
            $("#call-order-number").val("");
            $("#ip_phone_order_id").text("");
            $("#ip_phone_order_address").text("");
            $("#ip_phone_order_date").text("");
        });

        $('#hang-up').bind('click', function() {
            hangUp();
            $("#ip_phone_outcoming_call_number").val("");
            showTab(CALL_TAB);
        });

    };
});