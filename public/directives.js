angular.module('yxaquant.plugin', [])
.directive('datepicker', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            $(element)
                .datepicker({
                    format: "yyyy-mm-dd",
                    initialDate: new Date("2013-2-3"),
                    weekStart: 6
                })
                .on('changeDate', function(ev){
                    $(this).datepicker( "hide" )
                })
        }
    };
})
.directive('timepicker', function() {
    return {
        restrict: 'A',
        scope: {
            defaultTime: '&'
        },
        link: function(scope, element, attrs) {
            var $this = $(element),
                opts = {
                    showSeconds: attrs.showSeconds || false,
                    defaultTime: scope.defaultTime || 'current',
                    showMeridian: attrs.showMeridian == 'true' || false,
                    minuteStep: attrs.minuteStep || 15,
                    secondStep: attrs.secondStep || 15
                };

            $this.timepicker(opts);
        }
    };
})
.directive('selectStocks', function(Stock) {
    return {
        restrict: 'E',
        templateUrl: '/templates/components/select-stocks.html',
        scope: {
            chosenStocks: '=data'
        },
        link: function(scope, element, attrs) {
            var firstParams = {
                skip: 0,
                limit: 20
            }
            Object.assign(scope.filter, firstParams)
            scope.chosenStocks = scope.chosenStocks || []
            scope.getStocks = function (params) {
                Stock.query(params).$promise.then(function (data) {
                    scope.stocks = data
                    // scope.checkChosenStocks()
                })
            }
            scope.checkChosenStocks = function (stock) {
                scope.stocks.forEach(function (s, i, stocks) {
                    if (scope.chosenStocks.some(function (cs) {
                        return cs.id == s.id 
                    })) {
                        stocks[i].checked = true
                    }
                })
            }
            // scope.getStocks(firstParams)
            scope.search = function () {
                $location.path('/task')
            }
            scope.add = function () {
                scope.stocks.push({})
            }
            scope.inputBlur = function (stock) {
                $timeout(function (argument) {
                    stock.focus=false 
                    if(stock.data)
                        stock.keyword = stock.data.name
                    else
                        stock.keyword = ''
                }, 100)

            }
            scope.doSearch = function (key, val) {
                var keys = ['percentage', 'pb', /*'peLyr', */'peTtm', /*'psr', */'marketCapital', 'floatMarketCapital']
                var params = {}
                keys.forEach(function (key) {
                    params[key] = scope.filter[key]
                    params[key] = params[key].map(function (i) {
                        return i=='Infinity' ? '' : i
                    })
                    if (['marketCapital', 'floatMarketCapital'].indexOf(key) > -1) {
                        params[key] = params[key].map(function (i) {
                            if (typeof i == 'string' && i == 'Infinity')
                                return ''
                            else 
                                return i*Math.pow(10, 8)

                        })
                    }
                    if (scope.filter[key])
                        params[key] = params[key].join('~')
                })
                params.keyword = scope.filter.keyword
                scope.getStocks(params)
            }
            scope.checkAll = function () {
                scope.stocks.forEach(function (s) {
                    s.checked = scope.isAllChecked
                    scope.checkIt(s)
                })
                _.uniqBy(scope.chosenStocks,'id')
            }
            scope.checkIt = function (stock) {
                if(stock.checked)
                    scope.addToChosen(stock)
                else
                    scope.removeFromChosen(stock)
            }
            scope.addToChosen = function (stock) {
                scope.chosenStocks.push(stock)
            }
            scope.removeFromChosen = function (stock) {
                scope.chosenStocks.some(function (s,i) {
                    if (s.id == stock.id)
                        scope.chosenStocks.splice(i,1)
                    return s.id == stock.id
                })
            }

        }
    }
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
                if (x > elData.maxShow) x = '不限'
                return x
            }

            function anti_easeInVal(x) {
                if (x == 'Infinity' || x == elData.max) 
                    y = elData.maxShow*(1+marginForInfinity)
                else
                    y = (1 - Math.asin(1 - x/(elData.maxShow*(1+marginForInfinity)))/(Math.PI*0.5))*(+elData.max)
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
                params.initValues = JSON.parse(attrs.value)
                if (elData.maxShow) {
                    params.values = [anti_easeInVal(params.initValues[0]), anti_easeInVal(params.initValues[1])]
                } else {
                    params.values = params.initValues
                }
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

                $label_1.html((prefix ? prefix : '') + params.initValues[0] + (postfix ? postfix : ''));
                $handles.first().append( $label_1 );

                $label_2.html((prefix ? prefix : '') + params.initValues[1]+ (postfix ? postfix : ''));
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