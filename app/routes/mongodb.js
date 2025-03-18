const express = require("express");
const router = express.Router();
const User = require("../model/user.js");
const Business = require("../model/business.js");
const Review = require("../model/review.js");
const Address = require("../model/address.js");
const ApiKey = require("../model/api_key.js");

// Middleware to check API key
const checkApiKey = async (req, res, next) => {
  const apiKey = req.query.api_key;
  if (!apiKey) {
    return res.status(401).json({ success: false, message: "API key is required" });
  }

  const key = await ApiKey.findOne({ api_key: apiKey });
  if (!key) {
    return res.status(401).json({ success: false, message: "Invalid API key" });
  }

  req.user = key.user_id;
  next();
};

router.get("/", (req, res) => {
  res.json({ success: true, message: "MongoDB API is available" });
});

router.get("/businesses", checkApiKey, (req, res) => {
  Business.find()
    .populate('address_id')
    .then(businesses => {
      res.json({ success: true, data: businesses });
    })
    .catch(err => {
      res.json({ success: false, error: err });
    });
});

router.get("/businesses/search", checkApiKey, (req, res) => {
  const { city, state, postal_code } = req.query;
  let query = {};

  if (city) query['address_id.city'] = city;
  if (state) query['address_id.state'] = state;
  if (postal_code) query['address_id.postal_code'] = postal_code;

  Business.find(query)
    .populate('address_id')
    .then(businesses => {
      res.json({ success: true, data: businesses });
    })
    .catch(err => {
      res.json({ success: false, error: err });
    });
});

router.get("/reviews", checkApiKey, (req, res) => {
  Review.find()
    .then(reviews => {
      res.json({ success: true, data: reviews });
    })
    .catch(err => {
      res.json({ success: false, error: err });
    });
});

router.get("/tips", checkApiKey, (req, res) => {
  const { business_id } = req.query;

  if (!business_id) {
    return res.status(400).json({ success: false, message: "Business ID is required" });
  }

  Tip.find({ business_id })
    .then(tips => {
      res.json({ success: true, data: tips });
    })
    .catch(err => {
      res.json({ success: false, error: err });
    });
});

// Route to generate API key for a user
router.post("/generate-api-key", (req, res) => {
  const { user_id } = req.body;

  const apiKey = new ApiKey({ user_id });
  apiKey
    .save()
    .then(result => {
      res.json({ success: true, data: result });
    })
    .catch(err => {
      res.json({ success: false, error: err });
    });
});

module.exports = router;
