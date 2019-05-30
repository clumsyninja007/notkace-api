import express from 'express';
const router = express.Router();
const query = require('../../query');
import mysql from 'mysql';

/* GET /api/HdTickets */
router.get('/', async (req: express.Request, res: express.Request) => {
  const queryText = `SELECT *
                    FROM HD_TICKET`;

  await query.sqlQuery(queryText, req, res);
});

/* GET /api/HdTickets/5 */
router.get('/:id(\\d+)', async (req: express.Request, res: express.Request) => {
  const queryText = `SELECT *
                    FROM HD_TICKET
                    WHERE ID = ?`;

  let values = [];
  values.push(req.params.id);

  await query.sqlQuery(queryText, req, res, values);
});

/* GET /api/HdTickets/Open */
router.get('/Open', async (req: express.Request, res: express.Response) => {
  let queryText = `SELECT
                  h.id AS Ticket
                  ,h.TITLE AS Title
                  ,p.NAME AS Priority
                  ,u.FULL_NAME AS Owner
                  ,s.FULL_NAME AS Submitter
                  ,a.name AS Asset
                  ,d.name AS Device
                  ,hd.NAME AS Status
                  ,h.CUSTOM_FIELD_VALUE5 AS ReferredTo
                  ,u.user_name AS UserName
                  ,CASE p.NAME
                    WHEN 'EMERGENCY' THEN 1
                    WHEN 'CRITICAL' THEN 2
                    WHEN 'HIGH' THEN 3
                    WHEN 'MEDIUM' THEN 4
                    ELSE 5
                  END AS PriOrd
                  ,CASE hd.NAME
                    WHEN 'NEW' THEN 1
                    WHEN 'Re-Assigned' THEN 2
                    WHEN 'OPENED' THEN 3
                    WHEN 'In Progress' THEN 4
                    WHEN 'Waiting on Customer' THEN 5
                    WHEN 'Waiting on Third Party' THEN 6
                    WHEN 'Need More Info' THEN 7
                    ELSE 8
                  END AS StatOrd
                  ,h.CUSTOM_FIELD_VALUE1 AS Dept
                  ,h.CUSTOM_FIELD_VALUE2 AS Location
                FROM HD_TICKET AS h
                INNER JOIN USER AS u
                  ON u.ID = h.OWNER_ID
                INNER JOIN USER AS s
                  ON s.ID = h.SUBMITTER_ID
                LEFT JOIN ASSET AS a
                  ON a.id = h.ASSET_ID
                LEFT JOIN ASSET AS d
                  ON d.MAPPED_ID = h.MACHINE_ID
                  AND d.ASSET_TYPE_ID = 5
                  AND h.MACHINE_ID <> 0
                INNER JOIN HD_STATUS AS hd
                  ON hd.id = h.HD_STATUS_ID
                INNER JOIN HD_PRIORITY AS p
                  ON p.id = h.HD_PRIORITY_ID
                WHERE hd.name <> 'CLOSED'`;

  if (req.query.assignee) {
    queryText += ` AND u.USER_NAME = ${mysql.escape(req.query.assignee)}`;
  }
  if (req.query.software) {
    queryText += ` AND a.NAME = ${mysql.escape(req.query.software)}`;
  }
  if (req.query.referredTo) {
    queryText += ` AND h.CUSTOM_FIELD_VALUE5 = ${mysql.escape(
      req.query.referredTo
    )}`;
  }
  if (req.query.department) {
    queryText += ` AND h.CUSTOM_FIELD_VALUE1 = ${mysql.escape(
      req.query.department
    )}`;
  }
  if (req.query.location) {
    queryText += ` AND h.CUSTOM_FIELD_VALUE2 = ${mysql.escape(
      req.query.location
    )}`;
  }

  queryText += ' ORDER BY u.FULL_NAME, PriOrd, StatOrd';

  await query.sqlQuery(queryText, req, res);
});

/* GET /api/HdTickets/Open/5 */
router.get('/Open/:id', async (req: express.Request, res: express.Response) => {
  let queryText = `SELECT h.ID AS Ticket
      ,LTRIM(RTRIM(h.SUMMARY)) AS Summary
      ,c.COMMENT AS Comment
      ,c.TIMESTAMP AS Timestamp
      ,cu.FULL_NAME AS Commenter
    FROM HD_TICKET AS h
    LEFT JOIN HD_TICKET_CHANGE AS c
      ON c.HD_TICKET_ID = h.ID
      AND c.ID = (SELECT MAX(cc.ID)
                  FROM HD_TICKET_CHANGE cc
                  WHERE cc.HD_TICKET_ID = c.HD_TICKET_ID
                    AND cc.COMMENT <> ''
                    AND cc.COMMENT IS NOT NULL)
    LEFT JOIN USER AS cu
      ON cu.ID = c.USER_ID
    WHERE h.ID = ?`;

  let queryPromise = new Promise<string>((resolve) => {
    let temp: string = queryText;
    if (req.query.noOwners) {
      console.log("No 'owners only' comments");
      temp += ` AND c.OWNERS_ONLY = 0`;
      resolve(
        temp.replace(
          'AND cc.COMMENT IS NOT NULL',
          'AND cc.COMMENT IS NOT NULL AND cc.OWNERS_ONLY = 0'
        )
      );
    } else {
      console.log('All comments shown');
      resolve(temp);
    }
  });

  queryText = await queryPromise;

  let values = [];
  values.push(req.params.id);

  await query.sqlQuery(queryText, req, res, values);
});

module.exports = router;
