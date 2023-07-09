export default class JiraRequest {
    #url
    #init
    #mapper
    #params
    #all
    #log

    constructor(url, init) {
        this.#url = url;
        this.#init = init;
        this.#mapper = async (x) => x;
    }

    then(resolve, reject) {
        return (this.#all ? this.#runAll() : this.#run()).then(resolve, reject);
    }

    async #run() {
        if (this.#params) this.#url.search = new URLSearchParams(this.#params);
        this.res = await fetch(this.#url, this.#init);
        this.body = await this.res.json();
        const result = await this.#mapper(this.body);
        if (this.#log) {
            console.log(result);
        }
        return result;
    }

    async #runAll() {
        let results = [];

        this.#params ??= {};
        this.#params.maxResults ??= 10000;
        this.#params.startAt ??= 0;
        while (true) {
            const result = await this.#run();

            if (!this.body.maxResults) {
                console.warn(`ignoring .all() for non-paginated endpoint (${this.#url})`);
                return result;
            }

            results = results.concat(result);

            this.#params.startAt += this.body.maxResults;
            if (this.#params.startAt > this.body.total || this.body.isLast) break;
        }

        return results;
    }

    params(p) {
        this.#params = p;
        return this;
    }

    select(f) {
        const m = this.#mapper;
        this.#mapper = x => m(x).then(f);
        return this;
    }

    map(f) {
        return this.select(x => x.map(f));
    }

    filter(f) {
        return this.select(x => x.filter(f));
    }

    all() {
        this.#all = true;
        return this;
    }

    log() {
        this.#log = true;
        return this;
    }
}