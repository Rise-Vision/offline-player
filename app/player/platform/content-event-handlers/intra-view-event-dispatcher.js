module.exports = function(contentViewController, uiController) {
  var eventHandlers = [];

  uiController.registerWindowListener("message", dispatch);

  function dispatch(evt) {
    var handlers = eventHandlers.filter(function(handler) {
      return handler.handles(evt);
    });

    if(handlers.length > 1) {
      return respondWithError("Only one handler can exist for the given event");
    }
    else if(handlers.length === 1) {
      return handlers[0].process(evt, contentViewController.getViewUrl(evt.source));
    }

    function respondWithError(err) {
      evt.data.error = err;
      uiController.sendWindowMessage(evt.source, evt.data, "*");
      return Promise.reject(new Error(err));
    }
  }

  function resetEventHandlers() {
    eventHandlers = [];
  }

  function addEventHandler(handler) {
    eventHandlers.push(handler);
  }

  return {
    resetEventHandlers: resetEventHandlers,
    addEventHandler: addEventHandler,
    dispatch: dispatch
  };
};
