import { NEEDS_REVIEW } from "./constants";

const labelExists = (labels, labelName) => labels.filter( label => label.name === labelName).length > 0;


export const onPullRequestOpen = ({id, payload}) => {
    const {pull_request} = payload;
    if(labelExists(pull_request.labels, NEEDS_REVIEW)){
        console.log('SEND TO CHANNEL');
    }
}