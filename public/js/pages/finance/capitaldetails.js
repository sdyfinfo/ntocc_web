/**
 * Created by haiyang on 2020/3/6.
 */

var capitalList = [];

if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        fun_power();
        //获取用户余额
        getUserBalance();
        //获取资金明细
        getCapitalDetail();
    });
}

//资金详细表格
var CapitalDetailsTable = function () {
    var initTable = function () {
        var table = $('#capital_table');
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
                var currentpage = (data.start / data.length) + 1;
                var pagesize = data.length == -1 ? "": data.length;
                var startindex = data.start;

                if(capitalList.length == 0){   //查询失败
                    tableDataSet(0, 0, 0, [], callback);
                }else{
                    var displayList = [];
                    for(var i = startindex; i < capitalList.length;i++ ){
                        if(displayList.length != pagesize){
                            displayList.push(capitalList[i]);
                        }
                    }
                    tableDataSet(data.draw, capitalList.length, capitalList.length, displayList, callback);
                }

            },
            columns: [//返回的json数据在这里填充，注意一定要与上面的<th>数量对应，否则排版出现扭曲
                { "data": null},
                { "data": "transtime"},
                { "data": "amount" },
                { "data": "transtype"},
                { "data": "drcr" },
                { "data": "transobj"}
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
                        if(data == undefined){
                            return "";
                        }
                        return dateTimeFormat(data);
                    }
                },
                {
                    "targets": [2],
                    "render": function (data, type, row, meta) {
                        return formatCurrency(data);
                    }
                },
                {
                    "targets": [3],
                    "render": function (data, type, row, meta) {
                        var text = "";
                        switch(data){
                            case "CR":
                                text = "支出";
                                break;
                            case "DR":
                                text = "转入";
                                break;
                        }
                        return text;
                    }
                },
                {
                    "targets": [4],
                    "render": function (data, type, row, meta) {
                        var text = "";
                        switch(data){
                            case "0":
                                text = "运费充值";
                                break;
                            case "1":
                                text = "运费支付";
                                break;
                            case "2":
                                text = "服务费支付";
                                break;
                        }
                        return text;
                    }
                }
            ],
            fnRowCallback: function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
                $('td:eq(0),td:eq(1)', nRow).attr('style', 'text-align: center;');
                $('td:eq(2)', nRow).attr('style', 'text-align: right;');
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

//获取资金明细
$("#capital_inquiry").click(function(){
    getCapitalDetail();
});

//获取资金明细
function getCapitalDetail(){
    var formData = $(".inquiry-form").getFormData();
    var starttime = "";
    var endtime = "";
    if(formData.starttime != ""){
        starttime = formData.starttime.replace(/-/g,'');
    }
    if(formData.endtime != ""){
        endtime = formData.endtime.replace(/-/g,'');
    }
    var da = {
        starttime:starttime,
        endtime:endtime,
        transtype:formData.transtype,
        drcr:formData.drcr

    };
    capitalDetailDataGet(da);
}

//获取资金明细返回结果
function getCapitalDetailEnd(flg,result){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            capitalList = eval("("+res.list+")");
            //资金详细表格初始化
            CapitalDetailsTable.init();
        }else{
            //资金详细表格初始化
            CapitalDetailsTable.init();
            alertDialog(result.retmsg);
        }
    }else{
        //资金详细表格初始化
        CapitalDetailsTable.init();
        alertDialog("资金明细信息获取失败！");
    }
}

//获取账户余额返回结果
function getUserBalanceEnd(flg,result){
    var res = "失败";
    var text = "获取账户余额";
    var alert = "";
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg || "";
            if(alert == "") alert = text + res + "！";
            App.unblockUI('#lay-out');
            alertDialog(alert);
        }
        if (result && result.retcode == SUCCESS) {
            App.unblockUI('#lay-out');
            $("#balance").html(formatCurrency(result.response.list.data.balance));
        }
    }else{
        if(alert == "") alert = text + res + "！";
        App.unblockUI('#lay-out');
        alertDialog(alert);
    }

}