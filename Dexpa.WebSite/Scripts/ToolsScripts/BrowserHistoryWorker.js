function AddBrowserHistory(param) {
    var url = location.href;
    if (url.indexOf('?') + 1) {
        url = url.split('?');
        url = url[0];
        url += "?";
    } else {
        url += "?";
    }
    for (var i = 0; i < param.length; i++) {
        url += (param[i].text + "=" + param[i].value);
        if (i != param.length - 1) {
            url += "&";
        }
    }
    history.pushState('', '', url);
}

function GetBrowserHistory() {
    var url = location.href;
    var param = [];
    if (url.indexOf('?') + 1) {
        url = url.split('?');
        var params = url[1].split('&');
        for (var i = 0; i < params.length; i++) {
            param.push({
                text: params[i].split('=')[0],
                value: params[i].split('=')[1]
            });
        }
        return param;
    } else {
        return [];
    }
}