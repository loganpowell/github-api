"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.connect = undefined;

var _typeorm = require("typeorm");

const connect = exports.connect = (url = process.env.DATABASE_URL) => {
  return (0, _typeorm.createConnection)({
    type: 'postgres',
    url,
    entities: [...require('@accounts/typeorm').entities],
    synchronize: true
  }).then(connection => {
    return connection;
  });
};