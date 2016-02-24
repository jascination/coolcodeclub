// 'use strict';
/* Controllers */
(function() {
	angular.module('myApp.controllers', []).controller('mainCtrl', ['$window', '$document', 'apiService', 'toolBelt', '$rootScope', '$mdSidenav', '$scope', '$http', '$interval', '$location', '$timeout',
		function($window, $document, apiService, toolBelt, $rootScope, $mdSidenav, $scope, $http, $interval, $location, $timeout) {
			$scope.loading  = true;
      $rootScope.curr = 'home';
      var currentSort = 'JobId';
      var loadCount   = 0;

      
      $scope.headers = [
        { name: 'JobId', direction: -1},
        { name: 'BatchId', direction: -1},
        { name: 'JobStatus', direction: -1},
        { name: 'SourceMailbox', direction: -1},
        { name: 'TargetMailbox', direction: -1},
        { name: 'ItemsTotal', direction: -1},
        { name: 'ItemsRemaining', direction: -1},
        { name: 'ItemsFailed', direction: -1},
        { name: 'progress', direction: -1}
      ];
			
      getData();
			
      var dataInt = $interval(function() {
				getData(true);
			}, 15000);

      $window.addEventListener('resize', resize);

      function resize(initial){
        var topHeight = document.getElementById('job-card').getBoundingClientRect();
        var sizeFunct = function(){
          if (!$scope.$root.$$phase) $scope.$digest();
          $scope.$broadcast('$md-resize');
          if(initial){$scope.loading = false;}
        }      
        $scope.listStyle = {
          height: ($window.innerHeight - topHeight.top - 184) + 'px'
        };

        if(initial){
          $timeout(sizeFunct, 1000)
        }else{
          sizeFunct();
        }
      }

      function checkLoaded() {
        loadCount++;
        if (loadCount === 2) {
          resize(true)
        }
      }

      function getData(recheck) {
        // Load Widgets API
        apiService.getWidgets().then(function(widgets) {
          $scope.widgets = widgets;
          if (!recheck) {
            checkLoaded();
          }
        });
        // Load Jobs API
        apiService.getJobs().then(function(jobs) {
          $scope.data = jobs;

          if (!recheck) {
            checkLoaded();
            console.log($scope.data)
            $scope.sortBy('JobId');
          } else {
            $scope.sortBy(currentSort, true);
          }
        })
      }

      // Make the sidenav work
      $scope.sideToggle = function() {
        $mdSidenav('left').toggle();
      };
       
      // Table sorting function
			$scope.sortBy = function(type, redo) {
				var direction;
				for (var i = 0; i < $scope.headers.length; i++) {
					if ($scope.headers[i].name === type) {
						direction = $scope.headers[i].direction;
						if (!redo) {
							$scope.headers[i].direction *= -1;
						} else {
							direction = direction * -1;
						}
					}
				}
				currentSort = type;
				$scope.data = toolBelt.sortData($scope.data, currentSort, direction);
			}

      // Table filtering function
			$scope.search = function(row) {
				if (!$scope.query ||
          (String(row.JobId).toLowerCase().indexOf($scope.query.toLowerCase()) !== -1) ||
          (String(row.BatchId).toLowerCase().indexOf($scope.query.toLowerCase()) !== -1) ||
          (String(row.JobStatus).toLowerCase().indexOf($scope.query.toLowerCase()) !== -1) ||
          (String(row.SourceMailbox).toLowerCase().indexOf($scope.query.toLowerCase()) !== -1) ||
          (String(row.TargetMailbox).toLowerCase().indexOf($scope.query.toLowerCase()) !== -1)
        ){
					return true;
				}else{
				  return false;
        }
			};


			$scope.detail = function(id, type) {
				$interval.cancel(dataInt);
				if (type === 'Discovery') {
					$location.path('/discovery/' + id);
				} else {
					$location.path('/job/' + id);
				}
			}

			$rootScope.go = function(destination, type) {
				if (dataInt && $interval) {
					$interval.cancel(dataInt);
				}

        if(type && type === 'Discovery'){
          $location.path('/discovery/' + destination);
        }else if(type){
          $location.path('/job/' + destination);
        }else{
				  $location.path(destination);
        }
			}
		}
	]).controller('detailCtrl', ['webapiBase', 'apiService', 'toolBelt', '$rootScope', '$mdSidenav', '$scope', '$http', '$interval', '$routeParams', '$location', '$q',
		function(webapiBase, apiService, toolBelt, $rootScope, $mdSidenav, $scope, $http, $interval, $routeParams, $location, $q) {
			
      $rootScope.curr = 'detail';
			
      $scope.sideToggle = function() {
				$mdSidenav('left').toggle();
			};
      
      var id             = $routeParams.id;
      var deferred       = $q.defer()
      $scope.throughProm = deferred.promise;
      $scope.sourceData  = [];
			
			$rootScope.go = function(url) {
				// console.log("GO " + url)
				if (dataInt) {
					$interval.cancel(dataInt);
				}
				$location.path(url);
			}
			$scope.loading = true;
			var loadCount = 0;

			function checkLoaded() {
				loadCount++;
				if (loadCount === 3) {
					$scope.loading = false;
				}
			}

			function getData(recheck) {
				
        function getThroughput(start, fin) {
					if (!fin) {
						fin = new Date().toISOString();
					}
					apiService.getThroughput(id, start, fin).then(function(throughput) {
					
            $scope.throughput = throughput;
						
            if (!recheck) {
              deferred.resolve();
							checkLoaded();
						}

					}, function(err) {
					   console.log(err);
					})
				}
				
        apiService.getJobDetail(id).then(function(job) {
					// // console.log(res.data);
					$scope.data = job;
					var start = $scope.data.TimeStarted,
					  	fin = $scope.data.TimeFinished;

					$scope.date = toolBelt.makeDates(start, fin);
					
          getThroughput(start, fin);
					
          statusClass();
					
          if (!recheck) {
						checkLoaded()
					}

				});

				apiService.getSources(id).then(function(sources) {
					// // console.log('sources', res.data);
					sourceChart(sources);

					if (!recheck) {
						checkLoaded()
					}
				})

        apiService.getWidgets(id).then(function(widgets) {
          $scope.widgets = widgets;
          if (!recheck) {
            checkLoaded();
          }
        });
			}

			getData();
			
      var dataInt = $interval(function() {
				getData(true);
			}, 15000);


			function statusClass() {
				switch ($scope.data.JobStatus) {
					case 'Discovery':
						$scope.statusClass = '';
						break;
					case 'CompleteWithErrors':
						$scope.statusClass = 'md-warn';
						break;
					case 'Failed':
						$scope.statusClass = 'fail';
						break;
					case 'Complete':
						$scope.statusClass = 'success';
						break;
					case 'Cancelled':
						$scope.statusClass = 'fail';
						break;
					case 'Processing':
						$scope.statusClass = 'going';
						break;
					case 'Created':
						$scope.statusClass = '';
						break;
				}
			}

			function sourceChart(data) {
				$scope.sourceData = [];
				for (var i = 0; i < data.length; i++) {
					var temp = {
						key: data[i].Label,
						y: data[i].Data,
						color: data[i].Color
					}
					$scope.sourceData.push(temp);
				}
			}

			$scope.headers = [
        {	name: 'Subject',	direction: -1}, 
        {	name: 'Folder',	direction: -1}, 
        {	name: 'MessageClass',	direction: -1}, 
        {	name: 'Size',	direction: -1}, 
        {	name: 'StatusMessage',	direction: -1}
      ];

			$scope.sortBy = function(type, redo) {
				var direction;
				for (var i = 0; i < $scope.headers.length; i++) {
					if ($scope.headers[i].name === type) {
						direction = $scope.headers[i].direction;
						if (!redo) {
							$scope.headers[i].direction *= -1;
						} else {
							direction = direction * -1;
						}
					}
				}
				currentSort = type;

				$scope.failures = toolBelt.sortData();
			}

			$scope.search = function(row) {
				if (!$scope.query || 
            (String(row.Subject).toLowerCase().indexOf($scope.query.toLowerCase()) !== -1) || 
            (String(row.Size).toLowerCase().indexOf($scope.query.toLowerCase()) !== -1) || 
            (String(row.StatusMessage).toLowerCase().indexOf($scope.query.toLowerCase()) !== -1) || 
            (String(row.MessageClass).toLowerCase().indexOf($scope.query.toLowerCase()) !== -1) || 
            (String(row.Folder).toLowerCase().indexOf($scope.query.toLowerCase()) !== -1)
          ){
					return true;
				}
				return false;
			};
		
    }
	]).controller('reportsCtrl', ['$window', 'webapiBase', 'apiService', 'toolBelt', '$rootScope', '$mdSidenav', '$scope', '$http', '$timeout', '$interval', '$location', '$routeParams',
		function($window, webapiBase, apiService, toolBelt, $rootScope, $mdSidenav, $scope, $http, $timeout, $interval, $location, $routeParams) {
			var id;
			if ($location.path() === "/reports") {
				$rootScope.curr = 'reports';
				id = '1488';
			} else {
				var discovery = true;
				id = $routeParams.id;
			}
			$scope.loading = true;
			var allData = [];
			$scope.listStyle = {};
			$scope.sideToggle = function() {
				$mdSidenav('left').toggle();
			};
			$rootScope.go = function(url) {
				if (dataInt && $interval) {
					$interval.cancel(dataInt);
				}
				$location.path(url);
			}

			function getData(repeat) {
				var loaded = 0;

				function checkLoaded() {
					if (discovery) {
						loaded++;
						if (loaded === 2) {
							$scope.loading = false;
						}
					} else {
						$scope.loading = false;
					}
				}

        apiService.getReport(id).then(function(data) {
					
					$scope.data = data;
					// Temp Files for Orphan Filtering
					allData = data;
					// Resize Virtual Repeat Container
					$timeout(function() {
						onResize();
						$scope.$broadcast('$md-resize');
						if (!repeat) {
							checkLoaded();
						}
					}, 1000)
				});

				if (discovery && !repeat) {
					$http.get(webapiBase + '/api/v1/jobs/' + $routeParams.id).then(function(res) {
						// console.log('job',res.data);
						$scope.jobData = res.data;
						$scope.date = toolBelt.makeDates($scope.jobData.TimeStarted, $scope.jobData.TimeFinished);
						checkLoaded();
					}, function(err) {
						// console.log(err);
					})
				}
			}
			getData();
			var dataInt = $interval(function() {
				getData(true);
			}, 60000);
			$scope.headers = [{
				name: "ItemStatus",
				direction: -1
			}, {
				name: "Path",
				direction: -1
			}, {
				name: "FolderCount",
				direction: -1
			}, {
				name: "MessageCount",
				direction: -1
			}, {
				name: "EmailCount",
				direction: -1
			}, {
				name: "CalendarCount",
				direction: -1
			}, {
				name: "TaskCount",
				direction: -1
			}, {
				name: "OtherCount",
				direction: -1
			}, {
				name: "Owner1",
				direction: -1
			}, {
				name: "DiscoveryDate",
				direction: -1
			}]
			var currentSort = 'Id';
			$scope.ophaned = function() {
				if ($scope.showOrphaned) {
					var temp = [];
					for (var i = 0; i < $scope.data.length; i++) {
						if (!$scope.data[i].Owner1) {
							temp.push($scope.data[i]);
						}
					}
					$scope.data = temp;
				} else {
					$scope.data = allData;
				}
			}
			$scope.sortBy = function(type, redo) {
				var direction;
				for (var i = 0; i < $scope.headers.length; i++) {
					if ($scope.headers[i].name === type) {
						direction = $scope.headers[i].direction;
						if (!redo) {
							$scope.headers[i].direction *= -1;
						} else {
							direction = direction * -1;
						}
					}
				}
				currentSort = type;
				$scope.data = toolBelt.sortData($scope.data, currentSort);
			}
			$scope.search = function(row) {
				if (!$scope.query || (String(row.ItemStatus).toLowerCase().indexOf($scope.query.toLowerCase()) !== -1) || (String(row.Path).toLowerCase().indexOf($scope.query.toLowerCase()) !== -1) || (String(row.FolderCount).toLowerCase().indexOf($scope.query.toLowerCase()) !== -1) || (String(row.MessageCount).toLowerCase().indexOf($scope.query.toLowerCase()) !== -1) || (String(row.EmailCount).toLowerCase().indexOf($scope.query.toLowerCase()) !== -1) || (String(row.CalendarCount).toLowerCase().indexOf($scope.query.toLowerCase()) !== -1) || (String(row.TaskCount).toLowerCase().indexOf($scope.query.toLowerCase()) !== -1) || (String(row.OtherCount).toLowerCase().indexOf($scope.query.toLowerCase()) !== -1) || (String(row.Owner1).toLowerCase().indexOf($scope.query.toLowerCase()) !== -1) || (String(row.DiscoveryDate).toLowerCase().indexOf($scope.query.toLowerCase()) !== -1)) {
					return true;
				}
				return false;
			};


			$window.addEventListener('resize', onResize);

			function onResize() {
				var topHeight = document.getElementById('job-card').getBoundingClientRect();
				$scope.listStyle.height = ($window.innerHeight - topHeight.top - 190) + 'px';
				if (!$scope.$root.$$phase) $scope.$digest();
			}
		}
	]);
})()