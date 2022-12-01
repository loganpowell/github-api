import { createConnection } from 'typeorm';

export const connect = (url = process.env.DATABASE_URL) => {
  return createConnection({
    type: 'postgres',
    url,
    entities: [...require('@accounts/typeorm').entities],
    synchronize: true,
  }).then(connection => {
    return connection;
  });
};

// 'use strict';
 
// var pg = require('pg');
 
// exports.handler = function(event, context) {   
 
//     var dbConfig = {
//         user: 'username',
//         password: 'mypassword',
//         database: 'myDB',
//         host: 'myhost.com',
//         port: 5432
//     };
//     var client = new pg.Client(dbConfig);
//     client.connect();
//     client.end();
//  };

// your lambda entry point
module.exports.handler = (event, context, callback) =>  
getConnection(async (connection) => {
    let result;
    try {
        // work with your connection
    } catch (error) {
    }
    callback(null, result);
})


// db connection 

const getConnection = async (callback) => {
const dbConnection = new DBConnection();
try {
    const connection = await dbConnection.create();
    await callback(connection);
} finally {
    dbConnection.close();
}
};

const MAX_RETRY = 3;

const options = {
// global event notification;
error: (error, e) => {
    if (e.cn) {
    // A connection-related error;
    //
    // Connections are reported back with the password hashed,
    // for safe errors logging, without exposing passwords.
    logger.error('CN:', e.cn);
    logger.error('EVENT:', error.message || error);
    }
},
};

const pgp = require('pg-promise')(options);

const connectionParams = {
  host           : process.env.DATABASE_HOST,
  port           : process.env.DATABASE_PORT,
  database       : process.env.DATABASE_NAME,
  user           : process.env.DATABASE_USERNAME,
  password       : process.env.DATABASE_PASSWORD,
  poolSize       : 0,
  poolIdleTimeout: 10,
};

const db = pgp(connectionParams);

class DBConnection {

async create() {
  let retry = 0;
  while (retry < MAX_RETRY) {
    try {
        logger.debug(`Acquiring a new DB connection Attempt: ${retry}/${MAX_RETRY}`);
        this.connection = await db.connect({ direct: true });
        break;
    } catch (error) {
        logger.error(`Error occurred while getting DB connection ${error}. Retrying ${retry}/${MAX_RETRY}`);
        retry += 1;
    }
  }

  if (!this.connection) {
    throw Error(`Unable to obtain DB connection after ${MAX_RETRY} retries`);
  }

  return this.connection;
}

close() {
    if (this.connection) {
      logger.debug('Closing DB Connection');
      this.connection.done();
    }
  }
}
