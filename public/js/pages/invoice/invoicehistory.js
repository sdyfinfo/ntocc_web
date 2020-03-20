/**
 * Created by Administrator on 2020/3/17.
 */

var invoiceTrialList,billDetailList,widlist = [];

if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        fun_power();
        //开票审核信息
        InvoiceTrialTable.init();
    });
}

//开票信息表格
var InvoiceTrialTable = function () {
    var initTable = function () {
        var table = $('#invoice_table');
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
                //开票日期
                var start_time = "";
                var end_time = "";
                if(formData.start_time != ""){
                    start_time = formData.start_time.replace(/\//g,'')+"000000";
                }
                if(formData.end_time != ""){
                    end_time = formData.end_time.replace(/\//g,'')+"000000";
                }
                var audit_status = $("#audit_status").val();
                var da = {
                    start_time:start_time,
                    end_time:end_time,
                    audit_status:audit_status,
                    rise_name:formData.rise_name,
                    currentpage: (data.start / data.length) + 1,
                    pagesize: data.length == -1 ? "": data.length,
                    startindex: data.start,
                    draw: data.draw
                };
                invoiceTrialDataGet(da, callback);
            },
            columns: [//返回的json数据在这里填充，注意一定要与上面的<th>数量对应，否则排版出现扭曲
                { "data": null},
                { "data": null},
                { "data": "oid",visible: false },  //发票id
                { "data": "rise_name"},     //发票抬头
                { "data": "addTime" },    //申请时间
                { "data": "freight" },     //司机运费
                { "data": "serviceFee"},   //服务费
                { "data": "invoice" },     //开票总额
                { "data": "audit_status"},     //开票状态
                { "data": null},
                { "data": "waybillid",visible: false}
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
                },{
                    "targets": [4],
                    "render": function (data, type, row, meta) {
                        if(data == undefined){
                            return "";
                        }
                        return dateTimeFormat(data);
                    }
                },{
                    "targets": [5],
                    "render": function (data, type, row, meta) {
                        return formatCurrency(data);
                    }
                },{
                    "targets": [6],
                    "render": function (data, type, row, meta) {
                        return formatCurrency(data);
                    }
                },{
                    "targets": [7],
                    "render": function (data, type, row, meta) {
                        return formatCurrency(data);
                    }
                },{
                    "targets": [8],
                    "render": function (data, type, row, meta) {
                        var text = "";
                        switch(data){
                            case "0":
                                text = "审核中";
                                break;
                            case "1":
                                text = "审核通过";
                                break;
                            case "2":
                                text = "开票中";
                                break;
                            case "3":
                                text = "开票完成";
                                break;
                            case "4":
                                text = "审核驳回";
                                break;
                        }
                        return text;
                    }
                },{
                    "targets": [9],
                    "render": function (data, type, row, meta) {
                        return '<a href="javascript:;" id="invoice_Check">查看</a>';
                    }
                }
            ],
            fnRowCallback: function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
                $('td:eq(0),td:eq(1),td:eq(3),td:eq(8)', nRow).attr('style', 'text-align: center;');
                $('td:eq(4),td:eq(5),td:eq(6)', nRow).attr('style', 'text-align: right;');
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
            var checklength = $("#invoice_table").find(".checkboxes:checked").length;
            if(checklength == invoiceTrialList.length){
                $("#invoice_table").find(".group-checkable").prop("checked",true);
            }else{
                $("#invoice_table").find(".group-checkable").prop("checked",false);
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

//开票审核查询
$("#invoiceHis_inquiry").click(function(){
    InvoiceTrialTable.init();
});

//查看开票运单明细
$("#invoice_table").on('click',"#invoice_Check",function(){
    var row = $(this).parents('tr')[0];
    var oid = $("#invoice_table").dataTable().fnGetData(row).oid;
    var data = {};
    for(var i in invoiceTrialList){
        if(oid == invoiceTrialList[i].oid){
            data.rise_name = invoiceTrialList[i].rise_name
            data.addTime = dateTimeFormat(invoiceTrialList[i].addTime);
            data.freight = get_thousand_num(invoiceTrialList[i].freight);
            data.serviceFee = get_thousand_num(invoiceTrialList[i].serviceFee);
            data.invoice = get_thousand_num(invoiceTrialList[i].invoice);
            widlist = invoiceTrialList[i].waybillid.split(",");
        }
    }
    var exclude = [];
    var options = { jsonValue: data, exclude:exclude,isDebug: false};
    $(".trialCheck-form").initForm(options);

    trialCheckTable.init();
    $("#check_detail").modal('show');
});

//开票运单明细表
var trialCheckTable = function (){
    var initTable = function (){
        var table = $('#billDetail_table');
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
            "bAutoWidth": false,
            "ajax":function (data, callback, settings) {
                var da = {
                    widlist:widlist,
                    currentpage: (data.start / data.length) + 1,
                    pagesize: data.length == -1 ? "": data.length,
                    startindex: data.start,
                    draw: data.draw
                };
                billDetailGet(da, callback);
            },
            columns: [//返回的json数据在这里填充，注意一定要与上面的<th>数量对应，否则排版出现扭曲
                { "data": null},
                { "data": "project_name"},     //项目
                { "data": "linename" },
                { "data": "wid"},  //运单描述
                { "data": "name" },    //司机
                { "data": "plate_number"},     //车牌号
                { "data": "freight"},
                { "data": "serviceFee"}
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
                    "targets": [3],
                    "render": function (data, type, row, meta) {
                        //显示运单号，发货到卸货地址
                        for(var i in billDetailList){
                            if(data == billDetailList[i].wid){
                                return billDetailList[i].wabill_numbers+'<br>'+
                                    billDetailList[i].loading_place+'  到  '+billDetailList[i].unloading_place;
                            }
                        }
                    }
                },{
                    "targets": [6],
                    "render": function (data, type, row, meta) {
                        if(data == undefined){
                            return "";
                        }
                        return formatCurrency(data);
                    }
                },{
                    "targets": [7],
                    "render": function (data, type, row, meta) {
                        if(data == undefined){
                            return "";
                        }
                        return formatCurrency(data);
                    }
                }
            ],
            fnRowCallback: function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
                $('td:eq(0),td:eq(5)', nRow).attr('style', 'text-align: center;');
                $('td:eq(6),td:eq(7)', nRow).attr('style', 'text-align: right;');
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

//开票运单信息获取结果返回
function getInvoiceTrialEnd(flg,result,callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            invoiceTrialList = res.list;
            tableDataSet(res.draw, res.totalcount, res.totalcount, invoiceTrialList, callback);
        }else{
            tableDataSet(0, 0, 0, [], callback);
            alertDialog("开票审核信息获取失败！");
        }
    }else{
        tableDataSet(0, 0, 0, [], callback);
        alertDialog("开票审核信息获取失败！");
    }
}

//关联运单明细查询
function getBillDetailEnd(flg,result,callback){
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            billDetailList = res.list;
            tableDataSet(res.draw, res.totalcount, res.totalcount, billDetailList, callback);
        }else{
            tableDataSet(0, 0, 0, [], callback);
            alertDialog("开票联动运单明细信息获取失败！");
        }
    }else{
        tableDataSet(0, 0, 0, [], callback);
        alertDialog("开票联动运单明细信息获取失败！");
    }
}