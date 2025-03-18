const express = require("express");
const router = express.Router();
const config = require("config");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const pool = new Pool(config.get("postgresql"));

// Middleware to check API key
const checkApiKey = async (req, res, next) => {
  const apiKey = req.query.api_key;
  if (!apiKey) {
    return res.status(401).json({ success: false, message: "API key is required" });
  }

  const client = await pool.connect();
  try {
    const result = await client.query("SELECT * FROM api_keys WHERE api_key = $1", [apiKey]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid API key" });
    }

    req.user = result.rows[0].user_id;
    next();
  } finally {
    client.release();
  }
};

router.get("/", (req, res) => {
  res.json({ success: false, message: "PostgreSQL API is available" });
});

router.get("/businesses", checkApiKey, (req, res) => {
  pool.connect().then(client => {
    return client
      .query("SELECT * FROM businesses")
      .then(result => {
        client.release();
        res.json({ success: true, data: result.rows });
      })
      .catch(err => {
        client.release();
        res.json({ success: false, error: err.stack });
      });
  });
});

router.get("/businesses/search", checkApiKey, (req, res) => {
  const { city, state, postal_code } = req.query;
  let query = "SELECT * FROM businesses WHERE 1=1";
  let params = [];

  if (city) {
    query += " AND city = $1";
    params.push(city);
  }
  if (state) {
    query += " AND state = $2";
    params.push(state);
  }
  if (postal_code) {
    query += " AND postal_code = $3";
    params.push(postal_code);
  }

  pool.connect().then(client => {
    return client
      .query(query, params)
      .then(result => {
        client.release();
        res.json({ success: true, data: result.rows });
      })
      .catch(err => {
        client.release();
        res.json({ success: false, error: err.stack });
      });
  });
});

router.get("/reviews", checkApiKey, (req, res) => {
  pool.connect().then(client => {
    return client
      .query("SELECT * FROM reviews")
      .then(result => {
        client.release();
        res.json({ success: true, data: result.rows });
      })
      .catch(err => {
        client.release();
        res.json({ success: false, error: err.stack });
      });
  });
});

router.get("/tips", checkApiKey, (req, res) => {
  const { business_id } = req.query;

  if (!business_id) {
    return res.status(400).json({ success: false, message: "Business ID is required" });
  }

  pool.connect().then(client => {
    return client
      .query("SELECT * FROM tips WHERE business_id = $1", [business_id])
      .then(result => {
        client.release();
        res.json({ success: true, data: result.rows });
      })
      .catch(err => {
        client.release();
        res.json({ success: false, error: err.stack });
      });
  });
});

// Route to generate API key for a user
router.post("/generate-api-key", (req, res) => {
  const { user_id } = req.body;
  const apiKey = uuidv4();

  pool.connect().then(client => {
    return client
      .query("INSERT INTO api_keys (user_id, api_key, expires_at) VALUES ($1, $2, NOW() + INTERVAL '30 days') RETURNING *", [user_id, apiKey])
      .then(result => {
        client.release();
        res.json({ success: true, data: result.rows[0] });
      })
      .catch(err => {
        client.release();
        res.json({ success: false, error: err.stack });
      });
  });
});

module.exports = router;
