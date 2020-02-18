/**
 * Created by Lenovo on 2020/2/13.
 */

var payeeList = [];
if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function () {
        //fun_power();
        //收款人列表
        PayeeTable.init();
        //
        payeeEdit.init();
        //获取开户银行信息
        bankNameDataGet();
    })
}


//收货人表格
var PayeeTable = function () {
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
                    payname: formData.payname,
                    banknumber:formData.banknumber,
                    bankid:formData.bankid,
                    currentpage: (data.start / data.length) + 1,
                    pagesize: data.length == -1 ? "": data.length,
                    startindex: data.start,
                    draw: data.draw
                };
                PDataGet(da, callback);
            },
            columns: [//返回的json数据在这里填充，注意一定要与上面的<th>数量对应，否则排版出现扭曲
                { "data": null},
                { "data": null},
                { "data": "payid",visible: false },
                { "data": "bankid",visible: false },
                { "data": "payname"},
                { "data": "idcard" },
                { "data": "payphone" },
                { "data": "bank" },
                { "data": "bankname"},
                { "data": "state"},
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
                    "targets":[9],
                    "render":function (data, type, row, meta) {
                        return statusFormat(data);
                    }
                },
                {
                    "targets":[10],
                    "render": function (data, type, row ,meta) {
                        return dateTimeFormat(data);
                    }
                },
                {
                    "targets": [11],
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
                $('td:eq(0),td:eq(1)', nRow).attr('style', 'text-align: center;');
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



var payeeEdit = function(){
    var handleRegister = function() {
        var validator = $('.register-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                payname:{
                    required: true
                },
                idcard:{
                    required: true
                },
                addresseeTel:{
                    required: true
                },
                payphone:{
                    required: true
                },
                bank:{
                    required: true
                },
                bankname:{
                    required: true
                }

            },

            messages: {
                payname:{
                    required: "请输入银行开户户名"
                },
                idcard:{
                    required: "请输入身份证号"
                },
                payphone:{
                    required: "请输入收款人手机号"
                },
                bank:{
                    required: "请输入银行卡号"
                },
                bankname:{
                    required: "请选择开户行"
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
        jQuery.validator.addMethod("payphone", function(value, element) {
            var tel = /^1[3456789]\d{9}$/;
            return this.optional(element) || (tel.test(value));
        }, "请正确填写您的联系电话");

        jQuery.validator.addMethod("bank", function(value, element) {
            var reg = /^([1-9]{1})(\d{14}|\d{18})$/;
            return this.optional(element) || (reg.test(value));
        }, "请正确填写您的银行卡号");

        jQuery.validator.addMethod("idcard", function(value, element) {
            var ard =  /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}$)/;
            return this.optional(element) || (ard.test(value));
        }, "请正确填写您的身份证号");

        //点击确定按钮
        $('#register-btn').click(function() {
            btnDisable($('#register-btn'));
            if ($('.register-form').validate().form()) {
                var pay = $('.register-form').getFormData();
                pay.bankname = $("#bankid").find("option:selected").text();
                if($("input[name=edittype]").val() == PAYEEADD){
                    payeeAdd(pay);
                }else {
                    var data;
                    for(var i = 0; i < payeeList.length; i++) {
                        if(pay.payid == payeeList[i].payid){
                            data = payeeList[i];
                        }
                    }
                    payeEdit(pay,PAYEEEDIT);
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
            $(".register-form").find("input[name=payid]").attr("readonly", false);
            $("input[name=edittype]").val(PAYEEADD);
            $('#edit_pay').modal('show');
        });
        //编辑项目
        $('#payee_table').on('click', '#op_edit', function (e) {
            e.preventDefault();
            //清除校验错误信息
            validator.resetForm();
            $(".register-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("编辑项目");
            var exclude = [];
            var row = $(this).parents('tr')[0];
            var payid = $("#payee_table").dataTable().fnGetData(row).payid;
            var payee = new Object();
            for(var i=0; i < payeeList.length; i++){
                if(payid == payeeList[i].payid){
                    payee = payeeList[i];
                }
            }
            var options = { jsonValue: payee, exclude:exclude,isDebug: false};
            $(".register-form").initForm(options);
            $("input[name=edittype]").val(PAYEEEDIT);
            $('#edit_pay').modal('show');
        });
    };
    return {
        init: function() {
            handleRegister();
        }
    };
}();



// 返回查询结果
function getPDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            payeeList = res.payeelist;
            tableDataSet(res.draw, res.totalcount, res.totalcount, res.payeelist, callback);
        }else{
            tableDataSet(0, 0, 0, [], callback);
            alertDialog("司机信息获取失败！");
        }
    }else{
        tableDataSet(0, 0, 0, [], callback);
        alertDialog("司机信息获取失败！");
    }
}

