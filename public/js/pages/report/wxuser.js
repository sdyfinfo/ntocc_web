/**
 * Created by Jianggy on 2019/12/04.
 */
var wxuserList = [];
if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        WXUserTable.init();
    });
}

var WXUserTable = function () {
    var initTable = function () {
        var table = $('#wxuser_table');
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
                    nickname: formData.nickname,
                    phonenumber: formData.phonenumber,
                    currentpage: (data.start / data.length) + 1,
                    pagesize: data.length == -1 ? "": data.length,
                    startindex: data.start,
                    draw: data.draw
                };
                wxuserDataGet(da, callback);
            },
            columns: [//返回的json数据在这里填充，注意一定要与上面的<th>数量对应，否则排版出现扭曲
                { "data": null},
                { "data": "nickname" },
                { "data": "avatarurl" },
                { "data": "phonenumber" },
                { "data": "mark" },
                { "data": "learncountry" },
                { "data": "major" },
                { "data": "email" },
                { "data": "ordernum" },
                { "data": "orderamount" }
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
                        return "<img src='" + data + "' style='width: 50px; height:50px'>";
                    }
                },{
                    "targets":[4],
                    "render": function(data, type, row, meta) {
                        return formatNumber(data);
                    }
                },{
                    "targets":[8],
                    "render": function(data, type, row, meta) {
                        return formatNumber(data);
                    }
                },{
                    "targets":[9],
                    "render": function(data, type, row, meta) {
                        return formatCurrency(data);
                    }
                }
            ],
            fnRowCallback: function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
                $('td', nRow).attr('style', 'vertical-align: middle; padding-left: 20px');
                $('td:eq(0), td:eq(2), td:eq(3)', nRow).attr('style', 'text-align: center; vertical-align: middle;');
                $('td:eq(4), td:eq(8), td:eq(9)', nRow).attr('style', 'text-align: right; vertical-align: middle;');
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


function getWXUserDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            wxuserList = res.wxuserlist;
            tableDataSet(res.draw, res.totalcount, res.totalcount, res.wxuserlist, callback);
        }else{
            tableDataSet(0, 0, 0, [], callback);
            alertDialog(result.retmsg);
        }
    }else{
        tableDataSet(0, 0, 0, [], callback);
        alertDialog("微信用户获取失败！");
    }
}

$("#wxuser_clear").on("click", function(){
    //用户查询
    WXUserTable.init();
});

$("#wxuser_inquiry").on("click", function(){
    //用户查询
    WXUserTable.init();
});
