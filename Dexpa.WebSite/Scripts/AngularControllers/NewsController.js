DexpaApp.controller('NewsMesagesCtrl', ['$scope', '$filter', '$interval', function ($scope, $filter, $interval) {
    $scope.newsList = [];

    $scope.newNewsMessage = {
        message: "",
        authorLogin:""
    };

    function getNews() {
        $.ajax({
            url: ApiServerUrl + 'NewsMesages/',
            method: 'GET',
            headers: GetHeaders()
        }).success(function (data) {
            $scope.newsList = data;
            $scope.$apply();
        }).error(function (msg) {
            showNotification('danger', "Ошибка при получении данных");
            console.error(msg);
        });
    }

    getNews();
    $interval(getNews, 20000);

    $scope.addNewsMessage = function (userLogin) {
        $scope.newNewsMessage.authorLogin = userLogin;

        if ($scope.newNewsMessage.message == "") {
            showNotification('danger', "Сообщение не может быть пустым");
            return;
        }

        $.ajax({
            url: ApiServerUrl + 'NewsMesages/',
            method: 'POST',
            data: $scope.newNewsMessage,
            headers: GetHeaders()
        }).success(function (data) {
            isSearch = true;
            $("#addNewsForm").hide(200);
            $("#searchNewsPanel").show(200);
            $scope.newNewsMessage = {
                message: "",
                authorLogin: ""
            };
            $scope.newsList.unshift(data);
        }).error(function (msg) {
            var error = errorHandling(msg);
            showNotification('danger', error);
            console.error(msg);
        });
    }

    var isSearch = true;
    $("#addNewsForm").hide();
    $("#searchNewsPanel").show();

    $scope.openCloseAddPanel = function () {
        if (isSearch) {
            isSearch = false;
            $("#searchNewsPanel").hide(200);
            $("#addNewsForm").show(200);
            $scope.filterAllOrderReport();
        } else {
            isSearch = true;
            $("#addNewsForm").hide(200);
            $("#searchNewsPanel").show(200);
            $scope.searchAllOrderReport();
        }
    }

}]);