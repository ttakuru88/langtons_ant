function Ant(x, y, pattern) {
  this.x = x;
  this.y = y;
  this.v = 0; // 0 = 上, 1 = 右 2 = 下 3 = 左
  this.xVec = [0, 1, 0, -1];
  this.yVec = [-1, 0, 1, 0];
  this.pattern = pattern;
  this.patternLength = pattern.length;
  this.cycle = 0;

  this.colors = [];
  for(var i=1; i<=this.patternLength; i++){
    this.colors[~~(i/this.patternLength * 255)] = {
      prev: i == 1 ? 255 : ~~((i-1)/this.patternLength * 255),
      code: this.pattern[i-1],
      next: i == this.patternLength ? ~~(1/this.patternLength * 255) : ~~((i+1)/this.patternLength * 255)
    };
  }
}
Ant.prototype = {
  move: function(place){
    if(this.colors[place].code == 'R'){
      this.turnRight();
      this.goStraight();
    }
    else {
      this.turnLeft();
      this.goStraight();
    }

    return this.colors[place].next;
  },

  turnRight: function(){
    this.v++;
    if(this.v > 3) { this.v = 0; }
  },
  turnLeft: function(){
    this.v--;
    if(this.v < 0) { this.v = 3; }
  },
  goStraight: function(){
    this.x += this.xVec[this.v];
    this.y += this.yVec[this.v];
  },
  defaultColor: function(){
    return ~~(1/this.patternLength * 255);
  }
}

var mapSize = 500;
var map, ctx, t = 0, timer, ant;

var requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;

function render(){
  ctx.putImageData(map, 0, 0);

  ctx.fillText(t, 10, 20);

  requestAnimationFrame(render);
}

function stop(){
  if(timer) {
    clearInterval(timer);
    timer = null;
  }
}

function clearCanvas(color){
  for(var x=0; x<mapSize; x++){
    for(var y=0; y<mapSize; y++){
      var p = (x + y * mapSize) * 4
      map.data[p] = map.data[p+1] = map.data[p+2] = color;
      map.data[p+3] = 0;
    }
  }
}

function start(step, pattern){
  history.pushState(null, document.title, "?s="+step+"&p="+pattern)

  stop();
  ant = new Ant(~~(mapSize / 2), ~~(mapSize / 2), pattern);
  t = 0

  clearCanvas(ant.defaultColor());

  requestAnimationFrame(render);

  if(step == 'animate') {
    timer = setInterval(function(){
      if(move()) { stop(); }
    }, 1);
  }
  else{
    while(t < step){
      if(move()){ break; };
    }
  }
}

function move(){
  var p = (ant.x + ant.y * mapSize) * 4;

  map.data[p] = map.data[p+1] = map.data[p+2] = ant.move(map.data[p]);
  map.data[p+3] = 255;

  t++;
  return ant.x < 0 || ant.y < 0 || ant.x >= mapSize || ant.y >= mapSize
}

$(function(){
  var $ui = {
    stepSelector: $('input[name=change-step]'),
    step:         $('#step'),
    canvas:       $('#map'),
    pattern:      $('#pattern')
  };

  $ui.canvas.attr('width', mapSize).attr('height', mapSize).css({width: mapSize, height: mapSize});
  ctx = $ui.canvas[0].getContext('2d');
  map = ctx.getImageData(0, 0, mapSize, mapSize);

  $ui.stepSelector.on('change', function(e){
    var step = $(e.target).val();
    $ui.step.val(step);
    start(step, $ui.pattern.val());
  });

  $ui.step.on('change', function(e){
    start($ui.step.val(), $ui.pattern.val());
  });

  $ui.pattern.on('change', function(e){
    start($ui.step.val(), $ui.pattern.val());
  });

  var params = location.search.replace('?', '').split('&');
  for(var i=0; i<params.length; i++){
    var param = params[i].split('=');
    switch(param[0]) {
      case 's':
        $ui.step.val(param[1]);
        break;
      case 'p':
        $ui.pattern.val(param[1]);
        break;
    }
  }

  start($ui.step.val(), $ui.pattern.val());
});
