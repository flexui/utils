/**
 * https://github.com/cho45/micro-template.js
 * (c) cho45 http://cho45.github.com/mit-license
 */
function template(string, data) {
  var line = 1;

  var body =
    "try {\n" +
    "this.ret += '" +
    string.replace(/<%/g, '\x11').replace(/%>/g, '\x13')
    .replace(/'(?![^\x11\x13]+?\x13)/g, '\\x27')
    .replace(/^\s*|\s*$/g, '')
    .replace(/\n|\r\n/g, function() {
      return "';\nthis.line = " + (++line) + ";\nthis.ret += '\\n";
    })
    .replace(/\x11==\s*(.+?)\s*\x13/g, "' + ($1) + '")
    .replace(/\x11=\s*(.+?)\s*\x13/g, "' + this.escapeHTML($1) + '")
    .replace(/(^|[^\w\u00c0-\uFFFF_])(@)(?=\w)/g, '$1this.stash.')
    .replace(/\x11\s*(.+?)\s*\x13/g, "';\n$1\nthis.ret += '") +
    "';\n\nreturn this.ret;\n} catch (e) {\nthrow 'TemplateError: ' + e + ' (at ' + ' line ' + this.line + ')';\n}";

  var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '\x22': '&#x22;',
    '\x27': '&#x27;'
  };

  function escapeHTML(string) {
    return ('' + string).replace(/[&<>\'\"]/g, function(char) {
      return map[char];
    });
  };

  var func = new Function(body.replace(/\nthis\.ret \+= '';\n/g, '\n'));

  function render(stash) {
    return func.call({
      ret: '',
      line: 1,
      stash: stash,
      escapeHTML: escapeHTML
    });
  };

  console.log(func);

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
