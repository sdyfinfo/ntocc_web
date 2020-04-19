/**
 * Created by Administrator on 2019/2/18.
 */
var express = require('express');
var router = express.Router();


router.get('/',function(req,res,next){
    console.info(req.url);
    res.render('login');
});

router.get('/index',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    res.render('index', {
        menu: 'index',
        loginsucc: req.session["ywtLogin" + uname]
    });
});

router.post('/main',function(req,res,next){
    var uname = req.body.username;
    req.session["ywtUname" + uname] = uname;
    req.session["ywtLogin" + uname] = req.body.loginsucc;
    //req.session["ywtUname" + uname] = req.body.username; // 登录成功，设置 session
    //req.session["ywtLogin" + uname] = req.body.loginsucc; // 登录成功，设置 session
    res.render('main', {
        menu: 'main',
        loginsucc: req.session["ywtLogin" + uname]
    });
});

router.get('/logout',function(req,res){
    var uname = req.query.username;
    req.session["ywtUname" + uname] = "";
    req.session["ywtLogin" + uname] = "";
    //req.session.destroy();
    res.redirect('/');
});


router.get('/main',function(req,res,next){
   console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]) {  //判断session 状态，如果有效，则返回主页，否则转到登录页面
        res.render('main', {
            menu: req.url.substr(1),
            loginsucc: req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});

router.get('/user',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    console.info("usersession" + JSON.stringify(req.session));
    if(req.session["ywtUname" + uname]) {  //判断session 状态，如果有效，则返回主页，否则转到登录页面
        res.render('user/user', {
            menu: req.url.substr(1),
            loginsucc: req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});


router.get('/userpower',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]) {  //判断session 状态，如果有效，则返回主页，否则转到登录页面
        res.render('power/userpower', {
            menu: req.url.substr(1),
            loginsucc: req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});


router.get('/rolepower',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]) {  //判断session 状态，如果有效，则返回主页，否则转到登录页面
        res.render('power/rolepower', {
            menu: req.url.substr(1),
            loginsucc: req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});



router.get('/role',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]) {  //判断session 状态，如果有效，则返回主页，否则转到登录页面
        res.render('user/role', {
            menu: req.url.substr(1),
            loginsucc: req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});

router.get('/password',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]) {  //判断session 状态，如果有效，则返回主页，否则转到登录页面
        res.render('user/password', {
            menu: req.url.substr(1),
            loginsucc: req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});

router.get('/organ',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]) {  //判断session 状态，如果有效，则返回主页，否则转到登录页面
        res.render('organ/organ', {
            menu: req.url.substr(1),
            loginsucc: req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});

//项目管理
router.get('/project',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]) {  //判断session 状态，如果有效，则返回主页，否则转到登录页面
        res.render('basicData/project', {
            menu: req.url.substr(1),
            loginsucc: req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});

//线路管理
router.get('/line',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]) {  //判断session 状态，如果有效，则返回主页，否则转到登录页面
        res.render('basicData/line', {
            menu: req.url.substr(1),
            loginsucc: req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});

//车辆管理
router.get('/vehice',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]) {  //判断session 状态，如果有效，则返回主页，否则转到登录页面
        res.render('basicData/vehice', {
            menu: req.url.substr(1),
            loginsucc: req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});

//车辆模板下载
var fs = require('fs');
var path = require('path');
router.get('/downloadvehicefile', function (req, res, next) {
    var filename = '车辆模板.xlsx';
    var filepath = path.join(__dirname, '../upload/' + filename);
    var stats = fs.statSync(filepath);
    if (stats.isFile()) {
        res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'attachment; filename=' + encodeURIComponent(filename),
            "Content-Length": stats.size
        });
        fs.createReadStream(filepath).pipe(res);
    } else {
        res.end(404);
    }
});

//司机模板下载
var fs = require('fs');
var path = require('path');
router.get('/downloaddriverfile', function (req, res, next) {
    var filename = '司机模板.xlsx';
    var filepath = path.join(__dirname, '../upload/' + filename);
    var stats = fs.statSync(filepath);
    if (stats.isFile()) {
        res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'attachment; filename=' + encodeURIComponent(filename),
            "Content-Length": stats.size
        });
        fs.createReadStream(filepath).pipe(res);
    } else {
        res.end(404);
    }
});

