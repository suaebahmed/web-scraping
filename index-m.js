const puppeteer = require("puppeteer");
const { Parser } = require("json2csv");
const fs = require("fs");

const saveMerkets = (baseURL, fileName, folderName) =>{
  var allUrl = [], allData = [], finalData = [];

  (async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    // collect all the url and data...
    await page.goto(baseURL, { timeout: 0 });
    const scrapingData1 = await page.evaluate(() => {
      var data = [], arr = [];
      const item = document.querySelectorAll("table:nth-of-type(12) div#header");
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
          'markets name': name,
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
        const needInnerHtml = document.querySelector("td td div.bodyLink");
        let firstBracket = 0, desciption = "", isFinish = 0;
        if(needInnerHtml){
          const t = needInnerHtml.innerHTML;
          for (let i = 0; i < t.length; i++) {
            // firstBracket - ensure us <div> ... </div>
            if(t[i] == "<" && i+1 != t.length && t[i+1] !== "/") firstBracket++;
            else if(i!=0 && t[i-1] == "<" && t[i] == "/") firstBracket--;
    
            if(firstBracket == 0 && isFinish == 0 && t[i] !== "\n" && !(t[i] == " " && (desciption.length == 0 || desciption[desciption.length - 1] == " "))) {
              desciption += t[i];
            }
            // isFinish - ensure us <div> or </div>
            if (t[i] == "<") isFinish++;
            else if (t[i] == ">") isFinish--;
          }
        }
        // -------- Time table From Sunday  ----------
        var times = document.querySelectorAll("table[cellpadding='3'] div.microLink");
        let _j = 7, hours = "";
        for(let i=0; i<7 && i<times.length; i++){
          if(hours.length !== 0) hours += " | ";
          if(times[i].textContent == "OPEN 24 HRS") hours += "OPEN 24 HRS";
          else if(times[i].textContent == "CLOSE") hours += "CLOSE";
          else{
            hours += times[i].textContent;
            if(times[_j]) hours += "-"+ times[_j++].textContent;
          }
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
        return {desciption, 'quick facts':quickFacts, 'hours: from Sunday':hours};
      });
      finalData.push({...allData[_i], url: allUrl[_i], ...scrapingData2});
    }
    // console.log(finalData);
    const parser = new Parser();
    const csv = parser.parse(finalData);
    //--------------- change file name every time  ---------------------
    fs.writeFileSync(`data/${folderName}/Markets-Data-${fileName}.csv`, csv); 
    await browser.close();
  })();
}
module.exports = saveMerkets;