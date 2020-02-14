/**
 * Created by haiyang on 2020/2/13.
 */

var billStateList,payStateList,dictTrue = [];   //字典
var projectList,driverList,consignorList = [];
var wayBillList = [];

if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        //fun_power();
        //时间控件初始化
        ComponentsDateTimePickers.init();
        //获取项目信息
        projectDataGet();
        //运单操作和查看
        //WayBillEdit.init();
    });
}

//时间控件初始化
var ComponentsDateTimePickers = function () {

    var handleDatePickers = function () {

        if (jQuery().datepicker) {
            $('.date-picker').datepicker({
                rtl: App.isRTL(),
                orientation: "auto",
                autoclose: true,
                language:"zh-CN",
                todayBtn:true,
                format:"yyyy-mm-dd",
                //showButtonPanel:true,
                todayHighlight: true
            });
            var date = getNowFormatDate();
            $("input[name='orderMaking_time']").datepicker("setDate",date);
        }
    };

    return {
        //main function to initiate the module
        init: function () {
            handleDatePickers();
        }
    };
}();

//运单表格
var WayBillTable = function () {
    var initTable = function () {
        var table = $('#bill_table');
        pageLengthInit(table);
        table.dataTable({
            "language": TableLanguage,
            "bStateSave": false,
            "lengthMenu": TableLengthMenu,
            "destroy": true,
            "pageLength": PageLength,
            //"pagingType": "numbers",
            "serverSide": true,
            "processing": true,
            "searching": false,
            "ordering": false,
            "bAutoWidth": false,
            "ajax":function (data, callback, settings) {
                var formData = $(".inquiry-form").getFormData();
                var start_subtime,end_subtime,loading_start_subtime,loading_end_subtime = "";
                if(formData.start_subtime != ""){
                    start_subtime = formData.start_subtime.replace(/(\/)/g,'')+"000000";
                }
                if(formData.end_subtime != ""){
                    end_subtime = formData.end_subtime.replace(/(\/)/g,'')+"000000";
                }
                if(formData.loading_start_subtime != ""){
                    loading_start_subtime = formData.loading_start_subtime.replace(/(\/)/g,'')+"000000";
                }
                if(formData.loading_end_subtime != ""){
                    loading_end_subtime = formData.loading_end_subtime.replace(/(\/)/g,'')+"000000";
                }
                var da = {
                    start_subtime:start_subtime,
                    end_subtime:end_subtime,
                    loading_start_subtime:loading_start_subtime,
                    loading_end_subtime:loading_end_subtime,
                    project_id:formData.project_id,
                    lid:formData.lid,
                    consignor:formData.consignor,
                    platenumber:formData.platenumber,
                    driver_name:formData.driver_name,
                    state:formData.state,
                    currentpage: (data.start / data.length) + 1,
                    pagesize: data.length == -1 ? "": data.length,
                    startindex: data.start,
                    draw: data.draw
                };
                billDataGet(da, callback);
            },
            columns: [//返回的json数据在这里填充，注意一定要与上面的<th>数量对应，否则排版出现扭曲
                { "data": null},
                { "data": null},
                { "data": "wid",visible: false },
                { "data": "wid"},     //项目
                { "data": "wid" },    //线路
                { "data": "wid" },    //运单描述
                { "data": "wid" },    //司机
                { "data": "wid"},     //车牌号
                { "data": "planTime"},
                { "data": "loading_time"},
                { "data": "disburden_time"},
                { "data": "freight"},
                { "data": "addTime"},
                { "data": "state"},
                { "data": "paystate"},
                { "data": null}
            ],
            columnDefs: [
                {
                    "targets": [0],
                    "data": null,
                    "render": function (data, type, row, meta) {
                        return meta.settings._iDisplayStart + meta.row + 1;  //行号
                    }
                },
                {
                    "targets": [1],
                    "render": function (data, type, row, meta) {
                        return '<input type="checkbox" class="checkboxes" value="1" />';
                    }
                },
                {
                    "targets": [3],
                    "render": function (data, type, row, meta) {
                        //显示项目名称
                        return projectDisplay(data);
                    }
                },
                {
                    "targets": [4],
                    "render": function (data, type, row, meta) {
                        //显示线路名称
                        return lineDisplay(data);
                    }
                },
                {
                    "targets": [5],
                    "render": function (data, type, row, meta) {
                        //显示运单号，发货到卸货地址
                        return wayBillDisplay(data);
                    }
                },
                {
                    "targets": [6],
                    "render": function (data, type, row, meta) {
                        //显示司机
                        return driverDisplay(data);
                    }
                },
                {
                    "targets": [7],
                    "render": function (data, type, row, meta) {
                        //显示车牌号
                        return plateNumDisplay(data);
                    }
                },
                {
                    "targets": [8],
                    "render": function (data, type, row, meta) {
                        return conferenceDateFormat(data);
                    }
                },{
                    "targets": [9],
                    "render": function (data, type, row, meta) {
                        return dateTimeFormat(data);
                    }
                },{
                    "targets": [10],
                    "render": function (data, type, row, meta) {
                        return dateTimeFormat(data);
                    }
                },
                {
                    "targets": [12],
                    "render": function (data, type, row, meta) {
                        return dateTimeFormat(data);
                    }
                },{
                    "targets": [13],
                    "render": function (data, type, row, meta) {
                        //运单状态
                    }
                },
                {
                    "targets": [14],
                    "render": function (data, type, row, meta) {
                        //支付状态
                    }
                },{
                    "targets": [15],
                    "render": function (data, type, row, meta) {
                        var edit = '';
                        if(!window.parent.makeEdit(menu,loginSucc.functionlist,"#op_edit")){
                            edit = '-';
                        }else{
                            edit = '<a href="javascript:;" id="op_edit">编辑</a>';
                        }
                        return edit;
                    }
                }
            ],
            fnRowCallback: function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
                $('td:eq(0),td:eq(1),td:eq(11),td:eq(15)', nRow).attr('style', 'text-align: center;');
            }
        });
        //table.draw( false );
        table.find('.group-checkable').change(function () {
            var set = jQuery(this).attr("data-set");
            var checked = jQuery(this).is(":checked");
            jQuery(set).each(function () {
                if (checked) {
                    $(this).prop("checked", true);
                    $(this).parents('tr').addClass("active");
                } else {
                    $(this).prop("checked", false);
                    $(this).parents('tr').removeClass("active");
                }
            });
        });
        table.on('change', 'tbody tr .checkboxes', function () {
            $(this).parents('tr').toggleClass("active");
        });
    };
    return {
        init: function (data) {
            if (!jQuery().dataTable) {
                return;
            }
            initTable(data);
        }
    };

}();

