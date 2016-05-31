var showDropDown = false;

function initialization(elementId) {
    $("#" + elementId).bind('click', function () {
        if (!showDropDown) {
            showDropDown = true;
            dropdownShow(elementId);
        } else {
            showDropDown = false;
            dropdownHide(elementId);
        }
    });
    $(document).click(function (e) {
        var container = $("#"+elementId);

        if (!container.is(e.target) && container.has(e.target).length === 0) {
            showDropDown = false;
            dropdownHide(elementId);
        }
    });
}

function dropdownShow(elementId) {
    showDropDown = true;
    $(".dropdownPanel_"+elementId).show();
}

function dropdownHide(elementId) {
    showDropDown = false;
    $(".dropdownPanel_"+elementId).hide();
}

function dropdownLoaderHide() {
    $("#dropdownPanelLoader").hide();
}

function dropdownLoaderShow() {
    $("#dropdownPanelLoader").show();
}

function KeysNavigation(inputId, elementId, todoFunction) {

    var input = document.getElementById(inputId);

    var container = document.getElementById(elementId);
    if (container == null) {
        return;
    }
    var items = container.getElementsByTagName("li");
    var index = 0;
    items[index].className = 'selectedDropElement';

    function move(dir) {
        !items[index] || (items[index].className = '');
        switch (dir) {
            case 'up':
                index = (index <= 0) ? items.length - 1 : --index;
                if (index == items.length-1) {
                    scrollValue = -container.scrollHeight;
                    scrollHeight = 0;
                } else {
                    scrollValue = items[index].offsetHeight;
                }
                break;
            case 'down':
                index = (index == items.length - 1) ? 0 : ++index;
                if (index <= 0) {
                    scrollValue = 0;
                    scrollHeight = 0;
                } else {
                    scrollValue = items[index].offsetHeight;
                }
                break;
            default:
                throw Error('WTF?');
        }
        items[index].className = 'selectedDropElement';
    }

    var scrollHeight = 0;
    var scrollValue = 30;

    input.addEventListener('keydown', function (e) {
        var newIndex = null;
        switch (e.keyIdentifier) {
            case 'Up':
                e.preventDefault();
                move('up');
                scrollHeight -= scrollValue;
                $(container).scrollTop(scrollHeight);
                break;
            case 'Down':
                e.preventDefault();
                move('down');
                scrollHeight += scrollValue;
                $(container).scrollTop(scrollHeight);
                break;
            case 'Enter':
                //e.preventDefault();
                //console.log(items[index]);
                todoFunction(items[index]);
                break;
        }
    });

    container.focus();


}