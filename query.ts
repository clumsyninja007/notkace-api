import express from 'express';
import { Config } from './config';

import mysql from 'mysql';

module.exports = {
  sqlQuery: function(
    queryText: string,
    req: express.Request,
    res: express.Response,
    values: string[]
  ): void {
    //console.log('Query: ' + queryText);

    let con = mysql.createConnection(new Config().database);

    con.connect((err) => {
      if (err) {
        console.error('Error connecting to database');
        console.error(err.stack);
        res.status(500);
        res.send();
        return;
      }

      console.log('connected as id ' + con.threadId);

      if (values) {
        con.query(queryText, values, (err, results) => {
          if (err) {
            console.error('Error executing query');
            console.log(queryText);
            console.error(err.stack);
            res.status(500);
            res.send();
            return;
          }
          res.send(results);
          console.log('Query successful');

          con.end((err) => {
            if (err) {
              console.error('Error ending connection');
            }
          });
        });
      } else {
        con.query(queryText, (err, results) => {
          if (err) {
            console.error('Error executing query');
            console.log(queryText);
            console.error(err.stack);
            res.status(500);
            res.send();
            return;
          }
          res.send(results);
          console.log('Query successful');

          con.end((err) => {
            if (err) {
              console.error('Error ending connection');
            }
          });
        });
      }
    });
  },
};
