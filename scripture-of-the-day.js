var verseOfTheDay = {};

verseOfTheDay.library = null;

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

verseOfTheDay.NT = [
  'Matthew 5:14-16',
  'Matthew 11:28-30',
  'Matthew 16:15-19',
  'Matthew 22:36-39',
  'Matthew 28:19-20',
  'Luke 24:36-39',
  'John 3:5',
  'John 14:6',
  'John 14:15',
  'John 17:3',
  'Acts 2:36-38',
  'Acts 3:19-21',
  '1 Corinthians 6:19-20',
  '1 Corinthians 15:20-22',
  '1 Corinthians 15:40-42',
  'Galatians 5:22-23',
  'Ephesians 4:11-14',
  'Philippians 4:13',
  '2 Thessalonians 2:1-3',
  '2 Timothy 3:15-17',
  'Hebrews 12:9',
  'James 1:5-6',
  'James 2:17-18',
  '1 Peter 4:6',
  'Revelation 20:12'
];

verseOfTheDay.OT = [
  'Moses 1:39',
  'Moses 7:18',
  'Abraham 3:22-23',
  'Genesis 1:26-27',
  'Genesis 2:24',
  'Genesis 39:9',
  'Exodus 19:5-6',
  'Exodus 20:3-17',
  'Joshua 24:15',
  '1 Samuel 16:7',
  'Psalms 24:3-4',
  'Psalms 119:105',
  'Psalms 127:3',
  'Proverbs 3:5-6',
  'Isaiah 1:18',
  'Isaiah 5:20',
  'Isaiah 29:13-14',
  'Isaiah 53:3-5',
  'Isaiah 58:6-7',
  'Isaiah 58:13-14',
  'Jeremiah 1:4-5',
  'Ezekiel 37:15-17',
  'Amos 3:7',
  'Malachi 3:8-10',
  'Malachi 4:5-6'
];
verseOfTheDay.DC = [
  'Joseph Smith—History 1:15-20',
  'D&C 1:37-38',
  'D&C 6:36',
  'D&C 8:2-3',
  'D&C 10:5',
  'D&C 13:1',
  'D&C 18:10-11',
  'D&C 18:15-16',
  'D&C 19:16-19',
  'D&C 19:23',
  'D&C 25:13',
  'D&C 46:33',
  'D&C 58:27',
  'D&C 58:42-43',
  'D&C 64:9-11',
  'D&C 76:22-24',
  'D&C 76:40-41',
  'D&C 78:19',
  'D&C 82:10',
  'D&C 88:124',
  'D&C 89:18-21',
  'D&C 107:8',
  'D&C 121:36, 41-42',
  'D&C 130:22-23',
  'D&C 131:1-4'
];

verseOfTheDay.get = function(standardWorkID) {
  var dayOfYear = getDayOfYear();
  console.log('Day of year: ' + dayOfYear);
  var standardWorkID = standardWorkID || getDefaultStandardWorkID(dayOfYear);
  console.log('Selected standard work: ' + standardWorkID);
  var availableReferences = verseOfTheDay[standardWorkID];
  var reference = availableReferences[dayOfYear % availableReferences.length];
  return verseOfTheDay.library.getVerses(reference);
}

module.exports = verseOfTheDay;

function getDayOfYear() {
  var now = new Date();
  var start = new Date(now.getFullYear(), 0, 0);
  var diff = now - start;
  var oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function getDefaultStandardWorkID(dayOfYear) {
  var idx = dayOfYear % 3;
  switch (idx) {
    case 0: return 'OT';
    case 1: return 'NT';
    case 2: return 'BOM';
    case 3: return 'DC';
    default: throw 'Unrecognized';
  }
}