'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
let AsciiTable = require('ascii-table');
let RoutesList = (function () {
  function RoutesList() {}

  RoutesList.terminal = function (app) {
    RoutesList.table = new AsciiTable('List All Routes Endpoints');
    RoutesList.table.setHeading('Method', 'URI');
    app._router.stack.forEach(RoutesList.print.bind(undefined, []));

    // Filter unique endpoints
    RoutesList.data = RoutesList.data.filter(
      (value, index, self) => index === self.findIndex(t => t.method === value.method && t.URI === value.URI),
    );

    // Sort the data
    RoutesList.data = RoutesList.data.sort((a, b) => {
      return a.URI.localeCompare(b.URI);
    });

    // Assign the data to table row
    for (const item of RoutesList.data) {
      RoutesList.table.addRow(item.method, item.URI);
    }

    // Print the Log
    console.log(RoutesList.table.toString());
  };
  RoutesList.web = function (app, path) {
    app._router.stack.forEach(RoutesList.print.bind(undefined, []));

    // Filter unique endpoints
    RoutesList.data = RoutesList.data.filter(
      (value, index, self) => index === self.findIndex(t => t.method === value.method && t.URI === value.URI),
    );

    let table =
      '<!DOCTYPE html>\n    <html>\n    <head>\n    <style>\n    body{\n      width:75%;\n      margin: 0 auto;\n      font-family: Arial, Helvetica, sans-serif;\n    }\n   \n    table, th, td {\n      border: 1px solid #dee2e6;\n      border-collapse: collapse;\n    }\n    th, td {\n      padding: 15px;\n      text-align: left;\n    }\n    table{\n      width:"100%"\n    } \n    th{\n      font-size: 18px;\n      color: #fff;\n      font-weight:"bold";\n      line-height: 1.4;\n      background-color: #343a40;\n    }\n    .text-center{\n      text-align:center;\n    }    \n    </style>\n    </head>\n    <body>\n    <h1 class="text-center">List of Routes</h1>\n    <table style="width:100%">\n    <thead>\n    <tr>\n    <th class="text-center" align="center">#</th>\n    <th align="center">METHOD</th>\n    <th align="center">URI</th>\n    </tr>\n    </thead>\n    <tbody>\n    ';
    for (const [index, item] of RoutesList.data.entries()) {
      table +=
        '<tr><td class="text-center">' +
        (index + 1) +
        '</td><td>' +
        item.method +
        '</td><td>' +
        item.URI +
        '</td></tr>';
    }
    table += '</tbody></table></body></html>';
    app.get(path, function (req, res) {
      res.send(table);
    });
  };
  RoutesList.print = function (path, layer) {
    if (layer.route) {
      layer.route.stack.forEach(RoutesList.print.bind(undefined, path.concat(RoutesList.split(layer.route.path))));
    } else if (layer.name === 'router' && layer.handle.stack) {
      layer.handle.stack.forEach(RoutesList.print.bind(undefined, path.concat(RoutesList.split(layer.regexp))));
    } else if (layer.method) {
      let item = {
        method: layer.method.toUpperCase(),
        URI: path.concat(RoutesList.split(layer.regexp)).filter(Boolean).join('/'),
      };
      RoutesList.data.push(item);
    }
  };
  RoutesList.split = function (thing) {
    if (typeof thing === 'string') {
      return thing.split('/');
    } else if (thing.fast_slash) {
      return '';
    } else {
      let match = thing
        .toString()
        .replace('\\/?', '')
        .replace('(?=\\/|$)', '$')
        .match(/^\/\^((?:\\[$()*+./?[\\\]^{|}]|[^$()*+./?[\\\]^{|}])*)\$\//);
      return match ? match[1].replace(/\\(.)/g, '$1').split('/') : '<complex:' + thing.toString() + '>';
    }
  };
  RoutesList.data = [];
  return RoutesList;
})();
exports.default = RoutesList;
