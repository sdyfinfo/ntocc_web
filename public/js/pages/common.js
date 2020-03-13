/**
 * Created by Administrator on 2019/2/19.
 */
function sendMessageEdit(type, data){
    var head, request;
    head = msgHeadMake(type);
    switch(type){
        case LOGIN:
            head["token"] = "";
            head["userid"] = data[0];
            request = {
                "passwd":data[1]
            };
            break;
        default :
            request = data;
            break;
    }
    request = {
        "request":request
    };
    request = $.extend({},request,head);
    var oJson = request;
    console.info(oJson);
    return JSON.stringify(oJson);
}

function msgHeadMake(type){
    return {
        "timestamp": getTimeStamp(),
        "token": loginSucc.token || '',
        "userid": loginSucc.userid || '',
        "termid": "",
        "orid": loginSucc.organid || ''
    };
}

function getTimeStamp(){
    var now = new Date(),
        y = now.getFullYear(),
        m = now.getMonth() + 1,
        d = now.getDate();
    return y.toString() + (m < 10 ? "0" + m : m) + (d < 10 ? "0" + d : d) + now.toTimeString().substr(0, 8).replace(/:/g, "");
}

function confirmDialog(tips, func, para){
    bootbox.dialog({
        message: tips,
        title: "提示",
        buttons: {
            success: {
                label: "确定",
                className: "blue",
                callback: function(){
                    func(para)
                }
            },
            danger: {
                label: "取消",
                className: "red"
            }
        }
    });
}

function alertDialog(tips){
    bootbox.dialog({
        message: tips,
        title: "提示",
        buttons: {
            success: {
                label: "确定",
                className: "blue"
            }
        }
    });
}

function sexFormat(sexcode){
    var sex = "女";
    switch (sexcode){
        case "0":
            sex = "男";
            break;
    }
    return sex;
}

function dateTimeFormat(datetime){
    if(datetime == "" || datetime.length < 14) return datetime;
    return datetime.substr(0, 4) + "/" + datetime.substr(4, 2) + "/" +
        datetime.substr(6, 2) + " " + datetime.substr(8, 2) + ":" +
        datetime.substr(10, 2) + ":" + datetime.substr(12, 2);
}


function conferenceDateFormat(dateRange){
    if(dateRange == "" || dateRange.length < 8) return dateRange;
    return dateRange.substr(0, 4) + "/" + dateRange.substr(4, 2) + "/" +
        dateRange.substr(6, 2);
}

function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = year + seperator1 + month + seperator1 + strDate;
    return currentdate;
}

function getNowFormatTime() {
    var date = new Date();
    var seperator1 = ":";
    var hours= date.getHours();
    var minutes = date.getMinutes();
    if (hours >= 1 && hours <= 9) {
        hours = "0" + hours;
    }
    if (minutes >= 0 && minutes <= 9) {
        minutes = "0" + minutes;
    }
    var currentTime = hours + seperator1 + minutes;
    return currentTime;
}

function notifyStatusFormat(status){
    var str;
    switch (status){
        case "0":
            str = "通知中";
            break;
        case "1":
            str = "结束通知";
            break;
        case "2":
            str = "未通知";
            break;
    }
    return str;
}

function notifyTypeFormat(type){
    var str;
    switch (type){
        case "1":
            str = "会议报名通知";
            break;
        case "2":
            str = "会议缴费通知";
            break;
        case "3":
            str = "会议签到通知";
            break;
        case "4":
            str = "会费缴费通知";
            break;
    }
    return str;
}

function selectChilds(datas,row,id,pid,checked,table) {
    for(var i in datas){
        if(datas[i][pid] == row[id]){
            datas[i].check=checked;
            $(table+' tbody').find('tr').eq(i).find('input[type=checkbox]').prop('checked',checked);
            selectChilds(datas,datas[i],id,pid,checked,table);
        }
    }
}

function selectParentChecked(datas,row,id,pid,table){
    for(var i in datas){
        if(datas[i][id] == row[pid]){
            datas[i].check=true;
            $(table+' tbody').find('tr').eq(i).find('input[type=checkbox]').prop('checked',true);
            selectParentChecked(datas,datas[i],id,pid,table);
        }
    }
}

function singleSelect(datas,row,id) {
    for(var i in datas){
        if(datas[i].check == true){
            datas[i].check = false;
        }
        if(datas[i][id] == row[id]){
            datas[i].check=true;
        }
    }

}

