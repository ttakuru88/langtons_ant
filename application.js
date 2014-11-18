function Ant(x, y, pattern, scale) {
  this.x = x;
  this.y = y;
  this.v = 0; // 0 = 上, 1 = 右 2 = 下 3 = 左
  this.pattern = pattern;
  this.patternLength = pattern.length;
  this.cycle = 0;
  this.scale = scale;

  this.xVec = [0, 1, 0, -1];
  this.yVec = [-1, 0, 1, 0];
  for(var i=0; i<4; i++){
    this.xVec[i] *= scale;
    this.yVec[i] *= scale;
  }

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
var intervalMs = 1;
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

function updateState(step, pattern, animate, scale){
  history.pushState(null, document.title, "?s="+step+"&p="+pattern+"&a="+animate+"&c="+scale)
  $('#tweet-button').html('<a href="https://twitter.com/share" class="twitter-share-button" data-url="'+location.href+'">Tweet</a>')
  if(window.twttr.widgets) { twttr.widgets.load(); }
}

function start(step, pattern, animate, scale){
  updateState(step, pattern, animate, scale);
  stop();
  ant = new Ant(~~(mapSize / 2), ~~(mapSize / 2), pattern, scale);
  t = 0

  clearCanvas(ant.defaultColor());

  requestAnimationFrame(render);

  while(t < step){
    if(move()){ break; };
  }

  if(animate) { play(); }
}

function play(){
  if(timer) { return; }

  timer = setInterval(function(){
    if(move()) { stop(); }
  }, intervalMs);
}

function move(){
  var p = (ant.x + ant.y * mapSize) * 4;
  var prevX = ant.x, prevY = ant.y;
  var color = ant.move(map.data[p]);

  for(var y=0; y<ant.scale; y++){
    for(var x=0; x<ant.scale; x++){
      p = ((prevX + x) + (prevY + y) * mapSize) * 4;
      map.data[p] = map.data[p+1] = map.data[p+2] = color
      map.data[p+3] = 255;
    }
  }

  t++;
  return ant.x < 0 || ant.y < 0 || ant.x >= mapSize || ant.y >= mapSize
}

$(function(){
  var $ui = {
    stepSelector: $('.js-step-selector'),
    step:         $('#step'),
    canvas:       $('#map'),
    pattern:      $('#pattern'),
    play:         $('.js-play'),
    stop:         $('.js-stop'),
    zoomIn:       $('.js-zoom-in'),
    zoomOut:      $('.js-zoom-out'),
    scale:        $('#zoom')
  };

  $ui.canvas.attr('width', mapSize).attr('height', mapSize).css({width: mapSize, height: mapSize});
  ctx = $ui.canvas[0].getContext('2d');
  map = ctx.getImageData(0, 0, mapSize, mapSize);

  $ui.stepSelector.on('click', function(e){
    var step = $(e.target).data('step');
    $ui.step.val(step);
    start(step, $ui.pattern.val(), 0, $ui.scale.val());
  });

  $ui.play.on('click', function(){
    updateState(t, $ui.pattern.val(), 1, $ui.scale.val());
    play();
  });

  $ui.stop.on('click', function(){
    stop();
    updateState(t, $ui.pattern.val(), 0, $ui.scale.val());
  });

  $ui.zoomIn.on('click', function(e){
    var scale = parseInt($ui.scale.val())+1;
    $ui.scale.val(scale);

    start(t, $ui.pattern.val(), 0, $ui.scale.val());
  });

  $ui.zoomOut.on('click', function(e){
    var scale = parseInt($ui.scale.val())-1;
    if(scale < 1) { scale = 1; }
    $ui.scale.val(scale);

    start(t, $ui.pattern.val(), 0, $ui.scale.val());
  });

  $ui.step.on('change', function(e){
    start($ui.step.val(), $ui.pattern.val(), 0, $ui.scale.val());
  });

  $ui.pattern.on('change', function(e){
    start($ui.step.val(), $ui.pattern.val(), 0, $ui.scale.val());
  });

  var params = location.search.replace('?', '').split('&');
  var animate = 0;
  var scale = 1;
  for(var i=0; i<params.length; i++){
    var param = params[i].split('=');
    switch(param[0]) {
      case 's':
        $ui.step.val(param[1]);
        break;
      case 'p':
        $ui.pattern.val(param[1]);
        break;
      case 'a':
        animate = +param[1];
        break;
      case 'c':
        $ui.scale.val(param[1]);
        break;
    }
  }

  start($ui.step.val(), $ui.pattern.val(), animate, +$ui.scale.val());
});
