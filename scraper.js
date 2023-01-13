const cheerio = require("cheerio");
const axios = require("axios");
const puppeteer = require('puppeteer');
const fs = require('fs');

(async function main() {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        const startUrl = 'http://www.01xq.com/e_game_view.asp?id=044341D731A1AC';

        async function scrapePage(url) {
            await page.goto(url, { waitUntil: 'networkidle0' });
            const html = await page.evaluate(() => document.querySelector('*').outerHTML);
            const $ = cheerio.load(html);
            const tds = $("td[style='letter-spacing:3pt']")
          

            let movesString = "";
            tds.each(function (i, elem) {
                if (i % 2 == 0) {
                    n = Math.floor(i / 2) + 1;
                    movesString += n + ". ";
                }
                movesString += $(elem).text() + " ";
                if ((i + 1) % 6 == 0) {
                    movesString += "\n"
                }

            });
            movesString = movesString.replace('*', '');
            // console.log(movesString);

            let gameOutcome = $("#movetipsdiv b").text();
            // console.log(gameOutcome);

            let gameIndex = $("#movetipsdiv td.gray:contains('game index')").next().text();
            // console.log(gameIndex);
            let nextUrl = undefined;
            if(gameIndex != "1") {
                nextUrl = "http://www.01xq.com/" + $("td[width='304'] b").first().next().next().attr('href');
            }

            let endString =
                "Url : " + url + "\n" +
                "Next url : " + nextUrl + "\n" +
                "Game index : " + gameIndex + "\n" +
                "Outcome : Red " + gameOutcome + "\n" +
                movesString;

            fs.writeFile('data/' + gameIndex + '.txt', endString, function (err) {
                if (err) throw err;
                console.log('Saved!');
            });

            return nextUrl;
        }

        let nextUrl = startUrl;
        while(true) {
            nextUrl = await scrapePage(nextUrl);
            if(nextUrl == undefined) {
                break;
            }
        }
        // await scrapePage(startUrl);
        await browser.close();
    } catch (err) {
        console.error(err);
    }
})();

