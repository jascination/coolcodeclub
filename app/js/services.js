// 'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', [])
.service('apiService', ['$http', 'webapiBase', function($http, webapiBase) {
  
  this.getJobs = function(){
    return $http.get(webapiBase + '/api/v1/jobs').then(function(res){
      for(var i = 0; i<res.data.length; i++){
        var curr = res.data[i];
        var rem = curr.ItemsRemaining;
        var fail = curr.ItemsFailed;
        var total = curr.ItemsTotal;

        var done = total-rem-fail;

        res.data[i].progress = (done / total) || 0;

        switch(res.data[i].JobStatus){
          case 'Discovery':
            res.data[i].statusLabel ='info';
            break;
          case 'CompleteWithErrors':
            res.data[i].statusLabel ='warning';
            break;
          case 'Failed':
            res.data[i].statusLabel ='danger';
            break;
          case 'Complete':
            res.data[i].statusLabel ='success';
            break;
          case 'Cancelled':
            res.data[i].statusLabel ='warning';
            break;
          case 'Processing':
            res.data[i].statusLabel ='info';
            break;
          case 'Created':
            res.data[i].statusLabel ='primary';
            break;
          default:
            res.data[i].statusLabel = 'info';
            break;
        }
      }
      return res.data;
    }, function(err){
      return false;
    })
  }

  this.getWidgets = function(id){
    if(id){
      var url = '/api/v1/widgets/' + id;
    }else{
      var url = '/api/v1/widgets';
    }

    return $http.get(webapiBase + url).then(function(res){
      var obj = {
          data       : formatBytes(res.data.DataMigrated, 2),
          items      : res.data.ItemsMigrated,
          throughput : res.data.CurrentThroughput,
          processing : res.data.JobsProcessing,
          users      : res.data.UsersMigrated
      }
      return obj;
    }, function(err){
      console.log(err);
      return false;
    })
  }

  this.getJobDetail = function(id){
    return $http.get(webapiBase + '/api/v1/jobs/' + id).then(function(res) {
      return res.data;
    }, function(err) {
      console.log(err);
      return false;
    })
  }

  this.getThroughput = function(id, start, fin){
    return $http.get(webapiBase + '/api/v1/reports/job/progress/' + id /*+ '/' + start + '/' + fin*/).then(function(res) {
      return res.data;
    }, function(err) {
      console.log(err);
      return false;
    })
  }

  this.getSources = function(id){
    return $http.get(webapiBase + '/api/v1/Reports/Job/MessageClasses/' + id).then(function(res) {
      return res.data;
    }, function(err) {
      console.log(err);
      return false;
    })
  }

  this.getReport = function(id){
    return $http.get(webapiBase + '/api/v1/jobs/' + id + '/Entry').then(function(res) {
      // console.log(res.data);
      for (var i = 0; i < res.data.length; i++) {
        
        res.data[i].statusLabel = getStatusLabels(res.data[i]);
        var path = res.data[i].Path.replace("\\\\", "");
        res.data[i].Path = path;
        var paths = path.split('\\');
        res.data[i].smallPath = paths[paths.length - 1];
        res.data[i].DiscoveryDate = new Date(res.data[i].DiscoveryDate);
        res.data[i].date = res.data[i].DiscoveryDate.toDateString();
      }
      return res.data;
    }, function(err) {
      console.log(err);
      return false;
    });
  }



  formatBytes = function(bytes, decimals) {
    if (bytes == 0) return '0 Byte';
    var k = 1000;
    var dm = decimals + 1 || 3;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return [Number((bytes / Math.pow(k, i)).toPrecision(dm)), sizes[i]];
  }

  function getStatusLabels(d) {
    switch (d.ItemStatus) {
      case 'Created':
        return 'primary';
        break;
      case 'Discovery':
        return 'info';
        break;
      case 'Processing':
        return 'info';
        break;
      case 'Throttled':
        return 'warning';
        break;
      case 'OnHold':
        return 'warning';
        break;
      case 'Complete':
        return 'success';
        break;
      case 'CompleteWithErrors':
        return 'warning';
        break;
      case 'Failed':
        return 'danger';
        break;
      case 'Cancelled':
        return 'danger';
        break;
    }
  }

}]);
