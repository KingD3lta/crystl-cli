export var deDuplicate = (function(arr){
    var m = {}, newarr = []
    for (var i=0; i<arr.length; i++) {
      var v = arr[i];
      if (!m[v]) {
        newarr.push(v);
        m[v]=true;
      }
    }
    return newarr;
  });