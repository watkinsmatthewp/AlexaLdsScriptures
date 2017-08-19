var library = require('./library');

var verseOfTheDay = {};

verseOfTheDay.BOM = [
  '1 Nephi 3:7',
  '2 Nephi 2:25',
  '2 Nephi 2:27',
  '2 Nephi 9:28–29',
  '2 Nephi 25:23, 26',
  '2 Nephi 28:7–9',
  '2 Nephi 31:19–20',
  '2 Nephi 32:3',
  '2 Nephi 32:8–9',
  'Mosiah 2:17',
  'Mosiah 3:19',
  'Mosiah 4:30',
  'Alma 7:11–13',
  'Alma 32:21',
  'Alma 37:35',
  'Alma 39:9',
  'Alma 41:10',
  'Helaman 5:12',
  '3 Nephi 12:48',
  '3 Nephi 18:15, 20–21',
  'Ether 12:6',
  'Ether 12:27',
  'Moroni 7:41',
  'Moroni 7:45, 47–48',
  'Moroni 10:4–5'
];

verseOfTheDay.NT = [];
verseOfTheDay.OT = [];
verseOfTheDay.DC = [];
verseOfTheDay.POGP = [];

verseOfTheDay.get = function(standardWorkID) {
  var standardWorkID = standardWorkID || 'BOM';
  var reference = verseOfTheDay[standardWorkID][0];
  return new Promise(function(resolve, reject) {
    library.getVerses(reference).then(function(verses) {
      resolve(verses);
    });
  });
}

module.exports = verseOfTheDay;