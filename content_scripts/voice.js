(function() {
  var sendKeyboardEvent = function(key, type, extra) {
    if (type == null) {
      type = "keydown";
    }
    if (extra == null) {
      extra = {};
    }
    return handlerStack.bubbleEvent(
      type,
      extend(extra, {
        type: type,
        key: key,
        preventDefault: function() {},
        stopImmediatePropagation: function() {}
      })
    );
  };

  var sendKeyboardEvents = function(keys) {
    var j, key, len, ref, results;
    ref = keys.split("");
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      key = ref[j];
      results.push(sendKeyboardEvent(key));
    }
    return results;
  };

  var direction_select_key = function(direction, keep, abit) {
    switch (direction) {
      case "up":
        if (keep) {
          root.Scroller.scrollBy("y", -1);
          return;
        }
        var key = abit ? "k" : "u";
        sendKeyboardEvent(key);
        sendKeyboardEvent("a");
        break;
      case "down":
        if (keep) {
          root.Scroller.scrollBy("y", 1);
          return;
        }
        var key = abit ? "j" : "d";
        sendKeyboardEvent(key);
        sendKeyboardEvent("a");
        break;
      case "left":
        if (keep) {
          root.Scroller.scrollBy("x", -1);
          return;
        }
        sendKeyboardEvent("h");
        sendKeyboardEvent("a");
        break;
      case "right":
        if (keep) {
          root.Scroller.scrollBy("x", 1);
          return;
        }
        sendKeyboardEvent("l");
        sendKeyboardEvent("a");
        break;
      default:
        throw new Error("unknown direction: " + direction);
    }
  };

  // For allrecipes.com.
  var goToIngredients = function() {
    var elements = window.document.getElementsByTagName("span");
    for (var i = 0; i < elements.length; i++) {
      var e = elements[i];
      if (e.innerText === "Ingredients") {
        // Scroll_To(e, e.offsetTop);
        e.scrollIntoView();
        break;
      }
    }
  };
  var goToDirections = function() {
    var elements = window.document.getElementsByTagName("span");
    for (var i = 0; i < elements.length; i++) {
      e = elements[i];
      if (e.innerText === "Directions" || e.innerText === "Instructions") {
        // Scroll_To(e, e.offsetTop);
        e.scrollIntoView();
        break;
      }
    }
  };

  var keep_direction_re = /keep.*(up|down|left|right)/;
  var abit_direction_re = /(up|down|left|right) a (bit|little)/;
  var direction_re = /(up|down|left|right)/;
  var next_page_re = /(next[- ]|go down a) page/;
  var previous_page_re = /((previous|last|go up a) page)/;
  var find_re = /find/;
  var type_re = /type (.*)/;
  var link_re = /(lynx|links)/;
  var goto_re = /go to (\w{1,2})/;
  var goto_ingredients_re = /ingredients/;
  var goto_directions_re = /(directions|instructions)/;
  var goback_re = /go back/;
  var goforward_re = /go forward/;

  var recognition = new webkitSpeechRecognition();
  var recognitionOn = true;

  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = function() {
    console.log("onstart");
  };
  recognition.onend = function() {
    console.log("onend");
  };

  recognition.onresult = function(event) {
    var last = event.results.length - 1;
    var text = event.results[last][0].transcript.toLowerCase();
    console.log(text);

    if (goto_ingredients_re.exec(text)) {
      goToIngredients();
      return;
    }
    if (goto_directions_re.exec(text)) {
      goToDirections();
      return;
    }

    // match = find_re.exec(text);
    // if (match) {
    //   sendKeyboardEvents("/");
    //   return;
    // }

    // match = type_re.exec(text);
    // if (match) {
    //   console.log(match[1]);
    //   sendKeyboardEvents(match[1]);
    //   return;
    // }

    if (text.includes("stop")) {
      sendKeyboardEvent("Esc");
      return;
    }

    if (text.includes("close help") || text.includes("quit help")) {
      sendKeyboardEvent("?");
      return;
    }

    if (text.includes("help")) {
      NormalModeCommands.showHelp(null);
      return;
    }

    if (next_page_re.exec(text)) {
      sendKeyboardEvents("dda");
      return;
    }

    if (previous_page_re.exec(text)) {
      sendKeyboardEvents("uua");
      return;
    }

    if (goback_re.exec(text)) {
      sendKeyboardEvent("H");
    }

    if (goforward_re.exec(text)) {
      sendKeyboardEvent("L");
    }

    match = abit_direction_re.exec(text);
    if (match) {
      // console.log(match);
      direction_select_key(match[1], false, true);
      return;
    }

    match = keep_direction_re.exec(text);
    if (match) {
      // console.log(match);
      direction_select_key(match[1], true, false);
      return;
    }

    match = direction_re.exec(text);
    if (match) {
      // console.log(match);
      direction_select_key(match[1], false, false);
    } else if (link_re.exec(text)) {
      // console.log("links");
      sendKeyboardEvent("f");
    } else {
      match = goto_re.exec(text);
      if (match) {
        // console.log(match);
        if (match[1].length > 1) {
          sendKeyboardEvents(match[1]);
          return;
        }
        sendKeyboardEvent(match[1]);
      }
    }
  };
  recognition.onerror = function(event) {
    console.log("onerror");
  };

  recognize = function() {
    if (recognitionOn) {
      recognitionOn = false;
      recognition.stop();
      return;
    }

    recognition.start();
    recognitionOn = true;
  };

  recognition.start();

  window.addEventListener("keydown", function(event) {
    if (event.keyCode === 81) {
      recognize();
    }
  });
}.call(this));
