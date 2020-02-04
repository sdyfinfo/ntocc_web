/**
 * Created by Jianggy on 2019/12/04.
 */
var suggestList = [];
if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        SuggestTable.init();
        SuggestEdit.init();
    });
}
//时间选择控件初始化
$("#starttime").datetimepicker({
    format: 'yyyy-mm-dd hh:ii',
    language:'zh-CN',
    todayBtn: 'linked',
    todayHighlight:true, //高亮‘今天’
    //clearBtn:true,   //清除按钮
    autoclose: true,//选中之后自动隐藏日期选择框
    endDate : new Date()
}).on('changeDate',function(e){

});

$("#endtime").datetimepicker({
    format: 'yyyy-mm-dd hh:ii',
    language:'zh-CN',
    todayBtn: 'linked',
    autoclose: true,//选中之后自动隐藏日期选择框
    todayHighlight:true, //高亮‘今天’
    //clearBtn:true,   //清除按钮
    endDate : new Date()
}).on('changeDate',function(e){

});

const dateOptions = {
    language: 'zh-CN',
    format: 'yyyy-mm-dd HH:ii',
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
var SuggestTable = function () {
    var initTable = function () {
        var table = $('#suggest_table');
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
                    phone: formData.phone,
                    starttime: formData.starttime.replace(/-|:| /g, ""),
                    endtime: formData.endtime.replace(/-|:| /g, ""),
                    currentpage: (data.start / data.length) + 1,
                    pagesize: data.length == -1 ? "": data.length,
                    startindex: data.start,
                    draw: data.draw
                };
                suggestDataGet(da, callback);
            },
            columns: [//返回的json数据在这里填充，注意一定要与上面的<th>数量对应，否则排版出现扭曲
                { "data": null},
                { "data": "phone" },
                { "data": "updtime" },
                { "data": "content" },
                { "data": "handle" },
                { "data": "status" },
                { "data": null },
                { "data": "id", visible: false }
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
                        return dateTimeFormat(data);
                    }
                },
                {
                    "targets":[3],
                    "render":function(data, type, row, meta){
                        return "<div class='toLong'>" + data + "</div>";
                    }
                },
                {
                    "targets":[4],
                    "render":function(data, type, row, meta){
                        return "<div class='toLong'>" + data + "</div>";
                    }
                },{
                    "targets":[5],
                    "render":function(data, type, row, meta){
                        var status = "未处理";
                        data === "1" ? status = "已处理" :  status = "未处理";
                        return status;
                    }
                },{
                    "targets":[6],
                    "render": function(data, type, row, meta) {
                        if(!makeEdit(menu,loginSucc.functionlist,"#op_edit")) return '-';
                        return '<a href="javascript:;" id="op_edit">编辑</a>'
                    }
                }
            ],
            fnRowCallback: function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
                $('td', nRow).attr('style', 'vertical-align: middle; padding-left: 20px');
                $('td:eq(0), td:eq(2)', nRow).attr('style', 'text-align: center; vertical-align: middle;');
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


//新增编辑系统控件初始化
var SuggestEdit = function() {
    var handleRegister = function() {
        var validator = $('.register-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                status: {
                    required: true,
                },
                handle: {
                    frequired: true
                }
            },
            messages: {
                status: {
                    required: "状态必须输入"
                },
                handle: {
                    frequired: "处理方式必须输入"
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
        jQuery.validator.addMethod("frequired", function(value, element) {
            if($("#status").val() !== "0"){
                return value.replace(/\s+/g, "") != "";
            }else{
                return true;
            }
        },"该字段必须输入");
        //点击确定按钮
        $('#register-btn').click(function() {
            btnDisable($('#register-btn'));
            if ($('.register-form').validate().form()) {
                var suggest = $('.register-form').getFormData();
                suggestEdit(suggest);
            }
        });
        //编辑参数
        $('#suggest_table').on('click', '#op_edit', function (e) {
            e.preventDefault();
            //清除校验错误信息
            validator.resetForm();
            $(".register-form").find(".has-error").removeClass("has-error");
            var exclude = [];
            var row = $(this).parents('tr')[0];
            var id = $("#suggest_table").dataTable().fnGetData(row).id;
            var regulate = new Object();
            for(var i=0; i < suggestList.length; i++){
                if(id == suggestList[i].id){
                    regulate = suggestList[i];
                }
            }
            var options = { jsonValue: regulate, exclude:exclude,isDebug: false};
            $(".register-form").initForm(options);
            $('#edit_suggest').modal('show');
        });
    };
    return {
        init: function() {
            handleRegister();
        }
    };
}();

function getSuggestDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            suggestList = res.suggestlist;
            tableDataSet(res.draw, res.totalcount, res.totalcount, res.suggestlist, callback);
        }else{
            tableDataSet(0, 0, 0, [], callback);
            alertDialog(result.retmsg);
        }
    }else{
        tableDataSet(0, 0, 0, [], callback);
        alertDialog("投诉建议获取失败！");
    }
}

function suggestInfoEditEnd(flg, result, type){
    var res = "失败";
    var text = "处理";
    var alert = "";
    if(flg){
        if(result && result.retcode !== SUCCESS){
            alert = result.retmsg;
        }
        if (result && result.retcode === SUCCESS) {
            res = "成功";
            SuggestTable.init();
            $('#edit_suggest').modal('hide');
        }
    }
    if(alert == "") alert = text + "投诉建议" + res + "！";
    App.unblockUI('#lay-out');
    alertDialog(alert);
}

$("#suggest_inquiry").on("click", function(){
    //用户查询
    SuggestTable.init();
});
