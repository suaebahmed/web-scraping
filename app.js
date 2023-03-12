const saveRestaurants = require('./index.js');
const saveMerkets  = require('./index-m.js');
const saveCaterers = require('./index-c.js');

const url = "https://www.zabihah.com/sub/Mqqx8jpRcx?t=", cityName = "Arlington&Alexandria", folderName = "virginia";


saveRestaurants(url+"r", cityName, folderName);
saveMerkets(url+"m", cityName, folderName);
saveCaterers(url+"c", cityName, folderName);
