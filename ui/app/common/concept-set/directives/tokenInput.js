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
                var codedAnswersNames = _.map(scope.codedAnswers,"displayString");
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
                        scope.observation.toggleSelection(item);
                        if (scope.$parent.observation && typeof scope.$parent.observation.onValueChanged == 'function') {
                            scope.$parent.observation.onValueChanged();
                        }
                        scope.$parent.handleUpdate();
                    },
                    onDelete : function(item){
                        scope.observation.toggleSelection(item);
                        if (scope.$parent.observation && typeof scope.$parent.observation.onValueChanged == 'function') {
                            scope.$parent.observation.onValueChanged();
                        }
                        scope.$parent.handleUpdate();
                    }
                });
                $("input").keyup(function(){
                    var value = $(this).val();
                    var valueFound = false;
                    if(value.length >= 2){
                        _.forEach(codedAnswersNames, function(answer){
                            if(_.findIndex(answer, value) == -1){
                                valueFound = true;
                            }
                        });
                    }
                    if(!valueFound){
                       element.addClass('illegalValue');
                    }
                })
            },
            scope: {
                observation: '=',
                codedAnswers : '=',
                multiSelect: '='
            }
        };


    });