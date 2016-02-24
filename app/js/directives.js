// 'use strict';

/* Directives */

angular.module('myApp.directives', [])
.directive('loader', [function() {
    return {
      restrict: "E",
      replace: true,
      template: '<div class="loader" ng-if="loading">\
                    <div class="loader-content">\
                      <h3>Loading Data</h3>\
                      <md-progress-circular md-diameter="150" md-mode="indeterminate"></md-progress-circular> \
                    </div>\
                </div>'
    }
}])
.directive('widgets', [function(){
    return {
        restrict: 'E',
        replace: true,
        templateUrl: './partials/widgets.html'
    }
 }])
.directive('jobProgress', [function(){
    return {
        restrict: 'E',
        replace: true,
        templateUrl: './partials/job-progress.html'
    }
 }])
.directive('jobTable', [function(){
    return {
        restrict: 'E',
        replace: true,
        templateUrl: './partials/job-table.html'
    }
 }])
.directive('discoveryTable', [function(){
    return {
        restrict: 'E',
        replace: true,
        templateUrl: './partials/discovery-table.html'
    }
 }])
.directive('jobInfoCard', [function(){
    return {
        restrict: 'E',
        replace: true,
        templateUrl: './partials/job-info-card.html'
    }
 }])
.directive('jobDetailCard', [function(){
    return {
        restrict: 'E',
        replace: true,
        templateUrl: './partials/job-detail-card.html'
    }
 }])
.directive('throughputChart', [function(){
    return {
        restrict: 'E',
        replace: true,
        template: '<md-card flex-gt-xs="50" flex="100">\
                    <h3>Throughput Graph 123</h3>\
                    <nvd3 options="thrChartOptions" data="thrChartData"></nvd3>\
                  </md-card>',
        link: function (scope, element, attrs) {
        scope.thrChartOptions = {
          chart: {
            type: 'cumulativeLineChart',
            height: 450,
            margin: {
              top: 20,
              right: 20,
              bottom: 60,
              left: 65
            },
            x: function(d) {
              return d[0];
            },
            y: function(d) {
              return d[1];
            },
            color: d3.scale.category10().range(),
            duration: 300,
            useInteractiveGuideline: true,
            clipVoronoi: false,
            xAxis: {
              axisLabel: 'X Axis',
              tickFormat: function(d) {
                return d3.time.format('%m/%d/%y')(new Date(d))
              },
              showMaxMin: false
            },
            yAxis: {
              axisLabel: 'Y Axis',
              axisLabelDistance: 20,
              showMaxMin: false,
              tickFormat: function(d) {
                return d3.format('r')(d)
              }
            },
            valueFormat: function(d) {
              return d3.format(".0f")(d);
            }
          }
        };
        scope.throughProm.then(function(){

          var temp1 = scope.throughput;
          var temp = { err: [], kb: [], re: []};
          var err = 0, kb = 0, re = 0;

          for (var i = 0; i < temp1.length; i++) {
            var time = new Date(temp1[i].ts);
            var ce = temp1[i].er;
            temp.err.push([time, ce]);
            if (err < ce) {
              err = ce;
            }
            var ck = temp1[i].kb;
            temp.kb.push([time, ck]);
            if (kb < ck) {
              kb = ck;
            }
            var cr = temp1[i].re;
            temp.re.push([time, cr]);
            if (re < cr) {
              re = cr;
            }
          }
          scope.thrChartData = [{
            key: "Errors",
            values: temp.err,
            bar: true
          }, {
            key: "Kb",
            values: temp.kb,
            bar: true
          }, {
            key: "Remaining",
            values: temp.re,
            bar: true
          }];
        })
      }
    }

 }])
.directive('sourceChart', [function(){
    return {
        restrict: 'E',
        replace: true,
        template: '<md-card flex-gt-xs="50" flex="100" class="sources left-margin">\
                    <div layout="column">\
                      <h3>Data Sources</h3>\
                      <nvd3 options="sourceOptions" data="sourceData"></nvd3>\
                    </div>\
                  </md-card>',
        link: function (scope, element, attrs) {
          scope.sourceOptions = {
            chart: {
              type: 'pieChart',
              height: 450,
              donut: true,
              x: function(d) {
                return d.key;
              },
              y: function(d) {
                return d.y;
              },
              showLabels: true,
              duration: 500,
              legend: {
                margin: {
                  top: 5,
                  right: 70,
                  bottom: 5,
                  left: 0
                }
              },
              color: function(d) {
                return d.color
              },
              valueFormat: function(d) {
                return d3.format(".0f")(d);
              }
            }
          };
      }
    }

 }])


;