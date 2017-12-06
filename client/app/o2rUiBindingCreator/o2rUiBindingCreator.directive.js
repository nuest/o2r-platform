/**
 * Directive for the creation of ui bindings.
 * This directive contains the whole workflow for the creation of one new ui binding.
 * The directive can be called via
 * <o2r-ui-binding-creator></o2r-ui-binding-creator>
 * and expects a scope "o2r-codefiles".
 * 
 * o2r-codefiles MUST be an array of Strings, where each string is a path to a single file within an ERC.
 * 
 * Example:
 * 
 * <o2r-ui-binding-creator o2r-codefiles="["path/to/first/file", "path/to/second/file"]"></o2r-ui-binding-creator>
 * 
 * Given that the calling controller has a scope variable vm.files = ["path/to/first/file", "path/to/second/file"]
 * the directive can be called within the scope of that controller as follows
 * 
 * <o2r-ui-binding-creator o2r-codefiles="{{vm.files}}"></o2r-ui-binding-creator>
 */
(function(){
    'use strict';

    angular
        .module('starter.o2rUiBindingCreator')
        .directive('o2rUiBindingCreator', o2rUiBindingCreator);
    
    o2rUiBindingCreator.$inject = ["$log", "$window", "$document", "$http", "env", "o2rUiBindingCreatorHelper"];
    function o2rUiBindingCreator($log, $window, $document, $http, env, o2rUiBindingCreatorHelper){
        return{
            restrict: 'E',
            scope: {
                codefiles: '@o2rCodefiles' 
            },
            templateUrl: 'app/o2rUiBindingCreator/o2rUiBindingCreator.template.html',
            link: link
        };

        function link(scope, element, attrs){
            if(!scope.codefiles) throw 'o2r-codefiles is undefined';

            var logger = $log.getInstance('o2rUiBindingCreator');
            var lines;
            var codeText;
            var selectedLinesIndex = [];
            // turn string into array and then add actual path
            // NOTE: Remove the prepareCodefiles wrapper as soon as the paths are consistent
            scope.codefiles = prepareCodefiles(angular.fromJson(scope.codefiles));
            scope.codefile = {path: scope.codefiles[0], lineHighlight: ""}; //only use first codefile so far
            scope.figures = ["Figure 1", "Figure 2", "Figure 3", "Figure 4", "Figure 5"];
            scope.step3Done = step3Done;
            scope.step5Done = step5Done;
            scope.selectionEvent = selectionEvent;
            scope.step4Done = step4Done;
            scope.showOriginalCode = true;
            scope.selectedText = {};
            scope.selectedVariable = {};
            
            scope.steps = {};
            scope.steps.step1 = {};
            scope.steps.step2 = {};
            scope.steps.step3 = {};
            scope.steps.step4 = {};
            scope.steps.step5 = {};
            scope.steps.step6 = {};
            
            scope.steps.step1.show = true;
            scope.steps.step2.show = false;
            scope.steps.step3.show = false;
            scope.steps.step4.show = false;
            scope.steps.step5.show = false;
            scope.steps.step6.show = false;

            scope.steps.step3.showSelectedText = false;
            
            scope.steps.step1.options = [{text: "Change a variable", value:0}, {text: "other", value: 1}];
            scope.steps.step1.selected = null;
            
            scope.steps.step2.options = [{text: "Slider", value:0}, {text: "Switch", value:1}];
            scope.steps.step2.selected = null;
            
            scope.steps.step4.showSelection = false;

            scope.steps.step3.disable = true;
            scope.steps.step4.disable = true;
            scope.steps.step5.disable = true;

            // scope.steps.step5.min_value = 0;
            // scope.steps.step5.max_value = 0;
            scope.steps.step5.step_size = 1;
            
            scope.$watch('steps.step1.selected', function(newVal, oldVal){
                if(typeof newVal === 'number'){
                    switch (newVal) {
                        case 0:
                            scope.steps.step2.show = true;
                            break;
                        default:
                        break;
                    }
                }
            });
            
            scope.$watch('steps.step2.selected', function(newVal, oldVal){
                if(typeof newVal === 'number'){
                    switch (newVal) {
                        case 0:
                        scope.steps.step3.show = true;
                        scope.steps.step5.type = newVal;
                    }
                }
            });
            
            scope.$watch('codefile', function(newVal, oldVal){
                $http.get(newVal.path)
                .then(function(response){
                    codeText = o2rUiBindingCreatorHelper.removeCarriage(response.data);
                })
                .catch(function(err){
                    logger.error(err);
                });
            });

            //////////////////
            
            function prepareCodefiles(files){
                for(var i in files){
                    var parts = files[i].split('/');
                    var result = '';
                    for(var j in parts){
                        if(j==0) result += env.api + '/compendium/' + parts[j] + '/data';
                        else result += '/' + parts[j];
                    }
                    files[i] = result;
                }
                return files;
            }

            // function updateValue(){
            //     var selection = $window.getSelection().toString();
            //     logger.info(selection);
            //     var value = parseFloat(selection);
            //     if(isNaN(value)){
            //         throw "Value not a number";
            //     } else {
            //         scope.steps.step4.result.value = value;
            //     }
            // }
            
            function step3Done(){
                logger.info(selectedLinesIndex);
                scope.selectedText.source = o2rUiBindingCreatorHelper.mergeSelectedCode(selectedLinesIndex, codeText);
                scope.showOriginalCode = false;
                scope.steps.step3.showSelectedText = true;
                scope.steps.step4.show = true;
            }
            
            function step4Done(){
                // updateValue();
                // scope.steps.step4.result.show = true;
                scope.steps.step5.show = true;
                scope.steps.step5.min_value = scope.selectedVariable.val;
                scope.steps.step5.max_value = scope.selectedVariable.val;
            }

            function step5Done(){
                scope.steps.step6.show = true;
            }

            function selectionEvent(){
                // only check selection if we are in step 3 or 4
                
                // check selection for step 3
                if(scope.steps.step3.show && !scope.steps.step4.show){
                    var selection = $window.getSelection().toString();
                    // ignore click events
                    if(selection.length != 0){
                        var lines = o2rUiBindingCreatorHelper.getSelectionLines(selection, codeText);
                        selectedLinesIndex = o2rUiBindingCreatorHelper.removeOverlap(lines, selectedLinesIndex);
                        scope.codefile.lineHighlight = o2rUiBindingCreatorHelper.setUpLineHighlight(selectedLinesIndex);
                        scope.steps.step3.disable = false;
                    }
                // check selection for step 4
                } else if(scope.steps.step4.show && !scope.steps.step5.show){
                    var selection = $window.getSelection().toString();
                    // scope.steps.step4.result.selection = selection;
                    if(selection.length != 0){
                        scope.selectedVariable = o2rUiBindingCreatorHelper.validateVariable(selection);
                        // if selection is valid assign values to scope variable
                        if(scope.selectedVariable){
                            scope.selectedVariable.line = o2rUiBindingCreatorHelper.getSelectionLines(selection, scope.selectedText.source);
                            scope.selectedText.lineHighlight = scope.selectedVariable.line.start;
                            scope.steps.step4.disable = false;
                        } else {
                            scope.steps.step4.disable = true;
                        }
                        // show information in the frontend regardless of valid/invalid selection
                        scope.steps.step4.showSelection = true;
                    }
                }
            }
        }  
    }
})();