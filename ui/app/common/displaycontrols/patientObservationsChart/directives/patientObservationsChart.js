'use strict';

angular.module('bahmni.common.displaycontrol.patientObservationsChart').directive('patientObservationsChart', ['$translate', 'spinner', 'observationsService', '$q',
    function ($translate, spinner, observationsService, $q) {
        var link = function ($scope) {

            var getPatientObservationChartData = function () {

                return observationsService.fetchPatientObservationsChartData($scope.patient.uuid, $scope.enrollment).success(function (data) {
                    $scope.flowsheetHeader = data.flowsheetHeader;
                    $scope.flowsheetData = data.flowsheetData;
                    $scope.flowsheetDataKeys = Object.keys($scope.flowsheetData);
                    $scope.highlightedColumnIndex = data.flowsheetHeader.indexOf(data.currentMilestoneName);
                })
            };

            var init = function () {
                return $q.all([getPatientObservationChartData()]).then(function () {
                });
            };

            spinner.forPromise(init());
        };
        return {
            restrict: 'E',
            link: link,
            scope: {
                section: "=",
                patient: "=",
                enrollment: "@"
            },
            templateUrl: "../common/displaycontrols/patientObservationsChart/views/patientObservationsChart.html"
        };
    }]);
