const puppeteer = require("puppeteer");
const { Parser } = require("json2csv");
const fs = require("fs");

const url =
  "https://www.zabihah.com/sub/United-States/Virginia/Arlington-amp-Alexandria/Mqqx8jpRcx";
const local = "http://127.0.0.1:5500/index.html";

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(url, { timeout: 0 });
  // await page.screenshot({ path : "myScreenShot.png"});

  // const scrapingData = await page.evaluate(() => {
  //   const a = document.querySelectorAll("div#header");
  //   var data = [];
  //   for (let i = 0; i < a.length; i++) {
  //     let ss = "";
  //     let el = a[i].querySelectorAll(".microLinkW b");
  //     for (let j = 0; j < el.length; j++) {
  //       ss += el[j].innerHTML;
  //       if (j + 1 != el.length) ss += ", ";
  //     }
  //     data.push({ "restaurant types": ss });
  //   }
  //   // return all the restaurant types
  //   return data;
  // });

  const scrapingData = await page.evaluate(() => {
    const item = document.querySelectorAll("div#header");
    var data = [];
    for (let i = 0; i < item.length; i++) {
      const badge = item[i].querySelector("#badge_review .tinyText");
      let N = 0, ss = "";
      if (badge) {
        for (let j = 0; j < badge.textContent.length; j++) {
          if (badge.textContent[j] >= "0" && badge.textContent[j] <= "9")
            ss += badge.textContent[j];
        }
        N = parseInt(ss);
      }
      data.push({ "Number of reviews": N });
    }
    return data;
  });

  const parser = new Parser();
  const csv = parser.parse(scrapingData);
  fs.writeFileSync("./final-data.csv", csv);

  await browser.close();
})();
