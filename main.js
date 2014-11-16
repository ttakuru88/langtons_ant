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
var map, ctx;

var requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;

function render(){
  ctx.putImageData(map, 0, 0);

  requestAnimationFrame(render);
}

$(function(){
  var $canvas = $('#map').attr('width', mapSize).attr('height', mapSize).css({width: mapSize, height: mapSize});
  ctx = $canvas[0].getContext('2d');
  map = ctx.getImageData(0, 0, mapSize, mapSize);

  requestAnimationFrame(render);

  var ant = new Ant(~~(mapSize / 2), ~~(mapSize / 2));
  var timer = setInterval(function(){
    var p = (ant.x + ant.y * mapSize) * 4;

    map.data[p+3] = 255;
    if(map.data[p] === 0){
      ant.turnRight();
      ant.goStraight();

      map.data[p] = 255;
    }
    else {
      ant.turnLeft();
      ant.goStraight();

      map.data[p] = 0;
    }

    if(ant.x < 0 || ant.y < 0 || ant.x >= mapSize || ant.y >= mapSize){ clearInterval(timer); }
  }, 1);
});
