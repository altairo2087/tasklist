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
  };

  // статус по умолчанию для новых заданий
  $scope.defaultStatus = "status1";

  /**
   * коллекция всех заданий
   */
  $scope.allTasks = {};

  // поддерживается ли localstorage
  $scope.isLocalStorage = typeof(Storage) !== "undefined";

  // сохранение всех заданий в localstorage
  $scope.saveToStorage = function (tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

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

  // модель, название для новых заданий
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
    };
    $scope.tasksInStatus[$scope.defaultStatus].push(newId);
    $scope.statusSelect[newId] = $scope.statusArr[$scope.defaultStatus];
    $scope.title = "";
    // сохранение в localstorage
    if ($scope.isLocalStorage)
      $scope.saveToStorage($scope.allTasks);
  };

  /**
   * удаление задания
   */
  $scope.deleteTask = function(taskId) {

    var status = $scope.allTasks[taskId] && $scope.allTasks[taskId].status;
    for (var key in $scope.tasksInStatus[status]) {
      if ($scope.tasksInStatus[status][key]==taskId) {
        $scope.tasksInStatus[status].splice(key,1);
        break;
      }
    }

    $scope.allTasks[taskId] && delete $scope.allTasks[taskId];
    $scope.statusSelect[taskId] && delete $scope.statusSelect[taskId];
    // сохранение в localstorage
    if ($scope.isLocalStorage)
      $scope.saveToStorage($scope.allTasks);
  };

  /**
   * Инициализация контроллера
   */
  $scope.init = function() {

    if ($scope.isLocalStorage && localStorage.getItem("tasks"))
      $scope.allTasks = JSON.parse(localStorage.getItem("tasks"));

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
  };

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
    // сохранение в localstorage
    if ($scope.isLocalStorage)
      $scope.saveToStorage($scope.allTasks);
  }
});

/**
 * drug'n'drop
 * здесь получился нативный js от html5, не работает в ie<10
 */

/**
 * директива перетаскиваемого объекта
 */
myApp.directive('draggable', function() {
  return function(scope, element) {

    var el = element[0];

    el.draggable = true;

    el.addEventListener(
      'dragstart',
      function(e) {

        var taskId = el.dataset && el.dataset.taskid || el.getAttribute('data-taskid');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text', taskId);
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

          if (e.preventDefault)
            e.preventDefault();
          this.classList.add('bg-warning');
          return false;
        },
        false
      );

      el.addEventListener(
        'dragenter',
        function(e) {
          this.classList.add('bg-warning');
          return false;
        },
        false
      );

      el.addEventListener(
        'dragleave',
        function(e) {
          this.classList.remove('bg-warning');
          return false;
        },
        false
      );

      el.addEventListener(
        'drop',
        function(e) {

          if (e.stopPropagation)
            e.stopPropagation();

          this.classList.remove('bg-warning');
          $scope.$parent.changeStatus(e.dataTransfer.getData("text"), $scope.$parent.statusArr[el.id]);
          $scope.$apply('drop()');

          e.preventDefault();

          return false;
        },
        false
      );
    }
  }
});