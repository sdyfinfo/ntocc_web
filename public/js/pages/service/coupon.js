/**
 * Created by Administrator on 2019/12/4.
 */
var coupList = [];
var coupHisList = [];
if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        CoupTable.init();
        CoupEdit.init();
        CoupGive.init();
        //时间控件初始化
        ComponentsDateTimePickers.init();
    });
}

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
            $("input[name='enddate']").datepicker("setDate",date);
        }
    };

    return {
        //main function to initiate the module
        init: function () {
            handleDatePickers();
        }
    };
}();

var CoupTable = function () {
    var initTable = function () {
        var table = $('#coup_table');
        pageLengthInit(table);
        table.dataTable({
            "language": TableLanguage,
            "bStateSave": false, // save datatable state(pagination, sort, etc) in cookie.
            "lengthMenu": TableLengthMenu,
            "destroy": true,
            "pageLength": PageLength,
            "serverSide": true,
            "pagingType": "bootstrap_extended",
            "processing": true,
            "searching": false,
            "ordering": false,
            "autoWidth": false,
            "ajax":function (data, callback, settings) {
                var formData = $(".inquiry-form").getFormData();
                var da = {
                    type: formData.type,
                    couponname: formData.couponname,
                    currentpage: (data.start / data.length) + 1,
                    pagesize: data.length == -1 ? "": data.length,
                    startindex: data.start,
                    draw: data.draw
                };
                coupDataGet(da, callback);
            },
            columns: [//返回的json数据在这里填充，注意一定要与上面的<th>数量对应，否则排版出现扭曲
                { "data": null},
                { "data": null},
                { "data": "id", visible: false },
                { "data": "type" },
                { "data": "couponname" },
                { "data": "amount" },
                { "data": "usemark" },
                { "data": "upfee" },
                { "data": "numbers" },
                { "data": "enddate" },
                { "data": "status" },
                { "data": null }
            ],
            columnDefs: [
                {
                    "targets":[1],
                    "render":function(data, type, row, meta){
                        return '<input type="checkbox" class="checkboxes" value="1" />';
                    }
                },
                {
                    "targets": [0],
                    "data": null,
                    "render": function (data, type, row, meta) {
                        return meta.settings._iDisplayStart + meta.row + 1;  //行号
                    }
                },
                {
                    "targets":[3],
                    "render": function(data, type, row, meta) {
                        var cType;
                        switch (data) {
                            case "0":
                                cType = "Turnin查重";
                                break;
                            case "1":
                                cType = "Grammarian语法检测";
                                break;
                            case "2":

                        }
                        return cType;
                    }
                },{
                    //优惠券名称
                    "targets": [4],
                    "data": null,
                    "render": function (data, type, row, meta) {
                        return '<a href="javascript:;" id="op_detail">' + data + '</a>'
                    }
                },
                {
                    //优惠券金额
                    "targets": [5],
                    "data": null,
                    "render": function (data, type, row, meta) {
                        if(data == "-1"){
                            return "不限";
                        }else{
                            return data + '元';
                        }
                    }
                },{
                    //优惠券所需积分
                    "targets": [6],
                    "data": null,
                    "render": function (data, type, row, meta) {
                        return data + '分'
                    }
                },
                {
                    //使用场合
                    "targets": [7],
                    "data": null,
                    "render": function (data, type, row, meta) {
                        if(data == "-1"){
                            return "全部可用";
                        }else{
                            return "满" + data + "元可用";
                        }
                    }
                },
                {
                    //发行个数
                    "targets": [8],
                    "data": null,
                    "render": function (data, type, row, meta) {
                        if(data == "-1"){
                            return "不限制";
                        }else{
                            return data;
                        }
                    }
                },
                {
                    //截止期限
                    "targets": [9],
                    "data": null,
                    "render": function (data, type, row, meta) {
                        if(data == "-1"){
                            return "无截止期限";
                        }else{
                            return dateFormat(data, "-");
                        }
                    }
                },
                {
                    //状态
                    "targets": [10],
                    "data": null,
                    "render": function (data, type, row, meta) {
                        var cType;
                        switch (data) {
                            case "0":
                                cType = "正常";
                                break;
                            case "1":
                                cType = "已下架";
                                break;
                            case "2":
                                cType = "已用完";
                                break;

                        }
                        return cType;
                    }
                },{
                    "targets":[11],
                    "render": function(data, type, row, meta) {
                        var inner = "";
                        if(makeEdit(menu,loginSucc.functionlist,"#op_give")){
                            inner += '<a href="javascript:;" id="op_give">赠送</a>'
                        }
                        if(makeEdit(menu,loginSucc.functionlist,"#op_edit")){
                            if(inner == ""){
                                inner += '<a href="javascript:;" id="op_edit">编辑</a>'
                            }else{
                                inner += ' | <a href="javascript:;" id="op_edit">编辑</a>'
                            }
                        }
                        if(inner == "") inner = "-";
                        return inner;
                    }
                }
            ],
            fnRowCallback: function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
                $('td:eq(1)', nRow).attr('style', 'text-align: center;');
            }
        });
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

var CoupEdit = function() {
    var handleRegister = function() {
        var validator = $('.register-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                couponname: {
                    required: true
                },
                type: {
                    required: true
                },
                amount: {
                    required: true,
                    number: true
                },
                usemark: {
                    required: true,
                    number: true
                },
                upfee: {
                    number: true
                },
                numbers: {
                    digits: true
                },
                status: {
                    required: true,
                }
            },

            messages: {
                couponname: {
                    required: "优惠券名称必须输入"
                },
                type: {
                    required: "优惠券类别必须输入"
                },
                amount: {
                    required: "抵用金额必须输入"
                },
                usemark: {
                    required: "所需积分必须输入"
                },
                status: {
                    required: "优惠券状态必须输入",
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
                if (element.closest('.input-icon').size() === 1) {
                    error.insertAfter(element.closest('.input-icon'));
                } else {
                    error.insertAfter(element);
                }
            },

            submitHandler: function(form) {
                form.submit();
            }
        });
        $('#register-btn').click(function() {
            btnDisable($('#register-btn'));
            if ($('.register-form').validate().form()) {
                var coup = $('.register-form').getFormData();
                if ($("input[name=edittype]").val() == COUPADD) {
                    coupAdd(coup);
                } else {
                    coupEdit(coup);
                }
            }
        });
        //新增角色
        $('#op_add').click(function() {
            validator.resetForm();
            $(".register-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("新增优惠券");
            $(":input",".register-form").not(":button,:reset,:submit,:radio").val("")
                .removeAttr("checked")
                .removeAttr("selected");
            $("input[name=edittype]").val(COUPADD);
            $('#edit_coup').modal('show');
        });
        //编辑优惠券
        $("#coup_table").on('click', '#op_edit', function (e) {
            e.preventDefault();
            validator.resetForm();
            $(".register-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("编辑优惠券");
            var exclude = [""];
            var row = $(this).parents('tr')[0];     //通过获取该td所在的tr，即td的父级元素，取出第一列序号元素
            var coupid = $("#coup_table").dataTable().fnGetData(row).id;
            var coup = new Object();
            for(var i=0; i < coupList.length; i++){
                if(coupid == coupList[i].id){
                    coup = coupList[i];
                }
            }
            var options = { jsonValue: coup, exclude:exclude, isDebug: false};
            $(".register-form").initForm(options);
            $("input[name=edittype]").val(COUPEDIT);
            $('#edit_coup').modal('show');
        });
    };

    return {
        init: function() {
            handleRegister();
        }
    };
}();

var CoupGive = function() {
    var handleRegister = function() {
        var validator = $('.give-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                phone: {
                    required: true,
                    mobile: true
                }
            },

            messages: {
                phone: {
                    required: "受赠者手机号码必须输入"
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
                if (element.closest('.input-icon').size() === 1) {
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
        jQuery.validator.addMethod("mobile", function(value, element) {
            var tel = /^1[3456789]\d{9}$/;
            return this.optional(element) || (tel.test(value));
        }, "请正确填写您的手机号码");

        $('#give-btn').click(function() {
            btnDisable($('#give-btn'));
            if ($('.give-form').validate().form()) {
                var coup = $('.give-form').getFormData();
                coupGive(coup);
            }
        });
        //赠送优惠券
        $("#coup_table").on('click', '#op_give', function (e) {
            e.preventDefault();
            validator.resetForm();
            var exclude = [""];
            var row = $(this).parents('tr')[0];     //通过获取该td所在的tr，即td的父级元素，取出第一列序号元素
            var coupid = $("#coup_table").dataTable().fnGetData(row).id;
            var coup = new Object();
            for(var i=0; i < coupList.length; i++){
                if(coupid == coupList[i].id){
                    coup = coupList[i];
                }
            }
            var options = { jsonValue: coup, exclude:exclude, isDebug: false};
            $(".give-form").initForm(options);
            $('#give_coup').modal('show');
        });
    };

    return {
        init: function() {
            handleRegister();
        }
    };
}();

var CoupDelete = function() {
    $('#op_del').click(function() {
        var len = $(".checkboxes:checked").length;
        if(len < 1){
            alertDialog("至少选中一项！");
        }else{
            var para = 1;
            confirmDialog("数据删除后将不可恢复，您确定要删除吗？", CoupDelete.deleteCoup, para)
        }
    });
    return{
        deleteCoup: function(){
            var couplist = {coupidlist:[]};
            $(".checkboxes:checked").parents("td").each(function () {
                var row = $(this).parents('tr')[0];     //通过获取该td所在的tr，即td的父级元素，取出第一列序号元素
                var coupid = $("#coup_table").dataTable().fnGetData(row).id;
                couplist.coupidlist.push(coupid);
            });
            coupDelete(couplist);
        }
    }
}();

function getCoupDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            coupList = res.couplist;
            tableDataSet(res.draw, res.totalcount, res.totalcount, res.couplist, callback);
        }else{
            tableDataSet(0, 0, 0, [], callback);
            alertDialog(result.retmsg);
        }
    }else{
        coupList = [
            {id:1,type:"0",couponname:"3元优惠券", amount:"3", usemark:"30", upfee:"10", numbers:"999", enddate:"-1"},
            {id:2,type:"1",couponname:"5元优惠券", amount:"5", usemark:"0", upfee:"10", numbers:"999", enddate:"-1"},
            {id:3,type:"2",couponname:"5元优惠券", amount:"5", usemark:"0", upfee:"10", numbers:"-1", enddate:"20200106"}
        ];
        tableDataSet(0, 3, 3, coupList, callback);
        alertDialog("优惠券获取失败！");
    }
}

