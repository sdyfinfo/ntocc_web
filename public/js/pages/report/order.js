/**
 * Created by Administrator on 2019/12/04.
 */
var orderList = [];
if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        OrderTable.init();
        OrderEdit.init();
    });
}
//时间选择控件初始化
$("#starttime").datetimepicker({
    format: 'yyyy-mm-dd',
    language:'zh-CN',
    todayBtn: true,
    todayHighlight: true, //高亮‘今天’
    clearBtn: true,   //清除按钮
    autoclose: true,//选中之后自动隐藏日期选择框
    endDate : new Date(),
    minView: 'month',
    forceParse: 0
}).on('changeDate',function(e){

});

$("#endtime").datetimepicker({
    format: 'yyyy-mm-dd',
    language:'zh-CN',
    todayBtn: true,
    autoclose: true,//选中之后自动隐藏日期选择框
    todayHighlight: true, //高亮‘今天’
    clearBtn: true,   //清除按钮
    endDate : new Date(),
    minView: 'month',
    forceParse: 0
}).on('changeDate',function(e){

});

const dateOptions = {
    language: 'zh-CN',
    format: 'yyyy-mm-dd',
    minuteStep: 1,
    autoclose: true
};

$('#starttime').datetimepicker(dateOptions).on('show', function () {
    const endTime = $('#endtime').val();
    if (endTime !== '') {
        $(this).datetimepicker('setEndDate', endTime);
    } else {
        $(this).datetimepicker('setEndDate', null);
    }
});

$('#endtime').datetimepicker(dateOptions).on('show', function () {
    const startTime = $('#starttime').val();
    if (startTime !== '') {
        $(this).datetimepicker('setStartDate', startTime);
    } else {
        $(this).datetimepicker('setStartDate', null);
    }
});


var OrderTable = function () {
    var initTable = function () {
        var table = $('#order_table');
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
                    orderid: formData.orderid,
                    phone: formData.phone,
                    startdate: formData.starttime.replace(/-|:| /g, ""),
                    enddate: formData.endtime.replace(/-|:| /g, ""),
                    checktype: formData.selectChecktype,
                    status: formData.selectStatus,
                    currentpage: (data.start / data.length) + 1,
                    pagesize: data.length == -1 ? "": data.length,
                    startindex: data.start,
                    draw: data.draw
                };
                orderDataGet(da, callback);
            },
            columns: [//返回的json数据在这里填充，注意一定要与上面的<th>数量对应，否则排版出现扭曲
                { "data": null},
                { "data": "id", visible: false },
                { "data": "checktype" },
                { "data": "orderid" },
                { "data": "phonenumber" },
                { "data": "updtime" },
                { "data": "fullname" },
                { "data": "title" },
                { "data": "filename" },
                { "data": "wordcnt" },
                { "data": "status" },
                { "data": null },
                { "data": "repetrate" },
                { "data": null }
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
                    "render":function(data, type, row, meta){
                        var check = "";
                        switch (data) {
                            case "0":
                                check = "国际查重";
                                break;
                            case "1":
                                check = "UK查重";
                                break;
                            case "2":
                                check = "语法检测";
                                break;
                        }
                        return check;
                    }
                },{
                    "targets":[5],
                    "render": function(data, type, row, meta) {
                        return dateTimeFormat(data);
                    }
                }, {
                    "targets": [8],
                    "render": function (data, type, row, meta) {
                        return '<a href="' + row.originalurl + '" target="_blank">' + data + '</a>';
                    }
                }, {
                    "targets": [9],
                    "render": function (data, type, row, meta) {
                        return formatNumber(data);
                    }
                },{
                    "targets":[11],
                    "render": function(data, type, row, meta) {
                        if(data.status != "检测完成") return "-";
                        var text = '<a href="' + row.pdfreporturl + '" target="_blank">PDF报告</a>';
                        if(row.checktype !== "2"){
                            text += ' | <a href="' + row.htmlreporturl + '" target="_blank">HTML报告</a>'
                        }
                        return text;
                    }
                },{
                    "targets":[13],
                    "render": function(data, type, row, meta) {
                        return '<a href="javascript:;" id="op_upload">人工上传报告</a>';
                    }
                }
            ],
            fnRowCallback: function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
                $('td', nRow).attr('style', 'vertical-align: middle;');
                $('td:eq(0), td:eq(3), td:eq(4), td:eq(5)', nRow).attr('style', 'text-align: center; vertical-align: middle;');
                $('td:eq(8), td:eq(11)', nRow).attr('style', 'text-align: right; vertical-align: middle;');
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


