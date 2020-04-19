/**
 * Created by zxm on 2020/4/14.
 */

var billStateList,payStateList,goodsTypeList,unitList,verificationList,dictTrue = [];   //字典
var load_coordinate = [];  //装货地理坐标
var unload_coordinate = []; //卸货地理坐标

if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        $("#loading").modal('show');
        //根据省市区获取经纬度
        loadCoordinateGet();

        //获取字典相关信息
        var data = {};
        var list = ["10005","10006","10009","10010","10011"];
        for(var i in list){
            data.lx = list[i];
            dictQuery(data);
        }
    });
}

//根据装货省市区获取经纬度
function loadCoordinateGet(){
    var load_address = billData.loading_place;   //地方名称
    //var url = 'https://api.map.baidu.com/geocoder/v2/?ak=eIxDStjzbtH0WtU50gqdXYCz&output=json&address=' + encodeURIComponent(load_address);
    var url = "https://restapi.amap.com/v3/geocode/geo?key=f6f68560271048b40b595d960c79b846&s=rsv3&city=35&address=" + encodeURIComponent(load_address);
    $.ajax({
        type: "POST",
        url: url,
        dataType: "JSONP",
        async: false,
        success: function(data) {
            console.info("loadCoordinate:" + JSON.stringify(data));
            if(parseInt(data.status) == 1) {
                var content = data.geocodes[0].location.split(',');
                load_coordinate.push(content[0]);//data.result.location.lng 经度
                load_coordinate.push(content[1]);//data.result.location.lat 纬度
                //获取卸货地坐标
                unloadCoordinateGet();
            }
        },
        error:function(){
            console.info("loadCoordinaterror");
            //获取卸货地坐标
            unloadCoordinateGet();
            alertDialog("装货地坐标获取失败！");
        }
    });
}

//根据卸货省市区获取经纬度
function unloadCoordinateGet(){
    var unload_address = billData.unloading_place;   //地方名称
    //var url = 'https://api.map.baidu.com/geocoder/v2/?ak=eIxDStjzbtH0WtU50gqdXYCz&output=json&address=' + encodeURIComponent(unload_address);
    var url = "https://restapi.amap.com/v3/geocode/geo?key=f6f68560271048b40b595d960c79b846&s=rsv3&city=35&address=" + encodeURIComponent(unload_address);
    $.ajax({
        type: "POST",
        url: url,
        dataType: "JSONP",
        async: false,
        success: function(data) {
            console.info("unloadCoordinate:" + JSON.stringify(data));
            if(parseInt(data.status) == 1) {
                var content = data.geocodes[0].location.split(',');
                unload_coordinate.push(content[0]);//data.result.location.lng 经度
                unload_coordinate.push(content[1]);//data.result.location.lat 纬度
                getTrajectory();
            }
        },
        error:function(){
            console.info("unloadCoordinateError");
            getTrajectory();
            alertDialog("卸货地坐标获取失败！");
        }
    });
}

//获取车辆轨迹
function getTrajectory(){
    var data = {
        "plate_number":billData.plate_number,
        "wabill_numbers":billData.wabill_numbers};
    vehiceTrajectoryDataGet(data);
}

//车辆轨迹查询返回结果
function vehiceTrajectoryDataEnd(flg,result){
    App.unblockUI('#lay-out');
    $("#loading").modal('hide');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            var lineList = [];
            for(var i in res.list){
                var list = [(res.list[i].lon)/600000,(res.list[i].lat)/600000];
                lineList.push(list);
            }
            mapDisplay(lineList);
        }else{
            alertDialog(result.retmsg);
        }
    }else{
        alertDialog("车辆轨迹信息获取失败！");
    }
}


//显示运单基本数据
function wayBillDataDisplay(){
    //用form表单赋值
    var exclude = [];
    var options = { jsonValue: billData, exclude:exclude,isDebug: false};
    $(".billdata-form").initForm(options);
    //显示个别信息
    $("input[name=number]").val(billData.number+"吨");
    //显示货物类型
    for(var i in goodsTypeList){
        if(billData.goods_type == goodsTypeList[i].code){
            $("input[name=goods_type]").val(goodsTypeList[i].value);
        }
    }
    //显示运单状态
    for(var i in billStateList){
        if(billData.state == billStateList[i].code){
            $("input[name=state]").val(billStateList[i].value);
        }
    }
    //显示支付状态
    for(var i in payStateList){
        if(billData.payment_status == payStateList[i].code){
            $("input[name=payment_status]").val(payStateList[i].value);
        }
    }
    //格式化运费
    if(billData.freight != ""){
        $("input[name=freight]").val(formatCurrency(billData.freight));
    }
}