function coupInfoEditEnd(flg, result, type){
    var res = "失败";
    var text = "";
    var alert = "";
    switch (type){
        case COUPADD:
            text = "新增";
            break;
        case COUPEDIT:
            text = "编辑";
            break;
        case COUPDELETE:
            text = "删除";
            break;
    }
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg;
        }
        if (result && result.retcode == SUCCESS) {
            res = "成功";
            CoupTable.init();
            $('#edit_coup').modal('hide');
        }
    }
    if(alert == "") alert = text + "优惠券" + res + "！";
    App.unblockUI('#lay-out');
    alertDialog(alert);
}

$("#coup_inquiry").on("click", function(){
    //优惠券查询
    CoupTable.init();
});

$("#coup_his_inquiry").on("click", function(e){
    //优惠券明细查询
    e.preventDefault();
    CoupHisTable.init();
});

//赠送优惠券
$("#coup_table").on('click', '#op_detail', function (e) {
    var row = $(this).parents('tr')[0];     //通过获取该td所在的tr，即td的父级元素，取出第一列序号元素
    var coupid = $("#coup_table").dataTable().fnGetData(row).id;
    var coup = {id: coupid};
    var exclude = [""];
    var options = { jsonValue: coup, exclude:exclude, isDebug: false};
    $(".detail-form").initForm(options);
    CoupHisTable.init();
    //$('#detail_coup').modal('show');
});

