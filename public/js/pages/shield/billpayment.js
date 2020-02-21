/**
 * Created by haiyang on 2020/2/20.
 */

var billStateList,payStateList,goodsTypeList,unitList,verificationList,dictTrue = [];   //字典
var projectList = [];
var paymentList = [];

if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        fun_power();
        //时间控件初始化
        //ComponentsDateTimePickers.init();
        //获取项目信息
        projectDataGet();
        //支付运费
        paymentEdit();
    });
}

//运单支付表格
var BillPaymentTable = function () {
    var initTable = function () {
        var table = $('#payment_table');
        pageLengthInit(table);
        table.dataTable({
            "language": TableLanguage,
            "bStateSave": false,
            "lengthMenu": TableLengthMenu[2],
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
                var start_subtime = "";
                var end_subtime = "";
                var loading_start_subtime ="";
                var loading_end_subtime = "";
                var state = "";
                if(formData.start_subtime != ""){
                    start_subtime = formData.start_subtime.replace(/-/g,'')+"000000";
                }
                if(formData.end_subtime != ""){
                    end_subtime = formData.end_subtime.replace(/-/g,'')+"000000";
                }
                if(formData.loading_start_subtime != ""){
                    loading_start_subtime = formData.loading_start_subtime.replace(/-/g,'')+"000000";
                }
                if(formData.loading_end_subtime != ""){
                    loading_end_subtime = formData.loading_end_subtime.replace(/-/g,'')+"000000";
                }
                if(formData.state != ""){
                    state = "10010,"+formData.state;
                }
                var lid = $("#lineList").val();
                var da = {
                    start_subtime:start_subtime,
                    end_subtime:end_subtime,
                    loading_start_subtime:loading_start_subtime,
                    loading_end_subtime:loading_end_subtime,
                    project_id:$("#proList").find("option[value='"+formData.project_id+"']").attr("data-proid") || "",
                    lid:lid,
                    consignor:formData.consignor,
                    platenumber:formData.platenumber,
                    name:formData.driver_name,
                    state:state,
                    currentpage: (data.start / data.length) + 1,
                    pagesize: data.length == -1 ? "": data.length,
                    startindex: data.start,
                    draw: data.draw
                };
                paymentDataGet(da, callback);
            },
            columns: [//返回的json数据在这里填充，注意一定要与上面的<th>数量对应，否则排版出现扭曲
                { "data": null},
                { "data": null},
                { "data": "wid",visible: false },
                { "data": "project_name"},     //项目
                { "data": "linename" },    //线路
                { "data": "wid" },    //运单描述
                { "data": "loading_time"},
                { "data": "disburden_time"},
                { "data": "name" },    //司机
                { "data": "plate_number"},     //车牌号
                { "data": "rate"},
                { "data": "serviceFee"},
                { "data": "freight"},
                { "data": "payment_status"},
                { "data": "payment"},
                { "data": "updatetime"}
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
                    "targets": [5],
                    "render": function (data, type, row, meta) {
                        //显示运单号，发货到卸货地址
                        for(var i in paymentList){
                            if(data == paymentList[i].wid){
                                return '<a href="javascript:;" id="bill_detail">'+paymentList[i].wabill_numbers+'<br>'+
                                    paymentList[i].loading_place+'  到  '+paymentList[i].unloading_place+'</a>';
                            }
                        }
                    }
                },
                {
                    "targets": [6],
                    "render": function (data, type, row, meta) {
                        if(data == undefined){
                            return "";
                        }
                        return dateTimeFormat(data);
                    }
                },{
                    "targets": [7],
                    "render": function (data, type, row, meta) {
                        if(data == undefined){
                            return "";
                        }
                        return dateTimeFormat(data);
                    }
                },{
                    "targets": [10],
                    "render": function (data, type, row, meta) {
                        return data+"%";
                    }
                },{
                    "targets": [12],
                    "render": function (data, type, row, meta) {
                        return formatCurrency(data);
                    }
                },{
                    "targets": [13],
                    "render": function (data, type, row, meta) {
                        //支付状态
                        var value = "";
                        for(var i in payStateList){
                            if(data == payStateList[i].code){
                                value =  payStateList[i].value;
                            }
                        }
                        return value;
                    }
                },{
                    "targets": [14],
                    "render": function (data, type, row, meta) {
                        //已支付运费查看
                        if(data != "0"){
                            return '<a href="javascript:;" id="payment_detail">'+data+'</a>'
                        }
                    }
                },{
                    "targets": [15],
                    "render": function (data, type, row, meta) {
                        if(data == undefined){
                            return "";
                        }
                        return dateTimeFormat(data);
                    }
                }
            ],
            fnRowCallback: function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
                $('td:eq(0),td:eq(1),td:eq(6),td:eq(7),td:eq(8),td:eq(14)', nRow).attr('style', 'text-align: center;');
                $('td:eq(9),td:eq(10),td:eq(11)', nRow).attr('style', 'text-align: right;');
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
            //判断是否全选
            var checklength = $("#payment_table").find(".checkboxes:checked").length;
            if(checklength == paymentList.length){
                $("#payment_table").find(".group-checkable").prop("checked",true);
            }else{
                $("#payment_table").find(".group-checkable").prop("checked",false);
            }
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

//运单支付查询
$("#payment_inquiry").click(function(){
    BillPaymentTable.init();
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

//查看运单信息
$("#payment_table").on('click',"#bill_detail",function(){
    var row = $(this).parents('tr')[0];
    var wid = $("#payment_table").dataTable().fnGetData(row).wid;
    var data = {};
    for(var i in paymentList){
        if(wid == paymentList[i].wid){
            data =  paymentList[i];
        }
    }
    var exclude = [];
    var options = { jsonValue: data, exclude:exclude,isDebug: false};
    $(".bill-form").initForm(options);
    //显示货物名称
    var goodsList = data.goods.split(",");
    for(var i in goodsList){
        var div = "<div class='goods_check'>"+goodsList[i]+"</div>";
        $("#goodsname").append(div);
    }
    $(".bill-form").find("input,select,textarea").attr("disabled",true);
    $("#detail_bill").modal('show');
});

//查看运单支付明细
$("#payment_table").on('click',"#payment_detail",function(){
    var row = $(this).parents('tr')[0];
    var wid = $("#payment_table").dataTable().fnGetData(row).wid;
    var table = $('#payDetail_table');
    pageLengthInit(table);
    table.dataTable({
        "language": TableLanguage,
        "bStateSave": false,
        "lengthMenu": TableLengthMenu[2],
        "destroy": true,
        "pageLength": PageLength,
        //"pagingType": "numbers",
        "serverSide": true,
        "processing": true,
        "searching": false,
        "ordering": false,
        "bAutoWidth": false,
        "ajax":function (data, callback, settings) {
            var da = {
                wid:wid,
                currentpage: (data.start / data.length) + 1,
                pagesize: data.length == -1 ? "": data.length,
                startindex: data.start,
                draw: data.draw
            };
            paymentDetailGet(da, callback);
        },
        columns: [//返回的json数据在这里填充，注意一定要与上面的<th>数量对应，否则排版出现扭曲
            { "data": null},
            { "data": "wid" },
            { "data": "project_name"},     //项目
            { "data": "linename" }
        ],
        columnDefs: [
            {
                "targets": [0],
                "data": null,
                "render": function (data, type, row, meta) {
                    return meta.settings._iDisplayStart + meta.row + 1;  //行号
                }
            },{
                "targets": [1],
                "render": function (data, type, row, meta) {
                    if(data == undefined){
                        return "";
                    }
                    return dateTimeFormat(data);
                }
            },{
                "targets": [2],
                "render": function (data, type, row, meta) {
                    if(data == undefined){
                        return "";
                    }
                    return formatCurrency(data);
                }
            }
        ],
        fnRowCallback: function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
            $('td:eq(0),td:eq(1)', nRow).attr('style', 'text-align: center;');
            $('td:eq(2),td:eq(3)', nRow).attr('style', 'text-align: right;');
        }
    });
});

//支付运单
var paymentEdit = function() {
    var handleRegister = function() {
        var validator = $('.bill-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                amount: {
                    required: true
                },
                ushield: {
                    required: true
                }
            },

            messages: {
                amount: {
                    required: "支付金额必须输入"
                },
                ushield: {
                    required: "U盾口令必须输入"
                }
            },

            invalidHandler: function(event, validator) { //display error alert on form submit

            },

            highlight: function(element) { // hightlight error inputs
                $(element)
                    .closest('.form-group').addClass('has-error'); // set error class to the control group
            },

            success: function(label) {
                label.closest('.form-group').removeClass('has-error');
                label.remove();
            },

            errorPlacement: function(error, element) {
                if (element.attr("name") == "tnc") { // insert checkbox errors after the container
                    error.insertAfter($('#register_tnc_error'));
                } else if (element.closest('.input-icon').size() === 1) {
                    error.insertAfter(element.closest('.input-icon'));
                } else {
                    error.insertAfter(element);
                }
            },

            submitHandler: function(form) {
                form.submit();
            }
        });

        // 手机号码验证
        jQuery.validator.addMethod("phone", function(value, element) {
            var tel = /^1[3456789]\d{9}$/;
            return this.optional(element) || (tel.test(value));
        }, "请正确填写您的手机号码");

        //点击确定按钮
        $('#payment-btn').click(function() {
            btnDisable($('#payment-btn'));
            if ($('.payment-form').validate().form()) {
                var payment = $('.payment-form').getFormData();

            }
        });
        //一键支付
        $("#bill_payment").click(function(){
            validator.resetForm();
            $(".edit-form").find(".has-error").removeClass("has-error");
            var len = $(".checkboxes:checked").length;
            if(len < 1){
                alertDialog("至少选中一项！");
                return;
            }
            var result = true;
            var freight = 0; //司机运费
            var payment = 0;//已支付运费
            var serviceFee = 0;//平台服务费
            $(".checkboxes:checked").parents("td").each(function () {
                var row = $(this).parents('tr')[0];
                //已支付的运单不可一键支付
                var pay_state = $("#payment_table").dataTable().fnGetData(row).pay_state;
                if(pay_state == '03'){
                    alertDialog("已支付的运单不可一键支付！");
                    result = false;
                    return false;
                }else{
                    var driver = $("#payment_table").dataTable().fnGetData(row).freight;
                    var paied = $("#payment_table").dataTable().fnGetData(row).paiedfre;
                    var service = $("#payment_table").dataTable().fnGetData(row).serviceFee;
                    //累加司机运费
                    freight += Number(driver);
                    //累加已支付运费
                    payment += Number(paied);
                    //累加平台服务费
                    serviceFee += Number(service);
                }
            });
            var amount = Number(freight)-Number(payment);
            $("input[name=freight]").val(freight);
            $("input[name=payment]").val(payment);
            //支付金额=运费-已支付
            $("input[name=amount]").val(amount);
            $("input[name=serviceFee]").val(serviceFee);
            //合计支付=支付金额+服务费
            var fare = Number(amount)+Number(serviceFee);
            $("input[name=fare]").val(fare);
            $("#len").val(len);
            $("#payment_len").html("共选择了"+len+"个运单");
            if(len == 1){  //选择一个运单，显示已支付金额，支付金额可修改
                $("input[name=payment]").show();
                $("input[name=amount]").removeAttr("readonly");
            }else{

            }
        });
    };
    return {
        init: function() {
            handleRegister();
        }
    };
}();

