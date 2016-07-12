'use strict';

angular.module('bahmni.common.conceptSet').controller('multiSelectObservationSearchController',['$scope', function($scope){

    var possibleAnswers = $scope.observation.getPossibleAnswers();
    $scope.values = [];

    var init = function(){
        _.values($scope.observation.selectedObs).forEach(function(observation){
            $scope.values.push({"label" : observation.autocompleteValue, "name" : observation.autocompleteValue});
        });
    };

    $scope.search = function(query){
        var matchingAnswers = new Array();
        _.forEach(possibleAnswers, function(answer){
            if (typeof answer.name != "object" && answer.name.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
                answer.label = answer.name;
                matchingAnswers.push(answer);
            } else if (typeof answer.name == "object") {
                answer.name = answer.name.name;
                answer.label = answer.name;
                matchingAnswers.push(answer);
            }
            else {
                var synonyms = _.map(answer.names, 'name');
                _.find(synonyms, function (name) {
                    if (name.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
                        answer.label = name + " => " + answer.name;
                        matchingAnswers.push(answer);
                    }

                });
            }

        });
        return _.uniqBy(matchingAnswers,'uuid');
    };

    $scope.setLabel = function(answer){
        answer.label = answer.name;
        return true;
    };

    $scope.validate=function() {
        var value = $("input.input").val();
        if(_.isEmpty($scope.search(value))){
            $("input.input").val("");
            $($('tags-input')[0]).removeClass('ng-invalid');
        }
    };

    init();

}]);