//查询按钮
$("#pay_inquiry").on("click",function(){
    PayeeTable.init();
})

//返回开户行结果
function getbankNameDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            bankList = res.banklist;
            for(var i = 0; i < bankList.length; i++){
                $("#bankid").append("<option value='"+bankList[i].bankid+"'>" + bankList[i].bankname +"</option>");
            }
        }else{
            alertDialog("开户行信息获取失败！");
        }
    }else{
        alertDialog("开户行信息获取失败！");
    }
}


//收款状态显示
function statusFormat(data){
    var content;
    switch (data){
        case "0":  //启用
            content =
                "<div class='switch'>"+
                "<div class='onoffswitch'>"+
                "<input type='checkbox' checked='' class='onoffswitch-checkbox'>"+
                "<label class='onoffswitch-label' data-status='1' id='statusChange'>"+
                "<span class='inner on_inner' style='float: left'>启用</span>"+
                "<span class='switch' style='float: right'></span>"+
                "</label>"+
                "</div>"+
                "</div>";
            break;
        case "1":  //启用
            content =
                "<div class='switch'>"+
                "<div class='onoffswitch'>"+
                "<input type='checkbox' checked='' class='onoffswitch-checkbox'>"+
                "<label class='onoffswitch-label' style='border: 2px solid #ff0000;' data-status='0' id='statusChange'>"+
                "<span class='inner off_inner' style='float: right'>停用</span>"+
                "<span class='switch' style='float: left'></span>"+
                "</label>"+
                "</div>"+
                "</div>";
            break;
    }
    return content;
}


//收款人状态更改
var StatusChange = function(){
    var payee = {};
    $("#payee_table").on('click','#statusChange',function(){
        //获取id和status
        var row = $(this).parents('tr')[0];
        var payid = $("#payee_table").dataTable().fnGetData(row).payid;
        payee.payid = payid;
        payee.state = $(this).data('status');
        //先提示
        confirmDialog("您确定要更改该项目状态吗？", StatusChange.changeStatus);
    });
    return{
        changeStatus: function(){
            payeeState(payee);
        }
    }
}();

//导入收款人
$("#pay_import").on("click",function(){
    $(".pay_upload").find("input[type=file]").value = "";
    $("#upload_name").hide();
    $("#pay_upload").modal('show');
});

//收款人点击上传
$("#payee_file").change(function(){
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


//收款人文件拖拽上传
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
            driverUpload(formData);
        }else{
            alertDialog("请选择.xlsx类型的文件上传！");
            return false;
        }
    }else{
        $("#upload_name").html("");
    }
};



function payeeEditEnd(flg, result, type){
    var res = "失败";
    var text = "";
    var alert = "";
    switch (type){
        case PAYEEADD:
            text = "新增";
            break;
        case PAYEEEDIT:
            text = "编辑";
            break;
        case PAYEEDELETE:
            text = "删除";
            break;
        case GENNUPLOAD:
            text = "导入";
            break;
        case PAYEESTATUS:
            text = "状态设置";
            break;
    }
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg;
        }
        if (result && result.retcode == SUCCESS) {
            res = "成功";
            PayeeTable.init();
            $('#edit_pay').modal('hide');
            $('#pay_upload').modal('hide');
        }
    }
    if(alert == ""){
        if(type == PAYEESTATUS){
            alert ="收款人信息"+ text + res + "！";
        }else{
            alert = text + "收款人信息" + res + "！";
        }
    }
    App.unblockUI('#lay-out');
    alertDialog(alert);
}

//删除
var PayeeDelete = function() {
    $('#op_del').click(function() {
        var len = $(".checkboxes:checked").length;
        if(len < 1){
            alertDialog("至少选中一项！");
        }else{
            confirmDialog("数据删除后将不可恢复，您确定要删除吗？", PayeeDelete.deletepay)
        }
    });
    return{
        deletepay: function(){
            var payy = {payidlist:[]};
            $(".checkboxes:checked").parents("td").each(function () {
                var row = $(this).parents('tr')[0];
                payy.payidlist.push($("#payee_table").dataTable().fnGetData(row).payid);
            });
            payeeDelete(payy);
        }
    }
}();