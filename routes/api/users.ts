import express from 'express';
const router = express.Router();
const query = require('../../query');

/* GET /Users */
router.get('/', async (req: express.Request, res: express.Response) => {
  const queryString = `SELECT *
                      FROM USER`;

  await query.sqlQuery(queryString, req, res);
});

/* GET /Users/5 */
router.get(
  '/:id(\\d+)',
  async (req: express.Request, res: express.Response) => {
    const queryString = `SELECT *
                      FROM USER
                      WHERE ID = ?`;

    let values = [];
    values.push(req.params.id);

    await query.sqlQuery(queryString, req, res, values);
  }
);

/* GET /Users/Owners */
router.get('/Owners', async (req: express.Request, res: express.Response) => {
  const queryString = `SELECT ID AS Id
                        ,USER_NAME AS UserName
                        ,FULL_NAME AS FullName
                      FROM USER
                      WHERE ROLE_ID = 5
                      ORDER BY FULL_NAME`;

  await query.sqlQuery(queryString, req, res);
});

module.exports = router;
