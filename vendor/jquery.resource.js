(function($){
  $.resource = function(paths, update, callback){
    if (! paths instanceof Array) {
      paths = [paths];
    }
    
    var index = 0;
    var count = paths.length;
    var startTime = new Date().getTime();
    
    var loadResource = function(path, callback){
      var type = path.substring(path.lastIndexOf('.') + 1);
      $.get(path, callback);
    };
    
    var nextResource = function(params){
      index++;
      
      if (update) {
        update(index / count);
      }
      
      if (paths[index]) {
        // loading next resource
        loadResource(paths[index], nextResource);
      } else {
        // finished loading all resources
        if (callback) {
          callback(new Date().getTime() - startTime);
        }
      }
    };
    
    loadResource(paths[0], nextResource);
  };
})(jQuery);
