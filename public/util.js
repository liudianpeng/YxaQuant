
function getParamAsArray(value){
    if (typeof value == 'object')
        return value
    else
        return [value]
}

var checkCreateRoute = ['$route','$location', function ($route, $location){
    if (!$route.current.params.accounts) $location.path('/task/create')
}]