var request = require("request");

var library = {};

library.standardWorks = {
  OT: null,
  NT: null,
  BOM: null,
  DC: null,
  POGP: null
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
  return new Promise(function(resolve, reject) {
    library.getStandardWork(standardWorkID).then(function(standardWork) {
      var selectedVerseIndex = chooseRandom(0, standardWork.totalVerseCount - 1);
      resolve(standardWork.getVerse(selectedVerseIndex));
    });
  });
}

library.referenceParseRegex = /^(\d )?(([a-z]|[A-Z]| )+)(\d+)\:((\d| |\-|\–|\,)+)/;

library.getVerses = function(referenceString) {
  console.log('Looking up ' + referenceString);
  var matches = library.referenceParseRegex.exec(referenceString.trim());
  var bookName = '';
  if (matches[1]) {
    bookName += matches[1].trim();
  }
  if (matches[2]) {
    if (bookName.length) {
      bookName += ' ';
    }
    bookName += matches[2].trim();
  }
  var chapterNumber = parseInt(matches[4].trim());
  var verseRangeGroupStrings = matches[5].split(',');
  
  var verseNumbers = [];
  for (var r = 0; r < verseRangeGroupStrings.length; r++) {
    var verseRangeGroupString = verseRangeGroupStrings[r].trim();
    var rangePieceStrings = verseRangeGroupString.split('-');
    var verseRangeStart = parseInt(rangePieceStrings[0].trim());
    var verseRangeEnd = rangePieceStrings.length > 1 ? parseInt(rangePieceStrings[1].trim()) : verseRangeStart;
    for (var v = verseRangeStart; v <= verseRangeEnd; v++) {
      verseNumbers.push(v);
    }
  }
  
  return new Promise(function(resolve, reject) {
    library.getStandardWork('OT').then(function(ot) {
      library.getStandardWork('NT').then(function(nt) {
        library.getStandardWork('BOM').then(function(bom) {
          library.getStandardWork('DC').then(function(dc) {
            library.getStandardWork('POGP').then(function(pogp) {
              resolve(getVersesFrom([ot, nt, bom, dc, pogp], bookName, chapterNumber, verseNumbers));
            });
          });
        });
      });
    });
  });
};

module.exports = library;

function prepareForStorage(standardWork) {
  if (!standardWork.books) {
    standardWork.book = standardWork.title;
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
  var entityIndex = 0;
  for (entityIndex = 0; entityIndex < entities.length; entityIndex++) {
    if (entities[entityIndex].totalVerseCount > verseIndex) {
      break;
    }
    verseIndex -= entities[entityIndex].totalVerseCount;
  }
  newVerseIndex(verseIndex);
  return entityIndex;
}

function chooseRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getVersesFrom(standardWorks, bookName, chapterNumber, verseNumbers) {
  var book = getBookFrom(standardWorks, bookName);
  var chapter = book.chapters[chapterNumber - 1];
  
  var verses = [];
  for (var verseNumberIdx = 0; verseNumberIdx < verseNumbers.length; verseNumberIdx++) {
    var verseNumber = verseNumbers[verseNumberIdx];
    verses.push(chapter.verses[verseNumber - 1]);
  }
  return verses;
}

function getBookFrom(standardWorks, bookName) {
  console.log('Looking for book ' + bookName);
  for (var sw = 0; sw < standardWorks.length; sw++) {
    var standardWork = standardWorks[sw];
    for (var b = 0; b < standardWork.books.length; b++) {
      var book = standardWork.books[b];
      if (book.book.toLowerCase() === bookName.toLowerCase()) {
        return book;
      }
    }
  }
  
  console.log('Book ' + bookName + ' not found');
  return null;
}