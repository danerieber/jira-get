import Jira from '../jira.js';

const jira = new Jira(process.env.URL, process.env.EMAIL, process.env.TOKEN);

const fid = await jira.get('/rest/api/2/field')
    .map(f => [f.name, f.id])
    .select(Object.fromEntries);

const boardId = process.env.BOARD_ID;

const sprints = await jira.get(`/rest/agile/1.0/board/${boardId}/sprint`)
    .params({ state: 'active,closed' })
    .select(x => x.values)
    .map(x => ({ id: x.id, start: x.startDate, end: x.endDate }))
    .all();

for (const sprint of sprints) {
    const results = await jira.get(`/rest/agile/1.0/board/${boardId}/sprint/${sprint.id}/issue`)
        .params({
            jql: 'Status = "Completed" and "Story Points" is not empty order by created desc',
            fields: ['Story Points', 'Issue Type'].map(f => fid[f])
        })
        .select(x => x.issues)
        .map(x => x.fields[fid['Story Points']])
        .all();

    const points = results.reduce((a, b) => a + b, 0);
    console.log({
        ...sprint,
        points
    });
}