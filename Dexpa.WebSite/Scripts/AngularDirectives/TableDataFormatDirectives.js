DexpaApp.filter('formatDriver', function (formatPhoneFilter) {
    return function (driver) {
        if (driver === undefined || driver === null || driver.callsign === null)
            return " ";
        var phones = driver.phones === null ? "" : driver.phones;
        return "" + driver.callsign + " | " + formatPhoneFilter(phones.split(',')[0].trim(' '));
    };
});

DexpaApp.filter('formatManyPhones', function (formatPhoneFilter) {
    return function (phones) {
        if (phones === undefined || phones === null)
            return "";

        if (typeof phones === 'object') {
            if (!Array.isArray(phones)) {
                return "";
            }
        } else {
            if (typeof phones === 'string') {
                phones = phones.split(',');
            } else {
                return "";
            }
        }

        for (var i = 0; i < phones.length; i++) {
            phones[i] = formatPhoneFilter(phones[i]);
        }
        return phones;
    };
});

DexpaApp.filter('formatPhone', function (deformatPhoneFilter) {
    return function (phone) {
        if (phone === undefined || phone === null || phone == "")
            return "";

        phone = deformatPhoneFilter(phone);

        var length = phone.length;

        switch (length) {
            case 6:
                phone = phone[0] + phone[1] + "-" + phone[2] + phone[3] + "-" + phone[4] + phone[5];
                break;
            case 7:
                phone = phone[0] + phone[1] + phone[2] + "-" + phone[3] + phone[4] + "-" + phone[5] + phone[6];
                break;
            case 11:
                phone = phone[0] + " (" + phone[1] + phone[2] + phone[3] + ") " + phone[4] + phone[5] + phone[6] + "-" + phone[7] + phone[8] + "-" + phone[9] + phone[10];
                break;
            case 12:
                if (phone[0] == "+") {
                    phone = phone[0] + phone[1] + " (" + phone[2] + phone[3] + phone[4] + ") " + phone[5] + phone[6] + phone[7] + "-" + phone[8] + phone[9] + "-" + phone[10] + phone[11];
                }
                break;
            default:
                break;
        }
        return phone;
    };
});

DexpaApp.filter('deformatPhone', function () {
    return function (phone) {
        if (phone === undefined || phone === null || phone == "")
            return "";

        phone = "" + phone;

        return phone.replace(/\D/g, '');
    };
});