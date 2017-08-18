var request = require("request");

var library = {};

library.standardWorks = {
  'OT': null,
  'NT': null,
  'BOM': null,
  'DC': null,
  'POGP': null
};

library.getStandardWorkID = function(name) {
  if (!name) {
    return null;
  }
  switch (name.toLowerCase().trim()) {
    case 'old testament': return 'OT';
    case 'new testament': return 'NT';
    case 'book of mormon': return 'BOM';
    case 'doctrine and covenants':
    case 'doctrine & covenants': return 'DC';
    case 'pearl of great price': return 'POGP';
    default: throw 'Unrecognized name: ' + name;
  }
};

library.getStandardWorkResourceName = function(standardWorkID) {
  switch (standardWorkID) {
    case 'OT': return 'old-testament';
    case 'NT': return 'new-testament';
    case 'BOM': return 'book-of-mormon';
    case 'DC': return 'doctrine-and-covenants';
    case 'POGP': return 'pearl-of-great-price';
    default: throw 'Unrecognized ID ' + standardWorkID;
  }
}

library.downloadStandardWork = function(standardWorkID) {
  var resourceName = library.getStandardWorkResourceName(standardWorkID);
  var resourceURL = 'https://raw.githubusercontent.com/bcbooks/scriptures-json/master/' + resourceName + '.json';
  console.log('Downloading ' + resourceURL);
  return new Promise(function(resolve, reject) {
    request({ url: resourceURL, json: true }, function(err, response, standardWork) {
      console.log('Downloaded ' + resourceURL);
      standardWork = prepareForStorage(standardWork);
      resolve(standardWork);
    });
  });
};

library.getStandardWork = function(standardWorkID) {
  return new Promise(function(resolve, reject) {
    if (library.standardWorks[standardWorkID]) {
      resolve(library.standardWorks[standardWorkID]);
    } else {
      library.downloadStandardWork(standardWorkID).then(function(standardWork) {
        library.standardWorks[standardWorkID] = standardWork;
        resolve(library.standardWorks[standardWorkID]);
      });
    }
  });
};

library.getRandomVerse = function(standardWorkID) {
  console.log('Getting a random verse from ' + standardWorkID);
  return new Promise(function(resolve, reject) {
    library.getStandardWork(standardWorkID).then(function(standardWork) {
      var selectedVerseIndex = chooseRandom(0, standardWork.totalVerseCount - 1);
      console.log('Selected verse index: ' + selectedVerseIndex);
      resolve(standardWork.getVerse(selectedVerseIndex));
    });
  });
}

module.exports = library;

function prepareForStorage(standardWork) {
  if (!standardWork.books) {
    standardWork = { books: [ standardWork ] };
  }
  standardWork.totalVerseCount = 0;
  for (var b = 0; b < standardWork.books.length; b++) {
    var book = standardWork.books[b];
    book.chapters = book.chapters || book.sections;
    book.totalVerseCount = 0;
    for (var c = 0; c < book.chapters.length; c++) {
      var chapter = book.chapters[c];
      chapter.totalVerseCount = chapter.verses.length;
      book.totalVerseCount += chapter.totalVerseCount;
    }
    standardWork.totalVerseCount += book.totalVerseCount;
  }

  standardWork.getVerse = function(verseIdx) {
    var verseIndex = verseIdx;
    var selectedBookIndex = select(standardWork.books, verseIndex, function(newVerseIndex) { verseIndex = newVerseIndex; });
    var selectedBook = standardWork.books[selectedBookIndex];
    var selectedChapterIndex = select(selectedBook.chapters, verseIndex, function(newVerseIndex) { verseIndex = newVerseIndex; });
    var selectedChapter = selectedBook.chapters[selectedChapterIndex];
    return selectedChapter.verses[verseIndex];
  };
  
  return standardWork;
}

function select(entities, verseIndex, newVerseIndex) {
  console.log('Trying to find ' + verseIndex + ' from ' + entities.length + ' entities');
  var entityIndex = 0;
  for (entityIndex = 0; entityIndex < entities.length; entityIndex++) {
    if (entities[entityIndex].totalVerseCount > verseIndex) {
      break;
    }
    verseIndex -= entities[entityIndex].totalVerseCount;
  }
  newVerseIndex(verseIndex);
  console.log('Finish select with entity Idx ' + entityIndex + ', verse index ' + verseIndex);
  return entityIndex;
}

function chooseRandom(min, max) {
  console.log('Choosing a random number between ' + min + ' and ' + max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}