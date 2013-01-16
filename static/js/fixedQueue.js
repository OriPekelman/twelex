function FixedQueue(size, initialValues) {
  initialValues = (initialValues || []);
  var queue = Array.apply(null, initialValues);
  queue.fixedSize = size;
  queue.push = FixedQueue.push;
  queue.splice = FixedQueue.splice;
  queue.unshift = FixedQueue.unshift;
  FixedQueue.trimTail.call(queue);
  return (queue);

}
FixedQueue.trimHead = function() {
  if (this.length <= this.fixedSize) {
    return;
  }
  Array.prototype.splice.call(this, 0, (this.length - this.fixedSize));
};
FixedQueue.trimTail = function() {
  if (this.length <= this.fixedSize) {
    return;
  }
  Array.prototype.splice.call(this, this.fixedSize, (this.length - this.fixedSize));
};
FixedQueue.wrapMethod = function(methodName, trimMethod) {
  var wrapper = function() {
    var method = Array.prototype[methodName];
    var result = method.apply(this, arguments);
    trimMethod.call(this);
    return (result);
  };
  return (wrapper);
};
FixedQueue.push = FixedQueue.wrapMethod("push",FixedQueue.trimHead);
FixedQueue.splice = FixedQueue.wrapMethod("splice",FixedQueue.trimTail);
FixedQueue.unshift = FixedQueue.wrapMethod("unshift",FixedQueue.trimTail);
