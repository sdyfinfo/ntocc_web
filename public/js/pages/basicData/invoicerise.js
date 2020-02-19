/**
 * Created by Lenovo on 2020/2/17.
 */

var invocerList = [];
var addressidList = [];
var invlist = [];
if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function () {
        //fun_power();
        //获取页面信息
        invocreTable.init();
        invEdit.init();
        //获取邮寄地址
        addressDataGet();

    })
}

var invocreTable = function () {
    var initTable = function () {
        var table = $('#inv_table');
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
                    rise_name: formData.rise_name,
                    invid: formData.invid,
                    currentpage: (data.start / data.length) + 1,
                    pagesize: data.length == -1 ? "": data.length,
                    startindex: data.start,
                    draw: data.draw
                };
                invoDataGet(da, callback);
            },
            columns: [//返回的json数据在这里填充，注意一定要与上面的<th>数量对应，否则排版出现扭曲
                {"data":null},
                {"data":null},
                { "data": "invid",visible: false},
                { "data": "invids "},//抬头名称
                { "data": "invid"},//发票邮寄信息
                { "data": "invid"},//发票金额
                { "data": "invid"} //更新时间
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
                    "targets":[3],
                    "render": function (data, type, row ,meta) {
                        //显示发票抬头
                        for(var i in invocerList){
                            if(data == invocerList[i].invids){
                                return "<b>"+"抬头名称:     "+"</b>"+invocerList[i].rise_name +"<br>"+"<b>"+"纳税人识别号:     "+"</b>"+ invocerList[i].taxpayer +"<br>"+"<b>"+"地址/电话:     "+"</b>"+invocerList[i].address_phone +"<br>"+"<b>"+"开户行及账号:     "+"</b>"+ invocerList[i].bank_name + "<br>" +"<a href='javascript:;' id='invoice'>"+"修改抬头信息"+"</a>";
                            }
                        }
                    }
                },
                {
                    "targets":[4],
                    "render": function (data, type, row ,meta) {
                        //邮寄地址
                        for(var i in invocerList) {
                            if (data == invocerList[i].invid) {
                                return "<b>"+"邮寄地址:     "+"</b>"+invocerList[i].address +"<br>"+"<b>"+"收件人:     "+"</b>"+ invocerList[i].addressee +"<br>"+"<b>"+"电话:     "+"</b>"+ invocerList[i].addresseeTel +"<br>"+"<b>"+"邮箱:     "+"</b>"+ invocerList[i].email + "<br>" +"<a href='javascript:;' id='mail'>"+"更换邮寄地址"+"</a>";
                            }
                        }
                    }
                },
                {
                    "targets":[5],
                    "render": function (data, type, row ,meta) {
                        //发票金额
                        for(var i in invocerList) {
                            if (data == invocerList[i].invid) {
                                return formatCurrency(invocerList[i].invoice_amount);
                            }
                        }
                    }
                },
                {
                    "targets":[6],
                    "render": function (data, type, row ,meta) {
                        //更新时间
                        for(var i in invocerList) {
                            if (data == invocerList[i].invid) {
                                return dateTimeFormat(invocerList[i].updatetime);
                            }
                        }
                    }
                }
            ],
            fnRowCallback: function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
                $('td:eq(0),td:eq(1)',nRow).attr('style','text-align:center');
                $('td:eq(2),td:eq(3)', nRow).attr('style', 'text-align: left;');
                $('td:eq(4)',nRow).attr('style','text-align:right');
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
            var checklength = $("#inv_table").find(".checkboxes:checked").length;
            if(checklength == invocerList.length){
                $("#inv_table").find(".group-checkable").prop("checked",true);
            }else{
                $("#inv_table").find(".group-checkable").prop("checked",false);
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


var invEdit = function(){
    var handleRegister = function() {
        var validator = $('.register-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                address_phone:{
                    required: true
                },
                bank_name:{
                    required: true
                },
                bank:{
                    required: true
                }

            },

            messages: {
                address_phone:{
                    required: "请输入地址电话"
                },
                bank_name:{
                    required: "请输入开户行"
                },
                bank:{
                    required: "请输入银行卡号"
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
        jQuery.validator.addMethod("email", function(value, element) {
            var tel = /^\w+@[a-z0-9]+\.[a-z]+$/i;
            return this.optional(element) || (tel.test(value));
        }, "请正确填写您的邮箱");

        jQuery.validator.addMethod("bank", function(value, element) {
            var reg = /^([1-9]{1})(\d{14}|\d{18})$/;
            return this.optional(element) || (reg.test(value));
        }, "请正确填写您的银行卡号");

        //选择邮寄地址，显示收件人、电话、邮箱
        $("#addrid").change(function(){
            var id = $(this).val();
            for(var i in addressidList){
                if(id == addressidList[i].aid){
                    $("input[name=addressee]").val(addressidList[i].addressee);
                    $("input[name=addresseeTel]").val(addressidList[i].addresseeTel);
                    $("input[name=email]").val(addressidList[i].email);
                }
            }
        });
        //选择发货人或发货人显示
        $("#addrid").change(function(){
            var id = $(this).val();
            for(var i in addressidList){
                if(id == addressidList[i].aid){
                    $("input[name=address]").val(addressidList[i].ress);
                }
            }
        });

        //点击确定按钮
        $('#register-update').click(function() {
            btnDisable($('#register-update'));
            if ($('.register-form').validate().form()) {
                var inv = $('.register-form').getFormData();
                var data;
                for(var i = 0; i < invocerList.length; i++) {
                    if(inv.invid == invocerList[i].invid){
                        data = invocerList[i];
                    }
                }
                $("#loading_edit").modal("show");
                invoReplaceEdit(inv);
            }
        });
        //修改抬头信息
        $('#inv_table').on('click', '#invoice', function (e) {
            e.preventDefault();
            //清除校验错误信息
            validator.resetForm();
            $(".register-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("编辑发票抬头");
            var exclude = [];
            var row = $(this).parents('tr')[0];
            var invid = $("#inv_table").dataTable().fnGetData(row).invid;
            var inv = new Object();
            for(var i=0; i < invocerList.length; i++){
                if(invid == invocerList[i].invid){
                    inv = invocerList[i];
                }
            }
            var options = { jsonValue: inv, exclude:exclude,isDebug: false};
            $(".register-form").initForm(options);
            $("input[name=edittype]").val(INVREPLACE);
            $('#edit_update').modal('show');
        });
        //点击确定按钮
        $('#register-replace').click(function() {
            btnDisable($('#register-replace'));
            if ($('.register-form').validate().form()) {
                var inv = $('.register-form').getFormData();
                inv.addrid = $("input[name=addrid]").val();
                inv.address = $("#address").find("option:selected").text();
                var data;
                for(var i = 0; i < invocerList.length; i++) {
                    if(inv.invid == invocerList[i].invid){
                        data = invocerList[i];
                    }
                }
                for (var j = 0; j < invocerList.length; j++) {
                    if (inv.address == invocerList[j].addrid){
                        inv.addrid = invocerList[j].addrid;
                    }
                }
                $("#loading_edit").modal("show");
                invoReplaceEdit(inv);
            }
        });
        //更换邮寄地址
        $('#inv_table').on('click', '#mail', function (e) {
            e.preventDefault();
            //清除校验错误信息
            validator.resetForm();
            $(".register-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("选择地址");
            var exclude = [];
            var row = $(this).parents('tr')[0];
            var invid = $("#inv_table").dataTable().fnGetData(row).invid;
            var invo = new Object();
            for(var i=0; i < invocerList.length; i++){
                if(invid == invocerList[i].invid){
                    invo = invocerList[i];
                }
            }
            var options = { jsonValue: invo, exclude:exclude,isDebug: false};
            $(".register-form").initForm(options);
            $("input[name=edittype]").val(INVREPLACE);
            $('#edit_replace').modal('show');
        });
    };
    return {
        init: function() {
            handleRegister();
        }
    };
}();



//获返回结果
function getinvoDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            invocerList = res.invlist;
            tableDataSet(res.draw, res.totalcount, res.totalcount, res.invlist, callback);
        }else{

            tableDataSet(0, 0, 0, [], callback);
            alertDialog("发票抬头获取失败！");
        }
    }else{
        tableDataSet(0, 0, 0, [], callback);
        alertDialog("发票抬头获取失败！");
    }
}

//查询
$("#inv_inquiry").on('click',function(){
    invocreTable.init();
})

function invoEditEnd(flg, result, type){
    var res = "失败";
    var text = "";
    var alert = "";
    switch (type){
        case INVUPDATE:
            text = "修改";
            break;
        case INVREPLACE:
            text = "更改";
            break;
    }
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg;
        }if (result && result.retcode == SUCCESS) {
            res = "成功";
            invocreTable.init();
            $('#edit_update').modal('hide');
            $('#edit_replace').modal('hide');
        }
    }
    if(alert == ""){
        if(type == INVUPDATE){
            alert = "修改" + text + res + "！";
        }else{
            alert = text + "修改" + res + "！";
        }
    }
    App.unblockUI('#lay-out');
    alertDialog(alert);
}

//删除
var invoDelete = function() {
    $('#op_del').click(function() {
        var len = $(".checkboxes:checked").length;
        if(len < 1){
            alertDialog("至少选中一项！");
        }else{
            confirmDialog("数据删除后将不可恢复，您确定要删除吗？", invoDelete.deleteivo)
        }
    });
    return{
        deleteivo: function(){
            var ush = {invidlist:[]};
            $(".checkboxes:checked").parents("td").each(function () {
                var row = $(this).parents('tr')[0];
                ush.invidlist.push($("#inv_table").dataTable().fnGetData(row).invid);
            });
            invoDeleteEdit(ush);
        }
    }
}();


//返回邮寄地址结果
function getaddressDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            addressidList = res.list;
            for(var i = 0; i < addressidList.length; i++){
                $("#addrid").append("<option value='"+addressidList[i].aid+"'>" + addressidList[i].ress+"</option>");
            }
        }else{
            alertDialog("邮寄地址获取失败！");
        }
    }else{
        alertDialog("邮寄地址获取失败！");
    }
}
