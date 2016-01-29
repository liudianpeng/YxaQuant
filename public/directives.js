angular.module('yxaquant.plugin', [])
.directive('datepicker', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            $(element)
                .datepicker({
                    format: "yyyy-mm-dd"
                })
                .on('changeDate', function(ev){
                    $(this).datepicker( "hide" )
                })
        }
    };
})
.directive('range', function() {
    return {
        restrict: 'A',
        scope: {
            rv: '='
        },
        link: function(scope, element, attrs) {
            var elData = $(element)[0].dataset
            $(element).slider({
                range: 'min',
                min: +elData.min,
                max: +elData.max,
                value: +attrs.ngValue,
                step: +elData.step,
                slide: function(e, ui) {
                    scope.rv = ui.value
                    scope.$apply()
                },
                change: function(ev, ui) {
                    scope.rv = ui.value
                    scope.$apply()
                }
            });

        }
    };
})
.directive('datatable', function($timeout) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var $table = $( element )
            // wait for angular process tpl
            $timeout(function(){
                // Initialize DataTable
                $table.DataTable( {
                    "aLengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
                    "bStateSave": true
                });
                // Initalize Select Dropdown after DataTables is created
                $table.closest( '.dataTables_wrapper' ).find( 'select' ).select2( {
                    minimumResultsForSearch: -1
                });
            },0)
        }
    };
})