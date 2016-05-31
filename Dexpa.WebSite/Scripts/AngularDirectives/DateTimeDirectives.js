DexpaApp.filter('onlyData', function () {
    return function (data) {
        if (data === undefined || data === null)
            return "";

        var dataA = convertDateToArray(data);
        return dataA[0];
    };
});

DexpaApp.filter('onlyDateWithoutTime', function () {
    return function (data) {
        if (data === undefined || data === null)
            return "";

        var dataA = convertDateToString(data);
        return dataA;
    };
});

DexpaApp.filter('onlyTime', function () {
    return function (data) {
        if (data === undefined || data === null)
            return "";

        var dataA = convertDateToArray(data);
        return dataA[1];
    };
});

DexpaApp.filter('fullDate', function () {
    return function (data) {
        if (data === undefined || data === null)
            return "";

        var dataA = convertDateToArray(data);
        return dataA[0] + " " + dataA[1];
    };
});

function convertDateToArray(data) {
    if (data === undefined || data === null)
        return "";

    var d = data.split('T');
    var time = d[1].split(':');
    var date = d[0].split('-');
    var dd = new Array();
    dd.push(date[2] + "." + date[1] + "." + date[0]);
    dd.push(time[0] + ':' + time[1]);
    return dd;
}

function convertDateToString(date) {
    date += "T00:00:00";
    date = convertDateToArray(date);
    return date[0];
}