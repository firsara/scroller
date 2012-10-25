// scroller initialization
(function($){
  
  // default options
  var opts = {
    images: [], // scroller-images
    preload: .25, // preload friction
    speed: 1, // scroll-speed
    blend: 10, // parallax blending
    multiplier: 1, // multiply frames by
    loading: null, // loading update callback function
    ready: null, // initialize callback function
    update: null, // update scroller frame position
    move: document, // move-target (event-listener)
    scroll: document, // scroll-target (event-listener)
    container: 'body' // scroll-video-container
  };

  // merge options with user definitions
  if (this.scroller) {
    for (var k in opts) {
      if (this.scroller[k]) {
        opts[k] = this.scroller[k];
      }
    }
  }
  
  // re-attach options to scroller object
  this.scroller = {options: opts};
  
  var resources = [];
  var imgCount = Math.floor( scroller.options.images.length * scroller.options.preload );

  for (var i = 0; i < imgCount; i++) {
    resources.push(scroller.options.images[i]);
  }
  
  // load initial resources
  $.resource(resources, scroller.options.loading, function(duration){
    scroller.initialize();
    
    if (scroller.options.ready) {
      scroller.options.ready(duration);
    }
  });
  
})(jQuery);







// scroller functions
var app = (function($, self){
  var paths = [];
  var store = {};
  var image;
  store.y = 0;
  
  var NAME = 'scroller';
  var opts = this[NAME].options;

  var nav = null;
  var content = null;
  
  self.initialize = function(){
    image = $('<img src="' + opts.images[0] + '" class="scroller-image">');
    $(opts.container).append(image);
    
    for (var i = 0; i < opts.images.length; i++) {
      paths.push(opts.images[i]);
    }

    store.count = opts.images.length;
    
    if (store.count == 0) {
      return;
    }

    nav = $('nav li[data-frame]');
    content = $('[data-scroller]');
    
    $(document).bind('mousewheel', wheel);
    $(opts.move).touchmove(move);
    $(document).bind('keydown', keyup);


    var imgCount = Math.floor( opts.images.length * opts.preload );
    var resources = [];
    
    for (var i = imgCount; i < opts.images.length; i++) {
      resources.push(scroller.options.images[i]);
    }

    $.resource(resources, function(){}, function(){});

    opts.blend *= opts.multiplier;
    opts.blend = Math.round(opts.blend);
    
    self.to(0);
  };
  
  

  /* SET SCROLLER TO A SPECIFIC FRAME */
  var updateTimeout = null;

  self.to = function(index){
    if (index < 0) {
      index = store.count - 1;
      store.y = index * opts.speed;
    } if (index >= store.count) {
      index = 0;
      store.y = index * opts.speed;
    }
    
    store.index = index;
    image.css('display', 'block').attr('src', paths[index]);
    
    if (! updateTimeout) {
      updateTimeout = setTimeout(updateViewport, 5);
    }
  };



  /* ANIMATE TO THE END OF SCROLLER */
  /* ------------------------------ */
  self.play = function(speed){
    self.animate(store.count - 1);
  };
  


  /* ANIMATE TO A SPECIFIC FRAME */
  /* ___________________________ */
  var animateToIndex = null;
  var animationInterval = null;
  var animateDirection = null;
  var locked = false;
  
  self.animate = function(index){
    index = parseInt( index );
    index *= opts.multiplier;
    index = Math.round(index);

    if (store.index == index) { return; }
    if (locked) { return; }
    locked = true;
    animateToIndex = index;
    
    if (store.index > animateToIndex) {
      animateDirection = -1;
    } else {
      animateDirection = 1;
    }

    if (animateDirection == 1) {
      if (Math.abs(animateToIndex - store.index) > Math.abs(store.count + store.index - animateToIndex)) {
        animateDirection = -1;
      }
    } else if (animateDirection == -1 && store.index >= store.count / 2) {
      if (Math.abs(animateToIndex - store.index) > Math.abs(store.count + store.index - animateToIndex)) {
        animateDirection = 1;
      }
    }

    animationInterval = window.setInterval(doAnimate, 25);
    
    if (store.speed) {
      opts.speed = store.speed;
    }
  };
  
  var doAnimate = function(){
    add(animateDirection);
    
    if (store.index == animateToIndex) {
      window.clearInterval(animationInterval);
      animationInterval = null;
      animateToIndex = null;
      locked = false;
    }
  };



  // get type of a specific css value
  var type = function(val){
    val = val.toString();

    switch (val.substring(val.length - 1))
    {
      case 'x':
        return 'px';

      case 'm':
        return 'em';

      case '%':
        return '%';
    }

    return '';
  };

  // remove type (i.e. %, em, etc.) from css value
  var convert = function(val){
    val = val.toString();
    return parseFloat( val.replace(type(val), '') );
  };


  // update navigation and parallax items based on frame
  var updateViewport = function(){
    clearTimeout(updateTimeout);
    updateTimeout = null;

    var frame = null;
    var hasActive = false;

    nav.each(function(id, el){
      frame = parseInt( $(this).attr('data-frame') );
      frame *= opts.multiplier;
      frame = Math.round(frame);

      $(this).removeClass('active before after');

      if (frame < store.index) {
        $(this).addClass('before');
      } else if (frame <= store.index) {
        hasActive = true;
        $(this).addClass('active');
      } else {
        $(this).addClass('after');
      }
    });

    if (! hasActive) {
      nav.filter('.before:last').removeClass('before').addClass('active');
    }

    var params;
    var from;
    var percent;
    var distance;

    content.each(function(id, el){

      params = $.parseJSON( $(this).attr('data-scroller').toString() );
      params.frame *= opts.multiplier;
      params.frame = Math.round(params.frame);

      if (! params.after) {
        params.after = params.to;
      }

      if (params.frame < opts.blend * 2 && store.index + opts.blend > store.count) {
        params.frame = store.count + params.frame + opts.blend;
      }

      if (store.index >= (params.frame - opts.blend * 2) && store.index <= (params.frame + opts.blend * 2)) {
        $(this).removeClass('inactive');
        $(this).addClass('active');

        params.current = {};

        distance = Math.abs(store.index - params.frame) - opts.blend;
        distance = Math.max(0, distance);

        percent = distance / opts.blend;

        if (store.index > params.frame) {
          store.target = params.after;
        } else {
          store.target = params.from;
        }

        for (var k in params.to) {
          params.current[k] = convert( params.to[k] ) - (( convert( params.to[k] ) - convert( store.target[k] ) ) * percent) + type(params.to[k]);
        }

        $(this).css(params.current);
      } else {
        $(this).css(params.from);
        $(this).addClass('inactive');
        $(this).removeClass('active');
      }
    });

    if (opts.update) {
      opts.update(store.index, store.count);
    }
  };








  // move scroller by friction
  var add = function(friction){
    if (isNaN(friction)) { return; }
    
    store.y += (friction / opts.speed);
    self.to(Math.floor( store.y ));
  };
  
  
  // mousewheel-scroll
  var wheel = function(event, delta, deltaX, deltaY){
    if (locked) { return; }
    add(deltaY * -1);
  };
  
  // drag-scroll
  var move = function(event){
    if (locked) { return; }
    add(event.y / -10);
  };
  
  // keyboard-scroll
  var keyup = function(event){
    if (event.keyCode == 40) {
      event.preventDefault();
      add(1);
    } else if (event.keyCode == 38) {
      event.preventDefault();
      add(-1);
    }
  };
  
  
  // Publish functions to scroller
  for (var k in self) {
    this[NAME][k] = self[k];
  }
  
  return self;

})(jQuery, {});