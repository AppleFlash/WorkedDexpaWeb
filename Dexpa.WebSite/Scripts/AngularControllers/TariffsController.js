﻿DexpaApp.controller('TariffCtrl', function ($scope, $http, $filter) {

    $scope.init = function () {
        $scope.getTariffs();
        $scope.initTimePicker();
    };

    $scope.initRegions = function() {
        $scope.getRegions();
    };

    $scope.tariffs = [];

    $scope.getTariffs = function () {
        $.ajax({
            url: ApiServerUrl + "Tariffs/Light",
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {

            for (var item in data) {
                var days = [];

                var day = data[item].days.monday;

                if (day) {
                    days.push("Пн");
                }

                day = data[item].days.tuesday;

                if (day) {
                    days.push("Вт");
                }

                day = data[item].days.wednesday;

                if (day) {
                    days.push("Ср");
                }

                day = data[item].days.thursday;

                if (day) {
                    days.push("Чт");
                }

                day = data[item].days.friday;

                if (day) {
                    days.push("Пт");
                }

                day = data[item].days.saturday;

                if (day) {
                    days.push("Сб");
                }

                day = data[item].days.sunday;

                if (day) {
                    days.push("Вск");
                }

                data[item].days = days.join(', ');

                if (data[item].yandexId != null) {
                    data[item].category = "Яндекс(" + data[item].yandexId + ")";
                } else {
                    data[item].category = "Диспетчерская";
                }
            }

            console.log(data);
            $scope.tariffs = data;
            $scope.$apply();
            $("#loader").hide();
            $("#main_part").show();
        }).error(function (msg) {
            //showModal("Ошибка!", "Ошибка при получении данных");
            showNotification('danger', "Ошибка при получении данных");
            console.log(msg);
        });
    };

    $scope.regions = [];
    $scope.regionsCosts = [];

    $scope.getTariff = function (id) {
        $scope.getTariffZones();
        $.ajax({
            url: ApiServerUrl + "Tariffs/" + id,
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            console.log(data);

            $scope.regionsCosts = data.regionsCosts;

            $scope.getRegions();

            if (data.includeMinutesAndKilometers) {
                data.includeMinutesAndKilometers = "И";
            } else {
                data.includeMinutesAndKilometers = "ИЛИ";
            }

            if (data.tariffZones.length > 0) {
                $scope.tariffZones = data.tariffZones;
            }

            data.minimumCost = data.minimumCost.toFixed(2);

            var tariffOptions = data.tariffOptions;

            tariffOptions.baggage = tariffOptions.baggage.toFixed(2);
            tariffOptions.childrenSeat = tariffOptions.childrenSeat.toFixed(2);
            tariffOptions.conditioner = tariffOptions.conditioner.toFixed(2);
            tariffOptions.skis = tariffOptions.skis.toFixed(2);
            tariffOptions.smoke = tariffOptions.smoke.toFixed(2);
            tariffOptions.stationWagon = tariffOptions.stationWagon.toFixed(2);
            tariffOptions.wifi = tariffOptions.wifi.toFixed(2);
            tariffOptions.withAnimals = tariffOptions.withAnimals.toFixed(2);

            data.tariffOptions = tariffOptions;

            $scope.tariffs.push(data);

            console.log($scope.tariffZones);
            $scope.$apply();
            $scope.initTimePicker();
            $("#loader").hide();
            $("#main_part").show();
        }).error(function (msg) {
            //showModal("Ошибка!", "Ошибка при получении данных");
            showNotification('danger', "Ошибка при получении данных");
            console.log(msg);
        });
    };

    $scope.fillMatrix = function(regionsCosts) {

        for (var i = 0; i < regionsCosts.length; i++) {
            var fromId = regionsCosts[i].regionFromId;
            var toId = regionsCosts[i].regionToId;
            var cost = regionsCosts[i].cost;
            $("#" + fromId + "to" + toId).val(cost==0?"":cost);
        }

        $scope.showIndicator(false);

    };

    $scope.getRegions = function () {
        $scope.showIndicator(true);
        $.ajax({
            url: ApiServerUrl + "Regions",
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.regions = data;
            $scope.fillMatrix($scope.regionsCosts);
            $scope.$apply();
        }).error(function (msg) {
            console.error(msg);
        });
    };

    $scope.tariffZones = [];

    $scope.getTariffZones = function () {
        $.ajax({
            url: ApiServerUrl + "helpdictionaries/GetTariffZones",
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {

            for (var i = 0; i < data.length; i++) {
                data[i] = {
                    isActive: false,
                    kilometers: 0,
                    minutes: 0,
                    tariffZoneType: { name: data[i].name, type: data[i].type },
                    velocity: 0
                };
            }

            console.log(data);

            $scope.tariffZones = data;
            $scope.$apply();
        }).error(function (msg) {
            console.log(msg);
        });
    };

    $scope.addTariff = function (tariff) {

        if (!validateForm("addTariffForm"))
            return 0;

        $scope.showIndicator(true);

        if (tariff.includeMinutesAndKilometers == "И") {
            tariff.includeMinutesAndKilometers = true;
        } else {
            tariff.includeMinutesAndKilometers = false;
        }

        tariff.tariffZones = [];

        tariff.minimumCost = tariff.minimumCost.replace(',', '.');

        tariff.regionsCosts = $scope.createRegionMatrix(tariff);

        for (var i = 0; i < $scope.tariffZones.length; i++) {
            var tariffZone = null;
            if ($("#tariffCheckbox-" + i).prop("checked")) {
                tariffZone = {
                    tariffZoneType: { type: $scope.tariffZones[i].tariffZoneType.type },
                    isActive: true,
                    minuteCost: $scope.tariffZones[i].minuteCost,
                    kilometerCost: $scope.tariffZones[i].kilometerCost,
                    minVelocity: $scope.tariffZones[i].minVelocity
                };
                tariff.tariffZones.push(tariffZone);
            } else {
                tariffZone = {
                    tariffZoneType: { type: $scope.tariffZones[i].tariffZoneType.type },
                    isActive: false,
                    minuteCost: $scope.tariffZones[i].minuteCost,
                    kilometerCost: $scope.tariffZones[i].kilometerCost,
                    minVelocity: $scope.tariffZones[i].minVelocity
                };
                tariff.tariffZones.push(tariffZone);
            }
        }

        if ($scope.checkTime(tariff.timeFrom) == false && $scope.checkTime(tariff.timeTo) == false) {
            $scope.showIndicator(false);
            return false;
        }

        /*if ($scope.checkAdditionalOptions() == false) {
            $scope.showIndicator(false);
            return false;
        }*/

        var tariffOptions = tariff.tariffOptions;

        tariffOptions.baggage = tariffOptions.baggage.replace(',','.');
        tariffOptions.childrenSeat = tariffOptions.childrenSeat.replace(',', '.');
        tariffOptions.conditioner = tariffOptions.conditioner.replace(',', '.');
        tariffOptions.skis = tariffOptions.skis.replace(',', '.');
        tariffOptions.smoke = tariffOptions.smoke.replace(',', '.');
        tariffOptions.stationWagon = tariffOptions.stationWagon.replace(',', '.');
        tariffOptions.wifi = tariffOptions.wifi.replace(',', '.');
        tariffOptions.withAnimals = tariffOptions.withAnimals.replace(',', '.');

        tariff.tariffOptions = tariffOptions;

        console.log(tariff);
        $.ajax({
            url: ApiServerUrl + 'Tariffs/',
            method: 'POST',
            data: tariff,
            headers: GetHeaders()
        }).success(function (data) {
            console.log(data);
            $scope.showIndicator(false);
            location.href = "/Admin/Tariffs/";
        }).error(function (msg) {
            var error = errorHandling(msg);
            showNotification('danger', error);
            $scope.showIndicator(false);
            $scope.$apply();
        });
    };

    $scope.getCost = function (fromId, toId) {
        for (var i = 0; i < $scope.regionsCosts.length; i++) {
            if ($scope.regionsCosts[i].regionFromId == fromId && $scope.regionsCosts[i].regionToId == toId) {
                return $scope.regionsCosts[i].cost;
            }
        }
    };

    $scope.createRegionMatrix = function (tariff) {
        $scope.regionMatrix = [];
        for (var i = 0; i < $scope.regions.length; i++) {
            for (var j = 0; j < $scope.regions.length; j++) {
                var fromId = i + 1;
                var toId = j + 1;
                var cost = $("#" + fromId + "to" + toId).val();
                if (cost == "") {
                    cost = 0;
                }
                var regionCost = {
                    tariff: { id: tariff.id },
                    regionFromId: fromId,
                    regionToId: toId,
                    cost: cost
                };
                $scope.regionMatrix.push(regionCost);
            }
        }
        return $scope.regionMatrix;
    };

    $scope.changeRegionMatrix = function (tariff) {

        if (tariff.regionsCosts.length == 0) {
            return $scope.createRegionMatrix(tariff);
        }

        for (var i = 0; i < tariff.regionsCosts.length; i++) {
            var fromId = tariff.regionsCosts[i].regionFromId;
            var toId = tariff.regionsCosts[i].regionToId;
            var cost = $("#" + fromId + "to" + toId).val();
            if (cost == "") {
                cost = 0;
            }
            tariff.regionsCosts[i].cost = cost;
        }

        return tariff.regionsCosts;
    };

    $scope.editTariff = function (tariff, id) {

        if (!validateForm("addTariffForm"))
            return 0;

        $scope.showIndicator(true);

        tariff.minimumCost = tariff.minimumCost.replace(',', '.');

        tariff.regionsCosts = $scope.changeRegionMatrix(tariff);

        console.log(tariff);

        tariff.tariffZones = [];

        for (var i = 0; i < $scope.tariffZones.length; i++) {
            var tariffZone = null;
            if ($("#tariffCheckbox-" + i).prop("checked")) {
                tariffZone = {
                    id: $scope.tariffZones[i].id,
                    tariffZoneType: { type: $scope.tariffZones[i].tariffZoneType.type },
                    isActive: true,
                    minuteCost: $scope.tariffZones[i].minuteCost,
                    kilometerCost: $scope.tariffZones[i].kilometerCost,
                    minVelocity: $scope.tariffZones[i].minVelocity
                };
                tariff.tariffZones.push(tariffZone);
            } else {
                tariffZone = {
                    id: $scope.tariffZones[i].id,
                    tariffZoneType: { type: $scope.tariffZones[i].tariffZoneType.type },
                    isActive: false,
                    minuteCost: $scope.tariffZones[i].minuteCost,
                    kilometerCost: $scope.tariffZones[i].kilometerCost,
                    minVelocity: $scope.tariffZones[i].minVelocity
                };
                tariff.tariffZones.push(tariffZone);
            }
        }

        if (tariff.includeMinutesAndKilometers == "И") {
            tariff.includeMinutesAndKilometers = true;
        } else {
            tariff.includeMinutesAndKilometers = false;
        }

        if ($scope.checkTime(tariff.timeFrom) == false && $scope.checkTime(tariff.timeTo) == false) {
            $scope.showIndicator(false);
            return false;
        }

        /*if ($scope.checkAdditionalOptions() == false) {
            $scope.showIndicator(false);
            return false;
        }*/

        var tariffOptions = tariff.tariffOptions;

        tariffOptions.baggage = tariffOptions.baggage.replace(',', '.');
        tariffOptions.childrenSeat = tariffOptions.childrenSeat.replace(',', '.');
        tariffOptions.conditioner = tariffOptions.conditioner.replace(',', '.');
        tariffOptions.skis = tariffOptions.skis.replace(',', '.');
        tariffOptions.smoke = tariffOptions.smoke.replace(',', '.');
        tariffOptions.stationWagon = tariffOptions.stationWagon.replace(',', '.');
        tariffOptions.wifi = tariffOptions.wifi.replace(',', '.');
        tariffOptions.withAnimals = tariffOptions.withAnimals.replace(',', '.');

        tariff.tariffOptions = tariffOptions;

        console.log(tariff);
        $.ajax({
            url: ApiServerUrl + 'Tariffs/' + id,
            method: 'PUT',
            data: tariff,
            headers: GetHeaders()
        }).success(function (data) {
            console.log(data);
            $scope.showIndicator(false);
            location.href = "/Admin/Tariffs/";
        }).error(function (msg) {
            console.error(msg);
            $scope.showIndicator(false);
        });
    };

    $scope.showIndicator = function (status) {
        $scope.isVisible = status;
    };

    $scope.showIndicator(false);

    $scope.goTo = function (address, id) {
        location.href = address + id;
    };

    var CHECK_STATE = true;

    $scope.checkAll = function () {
        for (var i = 0; i < $scope.tariffZones.length; i++) {
            var state = $("#tariffCheckbox-" + i).prop("checked");
            if (state != CHECK_STATE) {
                $("#tariffCheckbox-" + i).prop("checked", !state);
            }
        }
        CHECK_STATE = !CHECK_STATE;
    };

    /*START SORTING*/

    $scope.sortBy = function (predicate) {
        var orderBy = $filter('orderBy');
        sortingInitialisation($scope.tariffs, orderBy);
        $scope.tariffs = sortBy(predicate);
    };

    /*END SORTING*/

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

    $scope.checkAdditionalOptions = function () {
        var regex = "^[0-9]+.[0-9]+$";
        regex = new RegExp(regex);
        var elements = document.getElementById("additionalOptions");
        for (var i = 0; i < elements.children.length; i++) {
            if (elements.children[i].className == "col-xs-6 col-md-3") {
                if (regex.test(elements.children[i].children[1].value) && elements.children[i].children[1].value>=0) {
                    continue;
                } else {
                    showNotification('danger', "Поле \"" + elements.children[i].children[0].innerText + "\" должно содержать только положительные цифры");
                    return false;
                }
            }
        }
        return true;
    };

    $scope.initTimePicker = function() {
        var datetimepickerOptions = {
            lang: 'ru',
            format: 'H:i',
            step: 15,
            dayOfWeekStart: 1,
            datepicker: false,
            validateOnBlur: false,
            onChangeDateTime: $scope.logic,
        };
        $("#timeFrom").datetimepicker(datetimepickerOptions);
        $("#timeTo").datetimepicker(datetimepickerOptions);
    };

});
