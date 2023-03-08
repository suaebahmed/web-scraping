const puppeteer = require("puppeteer");
const { Parser } = require("json2csv");
const fs = require("fs");
var url = "https://www.zabihah.com/sub/United-States/Virginia/Fairfax-amp-Loudoun/3YMVFltoPg";
var allUrl = [], allData = [], finalData = [];

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  // collect all the url and data...
  await page.goto(url, { timeout: 0 });
  const scrapingData1 = await page.evaluate(() => {
    var data = [], arr = [];
    const item = document.querySelectorAll("div#header");
    for (let i = 0; i < item.length; i++) {
      let urlText = item[i].getAttribute('onClick'), link = "https://www.zabihah.com", ok = 0;
      for(let _j=0; _j<urlText.length; _j++){
        if(ok && urlText[_j]!=="'" && urlText[_j]!==";") link += urlText[_j];
        if(urlText[_j]=== "=") ok = 1;
      }
      arr.push(link);
      let name = item[i].querySelector(".titleBS a").textContent;
      let location = item[i].querySelector(".tinyLink").textContent;
      let src = item[i].querySelector("td[valign='middle'] a img").getAttribute("src");
      let rating = item[i].querySelector("#badge_score .tinyText").textContent;
      let reviews = 0, ss = "";
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
        restaurant: name,
        origin: ss,
        location,
        src,
        rating,
        reviews,
      });
    }
    return {data, arr};
  });
  allUrl = scrapingData1.arr;
  allData = scrapingData1.data;

  // then we go through every sigle page collection more data...
  for(let _i=0; _i<allUrl.length; _i++){
    await page.goto(allUrl[_i], { timeout: 0 });
    const scrapingData2 = await page.evaluate(() => {
      //------- desription logic ------
      const t = document.querySelector("td td div.bodyLink").innerHTML;
      let firstBracket = 0, desciption = "", isFinish = 0;
      for (let i = 0; i < t.length; i++) {
        if (t[i] == "<" && t[i + 1] !== "/") firstBracket++;
        else if (t[i] == "/") firstBracket--;

        if(firstBracket == 0 && isFinish == 0 && t[i] !== "\n" && !(t[i] == " " && (desciption.length == 0 || desciption[desciption.length - 1] === " "))) {
          desciption += t[i];
        }

        if (t[i] == "<") isFinish++;
        else if (t[i] == ">") isFinish--;
      }
      // -------- Time table From Sunday  ----------
      var times = document.querySelectorAll("table[cellpadding='3'] div.microLink");
      let _j = 7, hours = "";
      for(let i=0; i<7; i++){
        if(hours.length !== 0) hours += " | ";
        if(times[i].textContent != "CLOSE"){
          hours += times[i].textContent+"-"+ times[_j++].textContent;
        } 
        else hours += "CLOSE";
      }
      //------- all quick-facts ------
      let quickFactsBtns = document.querySelectorAll("td td td div.midLink[f]");
      let quickFacts = "";
      for(let i=0; i<quickFactsBtns.length; i++){
        let isTitle = quickFactsBtns[i].querySelectorAll('img');
        if(isTitle.length > 0){
          let string = "";
          for(let j=0; j<isTitle.length; j++){
            string += isTitle[j].getAttribute('title');
            if(isTitle.length-1 != j) string += " , ";
          }
          string += " - accepted";
          quickFacts += string; 
        }
        else quickFacts += quickFactsBtns[i].textContent.trim();
        if(i+1 !== quickFactsBtns.length) quickFacts += " | ";
      }
      return {desciption, quickFacts, hours};
    });
    finalData.push({...allData[_i], ...scrapingData2});
  }
  console.log(finalData);
  await browser.close();
})();
