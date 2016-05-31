var isNewsPanelOpen = false;

$(document).ready(function () {

    $("#newsButton").bind('click', function () {
        showHideNewsPanel();
    });

});

function showHideNewsPanel() {
    if (isNewsPanelOpen) {
        hideNews();
    } else {
        showNews();
    }
}

function hideNews() {
    var rightIndent;
    rightIndent = '-350px';
    isNewsPanelOpen = false;
    $("#newsPanel").animate({ right: rightIndent }, 300);
    $("#newsButton").removeClass('selectedTp-icon');
    $("#newsButton").addClass('tp-icon');
}

function showNews() {
    var rightIndent;
    rightIndent = 0;
    isNewsPanelOpen = true;
    $("#newsPanel").animate({ right: rightIndent }, 300);
    $("#newsButton").removeClass('tp-icon');
    $("#newsButton").addClass('selectedTp-icon');
}