/**
 * Created by haiyang on 2020/2/24.
 */

var organList,projectList,bankList = [];
var invoiceBillList = [];
var pageSize;  //表格显示页数，全选会用到

/**
 * 遗留问题：
 * 如果登录者的所属机构为主机构，那应该把该主机构的下属机构全部查询出来做成select控件，查询框机构字段默认显示主机构
 * 如果登录者的所属机构为子机构，只能查询该子机构的订单，查询框机构字段默认显示子机构
 * 还要通过机构id查询开票信息
**/

if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        fun_power();
        //时间控件初始化
        //ComponentsDateTimePickers.init();
        //获取机构信息
//        var data = {
//            organid:loginSucc.organids   //查询一级机构
//        }
        organDataGet();
        //开票
        invoiceApply.init();
    });
}

//开票运单表格
var InvoiceBillTable = function () {
    var initTable = function () {
        var table = $('#invoice_table');
        pageLengthInit(table);
        table.dataTable({
            "language": TableLanguage,
            "bStateSave": false,
            "lengthMenu": TableLengthMenu[3],
            "destroy": true,
            "pageLength": InvoicePageLength,
            //"pagingType": "numbers",
            "serverSide": true,
            "processing": true,
            "searching": false,
            "ordering": false,
            "bAutoWidth": true,
            "scrollY":        ($(window).height())*0.7,
            "deferRender":    true,
            "scrollX":        true,
            "scrollCollapse": true,
            "ajax":function (data, callback, settings) {
                //获取页数
                pageSize = data.length == -1 ? "": data.length;
                $(".group-checkable").prop("checked", false);
                var formData = $(".inquiry-form").getFormData();
                var organname = $("#organids").val() || "";
                //创建日期
                var start_time = "";
                var end_time = "";
                if(formData.start_time != ""){
                    start_time = formData.start_time.replace(/\//g,'')+"000000";
                }
                if(formData.end_time != ""){
                    end_time = formData.end_time.replace(/\//g,'')+"000000";
                }
                var lid = $("#lineList").val();
                var da = {
                    timeType:$("#timeType").val(),
                    start_time:start_time,
                    end_time:end_time,
                    project_id:$("#proList").find("option[value='"+formData.project_id+"']").attr("data-proid") || "",
                    line_id:lid,
                    openinvoice_state:$("#openinvoice_state").val(),
                    organids:$("#organlist").find("option[value='"+organname+"']").attr("data-organid") || "",
                    currentpage: (data.start / data.length) + 1,
                    pagesize: data.length == -1 ? "": data.length,
                    startindex: data.start,
                    draw: data.draw
                };
                invoiceBillDataGet(da, callback);
            },
            "initComplete": function(settings, json) {
                //根据用户判断否显示所属机构
                organDisplayCheck();
            },
            columns: [//返回的json数据在这里填充，注意一定要与上面的<th>数量对应，否则排版出现扭曲
                { "data": null},
                { "data": null},
                { "data": "wid",visible: false },
                { "data": "organname",sClass:"organ-display"},
                { "data": "project_name"},     //项目
                { "data": "linename" },    //线路
                { "data": "wid" },    //运单描述
                { "data": "odd_numbers"},
                { "data": "name" },    //司机
                { "data": "plate_number"},     //车牌号
                { "data": "rate"},
                { "data": "serviceFee"},
                { "data": "freight"},
                { "data": "wid"},    //总运费
                { "data": "openinvoice_state"}, //申请开票状态
                { "data": "loading_time"},  //发车时间
                { "data": "disburden_time"}      //签收时间
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
                    "targets": [6],
                    "render": function (data, type, row, meta) {
                        //显示运单号，发货到卸货地址
                        for(var i in invoiceBillList){
                            if(data == invoiceBillList[i].wid){
                                return invoiceBillList[i].wabill_numbers+'<br>'+
                                    invoiceBillList[i].loading_place+'  到  '+invoiceBillList[i].unloading_place;
                            }
                        }
                    }
                },{
                    "targets": [10],
                    "render": function (data, type, row, meta) {
                        return data+"%";
                    }
                },{
                    "targets": [11],
                    "render": function (data, type, row, meta) {
                        return formatCurrency(data);
                    }
                },{
                    "targets": [12],
                    "render": function (data, type, row, meta) {
                        return formatCurrency(data);
                    }
                },{
                    "targets": [12],
                    "render": function (data, type, row, meta) {
                        for(var i in invoiceBillList){
                            if(data == invoiceBillList[i].wid){
                                var amount = Number(invoiceBillList[i].serviceFee)+Number(invoiceBillList[i].freight)
                            }
                        }
                        return formatCurrency(amount);
                    }
                },{
                    "targets": [14],
                    "render": function (data, type, row, meta) {
                        var text = "";
                        switch (data){
                            case "0":
                                text = "未申请";
                                break;
                            case "1":
                                text = "已申请";
                                break;
                        }
                        return text;
                    }
                },{
                    "targets": [15],
                    "render": function (data, type, row, meta) {
                        if(data == undefined){
                            return "";
                        }
                        return dateTimeFormat(data);
                    }
                },{
                    "targets": [16],
                    "render": function (data, type, row, meta) {
                        if(data == undefined){
                            return "";
                        }
                        return dateTimeFormat(data);
                    }
                }
            ],
            fnRowCallback: function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
                $('td:eq(0),td:eq(1),td:eq(14),td:eq(15)', nRow).attr('style', 'text-align: center;');
                $('td:eq(9),td:eq(10),td:eq(11),td:eq(12)', nRow).attr('style', 'text-align: right;');
            }
        });

        //table.draw( false );
        $('.group-checkable').change(function () {
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
            if(checkChooseAll("#invoice_table",pageSize,invoiceBillList)){
                $(".group-checkable").prop("checked",true);
            }else{
                $(".group-checkable").prop("checked",false);
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

//查询
$("#invoice_inquiry").click(function(){
    InvoiceBillTable.init();
});

//查询框所属机构
$("#organids").blur(function(){
    var value = $(this).val();
    var list = [];
    for(var i = 0;i<organList.length;i++){
        list.push(organList[i].organname);
    }
    if(list.indexOf(value) == -1){  //不存在
        $(this).val("");
    }
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

//开票
var invoiceApply = function() {
    var handleRegister = function() {
        var validator = $('.invoice-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                invoicerise_address: {
                    required: true,
                    address:true
                },
                invoicerise_tel: {
                    required: true
                },
                bank_name:{
                    required: true
                },
                bank:{
                    required: true,
                    bank_validator:true
                }
            },

            messages: {
                invoicerise_address: {
                    required: "地址必须输入"
                },
                invoicerise_tel: {
                    required: "电话必须输入"
                },
                bank_name:{
                    required: "开户银行必须输入"
                },
                bank:{
                    required: "银行卡号必须输入"
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

        jQuery.validator.addMethod("address", function(value, element) {
            var rate = /^[\u4e00-\u9fa5a-zA-Z0-9]+$/;
            return this.optional(element) || (rate.test(value));
        }, "不能含有特殊字符");

        jQuery.validator.addMethod("bank_validator", function(value, element) {
            var reg = /^[0-9]*$/;
            return this.optional(element) || (reg.test(value));
        }, "请正确填写您的银行卡号");

        //输入开户行事件
        $("#bank_name").blur(function(){
            var value = $(this).val();
            var list = [];
            for(var i = 0;i<bankList.length;i++){
                list.push(bankList[i].bankname);
            }
            if(list.indexOf(value) == -1){  //不存在
                $(this).val("");
            }
        });

        //点击确定按钮
        $('#invoice-btn').click(function() {
            btnDisable($('#invoice-btn'));
            if ($('.invoice-form').validate().form()) {
                var invoiceData = $('.invoice-form').getFormData();
                invoiceData.bankid = invoiceData.bankname;
                invoiceData.freight = invoiceData.freight.replace(/,/g,"");
                invoiceData.invoice = invoiceData.invoice.replace(/,/g,"");
                invoiceData.serviceFee = invoiceData.serviceFee.replace(/,/g,"");
                invoiceData.widlist = invoiceData.widlist.split(',');
                invoiceData.organid = loginSucc.organid;
                $("#loading_edit").modal("show");
                invoiceApplyQuest(invoiceData);
            }
        });
        //一键开票
        $("#invoice_apply").click(function(){
            //admin和运营方不可操作
            if(loginSucc.userid == "admin" || loginSucc.types == "0"){
                alertDialog("admin和运营方不可进行此操作！");
                return;
            }
            validator.resetForm();
            $(".invoice-form").find(".has-error").removeClass("has-error");
            if(invoiceBillList.length < 1){
                alertDialog("没有可开票订单！");
                return;
            }
            var data = {
                invoice_number:invoiceBillList.length,   //运单数量
                freight: 0,                       //司机运费总额
                serviceFee: 0,                   //平台服务费总额
                invoice:0,                         //开票总额
                widlist:[]                        //运单id数组
            };
            for(var i in invoiceBillList){
                if(invoiceBillList[i].openinvoice_state == "1"){   //已申请不能再次申请
                    alertDialog("已申请开票的订单不能再次申请！");
                    return;
                }
                data.freight += Number(invoiceBillList[i].freight)*100;
                data.serviceFee += Number(invoiceBillList[i].serviceFee)*100;
                data.widlist.push(invoiceBillList[i].wid);
            }
            data.invoice = Number(data.freight)+Number(data.serviceFee);
//            if(parseInt(data.invoice)>eval(100000000)){
//                alertDialog("单次开票合计不能超过100万！");
//                return;
//            }
            data.freight = get_thousand_num(subStringNum(data.freight/100,2));
            data.serviceFee = get_thousand_num(subStringNum(data.serviceFee/100,2));
            data.invoice = get_thousand_num(subStringNum(data.invoice/100,2));

            //发票信息
            for(var i in organList){
                if(loginSucc.organids == organList[i].organid){
                    data.rise_name = organList[i].rise_name;
                    data.taxpayer = organList[i].taxpayer;
                    if(organList[i].address_phone != ""){
                        var addresseeTel = (organList[i].address_phone.replace("/",",")).split(",");
                        data.invoicerise_address = addresseeTel[0];
                        data.invoicerise_tel = addresseeTel[1];
                    }else{
                        data.invoicerise_address = "";
                        data.invoicerise_tel = "";
                    }
                    data.bankname = organList[i].bankname;
                    data.bank = organList[i].bank;
                }
            }


            var exclude = [];
            var options = { jsonValue: data, exclude:exclude,isDebug: false};
            $(".invoice-form").initForm(options);

            //运费信息只读,开票信息中,抬头名称和纳税人识别号不可修改，其它可修改
            $(".invoice-form").find("input").attr("readonly","readonly");
            $("input[name=invoicerise_address],input[name=invoicerise_tel],input[name=bankname],input[name=bank]").removeAttr("readonly");
            $(".modal-title").val("一键开票");
            $("#invoice_edit").modal('show');
        });

        //选单开票
        $("#choose_apply").click(function(){
            //admin和运营方不可操作
            if(loginSucc.userid == "admin" || loginSucc.types == "0"){
                alertDialog("admin和运营方不可进行此操作！");
                return;
            }
            validator.resetForm();
            $(".invoice-form").find(".has-error").removeClass("has-error");
            var len = $(".checkboxes:checked").length;
            if(len < 1){
                alertDialog("至少选中一项！");
                return;
            }
            var data = {
                invoice_number:len,                         //运单数量
                freight: 0,                       //司机运费总额
                serviceFee: 0,                   //平台服务费总额
                invoice:0,                         //开票总额
                widlist:[]                        //运单id数组
            };
            var result = true;
            $(".checkboxes:checked").parents("td").each(function(){
                var row = $(this).parents('tr')[0];
                if($("#invoice_table").dataTable().fnGetData(row).openinvoice_state == "1"){  //已申请的不能再次申请
                    result = false;
                }
                data.freight += Number($("#invoice_table").dataTable().fnGetData(row).freight)*100;
                data.serviceFee += Number($("#invoice_table").dataTable().fnGetData(row).serviceFee)*100;
                data.widlist.push($("#invoice_table").dataTable().fnGetData(row).wid);
            });
            if(result){
                data.invoice = Number(data.freight)+Number(data.serviceFee);
//                if(parseInt(data.invoice)>eval(100000000)){
//                    alertDialog("单次开票合计不能超过100万！");
//                    return;
//                }
                data.freight = get_thousand_num(subStringNum(data.freight/100,2));
                data.serviceFee = get_thousand_num(subStringNum(data.serviceFee/100,2));
                data.invoice = get_thousand_num(subStringNum(data.invoice/100,2));

                //发票信息
                for(var i in organList){
                    if(loginSucc.organids == organList[i].organid){
                        data.rise_name = organList[i].rise_name;
                        data.taxpayer = organList[i].taxpayer;
                        if(organList[i].address_phone != ""){
                            var addresseeTel = (organList[i].address_phone.replace("/",",")).split(",");
                            data.invoicerise_address = addresseeTel[0];
                            data.invoicerise_tel = addresseeTel[1];
                        }else{
                            data.invoicerise_address = "";
                            data.invoicerise_tel = "";
                        }
                        data.bankname = organList[i].bankname;
                        data.bank = organList[i].bank;
                    }
                }

                var exclude = [];
                var options = { jsonValue: data, exclude:exclude,isDebug: false};
                $(".invoice-form").initForm(options);

                //运费信息只读,开票信息中,抬头名称和纳税人识别号不可修改，其它可修改
                $(".invoice-form").find("input").attr("readonly","readonly");
                $("input[name=invoicerise_address],input[name=invoicerise_tel],input[name=bank_name],input[name=bank]").removeAttr("readonly");
                $(".modal-title").val("选单开票");
                $("#invoice_edit").modal('show');
            }else{
                alertDialog("已申请开票的订单不能再次申请！");
                return;
            }
        });
    };
    return {
        init: function() {
            handleRegister();
        }
    };
}();

//开票运单信息获取结果返回
function getInvoiceBillEnd(flg,result,callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            invoiceBillList = res.list;
            tableDataSet(res.draw, res.totalcount, res.totalcount, invoiceBillList, callback);
        }else{
            tableDataSet(0, 0, 0, [], callback);
            alertDialog("运单开票信息获取失败！");
        }
    }else{
        tableDataSet(0, 0, 0, [], callback);
        alertDialog("运单开票信息获取失败！");
    }
}

//申请开票（一键/选取）
function invoiceApplyQuestEnd(flg,result){
    $("#loading_edit").modal("hide");
    var res = "失败";
    var text = "申请开票";
    var alert = "";
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg || "";
        }
        if (result && result.retcode == SUCCESS) {
            res = "成功";
            InvoiceBillTable.init();
            $('#invoice_edit').modal('hide');
        }
    }
    if(alert == "") alert = text + res + "！";
    App.unblockUI('#lay-out');
    alertDialog(alert);
}

//机构信息获取结果返回
function getOrganDataEnd(flg,result){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            organList = res.list;
            //判断该用户所属机构是一级机构，则显示下属子机构
//            if(loginSucc.organid == loginSucc.organids){
//                $("#organlist").empty();
//                $("#organlist").append("<option value='"+organList.organid+"' selected>"+organList.organname+"</option>");
//                if(organList.organlist != undefined){
//                    for(var i in organList[i].organlist){
//                        $("#organlist").append("<option value='"+organList.organlist[i].organid+"'>"+organList.organlist[i].organname+"</option>");
//                    }
//                }
//            }else{   //该用户所属机构为子机构，则只显示所属子机构
//                $("#organlist").empty();
//                $("#organlist").append("<option value='"+loginSucc.organid+"' selected>"+loginSucc.organname+"</option>");
//            }
            for(var i in organList){
                if(organList[i].organlist == undefined){
                    $("#organlist").append('<option data-organid = "'+organList[i].organid+'" value="'+organList[i].organname+'"></option>');
                }
            }
            //获取项目信息
            projectDataGet();
        }else{
            //获取项目信息
            projectDataGet();
        }
    }else{
        //获取项目信息
        projectDataGet();
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
            //开票运单表格
            InvoiceBillTable.init();
        }else{
            //开票运单表格
            InvoiceBillTable.init();
        }
    }else{
        //开票运单表格
        InvoiceBillTable.init();
    }
}
