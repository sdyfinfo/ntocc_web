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
        paymentEdit.init();
        //获取用户余额
        getUserBalance();
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
                    start_subtime = formData.start_subtime.replace(/\//g,'')+"000000";
                }
                if(formData.end_subtime != ""){
                    end_subtime = formData.end_subtime.replace(/\//g,'')+"000000";
                }
                if(formData.loading_start_subtime != ""){
                    loading_start_subtime = formData.loading_start_subtime.replace(/\//g,'')+"000000";
                }
                if(formData.loading_end_subtime != ""){
                    loading_end_subtime = formData.loading_end_subtime.replace(/\//g,'')+"000000";
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
                { "data": "paid"},
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
                        }else{
                            return data;
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
                $('td:eq(0),td:eq(1),td:eq(5),td:eq(6),td:eq(8),td:eq(14)', nRow).attr('style', 'text-align: center;');
                $('td:eq(9),td:eq(10),td:eq(11),td:eq(13)', nRow).attr('style', 'text-align: right;');
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
        var validator = $('.payment-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                amount: {
                    required: true,
                    amount:true
                },
                ushield: {
                    required: true
                },
                fare:{
                    required: true
                }
            },

            messages: {
                amount: {
                    required: "支付金额必须输入"
                },
                ushield: {
                    required: "U盾口令必须输入"
                },
                fare:{
                    required: "合计支付不能为空"
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

        //已支付金额+支付金额合计不可大于司机运费,且不能输入0
        jQuery.validator.addMethod("amount", function(value, element) {
            var result = true;
            var payment = $("input[name=payment]").val();
            var freight = $('.payment-form').find("input[name=freight]").val();
            if((Number(value)+Number(payment))>Number(freight)){
                result = false;
            }
            if(Number(value)==0){
                result = false;
            }
            return this.optional(element) || result;
        }, "已支付金额和支付金额合计不可大于司机运费且支付金额不能为0");

        //支付金额联动合计支付
        $("input[name=amount]").on("input propertychange",function(){
            $(this).val($(this).val().replace(/[^\d.]/g, ""));  //清除“数字”和“.”以外的字符
            $(this).val($(this).val().replace(/\.{2,}/g, ".")); //只保留第一个. 清除多余的
            $(this).val($(this).val().replace(".", "$#$").replace(/\./g, "").replace("$#$", "."));
            $(this).val($(this).val().replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3'));//只能输入两个小数
            if ($(this).val().indexOf(".") < 0 && $(this).val() != "") {//以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额
                $(this).val(parseFloat($(this).val()));
            }
            if($(this).val() != ""){
                var number = $(this).val();
                //计算平台服务费
                var rate = $("input[name=rate]").val();
                var serviceFee = subStringNum(((number/(1-(rate/100)))*(rate/100)),2);
                $("input[name=serviceFee]").val(serviceFee);
                var total = subStringNum((Number(number)+Number(serviceFee)),2);
                $("input[name=total]").val(total);
            }else{
                $("input[name=total],input[name=serviceFee]").val("");
            }
        });

        //点击确定按钮
        $('#payment-btn').click(function() {
            btnDisable($('#payment-btn'));
            if ($('.payment-form').validate().form()) {
                var paymentData = $('.payment-form').getFormData();
                var len = $("#len").val();
                if(len == 1){  //选择一条数据，如果运单未通过审核或状态不是完成时不可以全部支付
                    if((Number(paymentData.amount)+Number(paymentData.payment)) == Number(paymentData.freight)){   //全部支付
                        if(paymentData.verification_status == '02'){
                            alertDialog("运单未通过审核，不能全部支付！");
                            return;
                        }
                        if(paymentData.status != '03'){
                            alertDialog("运单状态不是完成状态，不能全部支付！");
                            return;
                        }
                    }
                }
                paymentData.widlist = paymentData.widlist.split(',');
                paymentData.paid = paymentData.paidlist.split(',');
                paymentData.userid = loginSucc.userid;
                delete paymentData.paidlist;
                $("#loading_edit").modal("show");
                billPayment(paymentData);
            }
        });
        //一键支付
        $("#bill_payment").click(function(){
            validator.resetForm();
            $(".payment-form").find(".has-error").removeClass("has-error");
            var len = $(".checkboxes:checked").length;
            if(len < 1){
                alertDialog("至少选中一项！");
                return;
            }
            var result = true;
            var data = {
                freight: 0, //司机运费
                paid: 0,//已支付运费
                serviceFee: 0,//平台服务费
                state: "",  //运单状态
                verification_status:"",  //审核状态
                widlist:[],
                amount:0,       //支付金额，
                total:0,          //合计支付
                paidlist:[]     //已支付金额集合
            }
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
                    var paied = $("#payment_table").dataTable().fnGetData(row).paid;
                    data.widlist.push($("#payment_table").dataTable().fnGetData(row).wid);
                    data.rate = $("#payment_table").dataTable().fnGetData(row).rate;
                    data.verification_status = $("#payment_table").dataTable().fnGetData(row).verification_status;
                    data.state = $("#payment_table").dataTable().fnGetData(row).state;
                    data.paidlist.push(paied);
                    //累加司机运费
                    data.freight += Number(driver);
                    //累加已支付运费
                    data.paid += Number(paied);
                }
            });
            //支付金额=运费-已支付
            data.amount = Number(data.freight)-Number(data.paid);
            //平台服务费=支付金额/(1-费率)*费率
            data.serviceFee = subStringNum(((data.amount)/(1-(data.rate)/100))*((data.rate)/100),2);
            //合计支付=支付金额+服务费
            data.total = subStringNum(Number(data.amount)+Number(data.serviceFee),2);
            var exclude = [];
            var options = { jsonValue: data, exclude:exclude,isDebug: false};
            $(".payment-form").initForm(options);

            $("#len").val(len);
            $("#payment_len").html("共选择了"+len+"个运单");
            if(len == 1){  //选择一个运单，显示已支付金额，支付金额可修改
                $("input[name=paid]").parents('.form-group').show();
                $("input[name=amount]").removeAttr("readonly");
            }else{   //多个运单，已支付金额不显示，支付金额不可修改
                $("input[name=paid]").parents('.form-group').hide();
                $("input[name=amount]").attr("readonly","readonly");
            }
            $("#payment_edit").modal('show');
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
            $("#edit_detail").modal('show');
        }else{
            tableDataSet(0, 0, 0, [], callback);
            $("#edit_detail").modal('show');
            alertDialog("运单支付明细获取失败！");
        }
    }else{
        tableDataSet(0, 0, 0, [], callback);
        $("#edit_detail").modal('show');
        alertDialog("运单支付明细获取失败！");
    }
}

//一键支付结果返回
function billPaymentEnd(flg,result){
    $("#loading_edit").modal("hide");
    var res = "失败";
    var text = "一键支付";
    var alert = "";
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg || "";
        }
        if (result && result.retcode == SUCCESS) {
            res = "成功";
            BillPaymentTable.init();
            getUserBalance();
            $('#payment_edit').modal('hide');
        }
    }
    if(alert == "") alert = text + res + "！";
    App.unblockUI('#lay-out');
    alertDialog(alert);
}

//获取账户余额返回结果
function getUserBalanceEnd(flg,result){
    var res = "失败";
    var text = "获取账户余额";
    var alert = "";
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg || "";
        }
        if (result && result.retcode == SUCCESS) {
            res = "成功";
            $("#balance").val(formatCurrency(result.response.balance));
        }
    }
    if(alert == "") alert = text + res + "！";
    App.unblockUI('#lay-out');
    alertDialog(alert);
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