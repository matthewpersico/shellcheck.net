/* I don't actually know Javascript :( */

var lastChange = 0;
var lastCheck = 0;
var lastCode = "";
var lastErrors = [];

function shellcheckCode(code, callback) {
  lastChange = lastCheck;
  if (lastChange == 0 && code == "") {
    return;
  }

  if (window.jQuery) {
    $.post("shellcheck.php",
        { "script": code },
        function (data) {
          callback(data);
        }, 'json');
  } else {
    // JQuery is not loaded. Try again soon.
    setTimeout(function() {
      shellcheckCode(code, callback);
    }, 1000);
  }
}

function getLink(code) {
  return $("<a />")
    .attr("href", "https://github.com/koalaman/shellcheck/wiki/SC" + code)
    .attr("target", "_blank")
    .attr("class", "wikilink")
    .text("SC" + code);
}
function getLineLink(line, column) {
    return $("<a />")
        .attr("href", "javascript:setPosition(" + line + ", " + column + ")")
        .attr("class", "linelink")
        .text("Line " + line + ":");
}

function formatError(err) {
  var nodes = [];
  var header="";

  var i=1;
  if (err.column >= 60) {
    header += ">>";
    i += header.length;
  }
  for(; i<err.column; i++) {
    header += "&nbsp;"
  }
  header += "^-- ";
  
  nodes.push($("<span />").html(header));
  if (err.code > 0) {
    nodes.push(getLink(err.code));
    nodes.push(document.createTextNode(": "));
  }
  nodes.push($("<span />").text(err.message));
  return $("<span />")
      .addClass(err.level)
      .addClass("pointer")
      .append(nodes);
}

function sortKey() {
  for(var i in arguments) {
    if (arguments[i] != 0)
      return arguments[i];
  }
  return 0;
}

function createTerminal(code, errors) {
  var node = $("<div />");
  errors.sort(function(a,b) {
    return sortKey(a.line - b.line, a.column - b.column)
  });

  var lines = code.split("\n");
  node.append(document.createTextNode("$ shellcheck myscript")).append("<br />");
  if(errors.length == 0) {
    node.append(document.createTextNode("No issues detected!")).append("<br />");
  } else {
    var last = -1;
    for (var i=0; i < errors.length; i++) {
      // For the first message of the line, print the line number and line
      if (errors[i].line != last) {
        last = errors[i].line;
        node.append("&nbsp;<br />");
        node.append(getLineLink(errors[i].line, errors[i].column));
        node.append("<br />");
        var line = lines[errors[i].line - 1];
        if ( ! line ) {
          line = "";
        }
        line = line.replace(/\t/g, "        ");
        line = line.replace(/^ /, "\u00A0");
        line = line.replace(/  /g, " \u00A0");
        var lineElem = $("<span />")
            .addClass("sourceline")
            .append(document.createTextNode(line));
        node.append(lineElem).append("<br />");
      }
      // Then 1+ errors
      node.append(formatError(errors[i])).append("<br />");
    }
  }
  node
    .append("<br />")
    .append(document.createTextNode("$ ")).append("<br />");
  return node;
}

function setTerminal(code, errors) {
  $("#terminal").html("").append(createTerminal(code, errors));
  if (lastChange == lastCheck) {
    lastCode = code;
    lastErrors = errors;
    $("#processingindicator").text("");
  }
}

function setPosition(line, column) {
  var min = 40;
  editor.gotoLine(line, column - 1);
  var position = editor.renderer.textToScreenCoordinates(line, column - 1).pageY;
  if ( position < min) {
    document.body.scrollTop += position - min;
  }
  editor.focus();
}
function maximize() {
  var selector = "#editorwindow";
  $(selector).css( { "max-width": "100%" });
  $(selector).height($(selector).height() * 1.5);
  $("#terminalwindow").css( { "max-width": "100%" });
  editor.resize();
}
function minimize() {
  var selector = "#editorwindow";
  if ($(selector).height() > 50) {
    $(selector).height($(selector).height() * 0.5);
  }
  editor.resize();
}

function editorChangeHandler(obj) {
  lastChange++;
  $("#processingindicator").text(" (updating)");
}

function reportBug() {
  window.open(makeReportUrl(lastCode, lastErrors));
}
