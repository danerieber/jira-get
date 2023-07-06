# jira-get

get data from Jira GET endpoints quickly

# Usage

## Create client

```js
import Jira from 'jira-get';

const jira = new Jira('URL', 'EMAIL', 'TOKEN');
```

## Make Requests

```js
const issues = await jira.get('/rest/api/2/search')
    .params({
        jql: 'assignee is not empty and created >= -30d',
        fields: ['created', 'assignee']
    })
    .select(body => body.issues)
    .map(issue => {
        id: issue.id,
        created: issue.fields.created,
        assignee: issue.fields.assignee.displayName
    })
    .all();     // collect paginated results
```