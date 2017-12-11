const puppeteer = require('puppeteer');

const config = {
    SITE_URL: "file:///home/nani/Desktop/puppet/sitedemo/Horse%20Racing%20Betting%20&%20Odds_%20Horse%20Racing%20Results%20_%20Coral.html",
    todaySelector: "#sub_nav_body > div > div.race-list.today-block > div.second-tabs-content > div > div",
}

async function run(){
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(config.SITE_URL, {waitUntil: 'networkidle2', timeout: 80000});

    const data = await page.evaluate(function(selector){
        let children = Array.from(document.querySelectorAll(selector));
        children = children.filter( (elem)=> { 
            return elem.getAttribute("class") === "race featured-match";
         });

        const results = children.map((child)=>{
            const venue = child.querySelector("div.venue > a");
            const city =  venue.textContent.trim();

            const races = Array.from(child.getElementsByClassName("race-time-wrapper"));
            const raceTimes = races.map((child) => {
                const corals = Array.from(child.children);

                const coral = corals.find((dt) => {
                    return dt.getAttribute("class").includes("race-time");
                });

                const node = coral.querySelector('a');
                const time = node.textContent.trim();
                const url = node.getAttribute("href");
                return { time, url };
            });

            const rslt = {
                [city] : raceTimes
            };

            return rslt;
        });

        return results;
    }, config.todaySelector);

    console.log( JSON.stringify(reArrangeData(data,""), null, 2) );
}

run().catch((e) => { console.log(e); } );
function reArrangeData(data, pad){
    const result = {};
    for(const entry of data){
        for(const key in entry){
            const value = entry[key];
            value.forEach(e => { e.url = pad.concat(e.url) });
            result[key] = value;
        }
    }
    return result;
}