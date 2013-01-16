TTYPRINTER = function() {
  this._TEXTS = [];
  this._CURRENT_TEXT_POSITION = 0;
  this._CURRENT_CHAR_POSITION = 0;
  this._CURRENT_STREAM_TYPE = "LET";
  this.AUDIO = undefined;
  this.AUDIOENABLED = "NO";
};

TTYPRINTER.prototype.DRAW_DOT = function(x, y, length,  canvas, context, color) {

  var radius = canvas.width / 15 ;
  var padding = radius / 1.5;
  context.globalCompositeOperation = "xor";
  context.save();
  context.beginPath();
  context.arc( x * radius * 3 + radius   , radius + y * radius * 3, radius, 0, 2 * Math.PI, false);
  context.fillStyle = color;
  context.fill();
  context.lineWidth = 0.5;
  context.strokeStyle = '#fff';
  context.stroke();
}

TTYPRINTER.prototype.DRAWTAPE = function(id, tape, complete_fill) {
  if (this.AUDIOENABLED == "YES") this.AUDIO.play();
  canvas = document.getElementById(id);
  context = canvas.getContext('2d');
  var radius = canvas.width / 15 ;
  context.clearRect(0, 0, canvas.width, canvas.height);
  if (typeof complete_fill == "undefined"){
    context.rect(0, 0, canvas.width, radius + tape.length * radius * 3);
  } else {
    context.rect(0, 0, canvas.width,  canvas.height);
  }
  context.fillStyle = '#FFF3B5';
  context.fill();
  for (line = 0; line < tape.length; line++) {
    for (var x = 0; x < 5; x++) {
      if (tape[line].split("")[x] == "1") this.DRAW_DOT(x, line, tape.length, canvas, context, "white");
    }
  }
};

TTYPRINTER.prototype.ENABLEAUDIO = function() {
  this.AUDIO = document.createElement('audio');
  if (this.AUDIO.canPlayType) {
    // Currently canPlayType(type) returns: "", "maybe" or "probably" 
    var CANPLAYMP3 = !! this.AUDIO.canPlayType && "" != this.AUDIO.canPlayType('audio/mpeg');
    var CANPLAYOGG = !! this.AUDIO.canPlayType && "" != this.AUDIO.canPlayType('audio/ogg; codecs="vorbis"');
  }
  if (CANPLAYMP3) this.AUDIO.setAttribute('src', '/sounds/323086_SOUNDDOGS__te.mp3');
  if (CANPLAYOGG) this.AUDIO.setAttribute('src', '/sounds/323086_SOUNDDOGS__te.ogg');

  this.AUDIO.load()
  this.AUDIO.volume = 0.1;
  this.AUDIOENABLED = "YES";
}

TTYPRINTER.prototype.TEXTS = function() {
  return this._TEXTS;
}

TTYPRINTER.prototype.ADD_TEXT = function(TEXT) {
  this._TEXTS.push(this.NORMALIZE(TEXT));
  return this.NUMBER_OF_TEXTS();
}

TTYPRINTER.prototype.NUMBER_OF_TEXTS = function() {
  return this._TEXTS.length;
}

TTYPRINTER.prototype.CURRENT_TEXT = function() {
  return this._TEXTS[this._CURRENT_TEXT_POSITION];
}

TTYPRINTER.prototype.CURRENT_TEXT_POSITION = function(NUMBER) {
  if (typeof NUMBER != "undefined" && NUMBER <= this.NUMBER_OF_TEXTS()) {
    this._CURRENT_TEXT_POSITION = NUMBER;
  };
  return this._CURRENT_TEXT_POSITION;
}

TTYPRINTER.prototype.NEXT_TEXT = function() {
  this._CURRENT_TEXT_POSITION += 1;
  this._CURRENT_CHAR_POSITION = 0;
  return this._CURRENT_TEXT_POSITION;
}

TTYPRINTER.prototype.CURRENT_CHAR = function() {
  return this.CURRENT_TEXT().split('')[this._CURRENT_CHAR_POSITION];
}

TTYPRINTER.prototype.TTY_CHAR = function(CHAR) {
  switch (this.CHAR_TYPE(CHAR)) {
  case "FIG":
    return this._FIGS[CHAR];
    break;
  case "LET":
    return this._LETS[CHAR];
    break;
  case "UNKNOWN":
  default:
    return this._LETS[""];
    break;
  }
}
TTYPRINTER.prototype.CURRENT_TTY_CHAR = function() {
  return this.TTY_CHAR(this.CURRENT_CHAR());
}

TTYPRINTER.prototype.CURRENT_CHAR_POSITION = function() {
  return this._CURRENT_CHAR_POSITION;
}