$("#op_add").click(function(){
   $("#add_bill").modal('show');
});

//查询框项目联动线路
$("#project_id").blur(function(){
    var value = $(this).val();
    var list = [];
    for(var i = 0;i<projectList.length;i++){
        list.push(projectList[i].proname);
    }
    if(list.indexOf(value) == -1){  //不存在
        $(this).val("");
        $("#lineList").empty();
        $("#lineList").append("<option value=''>请选择</option>");
        $("#lineList").attr("disabled",true);
    }
});
$("#project_id").change(function(e){
    var value = $(this).val();
    if(value != ""){
        var id = $("#proList").find("option[value='"+value+"']").attr("data-proid");
        for(var i in projectList){
            if(id == projectList[i].proid){
                var linelist = projectList[i].linelist;
                for(var j in linelist){
                    $("#lineList").append("<option value='"+linelist[j].lineid+"'>"+linelist[j].line+"</option>");
                }
            }
        }
        $("#lineList").attr("disabled",false);
    }else{
        $("#lineList").empty();
        $("#lineList").append("<option value=''>请选择</option>");
        $("#lineList").attr("disabled",true);
    }
});


//新增框项目联动线路
$("#project_add").blur(function(){
    var value = $(this).val();
    var list = [];
    for(var i = 0;i<projectList.length;i++){
        list.push(projectList[i].proname);
    }
    if(list.indexOf(value) == -1){  //不存在
        $(this).val("");
        $("#lineList_add").empty();
        $("#lineList_add").append("<option value=''>请选择</option>");
        $("#lineList_add").attr("disabled",true);
    }
});
$("#project_add").change(function(e){
    var value = $(this).val();
    if(value != ""){
        var id = $("#proList_add").find("option[value='"+value+"']").attr("data-proid");
        for(var i in projectList){
            if(id == projectList[i].proid){
                var linelist = projectList[i].linelist;
                for(var j in linelist){
                    $("#lineList_add").append("<option value='"+linelist[j].lineid+"'>"+linelist[j].line+"</option>");
                }
            }
        }
        $("#lineList_add").attr("disabled",false);
    }else{
        $("#lineList_add").empty();
        $("#lineList_add").append("<option value=''>请选择</option>");
        $("#lineList_add").attr("disabled",true);
    }
});

