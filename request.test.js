import JiraRequest from './request';

const MAX_RESULTS = 10;
const TOTAL = 200;

// Mock a paginated response from a Jira endpoint
beforeAll(() => {
    global.fetch = jest.fn((url, init) => {
        const params = new URLSearchParams(url.search);
        const startAt = parseInt(params.get('startAt'));
        return Promise.resolve({
            json: () => Promise.resolve({
                startAt,
                maxResults: MAX_RESULTS,
                total: TOTAL,
                isLast: (startAt + MAX_RESULTS >= TOTAL),
                // Generate unique mock values based on startAt parameter
                values: [
                    { value: `${startAt} value 1` },
                    { value: `${startAt} value 2` },
                    { value: `${startAt} value 3` },
                ]
            })
        });
    });
});

test('builder pattern is order agnostic', async () => {
    const funnyUrl = 'https://test.com';
    const filterOutRow = 7;

    // Build an expected array of values that our requests will return,
    // after selecting, mapping, and filtering.
    // 
    // This is based off of the mock request in beforeAll().
    const expected = [];
    for (let i = 0; i < TOTAL; i += MAX_RESULTS) {
        if (i != filterOutRow) {
            expected.push(`${i} value 1`);
        }
        expected.push(`${i} value 2`);
        expected.push(`${i} value 3`);
    }

    // Just try the request with a few different orderings :)
    // Do I really need to write a function that tests all possible combinations?
    // ...
    // Nah

    let request = new JiraRequest(new URL(funnyUrl), {});
    let res = await request
        .params({ funnyParam: 'funny' })
        .select(r => r.values)
        .map(v => v.value)
        .filter(v => v != `${filterOutRow} value 1`)
        .all();
    expect(res).toEqual(expected);

    request = new JiraRequest(new URL(funnyUrl), {});
    res = await request
        .all()
        .select(r => r.values)
        .map(v => v.value)
        .params({ funnyParam: 'funny' })
        .filter(v => v != `${filterOutRow} value 1`)
    expect(res).toEqual(expected);

    request = new JiraRequest(new URL(funnyUrl), {});
    res = await request
        .select(r => r.values)
        .map(v => v.value)
        .all()
        .filter(v => v != `${filterOutRow} value 1`)
        .params({ funnyParam: 'funny' })
    expect(res).toEqual(expected);
});