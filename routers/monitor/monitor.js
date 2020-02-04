/**
 * Created by Administrator on 2019/8/27.
 */
var express = require('express');
var router = express.Router();

router.get('/index',function(req,res,next){
    res.render("monitor/index");
});

module.exports = router;