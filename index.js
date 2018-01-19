'use strict';
var async = require('async');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var opts = require('./extra/config')
var adapter = require('./extra/mysql')(opts.db)
var getDataType = require('./extra/data-type')

function structures(adapter, tables, cb) {
  var tables = tables.reduce(function(map, tbl) {
    map[tbl] = structureTask(adapter, tbl);
    return map;
  }, {});
  async.parallel(tables, cb);
}

function structureTask(adapter, tblName) {
  return function(cb) {
    adapter.getTableStructure(tblName, cb);
  };
}

function index() {
  var tableList = ['*'];
  adapter.getTables(tableList, function(err, tables) {
    if (err) {
      console.error(err.message ? err.message : err.toString());
      process.exit(1);
    }

    var matchAll = tableList.length === 1 && tableList[0] === '*';
    if (!matchAll && tableList.length !== tables.length) {
      return cb(new Error(
        'Did not find specified table(s): ' + diff(tableList, tables).join(', ')
      ));
    }

    structures(adapter, tables, function(err, dataStructure) {
      adapter.close();

      var outputdirectory = path.resolve(opts.outdirectory);
      var code = ''
      var tablenames = Object.keys(dataStructure)
      mkdirp(outputdirectory, function(err) {
        if (err) {
          throw err;
        }

        for (let key of tablenames) {
          var row = dataStructure[key]
          code += `type ${row[0].tableName} {\n`
          var fragCode = ''
          for (let i in row) {
            var columnKey = row[i].columnKey
            var isNullable = row[i].columnName == 'id' || row[i].isNullable == 'NO' ? '!' : ''
            var columnName = row[i].columnName
            var isUnique = row[i].columnName == 'id' || columnKey == 'PRI' ? ' @unique':''
            var dataType = row[i].columnName=='id' && columnKey == 'PRI' ? 'ID' : getDataType(row[i].dataType)
            fragCode += `  ${columnName}: ${dataType}${isNullable}${isUnique} \n`
          }
          code += fragCode
          code += `}\n\n`
        }
        fs.writeFileSync(path.join(outputdirectory, opts.outfilename), code);
        if (!opts.outdirectory) {
          return;
        }

      })

      var dir = path.resolve(opts.outdirectory);
      console.log('Graphql model generate in ' + path.join(dir, opts.outfilename))
    })
  });
}
index()