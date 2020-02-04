/**
 * Created by Administrator on 2019/6/18.
 */
var express = require('express');
var UUID = require('uuid');
var router = express.Router();
//用于处理文件上传
var multer = require('multer');
var fs = require('fs');

//设置文件路径
var createFolder = function(folder){
    try{
        fs.accessSync(folder);
    }catch(e){
        fs.mkdirSync(folder);
    }
};

var uploadFolder = './public/upload/';
createFolder(uploadFolder);

//设置保存规则
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadFolder)
    },
    filename: function (req, file, cb) {
        console.info("filename:" + JSON.stringify(file));
        var originalname = file.originalname;
        cb(null, originalname.substr(0, originalname.lastIndexOf("."))  + '-' + getDateTime() + originalname.substr(originalname.lastIndexOf(".")));
    }
});

//设置过滤规则
var imageFilter = function(req, file, cb){
    var acceptableMime = ['image/jpeg', 'image/png', 'image/jpg', 'image/bmp'];
    if(acceptableMime.indexOf(file.mimetype) !== -1){
        cb(null, true)
    }else{
        cb(null, false);
        cb(new Error('文件类型错误'));
    }
};


var imageUploader  =  multer({
    storage: storage,
    fileFilter: imageFilter,
    limits:{
        fileSize: 2000000
    }
});

var upload = imageUploader.single('photo');

router.post('/image',  function(req, res, next) {
    //var url = 'http://' + req.headers.host  + req.file.destination.substr(1) + '/' + req.file.filename;
    var result;
    upload(req, res, function (err) {
        if (err) {
            result = {
                ret : false,
                msg: "文件上传失败！" + err
            };
            res.send(result);
            return
        }
        console.info("post" + req.file);
        result = {
            ret : true,
            msg: "文件上传成功！",
            url: req.file.destination.substr(1) + req.file.filename
        };
        res.send(result);
    });
});

router.post('/delete', function(req, res, next){
    var filename = req.body.filename;
    console.info("filename" + filename);
    fs.unlinkSync(uploadFolder + filename);
});


//多文件上传
//设置文件路径
var getDateTime = function(){
    var now = new Date(),
        y = now.getFullYear(),
        m = now.getMonth() + 1,
        d = now.getDate();
    return y.toString() + (m < 10 ? "0" + m : m) + (d < 10 ? "0" + d : d) + now.toTimeString().substr(0, 8).replace(/:/g, "");
};

//设置过滤规则
var imageFilterExcel = function(req, file, cb){
    var acceptableMime = ['image/jpeg', 'image/png', 'image/jpg', 'image/bmp'];
    if(acceptableMime.indexOf(file.mimetype) !== -1){
        cb(null, true)
    }else{
        cb(null, false);
        cb(new Error('文件类型错误'));
    }
};

//设置保存规则
var storageCardImage = multer.diskStorage({
    destination: function (req, file, cb) {
        var carduploadFolder = './public/upload/' + getDateTime();
        createFolder(carduploadFolder);
        cb(null, carduploadFolder)
    },
    filename: function (req, file, cb) {
        console.info("file:" + file);
        console.info(req.body);
        cb(null, file.originalname);
    }
});

var cardImageUploader  =  multer({
    storage: storageCardImage,
    fileFilter: imageFilterExcel
});

var cardImage = cardImageUploader.array('cardimg');

router.post('/cardimage',  function(req, res, next) {
    //var url = 'http://' + req.headers.host  + req.file.destination.substr(1) + '/' + req.file.filename;
    var result;
    cardImage(req, res, function (err) {
        if (err) {
            result = {
                ret : false,
                msg: "文件上传失败！" + err
            };
            res.send(result);
            return
        }
        console.info(req.files);
        if(req.files.length === 0){
            result = {
                ret : false,
                msg: "没有文件被上传！" + err
            };
            res.send(result);
            return
        }
        result = {
            ret : true,
            msg: "文件上传成功！",
            url: req.files[0].destination.substr(1)
        };
        res.send(result);
    });
});

module.exports = router;