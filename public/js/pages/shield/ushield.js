/**
 * Created by Lenovo on 2020/2/14.
 */

var ushList = [];

if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function () {
        //fun_power();
        //收款人列表
        ushTable.init();
        //
       ushEdit.init();
       //获取发货人信息
       cgneeDataGet();
    })
}


//收货人表格
var ushTable = function () {
    var initTable = function () {
        var table = $('#payee_table');
        pageLengthInit(table);
        table.dataTable({
            "language": TableLanguage,
            "bStateSave": false,
            "lengthMenu": TableLengthMenu,
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
                var da = {
                    startdate: formData.startdate,
                    enddate:formData.enddate,
                    unumber:formData.unumber,
                    shieid: formData.shieid,
                    currentpage: (data.start / data.length) + 1,
                    pagesize: data.length == -1 ? "": data.length,
                    startindex: data.start,
                    draw: data.draw
                };
                ushieldGet(da, callback);
            },
            columns: [//返回的json数据在这里填充，注意一定要与上面的<th>数量对应，否则排版出现扭曲
                { "data": null},
                { "data": null},
                { "data": "shieid",visible: false},
                { "data": "unumber"},
                { "data": "secret_key"},
                { "data": "check"},
                { "data": "status"},
                { "data": "consignee"},
                { "data": "updatetime"},
                { "data": null}
            ],
            columnDefs: [
                {
                    "targets": [1],
                    "render": function (data, type, row, meta) {
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
                    "targets":[5],
                    "render":function (data, type, row, meta) {
                        var check = "是";
                        if(data == "0"){
                            check = "否";
                        }
                        return check;
                        //return ushFormat(data);
                    }
                },
                {
                    "targets":[6],
                    "render":function (data, type, row, meta) {
                        var status = "已绑定";
                        if(data == "0"){
                            status = "未绑定";
                        }
                        return status;
                    }
                },
                {
                    "targets":[8],
                    "render": function (data, type, row ,meta) {
                        return dateTimeFormat(data);
                    }
                },
                {
                    "targets": [9],
                    "render": function (data, type, row, meta) {
                        /*var edit = "";
                         if(!window.parent.makeEdit(menu,loginSucc.functionlist,"#op_edit")){
                         edit = '-';
                         }else{
                         edit = '<a href="javascript:;" id="op_edit">编辑</a>';
                         }
                         return edit;*/
                        //if(!window.parent.makeEdit(menu,loginSucc.functionlist,"#op_edit")) return '-';
                        return '<a href="javascript:;" id="op_edit">编辑</a>'
                    }
                }
            ],
            fnRowCallback: function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
                $('td:eq(0),td:eq(1),td:eq(2),td:eq(3),td:eq(4),td:eq(5),td:eq(6),td:eq(7)', nRow).attr('style', 'text-align: center;');
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



var ushEdit = function(){
    var handleRegister = function() {
        var validator = $('.register-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                unumber:{
                    required: true
                },
                secret_key:{
                    required: true
                },
                consigneeid:{
                    required: true
                }
            },

            messages: {
                unumber:{
                    required:"请输入U盾编号"


                },
                secret_key:{
                    required: "请输入U盾秘钥"
                },
                consigneeid:{
                    required: "请选择关联发货人"
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
        //点击确定按钮
        $('#register-btn').click(function() {
            btnDisable($('#register-btn'));
            if ($('.register-form').validate().form()) {
                var ush = $('.register-form').getFormData();
                ush.consignee = $("#consigneeid").find("option:selected").text();
                ush.unumber = $("input[name=unumber]").val();
                ush.secret_key = $("input[name=secret_key]").val();
                if($("input[name=edittype]").val() == USHADD){
                    ushieldAdd(ush);
                }else {
                    var data;
                    for(var i = 0; i < ushList.length; i++) {
                        if(ush.payid == ushList[i].shieid){
                            data = ushList[i];
                        }
                    }
                    ushieldEdit(ush,USHEDIT);
                }
            }
        });

        //新增项目
        $('#op_add').click(function() {
            //清除校验错误信息
            validator.resetForm();
            $(".register-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("新增项目");
            $(":input",".register-form").not(":button,:reset,:submit,:radio,:input[name=birthday],#evaluationneed").val("")
                .removeAttr("checked")
                .removeAttr("selected");
            $(".register-form").find("input[name=shieid]").attr("readonly", false);
            $("input[name=edittype]").val(USHADD);
            $('#edit_ush').modal('show');
        });
        //编辑项目
        $('#ush_table').on('click', '#op_edit', function (e) {
            e.preventDefault();
            //清除校验错误信息
            validator.resetForm();
            $(".register-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("编辑项目");
            var exclude = [];
            var row = $(this).parents('tr')[0];
            var shieid = $("#ush_table").dataTable().fnGetData(row).shieid;
            var ushield = new Object();
            for(var i=0; i < ushList.length; i++){
                if(shieid.shieid == ushList[i].shieid){
                    ushield = ushList[i];
                }
            }
            var options = { jsonValue: ushield, exclude:exclude,isDebug: false};
            $(".register-form").initForm(options);
            $("input[name=edittype]").val(USHEDIT);
            $('#edit_ush').modal('show');
        });
    };
    return {
        init: function() {
            handleRegister();
        }
    };
}();



//查询按钮
$("#us_inquiry").on("click",function(){
    ushTable.init();
})


//返回U盾管理结果
function getushieldDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            ushList = res.shielist;
            tableDataSet(res.draw, res.totalcount, res.totalcount, res.shielist, callback);
        }else{
            tableDataSet(0, 0, 0, [], callback);
            alertDialog("开户行信息获取失败！");
        }
    }else{
        tableDataSet(0, 0, 0, [], callback);
        alertDialog("开户行信息获取失败！");
    }
}

//获取发货人信息
function getcgneeEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            conList = res.conlist;
            for(var i = 0; i < conList.length; i++){
                $("#consigneeid").append("<option value='"+conList[i].conid+"'>" + conList[i].consignor +"</option>");
            }
        }else{
            alertDialog("关联发货人信息获取失败！");
        }
    }else{
        alertDialog("关联发货人信息获取失败！");
    }
}

function getushEditEnd(flg, result, type){
    var res = "失败";
    var text = "";
    var alert = "";
    switch (type){
        case USHADD:
            text = "新增";
            break;
        case USHEDIT:
            text = "编辑";
            break;
        case USHDELETE:
            text = "删除";
            break;
        case USHPLOAD:
            text = "导入";
            break;
    }
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg;
        }
        if (result && result.retcode == SUCCESS) {
            res = "成功";
            ushTable.init();
            $('#edit_ush').modal('hide');
            $('#ush_upload').modal('hide');
        }
    }
    if(alert == ""){
        if(type == USHPLOAD){
            alert ="U盾信息"+ text + res + "！";
        }else{
            alert = text + "U盾信息" + res + "！";
        }
    }
    App.unblockUI('#lay-out');
    alertDialog(alert);
}

