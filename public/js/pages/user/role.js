/**
 * Created by Administrator on 2019/2/21.
 */
/**
 * Created by Administrator on 2019/2/19.
 */
var roleList = [];
if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        fun_power();
        RoleTable.init();
        RoleEdit.init();
    });
}

var RoleTable = function () {
    var initTable = function () {
        var table = $('#role_table');
        pageLengthInit(table);
        table.dataTable({
            "language": TableLanguage,
            "bStateSave": false, // save datatable state(pagination, sort, etc) in cookie.
            "lengthMenu": TableLengthMenu,
            "destroy": true,
            "pageLength": PageLength,
            "serverSide": true,
            //"pagingType": "bootstrap_extended",
            "processing": true,
            "searching": false,
            "ordering": false,
            "autoWidth": false,
            "ajax":function (data, callback, settings) {
                var formData = $(".inquiry-form").getFormData();
                var da = {
                    rolecode: formData.rolecode,
                    rolename: formData.rolename,
                    currentpage: (data.start / data.length) + 1,
                    pagesize: data.length == -1 ? "": data.length,
                    startindex: data.start,
                    draw: data.draw
                };
                roleDataGet(da, callback);
            },
            columns: [//返回的json数据在这里填充，注意一定要与上面的<th>数量对应，否则排版出现扭曲
                { "data": null},
                { "data": null},
                { "data": "roleid", visible: false },
                { "data": "rolecode" },
                { "data": "rolename" },
                { "data": "operator" },
                { "data": "operatetime" },
                { "data": "remark" },
                { "data": null }
            ],
            columnDefs: [
                {
                    "targets":[1],
                    "render":function(data, type, row, meta){
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
                    "targets":[6],
                    "render": function(data, type, row, meta) {
                        return dateTimeFormat(data);
                    }
                },{
                    "targets":[8],
                    "render": function(data, type, row, meta) {
                        if(!window.parent.makeEdit(menu,loginSucc.functionlist,"#op_edit")) return '-';
                        return '<a href="javascript:;" id="op_edit">编辑</a>'
                    }
                }
            ],
            fnRowCallback: function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
            $('td:eq(0),td:eq(1),td:eq(5),td:eq(7)', nRow).attr('style', 'text-align: center;');
        }
        });
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
            var checklength = $("#role_table").find(".checkboxes:checked").length;
            if(checklength == roleList.length){
                $("#role_table").find(".group-checkable").prop("checked",true);
            }else{
                $("#role_table").find(".group-checkable").prop("checked",false);
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

var RoleEdit = function() {
    var handleRegister = function() {
        var validator = $('.register-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                rolename: {
                    required: true
                },
                rolecode: {
                    required: true
                }
            },

            messages: {
                rolename: {
                    required: "角色名必须输入"
                },
                rolecode: {
                    required: "角色代码必须输入"
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
                if (element.closest('.input-icon').size() === 1) {
                    error.insertAfter(element.closest('.input-icon'));
                } else {
                    error.insertAfter(element);
                }
            },

            submitHandler: function(form) {
                form.submit();
            }
        });
        $('#role-add-confirm').click(function() {
            if ($('.register-form').validate().form()) {
                var role = $('.register-form').getFormData();
                if($("input[name=edittype]").val() == ROLEADD){
                    $("#loading_edit").modal('show');
                    roleAdd(role);
                }else{
                    $("#loading_edit").modal('show');
                    roleEdit(role);
                }
            }
        });
        //新增角色
        $('#op_add').click(function() {
            validator.resetForm();
            $(".register-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("新增角色");
            $(":input",".register-form").not(":button,:reset,:submit,:radio").val("")
                .removeAttr("checked")
                .removeAttr("selected");
            //角色代码可以输入
            $(".register-form").find("input[name=rolecode]").attr("readonly", false);
            $("input[name=edittype]").val(ROLEADD);
            $('#edit_role').modal('show');
        });
        //编辑角色
        $("#role_table").on('click', '#op_edit', function (e) {
            e.preventDefault();
            validator.resetForm();
            $(".register-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("编辑角色");
            var exclude = [""];
            var row = $(this).parents('tr')[0];     //通过获取该td所在的tr，即td的父级元素，取出第一列序号元素
            var roleid = $("#role_table").dataTable().fnGetData(row).roleid;
            var role = new Object();
            for(var i=0; i < roleList.length; i++){
                if(roleid == roleList[i].roleid){
                    role = roleList[i];
                }
            }
            var options = { jsonValue: role, exclude:exclude, isDebug: false};
            $(".register-form").initForm(options);
            //角色代码不可以输入
            $(".register-form").find("input[name=rolecode]").attr("readonly", true);
            $("input[name=edittype]").val(ROLEEDIT);
            $('#edit_role').modal('show');
        });
    };

    return {
        init: function() {
            handleRegister();
        }
    };
}();

var RoleDelete = function() {
    //TODO:有人使用该角色时，不应该删除
    $('#op_del').click(function() {
        var len = $(".checkboxes:checked").length;
        if(len < 1){
            alertDialog("至少选中一项！");
        }else{
            var para = 1;
            confirmDialog("数据删除后将不可恢复，您确定要删除吗？", RoleDelete.deleteRole, para)
        }
    });
    return{
        deleteRole: function(){
            var rolelist = {roleidlist:[]};
            $(".checkboxes:checked").parents("td").each(function () {
                var row = $(this).parents('tr')[0];     //通过获取该td所在的tr，即td的父级元素，取出第一列序号元素
                var roleid = $("#role_table").dataTable().fnGetData(row).roleid;
                rolelist.roleidlist.push(roleid);
            });
            $("#loading_edit").modal('show');
            roleDelete(rolelist);
        }
    }
}();

function getRoleDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            roleList = res.rolelist;
            tableDataSet(res.draw, res.totalcount, res.totalcount, res.rolelist, callback);
        }else{
            tableDataSet(0, 0, 0, [], callback);
            alertDialog(result.retmsg);
        }
    }else{
        tableDataSet(0, 0, 0, [], callback);
        alertDialog("角色信息获取失败！");
    }
}

function roleInfoEditEnd(flg, result, type){
    $("#loading_edit").modal('hide');
    var res = "失败";
    var text = "";
    var alert = "";
    switch (type){
        case ROLEADD:
            text = "新增";
            break;
        case ROLEEDIT:
            text = "编辑";
            break;
        case ROLEDELETE:
            text = "删除";
            break;
    }
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg;
        }
        if (result && result.retcode == SUCCESS) {
            res = "成功";
            RoleTable.init();
            $('#edit_role').modal('hide');
        }
    }
    if(alert == "") alert = text + "角色" + res + "！";
    App.unblockUI('#lay-out');
    alertDialog(alert);
}

$("#role_inquiry").on("click", function(){
    //用户查询
    RoleTable.init();
});