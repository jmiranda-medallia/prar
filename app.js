const { WebClient } = require('@slack/web-api')
const { createEventAdapter } = require('@slack/events-api')

const SLACK_SIGNIN_SECRET = 'ea647b5552da8350c35a5eeba95a6d57'
const SLACK_TOKEN = 'xoxb-2656378355189-2656453504917-Zb6YSKnS1qSRB25lG3AIOWk5'
const PORT = 1234
const slackEvents = createEventAdapter(SLACK_SIGNIN_SECRET)
const slackClient = new WebClient(SLACK_TOKEN)

slackEvents.on('app_mention', (event) => {
  console.log(`Got message from user ${event.user}: ${event.text}`);
  (async () => {
    try {
      await slackClient.chat.postMessage({ channel: event.channel, text: `Miau <@${event.user}>! :tada:` })
    } catch (error) {
      console.log(error.data)
    }
  })();
});

slackEvents.on('error', console.error)

slackEvents.start(PORT).then(() => {
  console.log(`Server started on port ${PORT}.`)
})