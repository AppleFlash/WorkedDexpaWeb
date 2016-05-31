var Collection;
var OrderBy;

function sortingInitialisation(collection, orderBy) {
    Collection = collection;
    OrderBy = orderBy;
}

var Increase = true;
var PredicateHistory;
var Reverse;

function sortBy(predicate) {
    var reverse = false;
    var icon;
    if (PredicateHistory != null) {
        $("span#" + PredicateHistory.replace('.', '')).removeAttr('class');
    }
    if (PredicateHistory != predicate) {
        Increase = true;
    }
    PredicateHistory = predicate;
    if (Increase) {
        Increase = false;
        icon = "up";
    } else {
        reverse = true;
        Increase = true;
        icon = "down";
    }
    $("span#" + predicate.replace('.', '')).attr("class", "fa fa-caret-" + icon);
    //var orderBy = $filter('orderBy');
    Reverse = reverse;
    return OrderBy(Collection, predicate, reverse);
};

function getSortDirection() {
    if (Reverse) {
        return "DESC";
    } else {
        return "ASC";
    }
}