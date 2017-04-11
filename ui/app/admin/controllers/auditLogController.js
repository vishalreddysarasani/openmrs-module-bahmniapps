'use strict';

angular.module('bahmni.admin')
    .controller('auditLogController', ['$scope', 'spinner', 'auditLogService', 'messagingService',
        function ($scope, spinner, auditLogService, messagingService) {
            var DateUtil = Bahmni.Common.Util.DateUtil;
            var defaultMessage = "";
            var isNotEmpty = function (value) {
                return value !== undefined && value !== "";
            };

            var mapParamsForRequest = function (params) {
                return _.pickBy(params, isNotEmpty);
            };

            var updateIndex = function (logs, defaultFirstIndex, defaultLastIndex) {
                $scope.firstIndex = logs.length ? _.first(logs).auditLogId : defaultFirstIndex;
                $scope.lastIndex = logs.length ? _.last(logs).auditLogId : defaultLastIndex;
            };

            var setMessage = function (logsLength, message) {
                $scope.errorMessage = logsLength ? defaultMessage : message;
            };

            var updatePage = function (logs, defaultFirstIndex, defaultLastIndex, message) {
                if (logs.length) {
                    $scope.logs = logs;
                }
                setMessage(logs.length, message);
                updateIndex(logs, defaultFirstIndex, defaultLastIndex);
            };

            var getDate = function () {
                var date = $scope.startDate || $scope.today;
                $scope.startDate = date;
                return date;
            };

            var defaultView = function (params, message) {
                return auditLogService.getLogs(params).then(function (logs) {
                    logs.reverse();
                    updatePage(logs, 0, 0, message);
                });
            };

            $scope.next = function () {
                var params = {
                    lastAuditLogId: $scope.lastIndex,
                    username: $scope.username,
                    patientId: $scope.patientId,
                    startFrom: $scope.startDate
                };
                var promise = auditLogService.getLogs(mapParamsForRequest(params)).then(function (logs) {
                    updatePage(logs, $scope.firstIndex, $scope.lastIndex, "No more events to be displayed !!");
                });
                spinner.forPromise(promise);
            };

            $scope.prev = function () {
                var message = "No more events to be displayed !!";
                var promise;
                if (!$scope.firstIndex && !$scope.lastIndex) {
                    promise = defaultView(mapParamsForRequest({
                        defaultView: true,
                        startFrom: $scope.startDate
                    }), message);
                } else {
                    var params = {
                        lastAuditLogId: $scope.firstIndex,
                        username: $scope.username,
                        patientId: $scope.patientId,
                        prev: true,
                        startFrom: $scope.startDate
                    };
                    promise = auditLogService.getLogs(mapParamsForRequest(params)).then(function (logs) {
                        updatePage(logs, $scope.firstIndex, $scope.lastIndex, message);
                    });
                }
                spinner.forPromise(promise);
            };

            $scope.today = DateUtil.today();
            $scope.maxDate = DateUtil.getDateWithoutTime($scope.today);
            $scope.runReport = function () {
                if ($("#startDate").hasClass("ng-invalid-max")) {
                    messagingService.showMessage("error", "Please enter valid date !!");
                    return;
                }
                var params = {
                    username: $scope.username, patientId: $scope.patientId,
                    startFrom: $scope.startDate
                };
                var promise = auditLogService.getLogs(mapParamsForRequest(params)).then(function (logs) {
                    $scope.logs = logs;
                    setMessage(logs.length, "No matching events found for given criteria !!");
                    updateIndex(logs, 0, 0);
                });
                spinner.forPromise(promise);
            };

            var init = function () {
                $scope.logs = [];
                var promise = defaultView({startFrom: getDate(), defaultView: true}, "No events to display !!");
                spinner.forPromise(promise);
            };

            init();
        }]);
