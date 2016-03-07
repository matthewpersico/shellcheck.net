/* I don't actually know Javascript :( */

function shellcheckCode(code, callback) {
  if (window.jQuery) {
    $.post("shellcheck.php",
        { "script": code },
        function (data) {
          console.log(data);
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

function formatError(err) {
  var nodes = [];
  var tag=$("<span />");
  var header="";
  for(var i=1; i<err.column; i++) {
    header += "&nbsp;"
  }
  header += "^-- ";
  
  nodes.push($("<span />").html(header));
  nodes.push(getLink(err.code));
  nodes.push(document.createTextNode(": "));
  nodes.push($("<span />").text(err.message));
  return $("<span />").attr("class", err.level).append(nodes);
}

function createTerminal(code, errors) {
  console.log(code);
  console.log(errors);
  var node = $("<div />");
  // Sort by line, then by column.
  errors.sort(function(a,b) {
    return a.column - b.column;
  });
  errors.sort(function(a,b) {
    return a.line - b.line;
  });

  var lines = code.split("\n");
  node.append(document.createTextNode("$ shellcheck myscript")).append("<br />");
  if(errors.length == 0) {
    node.append(document.createTextNode("No issues detected!")).append("<br />");
  } else {
    var last = -1;
    for (var i=0; i < errors.length; i++) {
      // For the first message of the line, print the line
      if (errors[i].line != last) {
        last = errors[i].line;
        node.append("&nbsp;<br />");
        var line = lines[errors[i].line - 1];
        if ( ! line ) {
          line = "";
        }
        line = line.replace(/\t/g, "    ");
        line = line.replace(/ /g, "\u00A0");
        node.append(document.createTextNode(line)).append("<br />");
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
}
