import express from 'express';
const router = express.Router();
const query = require('../../query');

/* GET /api/Assets */
router.get('/', async (req: express.Request, res: express.Request) => {
  const queryText = `select *
                    FROM ASSET`;

  await query.sqlQuery(queryText, req, res);
});

/* GET /api/Assets/5 */
router.get(
  '/:id(\\d+)',
  async (req: express.Request, res: express.Response) => {
    const queryText = `select *
                  FROM ASSET
                  WHERE id = ?`;

    let values = [];
    values.push(req.params.id);

    await query.sqlQuery(queryText, req, res, values);
  }
);

/* GET /api/Assets/Type/5 */
router.get(
  '/Type/:id(\\d+)',
  async (req: express.Request, res: express.Request) => {
    const queryText = `SELECT ID AS Id
                      ,NAME AS Name
                    FROM ASSET
                    WHERE ASSET_TYPE_ID = ?
                    ORDER BY NAME`;

    let values = [];
    values.push(req.params.id);

    await query.sqlQuery(queryText, req, res, values);
  }
);

module.exports = router;
