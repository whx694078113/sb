var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('detail', { title: '使用cookies示例' });
});

module.exports = router;