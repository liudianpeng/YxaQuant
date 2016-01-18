angular.module('yxaquant.plugin', [])

.directive('datapicker', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            $(element).datepicker()
                .on('changeDate', function(ev){
                    console.log(ev.date)
                })

        }
    };
})
.directive('range', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {

            var elData = $(element)[0].dataset
            var $input =  $(element).next('input')
            $(element).slider({
                range: 'min',
                min: 0,
                max: 100,
                value: 0,
                step: 1,
                slide: function(e, ui) {
                    $input.val(ui.value+'%')
                },
                change: function(ev, ui) {

                    $input.val(ui.value+'%')
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