function passwordCheck(str){
    if(str.length <= 0) return false;
    var charMode, charCode;
    var mode = 0;
    for(var i=0; i<str.length; i++){
        charCode = str.charCodeAt(i);
        if(charCode >= 48 && charCode <= 57) {    //数字
            charMode = 1;
        }else{    //大写
            charMode = 2;
        }
        mode |= charMode;
    }
    return mode == 3;
}

function tableDataSet(draw, recordsTotal, filter, data, callback){
    var returnData = {};
    returnData.draw = draw;
    returnData.recordsTotal = recordsTotal;
    returnData.recordsFiltered = filter;
    returnData.data = data;
    callback(returnData);
}

function bootstrapTreeTableDataSet(totalcount, data, listname, idname, callback){
    var listNew = [];
    treeGridDataMake(listNew, data, listname, 0, idname);
    var returnData = {
        "total": totalcount,
        "data": listNew         //服务端分页这个字段名为rows，客户端分页这个字段名为data
    };

    callback(returnData);
}

function bootstrapTableDataSet(totalcount, data, callback){
    var returnData = {
        "total": totalcount,
        "data": data         //服务端分页这个字段名为rows，客户端分页这个字段名为data
    };

    callback(returnData);
}

function dateFormat(date, sep){
    //如果日期不存在，或者为空，返回当前日期
    if(date == undefined || date == "" || typeof(date) != "string"){
        //return getNowFormatDate();
        return "";
    }
    date = date.replace(/\//g,'');
    return date.substr(0,4) + sep + date.substr(4, 2) + sep + date.substr(6, 2);
}

function jsonKeyChange(json, oldkey, newkey){
    for (var i = 0; i < json.length; i++) {
        if(!json[i].hasOwnProperty(oldkey)){
            json[i][newkey] = [];
        }else{
            for(var j in json[i]){
                if(j == oldkey){
                    json[i][newkey]=json[i][oldkey];
                    delete json[i][oldkey];
                    var value = json[i][newkey];
                    jsonKeyChange(value, oldkey, newkey);
                }
            }
        }
    }
}

function treeGridDataMake(listNew, list, childrenKey, pid, idKey){
    for(var i=0; i<list.length; i++){
        list[i]["parentid"] = pid;
        list[i]["check"] = '';
        listNew.push(list[i]);
        if(list[i].hasOwnProperty(childrenKey)){
            var children = list[i][childrenKey];
            delete listNew[listNew.length - 1][childrenKey];
            treeGridDataMake(listNew, children, childrenKey, list[i][idKey], idKey)
        }
    }
}

function organNameSelectBuild(organList, id){
    var data = [];
    organListTreeDataMake(organList, data);
    if(id.jstree(true)) {
        id.jstree(true).settings.core.data = data;
        id.jstree(true).refresh();
    }else {
        id.jstree({
            "core": {
                "themes": {
                    "responsive": false
                },
                "data": data
            },

            "types": {
                "default": {
                    "icon": "fa fa-folder icon-state-warning icon-lg"
                },
                "file": {
                    "icon": "fa fa-file icon-state-warning icon-lg"
                }
            },
            "plugins": ["wholerow", "checkbox", "types"],
            "checkbox": {
                "keep_selected_style": false,//是否默认选中
                "three_state": false//父子级别级联选择
            }
        })
    }
}

function organListTreeDataMake(organList, data){
    for(var i=0; i < organList.length; i++){
        var el = {
            text: organList[i].organname,
            id: organList[i].organid,
            "state": {
                "selected": false,
                "opened": true
            }
        };
        if(organList[i].hasOwnProperty("organlist") && organList[i].organlist != ""){
            el.icon = "fa fa-folder icon-state-warning icon-lg";
            el.children = [];
            data.push(el);
            organListTreeDataMake(organList[i].organlist, el.children);
        }else{
            el.icon = "fa fa-file-text-o icon-state-warning icon-lg";
            data.push(el);
        }
    }
}

function clearSelect(id){
    var ref = id.jstree(true);
    try{
        var nodes = ref.get_selected();  //使用get_checked方法
        $.each(nodes, function(i, nd) {
            ref.deselect_node(nd);      //非checkbox函数
        });
        id.jstree(true).refresh();
    }catch(ex){

    }
    id.siblings("input").val("");
}


function clearSelectCheck(id){
    var ref = id.jstree(true);
    try{
        var nodes = ref.get_checked();  //使用get_checked方法
        $.each(nodes, function(i, nd) {
            ref.uncheck_node(nd);      //非checkbox函数

        });
    }catch(ex){

    }
    id.siblings("input").val("");
}

function jsTreeDataClear(id){
    if(id.jstree(true)) {
        id.jstree(true).settings.core.data = [];
        id.jstree(true).refresh();
    }
}

function menuNameSelectBuild(menulist, id, flg){
    var data = [];
    menuListTreeDataMake(menulist, data, flg);
    if(id.jstree(true)) {
        id.jstree(true).settings.core.data = data;
        id.jstree(true).refresh();
    }else{
        id.jstree({
            "core" : {
                "themes" : {
                    "responsive": false
                },
                "data": data
            },

            "types" : {
                "default" : {
                    "icon" : "fa fa-folder icon-state-warning icon-lg"
                },
                "file" : {
                    "icon" : "fa fa-file icon-state-warning icon-lg"
                }
            },
            "plugins": ["wholerow", "types"],
            "checkbox": {
                "keep_selected_style": false,//是否默认选中
                "three_state": false//父子级别级联选择
            }
        });
    }

}

function menuListTreeDataMake(menulist, data, flg){
    for(var i=0; i < menulist.length; i++){
        if(flg && menulist[i].power != 1) continue;
        var el = {
            text: menulist[i].menuname,
            id: menulist[i].menuid,
            "state": {
                "selected": false,
                "opened": true
            }
        };
        if(menulist[i].hasOwnProperty("menulist") && menulist[i].menulist != ""){
            el.icon = "fa fa-folder icon-state-warning icon-lg";
            el.children = [];
            data.push(el);
            menuListTreeDataMake(menulist[i].menulist, el.children,true);
        }else{
            el.icon = "fa fa-file-text-o icon-state-warning icon-lg";
            data.push(el);
        }
    }
}

function menuNameSelectBuild1(menulist, id, flg){
    var data = [];
    menuListTreeDataMake1(menulist, data, flg);
    if(id.jstree(true)) {
        id.jstree(true).settings.core.data = data;
        id.jstree(true).refresh();
    }else{
        id.jstree({
            "core" : {
                "themes" : {
                    "responsive": false
                },
                "data": data
            },

            "types" : {
                "default" : {
                    "icon" : "fa fa-folder icon-state-warning icon-lg"
                },
                "file" : {
                    "icon" : "fa fa-file icon-state-warning icon-lg"
                }
            },
            "plugins": ["wholerow", "types"],
            "checkbox": {
                "keep_selected_style": false,//是否默认选中
                "three_state": false//父子级别级联选择
            }
        });
    }

}

function menuListTreeDataMake1(menulist, data, flg){
    for(var i=0; i < menulist.length; i++){
        var el = {
            text: menulist[i].menuname,
            id: menulist[i].menuid,
            "state": {
                "selected": false,
                "opened": true
            }
        };
        if(menulist[i].hasOwnProperty("menulist") && menulist[i].menulist != ""){
            el.icon = "fa fa-folder icon-state-warning icon-lg";
            el.children = [];
            data.push(el);
            menuListTreeDataMake1(menulist[i].menulist, el.children,true);
        }else{
            el.icon = "fa fa-file-text-o icon-state-warning icon-lg";
            data.push(el);
        }
    }
}


function changeDataPower(data){
    for(var i in data){
        if(data[i]['check'] == true){
            data[i]['power'] = '1';
        }else{
            data[i]['power'] = '0';
        }
    }
}

function fillString(str, pad, length){
    if(str.length >= length) return str;
    var strTemp = str;
    for(var i=0; i<length - strTemp.length; i++){
        str = pad + str;
    }
    return str;
}

function btnDisable(id){
    id.attr("disabled","disabled");
    setTimeout(btnEnable, 3000, id);
}


function btnEnable(id){
    id.removeAttr("disabled");
}

function formatCurrency(num) {
    if(num === "") return num;
    var negative = 0;
    if(Number(num) < 0){
        negative = 1;
        num = Math.abs(Number(num));
    }
    var str = num.toString();
    var point = ".00";
    if(str.indexOf(".") != -1){
        num = str.substr(0, str.indexOf("."));
        point = str.substr(str.indexOf("."));
        point = fillStringAfter(point, "0", 3);
        point = (Number(point).toFixed(2)).toString();
        point = point.substr(point.indexOf("."));
    }
    num = num.toString().replace(/\$|\,/g,'');
    if(isNaN(num))
        num = "0";
    for (var i = 0; i < Math.floor((num.length-(1+i))/3); i++)
        num = num.substring(0,num.length-(4*i+3))+','+
            num.substring(num.length-(4*i+3));
    if(negative == 1) num = "-" + num;
    return num + point;
}
//字符串后补字符
function fillStringAfter(strOrignal,strPad,len){

    var i;
    var strTmp = strOrignal;
    if (strOrignal.length >= len)
        return strTmp;
    for (i=0;i<len-strOrignal.length;i++){
        strTmp += strPad;
    }
    return strTmp;
}

//获取本地时间前一月日期
function getLastMonthDay(date){
    var daysInMonth = new Array([0],[31],[28],[31],[30],[31],[30],[31],[31],[30],[31],[30],[31]);
    var strYear = date.getFullYear();
    var strDay = date.getDate();
    var strMonth = date.getMonth()+1;
    if(strYear%4 == 0 && strYear%100 != 0){
        daysInMonth[2] = 29;
    }
    if(strMonth - 1 == 0)
    {
        strYear -= 1;
        strMonth = 12;
    }
    else
    {
        strMonth -= 1;
    }
    strDay = daysInMonth[strMonth] >= strDay ? strDay : daysInMonth[strMonth];
    if(strMonth<10)
    {
        strMonth="0"+strMonth;
    }
    if(strDay<10)
    {
        strDay="0"+strDay;
    }
    var datastr = strYear.toString()+strMonth.toString()+strDay;
    return datastr;
}

function formatNumber(data){
    var da = formatCurrency(data);
    da = da.split(".");
    return da[0];
}

function pageLengthInit(id){
    var length = $(id.selector + "_length select").val();
    if(!isNaN(length)){
        PageLength = Number(length);
    }
}

function discountNumberChange(data) {
    if(data == "10" || data == "" ){
        return "无折扣";
    }
    if(data == "0"){
        return "0折";
    }
    return data + "折";
}

function discountNumber(data) {
    if(data == "10" || data == "" ){
        return 1;
    }
    return Number(data / 10);
}

//判断按钮权限
function fun_power(){
    var list = ["#op_add","#op_del","#user_inquiry","#password_reset","#role_inquiry","#organ_inquiry",
        "#vehice_inquiry","#vehice_import","#pro_inquiry","#driver_inquiry","#driver_import","#consignor_inquiry","#addr_inquiry",
        "#lin_inquiry","#cons_inquiry","#pay_inquiry","#us_inquiry","#us_import","#inv_inquiry","#bill_inquiry",
        "#bill_import","#bill_submit","#bill_depart","#bill_done","#payment_inquiry","#bill_payment","#invoice_inquiry","#invoice_apply",
        "#choose_apply","#vehiceImg_import","#driverImg_import","#capital_inquiry"];
    for(var i in list){
        if(!makeEdit(menu,loginSucc.functionlist,list[i])){
            $(list[i]).hide();
        }
    }
}


//省市区格式判断
function addressCheck(value){
    var reg = /.+?(省|市|自治区|自治州|县|区|旗)/g;
    var addresslist = value.match(reg);
    if(addresslist == null){
        return false;
    }else{
        return true;
    }

}

//获取时分
function getNowDateTime() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    var hours= date.getHours();
    var minutes = date.getMinutes();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    if (hours >= 1 && hours <= 9) {
        hours = "0" + hours;
    }
    if (minutes >= 0 && minutes <= 9) {
        minutes = "0" + minutes;
    }
    var value = year + month + strDate + hours + minutes;
    return value;
}


//保留小数，不四舍五入
function subStringNum(a,num) {
    var a_type = typeof(a);
    if(a_type == "number"){
        var aStr = a.toString();
        var aArr = aStr.split('.');
    }else if(a_type == "string"){
        var aArr = a.split('.');
    }

    if(aArr.length > 1) {
        a = aArr[0] + "." + aArr[1].substr(0, num);
    }
    return a
}

//千分位
function get_thousand_num(num) {
    return (num || 0).toString().replace(/\d+/, function (n) {
        var len = n.length;
        if (len % 3 === 0) {
            return n.replace(/(\d{3})/g, ',$1').slice(1);
        } else {
            return n.slice(0, len % 3) + n.slice(len % 3).replace(/(\d{3})/g, ',$1');
        }
    });
}
