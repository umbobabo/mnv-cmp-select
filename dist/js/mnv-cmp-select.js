function ecSelect(config){
  'use strict';
  var list, _currentList, widgetClassName = "mnv-ec-select", drawList, reorderSelect, trigger, bindEvents, container, log, list, prefix, reset, resetSelect;
  prefix = widgetClassName + "-";
  this.init = function(config) {
    if(config.list instanceof Array === false) {
      log("list should be an array");
      return false;
    }
    if(config.list.length === 0) {
      log("list shouldn't be empty");
      return false;
    }
    container = document.querySelectorAll('.' + widgetClassName);
    if(container.length===0){
      log('Unable to find a widget with class ' + widgetClassName);
      return false;
    }
    container = container[0];
    reset = document.createElement('button');
    reset.className = prefix + "reset search";
    // textContent is required for FF
    (document.all) ? (reset.innerText = 'Reset') : (reset.textContent = 'Reset');
    list = document.createElement('ul');
    list.className = prefix + "list";
    list.style.display = 'block';
    container.appendChild(list);
    container.appendChild(reset);
    // Create items list
    _currentList = [].concat(config.list);
    drawList();
    bindEvents();
  };

  drawList = function(){
    list.innerHTML = '';
    _currentList.map(function(obj, i){
      var item = document.createElement('li');
      item.innerHTML = obj.label;
      item.addEventListener('click', function(){
        trigger.call(container, 'selectChange', obj);
        reorderSelect(i);
        drawList();
      });
      list.appendChild(item);
    });
  }

  trigger = function(ev, data){
    var myEvent;
    function noCustomEvent(ev, data){
      var myEvent = document.createEvent('CustomEvent');
      myEvent.initCustomEvent(ev, true, true, data);
      return myEvent;
    }
    if (window.CustomEvent) {
      try {
        myEvent = new CustomEvent(ev, {
          detail: data
        });
      }
      catch (e){
        myEvent = noCustomEvent(ev, data);
      }
    } else {
      myEvent = noCustomEvent(ev, data);
    }
    log('triggered: ' + ev + ' with data : ' + data);
    this.dispatchEvent(myEvent);
  };

  log = function(txt){
    if(window.console && window.console.log){
      console.log(txt);
    }
  };

  resetSelect = function(){
    _currentList = [].concat(config.list);
    drawList();
  };

  reorderSelect = function(i){
    _currentList = _currentList.move(i,0);
    drawList();
  }

  Array.prototype.move = function (old_index, new_index) {
    if (new_index >= this.length) {
        var k = new_index - this.length;
        while ((k--) + 1) {
            this.push(undefined);
        }
    }
    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
    return this; // for testing purposes
  };

  bindEvents = function(){
    reset.addEventListener('click', function(){
      resetSelect();
      trigger.call(container, 'selectReset', _currentList);
    });
  };

  if(!config){
    log("You have to provide a config object");
    return false;
  }
  this.init(config);
}
