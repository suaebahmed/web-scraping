const puppeteer = require("puppeteer");
const { Parser } = require("json2csv");
const fs = require("fs");

const url = "https://www.zabihah.com/sub/Mqqx8jpRcx?t=c";

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(url, { timeout: 0 });

  const scrapingData = await page.evaluate(() => {
    const item = document.querySelectorAll("div#header");
    var data = [];
    for (let i = 0; i < item.length; i++) {
      let market_name = item[i].querySelector(".titleBS a").textContent;
      let location = item[i].querySelector(".tinyLink").textContent;
      let src = item[i]
        .querySelector("td[valign='middle'] a img")
        .getAttribute("src");
      let rating = item[i].querySelector("#badge_score .tinyText").textContent;
      let reviews = 0,
        ss = "";
      let badge = item[i].querySelector("#badge_review .tinyText");
      if (badge) {
        for (let j = 0; j < badge.textContent.length; j++) {
          if (badge.textContent[j] >= "0" && badge.textContent[j] <= "9")
            ss += badge.textContent[j];
        }
        reviews = parseInt(ss);
      }
      ss = "";
      let el = item[i].querySelectorAll(".microLinkW b");
      for (let j = 0; j < el.length; j++) {
        ss += el[j].innerHTML;
        if (j + 1 != el.length) ss += ", ";
      }
      data.push({
        "Ceterer name": market_name,
        Location: location,
        origin: ss,
        src,
        rating,
        reviews,
      });
    }
    return data;
  });

  const parser = new Parser();
  const csv = parser.parse(scrapingData);
  fs.writeFileSync("./Caterers-Data-Arlington&Alexandria.csv", csv);
  await browser.close();
})();
