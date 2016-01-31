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
            var isRange = elData.type == 'range'
            var reps = 0;
            var prefix = elData.prefix
            var postfix = elData.postfix
            var $label_1 = $('<span class="ui-label"></span>')
            var $label_2 = $label_1.clone()
            var marginForInfinity = 0.05



            function easeInVal(y) {
                var x = Math.ceil( (1 - Math.sin(Math.PI*0.5*(1+(y/+elData.max)))) * elData.maxShow*(1+marginForInfinity) )
                if (x > elData.maxShow) x = 'Infinity'
                return x
            }

            function anti_easeInVal(x) {
                if (x == 'Infinity') 
                    y = elData.maxShow*(1+marginForInfinity)
                else
                    y = ( 1 - x/(elData.maxShow*(1+marginForInfinity)) ) 
                    y = Math.ceil( (1 - Math.sin(Math.PI*0.5*(1+(x/+elData.max)))) * elData.maxShow*(1+marginForInfinity) )
                return y

            }

            var params = {
                range: isRange || elData.type || 'min',
                min: +elData.min,
                max: +elData.max,
                step: +elData.step,
                updateValToOutter: function(ui) {

                    // 刻度
                    if (elData.nums) {
                        var nums = JSON.parse(elData.nums)
                        if (ui.values) {
                            ui.values[0] = nums[ui.values[0]]
                            ui.values[1] = nums[ui.values[1]]
                        } else {
                            ui.value = nums[ui.value]
                        }
                    }

                    // 
                    if (elData.maxShow) {
                        if (ui.values) {
                            ui.values[0] = easeInVal(ui.values[0])
                            ui.values[1] = easeInVal(ui.values[1])
                        } else {
                            ui.value = nums[ui.value]
                        }
                    }

                    if (isRange) {
                        scope.rv = ui.values
                    } else {
                        scope.rv = ui.value
                    }
                    scope.$apply()
                }
            }

            // set init values to slider 
            if (isRange) {
                params.values = JSON.parse(attrs.value)
                if (elData.maxShow) {
                    // params.values[0] = easeInVal(params.values[0])
                    // params.values[1] = easeInVal(params.values[1])

                }
                var min_val = params.values[0]
                var max_val = params.values[1]
            } else {
                params.value = attrs.value
                var value = params.value
            }

            
            if (isRange) {
                params.slide = function (e, ui) {
                    params.updateValToOutter(ui)
                    var min_val = (prefix ? prefix : '') + ui.values[0] + (postfix ? postfix : ''),
                        max_val = (prefix ? prefix : '') + ui.values[1] + (postfix ? postfix : '');

                    $label_1.html( min_val );
                    $label_2.html( max_val );

                    reps++;
                }
                params.change = function (e, ui) {
                    params.updateValToOutter(ui)
                    if(reps == 1) {
                        var min_val = (prefix ? prefix : '') + ui.values[0] + (postfix ? postfix : ''),
                            max_val = (prefix ? prefix : '') + ui.values[1] + (postfix ? postfix : '');

                        $label_1.html( min_val );
                        $label_2.html( max_val );
                    }

                    reps = 0;
                }
                // init
                $(element).slider(params)
                var $handles = $(element).find('.ui-slider-handle');

                $label_1.html((prefix ? prefix : '') + min_val + (postfix ? postfix : ''));
                $handles.first().append( $label_1 );

                $label_2.html((prefix ? prefix : '') + max_val+ (postfix ? postfix : ''));
                $handles.last().append( $label_2 );
            } else {
                params.slide = function (e, ui) {
                    params.updateValToOutter(ui)
                    var val = (prefix ? prefix : '') + ui.value + (postfix ? postfix : '');

                    $label_1.html( val );

                    reps++;
                }
                params.change = function (e, ui) {
                    params.updateValToOutter(ui)
                    if(reps == 1) {
                        var val = (prefix ? prefix : '') + ui.value + (postfix ? postfix : '');

                        $label_1.html( val );
                    }

                    reps = 0;

                }
                // init
                $(element).slider(params)
                var $handles = $(element).find('.ui-slider-handle');

                $label_1.html((prefix ? prefix : '') + value + (postfix ? postfix : ''));
                $handles.html( $label_1 );
            }




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