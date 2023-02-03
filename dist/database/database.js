"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connection = void 0;
const mysql = require("mysql2/promise");
const bluebird = require('bluebird');
const connection = mysql
    .createConnection({
    host: "localhost",
    port: "8889",
    user: "root",
    password: "root",
    database: "tgBot",
    Promise: bluebird
})
    .then(console.log("DB connected"))
    .catch((err) => console.log(err));
exports.connection = connection;
