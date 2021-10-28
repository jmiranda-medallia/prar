// const { onPullRequestOpen } = require("./github-webhooks/github-webhooks-helper");
const { NEEDS_REVIEW } = require("./github-webhooks/constants");

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
const SLACK_TOKEN = 'xoxb-2656378355189-2656453504917-878a7YBigTQ6XHx3ZEwRxVDL'
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

const NEEDS_REVIEW_LABEL = 'Needs Review'
const READY_FOR_MERGE_LABEL = 'Ready for Merge'

const reviewersMap = {
  'jmiranda-medallia': 'slack channel name'
}

const sendNeedsReview = (pull_request) => {
  pull_request.requested_reviewers.forEach( reviewer => {
    console.log('SEND TO CHANNEL: ', reviewersMap[reviewersMap.login]);
  });
}

const readyForMerge = (pull_request) => {
  const jira_link = pull_request.body.split('Jira link:')[1].trim();
  console.log('ask time spent on ticket', jira_link);
  console.log('complete that info in ticket and move to done');
}

const labelsActions = {
  [NEEDS_REVIEW_LABEL]: {
    action: sendNeedsReview
  },
  [READY_FOR_MERGE_LABEL]: {
    action: readyForMerge
  } 
}

const labelExists = (labels,labelName) => labels.filter(label => label.name === labelName).length > 0;

const onPullRequestOpen = ({id, payload}) => {
  const { pull_request } = payload;
  if (labelExists(pull_request.labels, NEEDS_REVIEW_LABEL)) {
    labelsActions[NEEDS_REVIEW_LABEL].action(pull_request.requested_reviewers);
  }
}

const onLabelChange = ({id, payload}) => {
  const { label, pull_request } = payload;
  labelsActions[label.name].action(pull_request);
}

const onReviewSubmitted = ({id, payload}) => {
  // console.log(payload);
  const {review} = payload
  console.log('Review submitted by ', review.user.login);
  console.log("Review content: ", review.body);
  console.log("commit id: ", review.commit_id)
}

const onCommentedReview = ({id, payload}) => {
  const {comment} = payload
  console.log("comment on ", comment.html_url);
  console.log('comment by ', comment.user.login);
}

webhooks.on('pull_request.opened', onPullRequestOpen);
webhooks.on('pull_request.reopened', onPullRequestOpen);
webhooks.on('pull_request.labeled', onLabelChange); 
webhooks.on('pull_request_review.submitted', onReviewSubmitted);
webhooks.on('pull_request_review_comment.created', onCommentedReview);
