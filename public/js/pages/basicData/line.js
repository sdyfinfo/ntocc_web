/**
 * Created by Lenovo on 2020/2/7.
 */

var lineList = [];

if(App.isAngularJsApp() == false){
    jQuery(document).ready(function(){
        //线路列表
        LineTable.init();
        //线路表
        LineEdit.init();
    });
}

//项目列表
var LineTable = function(){
    var initTable = function(){
        var table = $('#line_table');
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
                    projectname: formData.projectname,
                    linename: formData.linename,
                    loading_address:formData.loading_address,
                    unloading_address:formData.unloading_address,
                    goods:formData.goods,
                    currentpage: (data.start / data.length) + 1,
                    pagesize: data.length == -1 ? "": data.length,
                    startindex: data.start,
                    draw: data.draw
                };
                lineDataGet(da, callback);
            },
            columns:[ //返回的json 数据在这里填充，注意一定要与上面的<th>数量对应，否则排版出现扭曲
                {"data":null},
                {"data":null},
                {"data":"lid", visible: false},
                {"data":"project_name"},
                {"data":"linename"},
                {"data":"loading_address"},
                {"data":"unloading_address"},
                {"data":"consignorid"},
                {"data":"consigneeid"},
                {"data":"goods_type"},
                {"data":"goods"},
                {"data":"unit"},
                {"data":"univalence"},
                {"data":"state"},
                {"data":"addTime"},
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
                        return '<input type="checkbox" class="checkbox" value="1" />'
                    }
                },
                {
                    "targets":[13],
                    "render":function (data, type, row, meta) {
                        var state = '启动';
                        if (data == "1") {
                            state = '禁用'
                        }
                        return state;
                    }
                },
                {
                    "targets":[14],
                    "render": function (data, type, row ,meta) {
                        return dateTimeFormat(data);
                    }
                },
                {
                    "targets":[15],
                    "render": function (data, type, row ,meta) {
                        return dateTimeFormat(data);
                    }
                },
                {
                    "targets":[16],
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
                $('td:eq(0),td:eq(1),td:eq(4),td:eq(5),td:eq(6),td:eq(7)', nRow).attr('style', 'text-align: center;');
                $('td:eq(1)').attr('style','text-align: center');
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

//返回线路查询结果
function getlineDataEnd(flg, result, callback){
    App.unblockUI("#lay-out");
    if(flg){
        if(result && result.retcode == SUCCESS){
            var res = result.response;
            lineList = res.list;
            tableDataSet(res.draw, res.totalcount, res.totalcount, res.list, callback);
        }else {
            tableDataSet(0, 0, 0, [], callback);
            alertDialog("线路信息获取失败！");
        }
    }else{
        tableDataSet(0, 0, 0, [], callback);
        alertDialog("线路信息获取失败！");
    }
}

$("#pro_inquiry").on("click",function(){
    //线路查询
    LineTable.init();
});

//线路表
var LineEdit = function(){
    var handleRegister = function() {
        var validator = $('.register-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                project_name: {
                    required: true
                },
                loading_name:{
                    required: true
                },
                unloading_name:{
                    required: true
                },
                loading_address:{
                    required: true
                },
                unloading_place:{
                    required: true
                },
                consignorid:{
                    required: true
                },
                consigneeid:{
                    required: true
                },
                contacts:{
                    required: true
                },
                phone:{
                    required: true
                }
            },

            messages: {
                proname: {
                    required: "请输入项目名称"
                },
                loading_name:{
                    required: "请选择装货地名称"
                },
                unloading_name:{
                    required: "请选择卸货地名称"
                },
                loading_address:{
                    required: "请选择装货地址"
                },
                unloading_place:{
                    required: "请选择卸货地址"
                },
                consignorid:{
                    required: "请选择发货人"
                },
                consigneeid:{
                    required: "请选择收货人"
                },
                contacts:{
                    required: "请输入线路联系人"
                },
                phone:{
                    required: "请输入联系电话"
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
        jQuery.validator.addMethod("phone", function(value, element) {
            var tel = /^1[3456789]\d{9}$/;
            return this.optional(element) || (tel.test(value));
        }, "请正确填写您的联系电话");

        //点击确定按钮
        $('#register-btn').click(function() {
            btnDisable($('#register-btn'));
            if ($('.register-form').validate().form()) {
                var line = $('.register-form').getFormData();
                line.project_name = $("#project_name").val();
                line.loading_name = $("#loading_name").val();
                line.unloading_name = $('#unloading_name').val();
                line.loading_address = $('#loading_address').val();
                line.unloading_place = $('#unloading_place').val();
                line.consignorid = $('#consignorid').val();
                line.consigneeid = $('#consigneeid').val();
                line.goods_type = $('#goods_type').val();
                line.goods = $('#goods').val();
            }
            if($("input[name=edittype]").val() == LINEADD){
                lineAdd(line);
            }else {
                lineEdit(line,LINEEDIT);
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
            $("input[name=edittype]").val(LINEADD);
            $('#edit_lin').modal('show');

            console.log("222");
        });
        //编辑项目
        $('#line_table').on('click', '#op_edit', function (e) {
            e.preventDefault();
            //清除校验错误信息
            validator.resetForm();
            $(".register-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("编辑项目");
            var exclude = [];
            var row = $(this).parents('tr')[0];
            var lid = $("#line_table").dataTable().fnGetData(row).lid;
            var line = new Object();
            for(var i=0; i < lineList.length; i++){
                if(lid == lineList[i].lid){
                    line = lineList[i];
                }
            }
            var options = { jsonValue: project, exclude:exclude,isDebug: false};
            $(".register-form").initForm(options);
            //项目名称赋值
            var project_name = $("#project_name").dataTable().fnGetData(row).lid;
            $("input[name=edittype]").val(LINEEDIT);
            $('#edit_lin').modal('show');
        });
    };
    return {
        init: function() {
            handleRegister();
        }
    };
}();

//线路操作返回结果
function lineEditEnd (flg, result, type){
    var res = "失败";
    var text = "";
    var alert = "";
    switch (type){
        case LINEADD:
            text = "新增";
            break;
        case LINEEDIT:
            text = "编辑";
            break;
        case LINEDELETE:
            text = "删除";
            break;
        case LINESTATUS:
            text = "状态设置";
            break;
    }
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg;
        }
        if (result && result.retcode == SUCCESS) {
            res = "成功";
            LineTable.init();
            $('#edit_lin').modal('hide');
        }
    }
    if(alert == ""){
        if(type == LINESTATUS){
            alert ="线路"+ text + res + "！";
        }else{
            alert = text + "线路" + res + "！";
        }
    }
    App.unblockUI('#lay-out');
    alertDialog(alert);
}