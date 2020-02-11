/**
 * Created by Lenovo on 2020/2/10.
 */

var addressidList = [];
if(App.isAngularJsApp() == false){
    jQuery(document).ready(function(){
        //地址列表
        addressTable.init();
        //线路表
        addressEdit.init();
    });
}

//项目列表
var addressTable = function(){
    var initTable = function(){
        var table = $('#add_table');
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
            "autoWidth": false,
            "ajax":function (data, callback, settings) {
                var formData = $(".inquiry-form").getFormData();
                var da = {
                    aid:formData.aid,
                    mailing_address: formData.mailing_address,
                    currentpage: (data.start / data.length) + 1,
                    pagesize: data.length == -1 ? "": data.length,
                    startindex: data.start,
                    draw: data.draw
                };
                addressDataGet(da, callback);
            },
            columns:[ //返回的json 数据在这里填充，注意一定要与上面的<th>数量对应，否则排版出现扭曲
                {"data":null},
                {"data":null},
                {"data":"aid", visible: false},
                {"data":"mailing_address"},
                {"data":"address"},
                {"data":"addressee"},
                {"data":"addresseeTel"},
                {"data":"email"},
                {"data":"updateTime"},
                {"data":null}
            ],
            columnDefs:[
                {
                    "targets":[0],
                    "data":null,
                    "render": function (data, type, row, meta) {
                        return meta.settings._iDisplayStart + meta.row + 1; //行号
                    }
                },
                {
                    "targets":[1],
                    "render":function (data, type, row, meta) {
                        return '<input type="checkbox" class="checkboxes" value="1" />';
                    }
                },
                {
                    "targets":[9],
                    "render": function (data, type, row, meta) {
                        var edit = '<a href="javascript:;" id="op_edit">编辑</a>';
//                        if(!window.parent.makeEdit(menu,loginSucc.functionlist,"#op_edit")){
//                            edit = '-';
//                        }else{
//                            edit = '<a href="javascript:;" id="op_edit">编辑</a>';
//                        }
                        return edit;
                    }
                }
            ],
            fnRowCallback: function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
                $('td:eq(0),td:eq(1),td:eq(2),td:eq(4),td:eq(5),td:eq(6),td:eq(7)', nRow).attr('style', 'text-align: center;');
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


var addressEdit = function(){
    var handleRegister = function() {
        var validator = $('.register-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                mailing_address: {
                    required: true
                },
                address:{
                    required: true
                },
                addressee:{
                    required: true
                },
                addresseeTel:{
                    required: true
                },
                consigneeTel:{
                    required: true
                },
                email:{
                    required: true
                }

            },

            messages: {
                mailing_address: {
                    required: "请选择邮寄地址"
                },
                address:{
                    required: "请输入详细地址"
                },
                addressee:{
                    required: "请输入收件人姓名"
                },
                addresseeTel:{
                    required: "请输入收件人电话"
                },
                email:{
                    required: "请输入收件人邮箱"
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
        jQuery.validator.addMethod("consigneeTel", function(value, element) {
            var tel = /^1[3456789]\d{9}$/;
            return this.optional(element) || (tel.test(value));
        }, "请正确填写您的联系电话");

        jQuery.validator.addMethod("consigneeid_mailbox", function(value, element) {
            var reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
            return this.optional(element) || (tel.test(value));
        }, "请正确填写您的收件邮箱");

        //点击确定按钮
        $('#register-btn').click(function() {
            btnDisable($('#register-btn'));
            if ($('.register-form').validate().form()) {
                var addr = $('.register-form').getFormData();
            }
            if($("input[name=edittype]").val() == ADDRADD){
                addrsAdd(addr);
            }else {
                var data;
                for(var i = 0; i < addressidList.length; i++) {
                    if(addr.aid == addressidList[i].aid){
                        data = addressidList[i];
                    }
                }
                addrsEdit(addr,ADDRSEDIT);
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

            $(".register-form").find("input[name=aid]").attr("readonly", false);
            $("input[name=edittype]").val(ADDRADD);
            $('#edit_adds').modal('show');
        });
        //编辑项目
        $('#add_table').on('click', '#op_edit', function (e) {
            e.preventDefault();
            //清除校验错误信息
            validator.resetForm();
            $(".register-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("编辑项目");
            var exclude = [];
            var row = $(this).parents('tr')[0];
            var aid = $("#add_table").dataTable().fnGetData(row).aid;
            var address = new Object();
            for(var i=0; i < addressidList.length; i++){
                if(aid == addressidList[i].aid){
                    address = addressidList[i];
                }
            }
            var options = { jsonValue: address, exclude:exclude,isDebug: false};
            $(".register-form").initForm(options);
            $("input[name=edittype]").val(LINEEDIT);
            $('#edit_adds').modal('show');
        });
    };
    return {
        init: function() {
            handleRegister();
        }
    };
}();


//返回地址管理列表查询结果
function getaddressDataEnd(flg, result, callback){
    App.unblockUI("#lay-out");
    if(flg){
        if(result && result.retcode == SUCCESS){
            var res = result.response;
            addressidList = res.addressidlist;
            tableDataSet(res.draw, res.totalcount, res.totalcount, res.addressidlist, callback);
        }else {
            tableDataSet(0, 0, 0, [], callback);
            alertDialog("地址信息获取失败！");
        }
    }else{
        tableDataSet(0, 0, 0, [], callback);
        alertDialog("地址信息获取失败！");
    }
}


//删除
var AddrDelete = function() {
    $('#op_del').click(function() {
        var len = $(".checkboxes:checked").length;
        if(len < 1){
            alertDialog("至少选中一项！");
        }else{
            confirmDialog("数据删除后将不可恢复，您确定要删除吗？", AddrDelete.deleteAddr)
        }
    });
    return{
        deleteAddr: function(){
            var addr = {addressidlist:[]};
            $(".checkboxes:checked").parents("td").each(function () {
                var row = $(this).parents('tr')[0];
                addr.addressidlist.push($("#add_table").dataTable().fnGetData(row).aid);
            });
            addrDelete(addr);
        }
    }
}();


//新增
function addrEditEnd(flg, result, type){
    var res = "失败";
    var text = "";
    var alert = "";
    switch (type){
        case ADDRADD:
            text = "新增";
            break;
        case ADDRSEDIT:
            text = "编辑";
            break;
        case ADDRDELETE:
            text = "删除";
            break;
    }
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg;
        }
        if (result && result.retcode == SUCCESS) {
            res = "成功";
            ProjectTable.init();
            $('#edit_adds').modal('hide');
        }
    }
    App.unblockUI('#lay-out');
    alertDialog(alert);
}