const { WebClient } = require('@slack/web-api')
const SLACK_TOKEN = 'xoxb-2656378355189-2656453504917-Rm0joW8ItWhEDgqijkl0nEd5'

var Singleton = (function () {
  var instance;

  function createInstance() {
    return new WebClient(SLACK_TOKEN);
  }

  return {
    getInstance: function () {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    }
  };
})();

module.exports = {
  SlackClient: Singleton
}