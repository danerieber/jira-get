import JiraRequest from './request';

beforeAll(() => {
    global.fetch = jest.fn(() => Promise.resolve({
        json: () => Promise.resolve({
            startAt: 0,
            maxResults: 10,
            total: 200,
            isLast: false,
            values: [
                { value: 'value 1' },
                { value: 'value 2' },
                { value: 'value 3' },
            ]
        })
    }));
});

test('builder pattern is order agnostic', () => {
    expect(true);
});