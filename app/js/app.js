// 'use strict';

// Declare app level module which depends on filters, and services

angular.module('myApp', [
    'myApp.controllers',
    'myApp.filters',
    'myApp.services',
    'myApp.directives',
    'ngRoute',
    'ngMaterial',
    'nvd3'
])
// Set Web API Base here
.constant('webapiBase', 'http://smlab.cloudapp.net:25714')

.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('blue');
})
.config(function($routeProvider, $locationProvider) {

    $routeProvider.
    when('/', {
        templateUrl: 'partials/home.html',
        controller: 'mainCtrl'
    }).
    when('/job/:id', {
        templateUrl: 'partials/detail.html',
        controller: 'detailCtrl'
    }).
    when('/discovery/:id', {
        templateUrl: 'partials/discovery.html',
        controller: 'reportsCtrl'
    }).
    when('/reports', {
        templateUrl: 'partials/reports.html',
        controller: 'reportsCtrl'
    }).
    otherwise({redirectTo: '/'});

    $locationProvider.html5Mode(true);
});