var OrderEdit = function() {
    var handleOrder = function() {
        var validator = $('.order-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                repetrate: {
                    frequired: true,
                },
                pdfreporturl: {
                    required: true,
                }
                // htmlreporturl: {
                //     frequired: true,
                // }
            },

            messages: {
                repetrate: {
                    frequired: "重复率必须输入"
                },
                pdfreporturl: {
                    required: "PDF报告文件必须选择",
                }
                // htmlreporturl: {
                //     frequired: "HTML报告文件必须选择",
                // }
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
        jQuery.validator.addMethod("frequired", function(value, element) {
            if($("#checktype").val() !== "2"){
                return value.replace(/\s+/g, "") != "";
            }else{
                return true;
            }
        },"该字段必须输入");

        //上传报告
        $("#order_table").on('click', '#op_upload', function (e) {
            e.preventDefault();
            validator.resetForm();
            $(".order-form").find(".has-error").removeClass("has-error");
            var row = $(this).parents('tr')[0];     //通过获取该td所在的tr，即td的父级元素，取出第一列序号元素
            var orderid = $("#order_table").dataTable().fnGetData(row).orderid;
            var order = new Object();
            for(var i=0; i < orderList.length; i++){
                if(orderid == orderList[i].orderid){
                    order = orderList[i];
                }
            }

            if(order.status != '检测中' && order.status != '报告下载中' && order.status != '检测完成') {
                alertDialog("只有订单状态为检测中、报告下载中、检测完成的订单才能上传报告！");
                return;
            }

            if(order.checktype === "2"){
                $("#fullnamerow").hide();
                $("#lastnamerow").hide();
                $("#titlerow").hide();
                $("#repetraterow").hide();
                $("#htmlreporturlrow").hide();
            }else{
                $("#fullnamerow").show();
                $("#lastnamerow").show();
                $("#titlerow").show();
                $("#repetraterow").show();
                $("#htmlreporturlrow").show();
            }
            var exclude = ["htmlreporturl","pdfreporturl"];
            var options = { jsonValue: order, exclude:exclude, isDebug: false};
            $(".order-form").initForm(options);
            $("#htmlreporturl").val("");
            $("#pdfreporturl").val("");
            $('#upload_report').modal('show');
        });
        $('#order_modify').click(function() {
            btnDisable($('#order_modify'));
            if ($('.order-form').validate().form()) {
                //先上传文件
                var order = $('.order-form').getFormData();
                var formData = new FormData();
                var pdfFileInfo = $("#pdfreporturl").get(0).files[0];
                if(order.repetrate == "") {
                    formData.append('htmlreport', pdfFileInfo);
                } else {
                    var htmlFileInfo = $("#htmlreporturl").get(0).files[0];
                    formData.append('htmlreport', htmlFileInfo);
                }
                formData.append('pdfreport', pdfFileInfo);
                formData.append('orderid', order.orderid);
                formData.append('repetrate', order.repetrate);
                $.ajax({
                    type: 'POST',
                    url: webUrl + "order/upload",
                    data: formData,
                    dataType: 'json',
                    contentType: false,
                    processData: false,
                    success: function (result) {
                        if (result.retcode == "0000") {
                            OrderTable.init();
                            $('#upload_report').modal('hide');
                            alertDialog("上传报告文件成功！");
                        } else {
                            alertDialog("上传报告文件失败！" + result.retmsg);
                        }
                    },
                    error: function () {
                        alertDialog("上传报告文件失败！");
                    }
                });
            }
        })
    };

    return {
        init: function() {
            handleOrder();
        }
    };
}();

function getOrderDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            orderList = res.orderlist;
            tableDataSet(res.draw, res.totalcount, res.totalcount, res.orderlist, callback);
        }else{
            tableDataSet(0, 0, 0, [], callback);
            alertDialog(result.retmsg);
        }
    }else{
        tableDataSet(0, 0, 0, [], callback);
        alertDialog("订单获取失败！");
    }
}

function orderInfoEditEnd(flg, result, type){
    var res = "上传失败";
    var text = "";
    var alert = "";
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg;
        }
        if (result && result.retcode == SUCCESS) {
            res = "成功";
            OrderTable.init();
            $('#upload_report').modal('hide');
        }
    }
    if(alert == "") alert = text + "文章" + res + "！";
    App.unblockUI('#lay-out');
    alertDialog(alert);
}

$("#order_inquiry").on("click", function(){
    // 用户查询
    OrderTable.init();
});

$("#order_clear").on("click", function(){
    // 清空查询条件
    $(".inquiry-form")[0].reset();
    OrderTable.init();
});


