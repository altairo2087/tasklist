"use strict";

var myApp = angular.module('myApp', []);

myApp.controller('TaskList', function($scope) {

  /**
   * массив всех статусов
   * идентификатор используется как аттрибут id
   */
  $scope.statusArr = {
    status1:"statusName1",
    status2:"statusName2",
    status3:"statusName3",
    status4:"statusName4"
  }

  // статус по умолчанию для новых заданий
  $scope.defaultStatus = "status1";

  /**
   * коллекция всех заданий
   */
  $scope.allTasks = {}

  /**
   * Здесь связываем задания в статусах
   * В коллекции идентификаторов статусов
   * хранятся идентификаторы заданий, которые им принадлежат
   */
  $scope.tasksInStatus = {};

  /**
   * Список всех моделей select
   * В каждом задании есть модель, где мы выбираем статус
   * айди_задания => текущий статус
   */
  $scope.statusSelect = {};

  // модель, названия для новых заданий
  $scope.title = "";

  /**
   * Добавление задания
   */
  $scope.addTask = function() {
    // придется вручную рассчитать айди нового задания
    var newId = 0;
    for(var key in $scope.allTasks) {
      if (key>newId)
        newId = key;
    }
    ++newId;

    $scope.allTasks[newId] = {
      name:$scope.title,
      status:$scope.defaultStatus
    }
    $scope.tasksInStatus[$scope.defaultStatus].push(newId);
    $scope.statusSelect[newId] = $scope.statusArr[$scope.defaultStatus];
    $scope.title = "";
  }

  /**
   * Инициализация контроллера
   */
  $scope.init = function() {

    // инициализируем массив статусов для связи с заданиями
    for (var key in $scope.statusArr) {
      if ($scope.statusArr.hasOwnProperty(key)) {
        $scope.tasksInStatus[key] = [];
      }
    }

    /* Здесь привязываем задания к статусам и
     * заполняем массив моделей к каждому заданию
     */
    for (var key in $scope.allTasks) {
      if ($scope.allTasks.hasOwnProperty(key)) {
        $scope.tasksInStatus[$scope.allTasks[key].status].push(key);
        $scope.statusSelect[key] = $scope.statusArr[$scope.allTasks[key].status];
      }
    }
  }

  $scope.init();

  /**
   * Изменение статуса задания
   * @param taskId
   * @param newStatus
   */
  $scope.changeStatus = function(taskId, newStatus) {
    var oldStatus = $scope.allTasks[taskId].status;
    // удаляем задание из его текущего статуса
    for (var key in $scope.tasksInStatus[oldStatus]) {
      if ($scope.tasksInStatus[oldStatus][key]==taskId) {
        $scope.tasksInStatus[oldStatus].splice(key,1);
        break;
      }
    }
    // записываем новый статус
    for (var key in $scope.statusArr) {
      if ($scope.statusArr[key]==newStatus) {
        $scope.tasksInStatus[key].push(taskId);
        $scope.allTasks[taskId].status = key;

        $scope.statusSelect[taskId] = newStatus;
        break;
      }
    }
  }
});

/**
 * drug'n'drop
 * здесь получился нативный js от html5, может не работать в ie
 */

/**
 * директива перетаскиваемого объекта
 */
myApp.directive('draggable', function() {
  return function($scope, element) {

    var el = element[0];

    el.draggable = true;

    el.addEventListener(
      'dragstart',
      function(e) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('Text', this.id);
        e.dataTransfer.setData('taskid', el.dataset.taskid);
        this.classList.add('drag');
        return false;
      },
      false
    );

    el.addEventListener(
      'dragend',
      function(e) {
        this.classList.remove('drag');
        return false;
      },
      false
    );
  }
});

/**
 * директива объекта, принимающего перетаскивание
 */
myApp.directive('droppable', function() {
  return {
    scope: {
      drop: '&'
    },
    link: function($scope, element) {

      var el = element[0];

      el.addEventListener(
        'dragover',
        function(e) {
          e.dataTransfer.dropEffect = 'move';

          if (e.preventDefault) e.preventDefault();
          this.classList.add('over');
          return false;
        },
        false
      );

      el.addEventListener(
        'dragenter',
        function(e) {
          this.classList.add('over');
          return false;
        },
        false
      );

      el.addEventListener(
        'dragleave',
        function(e) {
          this.classList.remove('over');
          return false;
        },
        false
      );

      el.addEventListener(
        'drop',
        function(e) {

          if (e.stopPropagation)
            e.stopPropagation();

          this.classList.remove('over');
          $scope.$parent.changeStatus(e.dataTransfer.getData("taskid"), $scope.$parent.statusArr[el.id]);
          $scope.$apply('drop()');

          return false;
        },
        false
      );
    }
  }
});