//运单查询返回结果
function getBillDataEnd(flg,result,callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            wayBillList = res.list;
            tableDataSet(res.draw, res.totalcount, res.totalcount, wayBillList, callback);
        }else{
            tableDataSet(0, 0, 0, [], callback);
            alertDialog("运单信息获取失败！");
        }
    }else{
        tableDataSet(0, 0, 0, [], callback);
        alertDialog("运单信息获取失败！");
    }
}

//项目查询结果返回
function getProjectDataEnd(flg,result){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            projectList = res.projectlist;
            for(var i in projectList){
                $("#proList").append("<option data-proid='"+projectList[i].proid+"' value='"+projectList[i].proname+"'></option>");
                $("#proList_add").append("<option data-proid='"+projectList[i].proid+"' value='"+projectList[i].proname+"'></option>");
            }
            //获取司机信息
            driverDataGet();
        }else{
            driverDataGet();
        }
    }else{
        driverDataGet();
    }
}

//司机信息结果返回
function getDriverDataEnd(flg, result){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            driverList = res.list;
            //获取发货人信息
            consignorDataGet();
        }else{
            //获取发货人信息
            consignorDataGet();
        }
    }else{
        //获取发货人信息
        consignorDataGet()
    }
}

//发货人信息货物结果
function getConsignorDataEnd(flg,result){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            consignorList = res.conlist;
            //获取字典相关信息
            var data = {};
            var list = ["10009","10010"];
            for(var i in list){
                data.lx = list[i];
                dictQuery(data);
            }
        }else{
            //获取字典相关信息
            var data = {};
            var list = ["10009","10010"];
            for(var i in list){
                data.lx = list[i];
                dictQuery(data);
            }
        }
    }else{
        //获取字典相关信息
        var data = {};
        var list = ["10009","10010"];
        for(var i in list){
            data.lx = list[i];
            dictQuery(data);
        }
    }
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
                    case "10009":
                        billStateList = dictlist;
                        $("#state").append("<option value='"+dictlist[i].code+"'>"+dictlist[i].value+"</option>");
                        break;
                    case "10010":
                        payStateList = dictlist;
                        $("#conductor").append("<option value='"+dictlist[i].code+"'>"+dictlist[i].value+"</option>");
                        break;
                }
                billInfoRequest();
            }
        }else{
            dictTrue.push("0");
            billInfoRequest();
        }
    }else{
        dictTrue.push("0");
        billInfoRequest();
    }
}

//判断是否可以请求车辆信息
function billInfoRequest(){
    if(dictTrue.length ==  2){
        //运单表格
        WayBillTable.init();
    }
}