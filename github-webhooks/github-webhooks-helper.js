const { NEEDS_REVIEW } = require("./constants");

const labelExists = (labels, labelName) => labels.filter(label => label.name === labelName).length > 0;

module.exports = {
  onPullRequestOpen: ({ id, payload }) => {
    const { pull_request } = payload;
    if (labelExists(pull_request.labels, NEEDS_REVIEW)) {
      console.log('SEND TO CHANNEL');
    }
  }
}