//显示地图
function mapDisplay(data){

    //以发货地做中心点进行缩放
    var map = new AMap.Map('container',{
        resizeEnable:true,
        center:load_coordinate,
        zoom: 10
    });
    //清除障碍物
    map.clearMap();
    var marker;

    //给装货地、卸货地标记
    var linelist = [load_coordinate,unload_coordinate];

    for(var i in linelist){
        var position = linelist[i];
        marker = new AMap.Marker({
            content:contentDisplay(billData,i),
            position:position,
            zIndex:101,
            map:map
        });

        marker.setMap(map);  //在地图上添加点
    }

    //标注实际开始地点和实际结束地点(取轨迹第一条和轨迹最后一条)
    var line_actually = [data[0],data[data.length-1]];
    for(var i in line_actually){
        var position = line_actually[i];
        marker = new AMap.Marker({
            content:contentActually(i),
            position:position,
            zIndex:101,
            map:map
        });

        marker.setMap(map);  //在地图上添加点
    }

    //线路
    var lineArr = data;    //画路线

    //箭头
    var canvasDir = document.createElement('canvas');
    var width = 24;
    canvasDir.width = width;
    canvasDir.height = width;
    var context = canvasDir.getContext('2d');
    context.strokeStyle = 'red';
    context.lineJoin = 'round';
    context.lineWidth = 8;
    context.moveTo(-4, width - 4);
    context.lineTo(width / 2, 6);
    context.lineTo(width + 4, width - 4);
    context.stroke();

    return new AMap.Polyline({
        map:map,
        path:lineArr,
        showDir:true,
        dirImg:canvasDir,
        strokeColor: "blue",//线颜色
        strokeOpacity: 1,//线透明度
        strokeWeight: 10,//线宽
        strokeStyle: "solid"//线样式


    });//起始知点的经纬度道
}

//实际地点标注
function contentActually(num){
    var content = '';
    switch (num){
        case "0": //起始点
            content = '<div>' +
                '<div style="float: left"><img style="width: 30px;height:30px;" src="/public/img/start_icon.png"></div>' +
                '<div style="width:100px;float: left;background-color: #FFFFFF;font-size: 16px;color:red ">实际开始地点</div>' +
                '</div>';
            break;
        case "1": //结束点
            content = '<div>' +
                '<div style="float: left"><img style="width: 30px;height:30px;" src="/public/img/end_icon.png"></div>' +
                '<div style="width:100px;float: left;background-color: #FFFFFF;font-size: 16px;color: red">实际结束地点</div>' +
                '</div>';
            break;
    }
    return content;
}

//地图标注显示
function contentDisplay(data,num){
    var content = '';
    switch (num){
        case "0": //起始点
            content = '<div>' +
                '<div style="float: left"><img style="width: 30px;height:30px;" src="/public/img/start_icon.png"></div>' +
                '<div style="width:200px;float: left;background-color: #FFFFFF">装货地：'+billData.loading_place+'<br>发车时间：'+dateTimeFormat(billData.loading_time)+'</div>' +
                '</div>';
            break;
        case "1": //结束点
            content = '<div>' +
                '<div style="float: left"><img style="width: 30px;height:30px;" src="/public/img/end_icon.png"></div>' +
                '<div style="width:200px;float: left;background-color: #FFFFFF;">卸货地：'+billData.unloading_place+'<br>卸货时间：'+dateTimeFormat(billData.disburden_time)+'</div>' +
                '</div>';
            break;
    }
    return content;
}

//获取字典信息返回
function getDictDataEnd(flg,result){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            var dictlist = res.dictlist;
            //给准驾车型赋值
            dictTrue.push("1");
            for(var i = 0;i<dictlist.length;i++){
                switch (dictlist[i].lx){
                    case "10005":
                        goodsTypeList = dictlist;
                        break;
                    case "10006":
                        unitList = dictlist;
                        break;
                    case "10009":
                        payStateList = dictlist;
                        break;
                    case "10010":
                        billStateList = dictlist;
                        break;
                    case "10011":
                        verificationList = dictlist;
                        break;
                }
            }
            billDataDisplay();
        }else{
            dictTrue.push("0");
            billDataDisplay();
        }
    }else{
        dictTrue.push("0");
        billDataDisplay();
    }
}


//判断是否可以请求运单信息
function billDataDisplay(){
    if(dictTrue.length ==  5){
        //显示运单基本数据
        wayBillDataDisplay();
    }
}