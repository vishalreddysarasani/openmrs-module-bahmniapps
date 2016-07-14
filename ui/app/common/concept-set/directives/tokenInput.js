angular.module('bahmni.common.conceptSet')
    .directive('tokenInput', function () {
        var getSelectedValues = function(observation){
            if(!_.isUndefined(observation.selectedObs))
                return _.map(observation.selectedObs, 'value');
            else if(!_.isUndefined(observation.value))
                return [observation.value];
            return [];
        };
        var setDisplayString = function(codedAnswers){
            angular.forEach(codedAnswers, function(answer){
                var shortName = answer.names ? _.first(answer.names.filter(function (name) {
                    return name.conceptNameType === 'SHORT'
                })) : null;
                answer.displayString = shortName ? shortName.name : answer.displayString;
            })

        };
        return {
            link: function (scope, element, attrs) {
                setDisplayString(scope.codedAnswers);
                var selectedValues = getSelectedValues(scope.observation);
                var unselectedValues = _.xorBy(scope.codedAnswers, selectedValues, 'uuid');
                var unselectedValuesNames = _.map(unselectedValues,"displayString");
                element.tokenInput(scope.codedAnswers,{
                    theme: "facebook",
                    noResultsText: "Nothing found.",
                    propertyToSearch : "displayString",
                    searchDelay : 100,
                    excludeCurrent: true,
                    prePopulate : selectedValues,
                    minChars : 2,
                    tokenLimit : scope.multiSelect ? null : 1,
                    onAdd : function(item){
                        unselectedValues = _.pullAllBy(unselectedValues, [{"uuid" : item.uuid}], 'uuid');
                        unselectedValuesNames = _.map(unselectedValues,"displayString");
                        scope.observation.toggleSelection(item);
                        scope.observation.validateObservation(scope.conceptSetRequired) ?  $(this).closest('.singleautocomplete').removeClass('illegalValue') : $(this).closest('.singleautocomplete').addClass('illegalValue');
                        if (scope.$parent.observation && typeof scope.$parent.observation.onValueChanged == 'function') {
                            scope.$parent.observation.onValueChanged();
                        }
                        scope.$parent.handleUpdate();
                    },
                    onDelete : function(item){
                        unselectedValues.push(item);
                        unselectedValuesNames.push(item.displayString);
                        scope.observation.toggleSelection(item);
                        scope.observation.validateObservation(scope.conceptSetRequired) ?  $(this).closest('.singleautocomplete').removeClass('illegalValue') : $(this).closest('.singleautocomplete').addClass('illegalValue');
                        if (scope.$parent.observation && typeof scope.$parent.observation.onValueChanged == 'function') {
                            scope.$parent.observation.onValueChanged();
                        }
                        scope.$parent.handleUpdate();
                    },

                });
                $("input").keyup(function(valuefound){
                   var value = $(this).val();
                   var valueFound = false;
                    if(value.length >= 2){
                        _.forEach(unselectedValuesNames, function(answer){
                            if(answer.toLowerCase().indexOf(value.toLowerCase()) != -1){
                                valueFound = true;
                                return valueFound;
                            }
                        });
                        if(valueFound == false){
                            $(this).closest('.singleautocomplete').addClass('illegalValue');
                            $('input').on('blur', function() {
                                $(this).closest('.singleautocomplete').hasClass('illegalValue') ? $(this).closest('.singleautocomplete').removeClass('illegalValue') : null ;
                            });
                        }
                    }
                    if(value == ''  || valueFound == true ) {
                        $(this).closest('.singleautocomplete').hasClass('illegalValue') ? $(this).closest('.singleautocomplete').removeClass('illegalValue') : null ;
                    }

                })
            },
            scope: {
                observation: '=',
                codedAnswers : '=',
                multiSelect: '=',
                conceptSetRequired: '='
            }
        };


    });