//删除
var UshDelete = function() {
    $('#op_del').click(function() {
        var len = $(".checkboxes:checked").length;
        if(len < 1){
            alertDialog("至少选中一项！");
        }else{
            confirmDialog("数据删除后将不可恢复，您确定要删除吗？", UshDelete.deleteush)
        }
    });
    return{
        deleteush: function(){
            var ush = {shieidlist:[]};
            $(".checkboxes:checked").parents("td").each(function () {
                var row = $(this).parents('tr')[0];
                ush.shieidlist.push($("#ush_table").dataTable().fnGetData(row).shieid);
            });
            ushieldDelete(ush);
        }
    }
}();

//导入U盾
$("#us_import").on("click",function(){
    $(".pay_upload").find("input[type=file]").value = "";
    $("#upload_name").hide();
    $("#ush_upload").modal('show');
});

//U盾点击上传
$("#ush_file").change(function(){
    var img = $(this).siblings("label").find("img");
    if(this.files[0]){
        //显示上传文件名
        $("#upload_name").show();
        $("#upload_name").html("文件名："+this.files[0].name+"   文件大小："+((Number(this.files[0].size))/1024).toFixed(1)+"KB");
        var formData = new FormData();
        formData.append("file",this.files[0]);
        var userid = {
            "userid":loginSucc.userid
        }
        var data = sendMessageEdit(DEFAULT,userid);
        formData.append("body",new Blob([data],{type:"application/json"}));
        payeeUpload(formData);
    }else{
        $("#upload_name").html("");
    }
});


//U盾文件拖拽上传
function allowDrop(ev) {
    //阻止浏览器默认打开文件的操作
    ev.preventDefault();
};
function drop(ev) {
    ev.preventDefault();
    var files = ev.dataTransfer.files;
    var len = files.length;
    if(len!=0){
        var filesName=files[0].name;
        var extStart=filesName.lastIndexOf(".");
        var ext=filesName.substring(extStart,filesName.length).toUpperCase();
        if(ext ==".xlsx" || ext ==".XLSX"){ //判断是否是需要的问件类型
            //显示上传文件名
            $("#upload_name").show();
            $("#upload_name").html("文件名："+filesName+"   文件大小："+((Number(files[0].size))/1024).toFixed(1)+"KB");
            var formData = new FormData();
            formData.append("file",files[0]);
            var userid = {
                "userid":loginSucc.userid
            };
            var data = sendMessageEdit(DEFAULT,userid);
            formData.append("body",new Blob([data],{type:"application/json"}));
            ushieldUpload(formData);
        }else{
            alertDialog("请选择.xlsx类型的文件上传！");
            return false;
        }
    }else{
        $("#upload_name").html("");
    }
};
