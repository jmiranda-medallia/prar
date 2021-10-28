const { onPullRequestOpen } = require("./github-webhooks/github-webhooks-helper");

const { WebClient } = require('@slack/web-api')
const { createEventAdapter } = require('@slack/events-api')
const { Webhooks, createNodeMiddleware } = require("@octokit/webhooks");
const webhooks = new Webhooks({
  secret: "secret",
});

const EventSource = require('eventsource')

const webhookProxyUrl = "https://smee.io/ocfDXep8EE4GS1PH"; // replace with your own Webhook Proxy URL
const source = new EventSource(webhookProxyUrl);
source.onmessage = (event) => {
  const webhookEvent = JSON.parse(event.data);
  webhooks
    .verifyAndReceive({
      id: webhookEvent["x-request-id"],
      name: webhookEvent["x-github-event"],
      signature: webhookEvent["x-hub-signature"],
      payload: webhookEvent.body,
    })
    .catch(console.error);
};

const SLACK_SIGNIN_SECRET = 'ea647b5552da8350c35a5eeba95a6d57'
const SLACK_TOKEN = 'xoxb-2656378355189-2656453504917-B1EHCD3svvSn4qaQ8A9QDbSC'
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

webhooks.on('pull_request.opened' | 'pull_request.reopened', onPullRequestOpen);

webhooks.onAny(async ({ id, name, payload }) => {
  const { pull_request } = payload;
  try {
    await slackClient.chat.postMessage({ channel: 'C02KRULNWHX', text: `Miau :tada:` })
  } catch (error) {
    console.log(error.data)
  }
  console.log('URL: ', pull_request.url);
  console.log("STATE: ", pull_request.state);
  console.log("DESCRIPTION: ", pull_request.body);
  console.log("requested reviewers: ", pull_request.requested_reviewers);
  pull_request.labels.forEach(label => {
    console.log('LABEL: ', label.name)
    if (label.name === 'Needs Review' && pull_request.requested_reviewers.length > 0) {
      console.log("READY FOR REVIEW -> ping in channel")
    }
  });
});