var CoupHisTable = function () {
    var initTable = function () {
        var table = $('#coup_his_table');
        pageLengthInit(table);
        table.dataTable({
            "language": TableLanguage,
            "bStateSave": false, // save datatable state(pagination, sort, etc) in cookie.
            "lengthMenu": TableLengthMenu,
            "destroy": true,
            "pageLength": PageLength,
            "serverSide": true,
            "pagingType": "bootstrap_extended",
            "processing": true,
            "searching": false,
            "ordering": false,
            "autoWidth": false,
            "ajax":function (data, callback, settings) {
                var formData = $(".detail-form").getFormData();
                var da = {
                    id: formData.id,
                    phone: formData.phone,
                    currentpage: (data.start / data.length) + 1,
                    pagesize: data.length == -1 ? "": data.length,
                    startindex: data.start,
                    draw: data.draw
                };
                coupHisDataGet(da, callback);
            },
            columns: [//返回的json数据在这里填充，注意一定要与上面的<th>数量对应，否则排版出现扭曲
                { "data": null},
                { "data": "phone" },
                { "data": "updtime" },
                { "data": "couponsource" },
                { "data": "couponstatus" }
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
                    "targets":[2],
                    "render": function(data, type, row, meta) {
                        return dateTimeFormat(data)
                    }
                },
                {
                    //优惠券来源
                    "targets": [3],
                    "data": null,
                    "render": function (data, type, row, meta) {
                        var cType;
                        switch (data) {
                            case "0":
                                cType = "系统赠送";
                                break;
                            case "1":
                                cType = "客服赠送";
                                break;
                            case "2":
                                cType = "积分兑换";
                                break;
                            case "3":
                                cType = "他人转赠";
                                break;

                        }
                        return cType;
                    }
                },
                {
                    //使用场合
                    "targets": [4],
                    "data": null,
                    "render": function (data, type, row, meta) {
                        var cType;
                        switch (data) {
                            case "0":
                                cType = "已获取";
                                break;
                            case "1":
                                cType = "已使用";
                                break;
                            case "2":
                                cType = "已转赠";
                                break;
                            case "9":
                                cType = "已过期";
                                break;

                        }
                        return cType;
                    }
                }
            ],
            fnRowCallback: function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
                $('td:eq(1)', nRow).attr('style', 'text-align: center;');
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

function getCoupHisDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            coupHisList = res.couphislist;
            tableDataSet(res.draw, res.totalcount, res.totalcount, res.couphislist, callback);
            $('#detail_coup').modal('show');
        }else{
            tableDataSet(0, 0, 0, [], callback);
            alertDialog(result.retmsg);
            $('#detail_coup').modal('hide');
        }
    }else{
        /*coupHisList = [
            {id:1,phone:"13111111111",updtime:"20200106123700", couponsource:"3", couponstatus:"9"}
        ];*/
        tableDataSet(0, 0, 0, [], callback);
        alertDialog("优惠券详情获取失败！");
        $('#detail_coup').modal('show');
    }
}

function coupGiveEnd(flg, result, type){
    var res = "失败";
    var alert = "";
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg;
        }
        if (result && result.retcode == SUCCESS) {
            res = "成功";
            $('#edit_coup').modal('hide');
        }
    }
    if(alert == "") alert = "赠送优惠券" + res + "！";
    App.unblockUI('#lay-out');
    alertDialog(alert);
}