import JiraRequest from "./request.js";

export default class Jira {
    #server
    #headers

    constructor(server, username, password) {
        this.#server = server;
        this.#headers = {
            Authorization: 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'),
            Accept: 'application/json'
        }
    }

    get(endpoint) {
        return new JiraRequest(
            new URL(endpoint, this.#server),
            { method: 'GET', headers: this.#headers }
        );
    }
}