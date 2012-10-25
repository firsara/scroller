(function($) {
	
var isTouch = "ontouchstart" in window;

$.fn.touchmove = function(callback){
	var $target = $(this);
	
	var startX = 0;
	var startY = 0;
	var opts = {};
	var store = {};
	
	var startTime = null;
	var duration = null;
	var scrollAfterFriction = 1;
	var scrollAfterInterval;
	
	var onTouchStart = function(event){
		event.preventDefault();
		
		if (event.targetTouches) {
			if (event.targetTouches.length > 1) {
				return false;
			}
			
			event = event.targetTouches[0];
		}
		
		if (scrollAfterInterval) {
			window.clearInterval(scrollAfterInterval);
		}
		
		startTime = new Date().getTime();
		
		startX = event.pageX;
		startY = event.pageY;
		
		store.x = startX;
		store.y = startY;
		
		$target.bind('mousemove', onTouchMove);

		if (isTouch){
			$target.get(0).addEventListener('touchmove', onTouchMove, false);
		}
	};
	
	var onTouchMove = function(event){
		if (event.targetTouches) {
			event = event.targetTouches[0];
		}
		
		opts.x = event.pageX - store.x;
		opts.y = event.pageY - store.y;
		opts.totalX = event.pageX - startX;
		opts.totalY = event.pageY - startY;
		
		store.x = event.pageX;
		store.y = event.pageY;
		
		callback.call($target, opts);
	};
	
	var onTouchEnd = function(event){
		$target.unbind('mousemove', onTouchMove);

		if (isTouch){
			$target.get(0).removeEventListener('touchmove', onTouchMove);
		}
		
		duration = new Date().getTime() - startTime;
		
		var scrollAfter = {
			x: opts.x / (1 / (8 * scrollAfterFriction)),
			y: opts.y / (1 / (8 * scrollAfterFriction))
		};
		
		var targetScroll = {
			x: Math.abs( opts.totalX + scrollAfter.x ),
			y: Math.abs( opts.totalY + scrollAfter.y )
		};
		
		var count = 0;
		
		scrollAfterInterval = window.setInterval(function(){
			count++;
			
			opts.x = scrollAfter.x / (25 + 2 * count);
			opts.y = scrollAfter.y / (25 + 2 * count);
			opts.totalX += opts.x;
			opts.totalY += opts.y;
			
			callback.call($target, opts);
			
			if (Math.abs( opts.totalX ) > targetScroll.x) {
				window.clearInterval(scrollAfterInterval);
			}
		}, 5);
		
		window.setTimeout(function(){
			window.clearInterval(scrollAfterInterval);
		}, 1000);
	};
	
	$target.bind('mousedown', onTouchStart);
	$target.bind('mouseup', onTouchEnd);
	
	if (isTouch){
		$target.get(0).addEventListener('touchstart', onTouchStart, false);
		$target.get(0).addEventListener('touchend', onTouchEnd, false);
	}
	
};

})(jQuery);