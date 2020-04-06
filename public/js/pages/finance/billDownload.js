/**
 * Created by Administrator on 2020/4/6.
 */

var organList = [];
var billList = [];

if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        fun_power();
        //根据用户判断否显示所属机构
        organDisplayCheck();
        //获取机构
        organDataGet();
        //运单操作
        BillTable.init();
    });
}

//账单表格
var BillTable = function () {
    var initTable = function () {
        var table = $('#bill_table');
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
            "bAutoWidth": true,
            "scrollY":     ($(window).height())*0.7,
            "deferRender":    true,
            "scrollX":        true,
            "scrollCollapse": true,
            "ajax":function (data, callback, settings) {
                var formData = $(".inquiry-form").getFormData();
                var organname = $("#organids").val() || "";
                var start_time = formData.start_time.replace(/\//g,'');
                var end_time = formData.end_time.replace(/\//g,'');
                var da = {
                    start_time:start_time,
                    end_time:end_time,
                    skr:formData.skr,
                    cph:formData.cph,
                    organids:$("#organlist").find("option[value='"+organname+"']").attr("data-organid") || "",
                    currentpage: (data.start / data.length) + 1,
                    pagesize: data.length == -1 ? "": data.length,
                    startindex: data.start,
                    draw: data.draw
                };
                billDownDataGet(da, callback);
            },
            "initComplete": function(settings, json) {
                //根据用户判断否显示所属机构
                organDisplayCheck();
            },
            columns: [//返回的json数据在这里填充，注意一定要与上面的<th>数量对应，否则排版出现扭曲
                { "data": null},
                { "data": "wid",visible: false },
                { "data": "organname",sClass:"organ-display"},
                { "data": "zhdz"},
                { "data": "xhdz" },
                { "data": "zfsj"},
                { "data": "cph" },
                { "data": "hwmc" },
                { "data": "skr"},
                { "data": "yf"},
                { "data": "fwf"}
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
                    "targets": [9],
                    "render": function (data, type, row, meta) {
                        if(data == undefined){
                            return "";
                        }
                        return formatCurrency(data);
                    }
                },{
                    "targets": [10],
                    "render": function (data, type, row, meta) {
                        if(data == undefined){
                            return "";
                        }
                        return formatCurrency(data);
                    }
                }
            ],
            fnRowCallback: function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
                $('td:eq(0),td:eq(4),td:eq(5)', nRow).attr('style', 'text-align: center;');
                $('td:eq(8),td:eq(9)', nRow).attr('style', 'text-align: right;');
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

//运单查询
$("#billdown_inquiry").click(function(){
    BillTable.init();
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

$("#bill_export").click(function(){
    var formData = $(".inquiry-form").getFormData();
    var organname = $("#organids").val() || "";
    var start_time = formData.start_time.replace(/-/g,'');
    var end_time = formData.end_time.replace(/-/g,'');
    var data = {
        start_time:start_time,
        end_time:end_time,
        skr:formData.skr,
        cph:formData.cph,
        organids:$("#organlist").find("option[value='"+organname+"']").attr("data-organid") || ""
    };
    $("#loading_edit").modal("show");
    billDownLoad(data);
});

//账单查询返回结果
function getBillEnd(flg,result,callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            billList = res.list;
            tableDataSet(res.draw, res.totalcount, res.totalcount, billList, callback);
        }else{
            tableDataSet(0, 0, 0, [], callback);
            alertDialog("账单信息获取失败！");
        }
    }else{
        tableDataSet(0, 0, 0, [], callback);
        alertDialog("账单信息获取失败！");
    }
}

//账单导出结果返回
function billDownLoadEnd(flg, obj){
    $("#loading_edit").modal("hide");
    App.unblockUI('#lay-out');
    var name = "对账单.xlsx";
    if(flg){
        var blob = obj.response;
        var reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = function (e) {
            var a = document.createElement('a');
            a.download = name;
            a.href = e.target.result;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }else{
        alertDialog("文件导出失败！");
    }
}

//获取机构结果返回
function getOrganDataEnd(flg, result){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            organList = res.list;
            for(var i in organList){
                if(organList[i].organlist == undefined){
                    $("#organlist").append('<option data-organid = "'+organList[i].organid+'" value="'+organList[i].organname+'"></option>');
                }
            }
        }else{
            alertDialog("机构信息获取失败！");
        }
    }else{
        alertDialog("机构信息获取失败！");
    }
}