TTYPRINTER.prototype.ADVANCE = function() {
  if (this.CURRENT_TEXT() == undefined) return false;
  var NEXT_CHAR_POSITION = this._CURRENT_CHAR_POSITION + 1;
  var PREVIOUS_CHAR_TTY = this.CURRENT_TTY_CHAR();
  var PREVIOUS_CHAR = this.CURRENT_CHAR();
  if (this._CURRENT_CHAR_POSITION < (this.CURRENT_TEXT().length)) {
    if (this.CURRENT_STREAM_TYPE() != this.CHAR_TYPE(this.CHAR_AT(NEXT_CHAR_POSITION))) {
      STREAM_CHANGE_CHAR_TTY = this.CURRENT_STREAM_TYPE(this.CHAR_TYPE(this.CHAR_AT(NEXT_CHAR_POSITION)));
      PREVIOUS_CHAR_TTY = PREVIOUS_CHAR_TTY + STREAM_CHANGE_CHAR_TTY;
    };
    this._CURRENT_CHAR_POSITION = NEXT_CHAR_POSITION;
    return {
      "TTY": PREVIOUS_CHAR_TTY,
      "CHAR": PREVIOUS_CHAR
    };
  };
  if (this._CURRENT_TEXT_POSITION < this.NUMBER_OF_TEXTS() - 1) {
    this.NEXT_TEXT();
    return false;
  } else {
    return false;
  }
}

TTYPRINTER.prototype.CURRENT_STREAM_TYPE = function(STREAM_TYPE) {
  if (typeof STREAM_TYPE != "undefined") {
    this._CURRENT_STREAM_TYPE = STREAM_TYPE;
    if (STREAM_TYPE == "FIG") {
      return this._LETS["NUM_SHIFT"];
    } else {
      return this._LETS["LET_SHIFT"];
    };
  };
  return this._CURRENT_STREAM_TYPE;
}

TTYPRINTER.prototype.CHAR_AT = function(POSITION) {
  return this.CURRENT_TEXT().split('')[POSITION];
}


TTYPRINTER.prototype.CHAR_TYPE = function(CHAR) {
  if (this._LETS[CHAR] != undefined) return "LET";
  if (this._FIGS[CHAR] != undefined) return "FIG";
  return "UNKNOWN";
}

TTYPRINTER.prototype.NORMALIZE = function(TEXT) {
  TEXT = TEXT.split('');
  STRACCENTSOUT = new Array();
  STRACCENTSLEN = TEXT.length;
  var ACCENTS = '@ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž';
  var ACCENTSOUT = ['#', 'A', 'A', 'A', 'A', 'A', 'A', 'a', 'a', 'a', 'a', 'a', 'a', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'o', 'o', 'o', 'o', 'o', 'o', 'E', 'E', 'E', 'E', 'e', 'e', 'e', 'e', 'e', 'C', 'c', 'D', 'I', 'I', 'I', 'I', 'i', 'i', 'i', 'i', 'U', 'U', 'U', 'U', 'u', 'u', 'u', 'u', 'N', 'n', 'S', 's', 'Y', 'y', 'y', 'Z', 'z'];
  for (var Y = 0; Y < STRACCENTSLEN; Y++) {
    if (ACCENTS.indexOf(TEXT[Y]) != -1) {
      STRACCENTSOUT[Y] = ACCENTSOUT[ACCENTS.indexOf(TEXT[Y])];
    } else STRACCENTSOUT[Y] = TEXT[Y];
  }
  STRACCENTSOUT = STRACCENTSOUT.join('');
  return STRACCENTSOUT.toUpperCase();
}


TTYPRINTER.prototype._FIGS = {
  "NULL": "00000",
  "SPACE": "00100",
  "1": "11101",
  "2": "11001",
  "3": "10000",
  "4": "01010",
  "5": "00001",
  "6": "10101",
  "7": "11100",
  "8": "01100",
  "9": "00011",
  "0": "01101",
  "-": "11000",
  "'": "10100",
  "$": "10010",
  "!": "10110",
  "&": "01011",
  "#": "00101",
  "'": "11010",
  "(": "11110",
  ")": "01001",
  "\"": "10001",
  "/": "10111",
  ":": "01110",
  ";": "01111",
  "?": "10011",
  ":": "00110",
  ".": "00111",
  "CR": "00010",
  "LF": "01000",
  "NUM_SHIFT": "11011",
  "LET_SHIFT": "11111",
};


TTYPRINTER.prototype._LETS = {
  "": "00000",
  " ": "00100",
  "Q": "11101",
  "W": "11001",
  "E": "10000",
  "R": "01010",
  "T": "00001",
  "Y": "10101",
  "U": "11100",
  "I": "01100",
  "O": "00011",
  "P": "01101",
  "A": "11000",
  "S": "10100",
  "D": "10010",
  "F": "10110",
  "G": "01011",
  "H": "00101",
  "J": "11010",
  "K": "11110",
  "L": "01001",
  "Z": "10001",
  "X": "10111",
  "C": "01110",
  "V": "01111",
  "B": "10011",
  "N": "00110",
  "M": "00111",
  "CR": "00010",
  "LF": "01000",
  "NUM_SHIFT": "11011",
  "LET_SHIFT": "11111",
};