//司机管理
router.get('/driver',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]) {  //判断session 状态，如果有效，则返回主页，否则转到登录页面
        res.render('basicData/driver', {
            menu: req.url.substr(1),
            loginsucc: req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});

//发货人管理
router.get('/consignor',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]) {  //判断session 状态，如果有效，则返回主页，否则转到登录页面
        res.render('basicData/consignor', {
            menu: req.url.substr(1),
            loginsucc: req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});

//运单管理
router.get('/waybill',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]) {  //判断session 状态，如果有效，则返回主页，否则转到登录页面
        res.render('waybill/waybill', {
            menu: req.url.substr(1),
            loginsucc: req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});

//运单支付
router.get('/billpayment',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]) {  //判断session 状态，如果有效，则返回主页，否则转到登录页面
        res.render('shield/billpayment', {
            menu: req.url.substr(1),
            loginsucc: req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});

//申请开票
router.get('/invoiceapply',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]) {  //判断session 状态，如果有效，则返回主页，否则转到登录页面
        res.render('invoice/invoiceapply', {
            menu: req.url.substr(1),
            loginsucc: req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});

router.get('/feature',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]) {  //判断session 状态，如果有效，则返回主页，否则转到登录页面
        res.render('service/feature', {
            menu: req.url.substr(1),
            loginsucc: req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});

router.get('/release',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]) {  //判断session 状态，如果有效，则返回主页，否则转到登录页面
        res.render('article/release', {
            menu: req.url.substr(1),
            loginsucc: req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});


//地址管理
router.get('/address',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]) {  //判断session 状态，如果有效，则返回主页，否则转到登录页面
        res.render('basicData/address', {
            menu: req.url.substr(1),
            loginsucc: req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});

//收货人信息
router.get('/consignee',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]) {  //判断session 状态，如果有效，则返回主页，否则转到登录页面
        res.render('basicData/consignee', {
            menu: req.url.substr(1),
            loginsucc: req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});


//收款人信息
router.get('/payee',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    var payname = req.query.payname || "";
    var banknumber = req.query.banknumber || "";
    if(req.session["ywtUname" + uname]) {  //判断session 状态，如果有效，则返回主页，否则转到登录页面
        res.render('basicData/payee', {
            menu: req.url.substr(1),
            loginsucc: req.session["ywtLogin" + uname],
            payname:payname,
            banknumber:decodeURI(banknumber)
        });
    }else{
        res.redirect('/');
    }
});

//发票抬头信息
router.get('/invoicerise',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]) {  //判断session 状态，如果有效，则返回主页，否则转到登录页面
        res.render('basicData/invoicerise', {
            menu: req.url.substr(1),
            loginsucc: req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});

//收款人模板下载
var fs = require('fs');
var path = require('path');
router.get('/downloadpayeefile', function (req, res, next) {
    var filename = '收款人模板.xlsx';
    var filepath = path.join(__dirname, '../upload/' + filename);
    var stats = fs.statSync(filepath);
    if (stats.isFile()) {
        res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'attachment; filename=' + encodeURIComponent(filename),
            "Content-Length": stats.size
        });
        fs.createReadStream(filepath).pipe(res);
    } else {
        res.end(404);
    }
});

//U盾管理
router.get('/ushield',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]) {  //判断session 状态，如果有效，则返回主页，否则转到登录页面
        res.render('shield/ushield', {
            menu: req.url.substr(1),
            loginsucc: req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});

//U盾模板下载
var fs = require('fs');
var path = require('path');
router.get('/downloadushieldfile', function (req, res, next) {
    var filename = 'U盾模板.txt';
    var filepath = path.join(__dirname, '../upload/' + filename);
    var stats = fs.statSync(filepath);
    if (stats.isFile()) {
        res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'attachment; filename=' + encodeURIComponent(filename),
            "Content-Length": stats.size
        });
        fs.createReadStream(filepath).pipe(res);
    } else {
        res.end(404);
    }
});

//我的U盾
router.get('/mshield',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]) {  //判断session 状态，如果有效，则返回主页，否则转到登录页面
        res.render('shield/mshield', {
            menu: req.url.substr(1),
            loginsucc: req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});

//派单模板下载
var fs = require('fs');
var path = require('path');
router.get('/downloadbillfile', function (req, res, next) {
    var filename = "派单模板.xlsx";
    var filepath = path.join(__dirname, '../upload/' + filename);
    var stats = fs.statSync(filepath);
    if (stats.isFile()) {
        res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'attachment; filename=' + encodeURIComponent(filename),
            "Content-Length": stats.size
        });
        fs.createReadStream(filepath).pipe(res);
    } else {
        res.end(404);
    }
});

//开票审核
router.get('/invoicetrial',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]) {  //判断session 状态，如果有效，则返回主页，否则转到登录页面
        res.render('invoice/invoicetrial', {
            menu: req.url.substr(1),
            loginsucc: req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});

//开票审核
router.get('/invoicehistory',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]) {  //判断session 状态，如果有效，则返回主页，否则转到登录页面
        res.render('invoice/invoicehistory', {
            menu: req.url.substr(1),
            loginsucc: req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});

//资金明细查询
router.get('/capitaldetails',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]) {  //判断session 状态，如果有效，则返回主页，否则转到登录页面
        res.render('finance/capitaldetails', {
            menu: req.url.substr(1),
            loginsucc: req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});

//账单下载
router.get('/billDownload',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]) {  //判断session 状态，如果有效，则返回主页，否则转到登录页面
        res.render('finance/billDownload', {
            menu: req.url.substr(1),
            loginsucc: req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});

//发货联系人模板下载
var fs = require('fs');
var path = require('path');
router.get('/downloadconsignorfile', function (req, res, next) {
    var filename = "发货联系人模板.xlsx";
    var filepath = path.join(__dirname, '../upload/' + filename);
    var stats = fs.statSync(filepath);
    if (stats.isFile()) {
        res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'attachment; filename=' + encodeURIComponent(filename),
            "Content-Length": stats.size
        });
        fs.createReadStream(filepath).pipe(res);
    } else {
        res.end(404);
    }
});

