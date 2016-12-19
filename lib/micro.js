/**
 * https://github.com/cho45/micro-template.js
 * (c) cho45 http://cho45.github.com/mit-license
 */
function template(view, data) {
  var line = 1;
  var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '\x22': '&#x22;',
    '\x27': '&#x27;'
  };

  function escapeHTML(html) {
    return String(html).replace(/[&<>\'\"]/g, function(char) {
      return map[char];
    });
  };

  var code =
    "try {\n" +
    "this.output += '" +
    view.replace(/<%/g, '\x11').replace(/%>/g, '\x13')
    .replace(/'(?![^\x11\x13]+?\x13)/g, '\\x27')
    .replace(/^\s*|\s*$/g, '')
    .replace(/\n|\r\n/g, function() {
      return "';\nthis.line = " + (++line) + ";\nthis.output += '\\n";
    })
    .replace(/\x11==\s*(.+?)\s*\x13/g, "' + ($1) + '")
    .replace(/\x11=\s*(.+?)\s*\x13/g, "' + this.escapeHTML($1) + '")
    .replace(/(^|[^\w\u00c0-\uFFFF_])(@)(?=\w)/g, '$1this.data.')
    .replace(/\x11\s*(.+?)\s*\x13/g, "';\n$1\nthis.output += '") +
    "';\n\nreturn this.output;\n} catch (e) {\n" +
    "throw 'TemplateError: ' + e + ' (at ' + ' line ' + this.line + ')';\n}";

  var syntax = new Function(code.replace(/\nthis\.output \+= '';\n/g, '\n'));

  function render(data) {
    return syntax.call({
      line: 1,
      output: '',
      data: data,
      escapeHTML: escapeHTML
    });
  };

  console.log(syntax);

  return data ? render(data) : render;
}

template(`
<h2><%= @name %></h2>
<!-- 这是注释 -->
<ul>
<% for(var i = 0 ; i < @supplies.length; i++) { %>
  <li><%= @supplies[i] %></li>
<% } %>
</ul>
<p style="text-indent:2em;">
  <%= @address %>
</p>
`)
