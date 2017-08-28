var request = require("request");

var library = {};

library.standardWorks = [];

library.downloadStandardWorkJSON = function(resourceName) {
  var resourceURL = 'https://raw.githubusercontent.com/bcbooks/scriptures-json/master/' + resourceName + '.json';
  console.log('Downloading ' + resourceURL);
  return new Promise(function(resolve, reject) {
    request({ url: resourceURL, json: true }, function(err, response, body) {
      resolve(body);
    });
  });
};

library.load = function() {
  return new Promise(function(resolve, reject) {
    library.downloadStandardWorkJSON('old-testament').then(function(otJSON) {
      library.standardWorks.push(prepareForStorage({
        id: 'OT',
        names: [ 'Old Testament' ],
        books: otJSON.books
      }));
      library.downloadStandardWorkJSON('new-testament').then(function(ntJSON) {
        library.standardWorks.push({
          id: 'NT',
          names: [ 'New Testament' ],
          books: ntJSON.books
        });
        library.downloadStandardWorkJSON('book-of-mormon').then(function(bomJSON) {
          library.standardWorks.push({
            id: 'BOM',
            names: [ 'Book of Mormon' ],
            books: bomJSON.books
          });
          library.downloadStandardWorkJSON('doctrine-and-covenants').then(function(dcJSON) {
            library.standardWorks.push({
              id: 'DC',
              names: [ 'Doctrine and Covenants', 'Doctrine & Covenants', 'D&C' ],
              books: [{
                book: 'D&C',
                chapters: dcJSON.sections
              }]
            });
            library.downloadStandardWorkJSON('pearl-of-great-price').then(function(pogpJSON) {
              for (var b = 0; b < pogpJSON.books.length; b++) {
                var book = pogpJSON.books[b];
                switch (book.book) {
                  case 'Moses':
                  case 'Abraham':
                    library.getStandardWork('OT').books.push(book);
                    break;
                  case 'Joseph Smith—Matthew':
                    library.getStandardWork('NT').books.push(book);
                    break;
                  default:
                    library.getStandardWork('DC').books.push(book);
                    break;
                }
              }
              
              for (var i = 0; i < library.standardWorks.length; i++) {
                library.standardWorks[i] = prepareForStorage(library.standardWorks[i]);
              }
              resolve();
            });
          });
        });
      });
    });
  });
};

library.getStandardWorkID = function(name, nullIfNotFound, randomIfNotFound) {
  var standardWorkID = null;
  if (name) {
    switch (name.toLowerCase().trim()) {
      case 'old testament': standardWorkID = 'OT'; break;
      case 'new testament': standardWorkID = 'NT'; break;
      case 'book of mormon': standardWorkID = 'BOM'; break;
      case 'd&c':
      case 'doctrine and covenants':
      case 'doctrine & covenants': standardWorkID = 'DC'; break;
      default: break;
    }
  }
  if (standardWorkID) {
    return standardWorkID;
  }
  if (nullIfNotFound) {
    return null;
  }
  if (randomIfNotFound) {
    return library.standardWorks[chooseRandom(0, library.standardWorks.length - 1)].id;
  }
  throw 'Unrecognized standard work name ' + name;
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

library.getStandardWork = function(standardWorkID) {
  for (var i = 0; i < library.standardWorks.length; i++) {
    if (library.standardWorks[i].id === standardWorkID) {
      return library.standardWorks[i];
    }
  }
  throw 'Standard work ' + standardWorkID + ' not found';
};

library.getRandomVerse = function(standardWorkID) {
  var standardWork = library.getStandardWork(standardWorkID);
  var selectedVerseIndex = chooseRandom(0, standardWork.totalVerseCount - 1);
  return standardWork.getVerse(selectedVerseIndex);
}

library.referenceParseRegex = /^(\d )?(([a-z]|[A-Z]| |\&)+)(\d+)(\:((\d| |\-|\–|\,)+))?/;

library.getVerses = function(referenceString) {
  console.log('Looking up reference ' + referenceString);
  var matches = library.referenceParseRegex.exec(referenceString.trim());

  // Parse book name
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
  
  // Parse chapter number
  var chapterNumber = parseInt(matches[4].trim());
  
  // Parse verse numbers
  var verseNumbers = [];
  if (matches[6] && matches[6].trim().length) {
    var verseRangeGroupStrings = matches[6].trim().split(',');
    for (var r = 0; r < verseRangeGroupStrings.length; r++) {
      var verseRangeGroupString = verseRangeGroupStrings[r].trim();
      var rangePieceStrings = verseRangeGroupString.split('-');
      var verseRangeStart = parseInt(rangePieceStrings[0].trim());
      var verseRangeEnd = rangePieceStrings.length > 1 ? parseInt(rangePieceStrings[1].trim()) : verseRangeStart;
      for (var v = verseRangeStart; v <= verseRangeEnd; v++) {
        verseNumbers.push(v);
      }
    }
  }
  
  return getVersesFrom(library.standardWorks, bookName, chapterNumber, verseNumbers);
};

module.exports = library;

function prepareForStorage(standardWork) {
  standardWork.totalVerseCount = 0;
  for (var b = 0; b < standardWork.books.length; b++) {
    var book = standardWork.books[b];
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
  if (verseNumbers.length) {
    for (var verseNumberIdx = 0; verseNumberIdx < verseNumbers.length; verseNumberIdx++) {
      var verseNumber = verseNumbers[verseNumberIdx];
      verses.push(chapter.verses[verseNumber - 1]);
    }
  } else {
    verses = chapter.verses;
  }
  return verses;
}

function getBookFrom(standardWorks, bookName) {
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