//二维码扫描
var request = require('request');
var express = require('express');
var router = express.Router();
var log4js = require("./../../log");
const logger = log4js.logger('http');

router.get('/',function(req,res,next){
    try{
        var countycode = req.query.countycode;
        var spid = req.query.spid;
        var url = "http://172.18.1.102:8003/ywt/ywt-dzsbk/web/front/qrcode?spid=" + spid + "&countycode=" +  countycode;
        //var url = "http://172.18.1.102:8002/ywt_yf/web/front/qrcode?spid=" + spid + "&countycode=" +  countycode;
        logger.info(url);
        var userAgent = req.headers["user-agent"];
        //支付宝
        if(userAgent != null && userAgent != undefined && userAgent.indexOf("AlipayClient") !== -1){
            request(url, function (error, response, body) {
                logger.info(error);
                if (!error && response.statusCode == 200) {
                    res.send(body);
                }
            })
        }else{
            res.render("scan/error", {result:"请使用支付宝扫描"});
        }
    }catch (e) {
        console.info("二维码扫描：" + e);
        res.render("scan/error", {result:"请联系开发人员"});
    }
});

module.exports = router;