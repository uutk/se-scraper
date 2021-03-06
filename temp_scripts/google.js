var fs = require('fs');
var path = require('path');
var os = require("os");

const se_scraper = require('se-scraper');

var filepath_de = path.join(__dirname, '/data/keywords_de.txt');
var filepath_fr = path.join(__dirname, '/data/keywords_fr.txt');

function read_keywords_from_file(fpath) {
    let kws =  fs.readFileSync(fpath).toString().split(os.EOL);
    // clean keywords
    kws = kws.filter((kw) => {
        return kw.trim().length > 0;
    });
    return kws;
}

let keywords_fr = read_keywords_from_file(filepath_fr);
let keywords_de = read_keywords_from_file(filepath_de);

const Cluster = {
    CONCURRENCY_PAGE: 1, // shares cookies, etc.
    CONCURRENCY_CONTEXT: 2, // no cookie sharing (uses contexts)
    CONCURRENCY_BROWSER: 3, // no cookie sharing and individual processes (uses contexts)
};


// those options need to be provided on startup
// and cannot give to se-scraper on scrape() calls
let browser_config = {
    // the user agent to scrape with
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36',
    // if random_user_agent is set to True, a random user agent is chosen
    random_user_agent: true,
    // whether to start the browser in headless mode
    headless: true,
    // whether debug information should be printed
    // level 0: print nothing
    // level 1: print most important info
    // ...
    // level 4: print all shit nobody wants to know
    debug_level: 1,
    puppeteer_cluster_config: {
        timeout: 3 * 60 * 1000, // max timeout set to 3 minutes
        monitor: false,
        concurrency: Cluster.CONCURRENCY_PAGE, // one scraper per tab
        maxConcurrency: 5, // scrape with 5 tabs
    }
};

(async () => {
    // scrape config can change on each scrape() call
    let google_scrape_config = {
        // which search engine to scrape
        search_engine: 'google',
        // an array of keywords to scrape
        keywords: keywords_de,
        // the number of pages to scrape for each keyword
        num_pages: 5,

        // OPTIONAL PARAMS BELOW:
        google_settings: {
            gl: 'de', // The gl parameter determines the Google country to use for the query.
            hl: 'de', // The hl parameter determines the Google UI language to return results.
            start: 0, // Determines the results offset to use, defaults to 0.
            num: 10, // Determines the number of results to show, defaults to 10. Maximum is 100.
        },
        // how long to sleep between requests. a random sleep interval within the range [a,b]
        // is drawn before every request. empty string for no sleeping.
        sleep_range: [1,3],
        // path to output file, data will be stored in JSON
        output_file: 'results/google_de.json',
        // whether to prevent images, css, fonts from being loaded
        // will speed up scraping a great deal
        block_assets: true,
        // check if headless chrome escapes common detection techniques
        // this is a quick test and should be used for debugging
        test_evasion: false,
        apply_evasion_techniques: true,
        // log ip address data
        log_ip_address: false,
        // log http headers
        log_http_headers: false,
    };

    let results = await se_scraper.scrape(browser_config, google_scrape_config);
    console.dir(results, {depth: null, colors: true});

})();