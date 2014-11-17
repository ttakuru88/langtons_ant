function Ant(x, y) {
  this.x = x;
  this.y = y;
  this.v = 0; // 0 = 上, 1 = 右 2 = 下 3 = 左
  this.xVec = [0, 1, 0, -1];
  this.yVec = [-1, 0, 1, 0];
}
Ant.prototype = {
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

function clearCanvas(){
  for(var x=0; x<mapSize; x++){
    for(var y=0; y<mapSize; y++){
      var p = (x + y * mapSize) * 4
      map.data[p] = map.data[p+1] = map.data[p+2] = 192;
      map.data[p+3] = 255;
    }
  }
}

function start(step){
  stop();
  ant = new Ant(~~(mapSize / 2), ~~(mapSize / 2));
  t = 0

  clearCanvas();

  requestAnimationFrame(render);

  if(step == 'animation') {
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

  map.data[p+3] = 255;
  if(map.data[p] === 0){
    ant.turnRight();
    ant.goStraight();

    map.data[p] = map.data[p+1] = map.data[p+2] = 255;
  }
  else {
    ant.turnLeft();
    ant.goStraight();

    map.data[p] = map.data[p+1] = map.data[p+2] = 0;
  }

  t++;
  return ant.x < 0 || ant.y < 0 || ant.x >= mapSize || ant.y >= mapSize
}

$(function(){
  var $canvas = $('#map').attr('width', mapSize).attr('height', mapSize).css({width: mapSize, height: mapSize});
  ctx = $canvas[0].getContext('2d');
  map = ctx.getImageData(0, 0, mapSize, mapSize);

  start('animation');

  var $ui = {
    step_selector: $('input[name=change-step]'),
    step: $('#step')
  };

  $ui.step_selector.on('change', function(e){
    var step = $(e.target).val();
    $ui.step.val(step);
    start(step);
  });

  $ui.step.on('change', function(e){
    start($ui.step.val());
  });
});