//收货联系人模板下载
var fs = require('fs');
var path = require('path');
router.get('/downloadgneefile', function (req, res, next) {
    var filename = "收货联系人模板.xlsx";
    var filepath = path.join(__dirname, '../upload/' + filename);
    var stats = fs.statSync(filepath);
    if (stats.isFile()) {
        res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'attachment; filename=' + encodeURIComponent(filename),
            "Content-Length": stats.size
        });
        fs.createReadStream(filepath).pipe(res);
    } else {
        res.end(404);
//车辆轨迹显示
router.post('/vehiceTrajectory',function(req,res,next){
    var uname = req.body.username;
    var billdata = req.body.billdata;
    if(req.session["ywtUname" + uname]) {  //判断session 状态，如果有效，则返回主页，否则转到登录页面
        res.render('waybill/vehiceTrajectory', {
            menu: req.url.substr(1),
            loginsucc: req.session["ywtLogin" + uname],
            billdata:billdata
        });
    }else{
        res.redirect('/');
    }
});
    }
});

router.get('/template',function(req,res,next){
    console.info(req.url);
    var artid = req.query.artid || '';
    var adid = req.query.adid || '';
    var servid = req.query.servid || '';
    var abroadid = req.query.abroadid || '';
    var newbornid = req.query.newbornid || '';
    var manmadeid = req.query.manmadeid || '';
    res.render('article/template', {
        artid: artid,
        adid: adid,
        servid: servid,
        abroadid: abroadid,
        newbornid: newbornid,
        manmadeid: manmadeid
    });
});


router.get('/artlist',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]) {  //判断session 状态，如果有效，则返回主页，否则转到登录页面
        res.render('article/artlist', {
            menu: req.url.substr(1),
            loginsucc: req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});

router.get('/menu',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]) {  //判断session 状态，如果有效，则返回主页，否则转到登录页面
        res.render('power/menu', {
            menu: req.url.substr(1),
            loginsucc: req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});

//评价管理
router.get('/coupon',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]){   ////判断session 状态，如果有效，则返回主页，否则转到登录页面
        res.render('service/coupon',{
            menu: req.url.substr(1),
            loginsucc: req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});

//用户评价查询
router.get('/price',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]){
        res.render('service/price',{
            menu: req.url.substr(1),
            loginsucc:req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});

//用户管理（个人信息）
router.get('/updateuser',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]){
        res.render('user/updateuser',{
            menu:req.url.substr(1),
            loginsucc:req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});

//turnitin国际版参数
router.get('/turnitin',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]){
        res.render('param/turnitin',{
            menu:req.url.substr(1),
            loginsucc:req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});

//turnitinUK版参数
router.get('/turnitinuk',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]){
        res.render('param/turnitinuk',{
            menu:req.url.substr(1),
            loginsucc:req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});

// grammarian参数管理
router.get('/grammarian',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]){
        res.render('param/grammarian',{
            menu:req.url.substr(1),
            loginsucc:req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});


// 广告管理
router.get('/adv',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]){
        res.render('service/advertisement',{
            menu:req.url.substr(1),
            loginsucc:req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});

// 海外招募
router.get('/abroad',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]){
        res.render('service/abroad',{
            menu:req.url.substr(1),
            loginsucc:req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});

// 新人专区
router.get('/newborn',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]){
        res.render('service/newborn',{
            menu:req.url.substr(1),
            loginsucc:req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});

// 查重参数
router.get('/tprice',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]){
        res.render('param/tprice',{
            menu:req.url.substr(1),
            loginsucc:req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});

// 语法检测参数
router.get('/gprice',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]){
        res.render('param/gprice',{
            menu:req.url.substr(1),
            loginsucc:req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});

// 人工服务参数
router.get('/manmade',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]){
        res.render('service/manmade',{
            menu:req.url.substr(1),
            loginsucc:req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});

// 订单查询
router.get('/order',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]){
        res.render('report/order',{
            menu:req.url.substr(1),
            loginsucc:req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});

// 交易流水查询
router.get('/jyls',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]){
        res.render('report/jyls',{
            menu:req.url.substr(1),
            loginsucc:req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});

// 微信用户查询
router.get('/wxuser',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]){
        res.render('report/wxuser',{
            menu:req.url.substr(1),
            loginsucc:req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});


// 投诉建议查询
router.get('/suggest',function(req,res,next){
    console.info(req.url);
    var uname = req.query.username;
    if(req.session["ywtUname" + uname]){
        res.render('report/suggest',{
            menu:req.url.substr(1),
            loginsucc:req.session["ywtLogin" + uname]
        });
    }else{
        res.redirect('/');
    }
});

module.exports = router;