//运单支付信息获取结果返回
function getPaymentDataEnd(flg,result,callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            paymentList = res.list;
            tableDataSet(res.draw, res.totalcount, res.totalcount, paymentList, callback);
        }else{
            tableDataSet(0, 0, 0, [], callback);
            alertDialog("运单支付信息获取失败！");
        }
    }else{
        tableDataSet(0, 0, 0, [], callback);
        alertDialog("运单支付信息获取失败！");
    }
}

//支付明细查询结果返回
function getPaymentDetailEnd(flg,result,callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            var paymentDetailList = res.list[0];
            tableDataSet(res.draw, res.totalcount, res.totalcount, paymentDetailList, callback);
            $("#payment_detail").modal('show');
        }else{
            tableDataSet(0, 0, 0, [], callback);
            $("#payment_detail").modal('show');
            alertDialog("运单支付明细获取失败！");
        }
    }else{
        tableDataSet(0, 0, 0, [], callback);
        $("#payment_detail").modal('show');
        alertDialog("运单支付明细获取失败！");
    }
}

//项目信息获取结果返回
function getProjectDataEnd(flg,result){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            projectList = res.projectlist;
            for(var i in projectList){
                if(projectList[i].state == "0"){
                    $("#proList").append("<option data-proid='"+projectList[i].proid+"' value='"+projectList[i].proname+"'></option>");
                    $("#proList_add").append("<option data-proid='"+projectList[i].proid+"' value='"+projectList[i].proname+"'></option>");
                }
            }
            //获取字典相关信息
            var data = {};
            var list = ["10005","10006","10009","10010"];
            for(var i in list){
                data.lx = list[i];
                dictQuery(data);
            }
        }else{
            //获取字典相关信息
            var data = {};
            var list = ["10005","10006","10009","10010"];
            for(var i in list){
                data.lx = list[i];
                dictQuery(data);
            }
        }
    }else{
        //获取字典相关信息
        var data = {};
        var list = ["10005","10006","10009","10010"];
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
                    case "10005":
                        goodsTypeList = dictlist;
                        $("#goods_type").append("<option value='"+dictlist[i].code+"'>"+dictlist[i].value+"</option>");
                        break;
                    case "10006":
                        unitList = dictlist;
                        $("#unit").append("<option value='"+dictlist[i].code+"'>"+dictlist[i].value+"</option>");
                        break;
                    case "10009":
                        payStateList = dictlist;
                        $("#conductor").append("<option value='"+dictlist[i].code+"'>"+dictlist[i].value+"</option>");
                        break;
                    case "10010":
                        billStateList = dictlist;
                        $("#state").append("<option value='"+dictlist[i].code+"'>"+dictlist[i].value+"</option>");
                        break;
                }
            }
            paymentInfoRequest();
        }else{
            dictTrue.push("0");
            paymentInfoRequest();
        }
    }else{
        dictTrue.push("0");
        paymentInfoRequest();
    }
}

//判断是否可以请求运单支付信息
function paymentInfoRequest(){
    if(dictTrue.length ==  4){
        //运单支付表格
        BillPaymentTable.init();
    }
}