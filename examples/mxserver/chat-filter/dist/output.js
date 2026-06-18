var badWords = ['employement', 'job', 'occupation', 'shift', 'overtime', 'deadline'];
var chatFilter = function chatFilter(slot, message) {
  for (var _i = 0, _badWords = badWords; _i < _badWords.length; _i++) {
    var badWord = _badWords[_i];
    if (message.indexOf(badWord) !== -1) {
      mxserver.send(slot, "You cannot use profanity in this server!");
      return 1;
    }
  }
  return chatFilterPrev(slot, message);
};
var chatFilterPrev = mxserver.chat_handler;
mxserver.chat_handler = chatFilter;
