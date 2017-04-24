var treemapDirective = new window.Babbage.TreemapDirective();
var app = angular.module('BabbageApplication', ['angular.filter']);
treemapDirective.init(app);

app.directive('navigatableTreeMap', function(){
  return {
    restrict: 'E',
    templateUrl: 'navigatable-tree-map.html',
    scope: {
      cube: '@',
      apiUrl: '@',
    },
    controller: function ($scope, $http, $timeout) {
      console.log($scope.cube);
      console.log($scope.apiUrl);

      let level, level_name, hierarchy, hierarchies, dimensions, item_key,
          aggregates;
      init();

      function init() {
        $http.get($scope.apiUrl + '/cubes/' + $scope.cube + '/model')
        .then(
          function(response) {
            hierarchies = response.data.model.hierarchies;
            dimensions = response.data.model.dimensions;
            aggregates = response.data.model.aggregates;
            //console.log(hierarchies);
            //console.log(dimensions);
            hierarchy = Object.keys(hierarchies)[2];
            level = 0;
            level_name = buildLevelName(level, hierarchies, hierarchy);
            $scope.isVisible = true;
            $scope.state = {
              group: [level_name],
              aggregates: Object.keys(aggregates)[1],
              filter: ''
            };
            console.log($scope.state);
          },
          function(error) {
            alert('An error occurred when querying to the API');
            console.log(error);
          }
        );

        $scope.$on('babbage-ui.click', goDeeper);
      }

      function goDeeper($event, component, item) {
        item_key = item.key;
        level++;
        level_name = buildLevelName(level, hierarchies, hierarchy);
        if (level != 1) {
          $scope.state.filter += ";";
        }
        $scope.state.filter += $scope.state.group[level-1] + ":" + item.key;
        $scope.state.group = [level_name];
        update();
        console.log("state: ", $scope.state);
      }

      function buildLevelName(level, hierarchies, hierarchy) {
        return dimensions[hierarchies[hierarchy].levels[level]].key_ref;
      }

      function update() {
        $timeout(function() {
          $scope.isVisible = false;
          $timeout(function() {
            $scope.isVisible = true;
          });
        });
      }

      $scope.goBack = function() {
        if (level < 1) return;
        let last_filter = $scope.state.group[level-1] + ":" + item_key;
        let full_filter = $scope.state.filter;
        $scope.state.filter =
          full_filter.substr(0, full_filter.length - last_filter.length - 1);
        level--;
        level_name = buildLevelName(level, hierarchies, hierarchy);
        $scope.state.group = [level_name];
        update();
        console.log("state: ", $scope.state);
      };

    }
  };
});

app.controller('VisualizationController', function ($scope) {
  $scope.datasets = ['boost:boost-moldova-2005-2014', '4b6d969e07ef7a86aa54e539fc127a14:berlin_1617_test_2'];
  $scope.apiUrl = 'http://next.openspending.org/api/3';
});