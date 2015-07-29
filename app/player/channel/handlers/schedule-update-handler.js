module.exports = function(platformIO) {
  function saveNewLocalSchedule(schedule) {
    return platformIO.localObjectStore.set({schedule: schedule})
    .then(function() {
      console.log("Realtime schedule updater: saved schedule");
      return true;
    })
    .catch(function(e) {
      throw err("error saving realtime schedule update " + e);
    });
  }

  return {
    handles: function(evt) {
      return evt.content && evt.content.schedule && evt.content.schedule.id;
    },

    process: function(evt) {
      var schedule = evt.content.schedule;

      return platformIO.localObjectStore.get(["schedule"])
      .then(function(items) {
        if(items.schedule && JSON.stringify(items.schedule) !== JSON.stringify(schedule)) {
          console.log("Updating schedule");
          logger.external("schedule update");

          return saveNewLocalSchedule(schedule);
        }
        else {
          console.log("Schedule not changed");
          return Promise.reject();
        }
      });
    }
  };
};
