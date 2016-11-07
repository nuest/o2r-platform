(function(){
    'use strict';
    
    window.__env = window.__env || {};

    var env = {
        server : window.__env.server || 'o2r.uni-muenster.de',
        c_api: window.__env.api || '/api/v1',
        sizeRestriction: window.__env.sizeRestriction || 10000000,
        disableTracking: window.__env.disableTracking || false,
        enableDebug: window.__env.enableDebug || false,
        version: window.__env.version || 'deployment'
    };
    env.api = env.server + env.c_api;

    angular
        .module('starter', [
            "treeControl",
            "ui.router", 
            "hljs", 
            "ngFileUpload", 
            'ngAnimate', 
            'ngMaterial',
            'angulartics', 
            'angulartics.piwik',
            'md.data.table'])
        .constant('env', env)
        .config(config);
    
    config.$inject = ['$stateProvider', '$urlRouterProvider', '$mdThemingProvider', '$logProvider', 'hljsServiceProvider', '$analyticsProvider'];

    function config($stateProvider, $urlRouterProvider, $mdThemingProvider, $logProvider, hljsServiceProvider, $analyticsProvider){
        $analyticsProvider.developerMode(window.__env.disableTracking);
        if(window.__env.disableTracking) console.log("Tracking globally disabled!");

        $logProvider.debugEnabled(window.__env.enableDebug);

        hljsServiceProvider.setOptions({
            tabReplace: '    '
        });

        var customPrimary = {
            '50': '#0681ff',
            '100': '#0074ec',
            '200': '#0068d2',
            '300': '#005bb9',
            '400': '#004f9f',
            '500': '#004286',
            '600': '#00356c',
            '700': '#002953',
            '800': '#001c39',
            '900': '#001020',
            'A100': '#208eff',
            'A200': '#399bff',
            'A400': '#53a8ff',
            'A700': '#000306'
        };
        $mdThemingProvider
            .definePalette('customPrimary', customPrimary);

        var customAccent = {
            '50': '#000000',
            '100': '#0a0a0c',
            '200': '#15161b',
            '300': '#212229',
            '400': '#2c2e37',
            '500': '#383945',
            '600': '#4e5161',
            '700': '#5a5c6f',
            '800': '#65687d',
            '900': '#71748b',
            'A100': '#4e5161',
            'A200': '#434553',
            'A400': '#383945',
            'A700': '#7e8197'
        };
        $mdThemingProvider
            .definePalette('customAccent', customAccent);

        var customWarn = {
            '50': '#e43e49',
            '100': '#e12734',
            '200': '#d11d29',
            '300': '#bb1a25',
            '400': '#a41720',
            '500': '#8e141c',
            '600': '#781118',
            '700': '#610e13',
            '800': '#4b0b0f',
            '900': '#35070a',
            'A100': '#e7545e',
            'A200': '#ea6a73',
            'A400': '#ed8188',
            'A700': '#1e0406'
        };
        $mdThemingProvider
            .definePalette('customWarn', customWarn);

        var customBackground = {
            '50': '#dedede',
            '100': '#d1d1d1',
            '200': '#c4c4c4',
            '300': '#b7b7b7',
            '400': '#ababab',
            '500': '#9E9E9E',
            '600': '#919191',
            '700': '#848484',
            '800': '#787878',
            '900': '#6b6b6b',
            'A100': '#eaeaea',
            'A200': '#f7f7f7',
            'A400': '#ffffff',
            'A700': '#5e5e5e'
        };
        $mdThemingProvider
            .definePalette('customBackground', customBackground);

        $mdThemingProvider.theme('default')
            .primaryPalette('customPrimary')
            .accentPalette('customAccent')
            .warnPalette('customWarn')
            .backgroundPalette('grey');
            
        $urlRouterProvider.otherwise("/home"); // For any unmatched url, send to /route1
        $stateProvider
            .state('home', {
                url: "/home",
                templateUrl: "app/homeView/home.html",
                controller: 'HomeCtrl',
                controllerAs: 'vm'
            })
            .state('erc', {
                url: "/erc/:ercid",
                templateUrl: "app/ercView/erc.html",
                controller: 'ErcCtrl',
                controllerAs: 'vm',
                resolve: {
                    compInfo: compInfoService
                }
            })
            .state('author', {
                url: "/author/:authorid",
                templateUrl: "app/authorView/author.html",
                controller: 'AuthorCtrl',
                controllerAs: 'vm',
                resolve: {
                    authorInfo: authorInfoService
                }
            })
            .state('search', {
                url: "/search?term",
                templateUrl: "app/searchView/search.html",
                controller: 'SearchCtrl',
                controllerAs: 'vm',
                resolve: {
                    searchResults: searchResultsService
                }
            })
            .state('impressum', {
                url: "/impressum",
                templateUrl: "app/templates/impressum.html",
                controller: 'ImpressumCtrl',
                controllerAs: 'vm'
            })
            .state('privacy', {
                url: "/privacy",
                templateUrl: "app/templates/privacy.html",
                controller: 'PrivacyCtrl',
                controllerAs: 'vm'
            })
            .state('404', {
                url: "/404",
                templateUrl: "app/templates/404.html"
            });
    }

    authorInfoService.$inject = ['$stateParams', '$log', 'metadata'];
    function authorInfoService($stateParams, $log, metadata){
        var id = $stateParams.authorid;
        $log.debug('authorInfoService, authorid: ' + id);
        return metadata.callMetadata_author(id);
    }

    compInfoService.$inject = ['$stateParams', '$log', 'publications', 'ercView'];
    function compInfoService($stateParams, $log, publications, ercView){
        var ercId = $stateParams.ercid;
        $log.debug('compInfoService, ercid: ' + ercId);
        ercView.callJobs(ercId);
        return publications.getRequest(ercId);
    }

    searchResultsService.$inject = ['$stateParams', '$log', 'metadata'];
    function searchResultsService($stateParams, $log, metadata){
        var term = $stateParams.term;
        $log.debug('searchResultsService, term: ' + term);
        return metadata.callMetadata_search(term);
    }
})();  