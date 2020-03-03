/**
 * Created by Jianggy on 2019/2/19.
 */
var userList = [];
var responseComplete = [0, 0];   //用户信息和机构全部返回
if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        fun_power();
        //时间控件初始化
        ComponentsDateTimePickers.init();
        //多选控件初始化
        RoleSelect2.init();
        //获取角色列表，用来做成角色选择框
        roleDataGet();
        //获取机构列表，用来做成机构选择框
        organDataGet();
        //新增编辑用户控件初始化
        UserEdit.init();
        //获取用户信息
        UserTable.init();
    });
}

var ComponentsDateTimePickers = function () {

    var handleDatePickers = function () {

        if (jQuery().datepicker) {
            $('.date-picker').datepicker({
                rtl: App.isRTL(),
                orientation: "auto",
                autoclose: true,
                language:"zh-CN",
                todayBtn:true,
                format:"yyyy-mm-dd",
                //showButtonPanel:true,
                todayHighlight: true
            });
            var date = getNowFormatDate();
            $("input[name='birthday']").datepicker("setDate","");
        }
    };

    return {
        //main function to initiate the module
        init: function () {
            handleDatePickers();
        }
    };
}();

var RoleSelect2 = function(){
    var intSelect2 = function (data){
        $.fn.select2.defaults.set("theme", "bootstrap");
        $(".select2, .select2-multiple").select2({
            placeholder: "角色",
            width:null
        });
        $(".select2, .select2-multiple, .select2-allow-clear, .js-data-example-ajax").on("select2:open", function() {
            if ($(this).parents("[class*='has-']").length) {
                var classNames = $(this).parents("[class*='has-']")[0].className.split(/\s+/);
                for (var i = 0; i < classNames.length; ++i) {
                    if (classNames[i].match("has-")) {
                        $("body > .select2-container").addClass(classNames[i]);
                    }
                }
            }
        });
    };
    return {
        init: function(){
            intSelect2();
        }
    }
}();

var UserTable = function () {
    var initTable = function () {
        var table = $('#user_table');
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
                var organ = "";
                try{
                    organ = $('#organtreequery').jstree(true).get_selected(true);
                }catch(err){

                }
                organ = organ.length > 0 ? organ[0].id : "";
                var da = {
                    userid: formData.userid,
                    username: formData.username,
                    organid: organ,
                    mobile:formData.mobile,
                    currentpage: (data.start / data.length) + 1,
                    pagesize: data.length == -1 ? "": data.length,
                    startindex: data.start,
                    draw: data.draw
                };
                userDataGet(da, callback);
            },
            columns: [//返回的json数据在这里填充，注意一定要与上面的<th>数量对应，否则排版出现扭曲
                { "data": null},
                { "data": null},
                { "data": "userid" },
                { "data": "username" },
                { "data": "sex" },
                { "data": "mobile" },
                { "data": "mail" },
                { "data": "organname" },
                { "data": "rolename" },
                { "data": "userid" }
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
                    //性别
                    "targets": [4],
                    "render": function (data, type, row, meta) {
                        var sex = "女";
                        if (data == "0") {
                            sex = "男"
                        }
                        return sex;
                    }
                },{
                    "targets": [9],
                    "render": function (data, type, row, meta) {
                        var edit;
	                    if(!window.parent.makeEdit(menu,loginSucc.functionlist,"#op_edit")){
	                        edit = '-';
	                    }else{
	                        edit = '<a href="javascript:;" id="op_edit">编辑</a>';
	                    }
                        return edit;
                    }
                }
            ],
            fnRowCallback: function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
                $('td:eq(1)', nRow).attr('style', 'text-align: center;');
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
            var checklength = $("#user_table").find(".checkboxes:checked").length;
            if(checklength == userList.length){
                $("#user_table").find(".group-checkable").prop("checked",true);
            }else{
                $("#user_table").find(".group-checkable").prop("checked",false);
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

var UserEdit = function() {
    var handleRegister = function() {
        var validator = $('.register-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                userid: {
                    required: true
                },
                username: {
                    required: true
                },
                sex: {
                    required: true
                },
                mobile: {
                    mobile: true
                },
                phone: {
                    phone: true
                },
                organid: {
                    required: true
                },
                mail: {
                    email: true
                },
                rolelist: {
                    required: true
                },
                image: {
                    required: true
                },
                evaluationneed: {
                    required: true
                },
                storeyid: {
                    required: true
                },
                areaid: {
                    required: true
                }
            },

            messages: {
                userid: {
                    required: "登录名必须输入"
                },

                username: {
                    required: "姓名必须输入"
                },
                sex: {
                    required: "性别必须输入"
                },
                organid: {
                    required: "所属机构必须输入"
                },
                rolelist: {
                    required: "角色必须输入"
                },
                image: {
                    required: "用户头像必须上传"
                },
                evaluationneed: {
                    required: "是否需要评价必须选择"
                },
                storeyid: {
                    required: "楼层必须输入"
                },
                areaid: {
                    required: "分区必须输入"
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
        jQuery.validator.addMethod("mobile", function(value, element) {
            var tel = /^1[3456789]\d{9}$/;
            return this.optional(element) || (tel.test(value));
        }, "请正确填写您的手机号码");

        // 固定电话码验证
        jQuery.validator.addMethod("phone", function(value, element) {
            var tel = /^((0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/;
            return this.optional(element) || (tel.test(value));
        }, "请正确填写您的固定电话");

        //点击确定按钮
        $('#register-btn').click(function() {
            btnDisable($('#register-btn'));
            if ($('.register-form').validate().form()) {
                var user = $('.register-form').getFormData();
                user.rolelist = $('#rolename').val();
                user.birthday = user.birthday.replace(/-/g, '');
                user.organid = ($('#organtree').jstree(true).get_selected(true))[0].id;
            }
            if($("input[name=edittype]").val() == USERADD){
                $("#loading_edit").modal("show");
                userAdd(user);
            }else {

                var data;
                for (var i = 0; i < userList.length; i++) {
                    if (user.userid == userList[i].userid) {
                        data = userList[i];
                    }
                }
                if (equar(user.rolelist, (data.roleid || "").split(","))) {
                    user.rolelist = [];
                }
                var formData = new FormData();
                formData.append("img_head",null);
                var data1 = sendMessageEdit(DEFAULT, user);
                formData.append("body",new Blob([data1],{type:"application/json"}));
                formData.append("rolelist",user.rolelist);
                $("#loading_edit").modal("show");
                userEdit(formData);
            }
        });
        //新增用户
        $('#op_add').click(function() {
            //清除校验错误信息
            validator.resetForm();
            $(".register-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("新增用户");
            $(":input",".register-form").not(":button,:reset,:submit,:radio,#evaluationneed").val("")
                .removeAttr("checked")
                .removeAttr("selected");
            //清空角色输入框
            $("#rolename").val(null).select2(
                {
                    placeholder: "角色",
                    width:null
                }
            );
            //清空机构输入框
            clearSelect($("#organtree"));
            ComponentsDateTimePickers.init();
            //用户代码可以输入
            $(".register-form").find("input[name=userid]").attr("readonly", false);
            $("input[name=edittype]").val(USERADD);
            $('#edit_user').modal('show');
        });
        //编辑用户
        $('#user_table').on('click', '#op_edit', function (e) {
            e.preventDefault();
            //清除校验错误信息
            validator.resetForm();
            $(".register-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("编辑用户");
            var exclude = ["rolename", "organid"];
            //var userid = $(this).parents("td").siblings().eq(1).text();
            var row = $(this).parents('tr')[0];
            var userid = $("#user_table").dataTable().fnGetData(row).userid;
            var user = new Object();
            for(var i=0; i < userList.length; i++){
                if(userid == userList[i].userid){
                    user = userList[i];
                }
            }
            var options = { jsonValue: user, exclude:exclude,isDebug: false};
            $(".register-form").initForm(options);
            //角色赋值
            $("#rolename").val((user.roleid||"").split(",")).select2(
                {
                    placeholder: "角色",
                    width:null
                }
            );
            //出生日期框
            $("input[name=birthday]").datepicker("setDate",dateFormat(user.birthday, "-"));
            //清空机构输入框
            clearSelectCheck($("#organtree"));
            //机构框赋值
            $('#organtree').jstree(true).select_node(user.organid);
            //用户代码不可以输入
            $(".register-form").find("input[name=userid]").attr("readonly", true);
            $("input[name=edittype]").val(USEREDIT);

            $('#edit_user').modal('show');
        });
    };
    return {
        init: function() {
            handleRegister();
        }
    };
}();

function equar(a,b){
    return (a.sort().toString() === b.sort().toString())
}

var UserDelete = function() {
    $('#op_del').click(function() {
        var len = $(".checkboxes:checked").length;
        if(len < 1){
            alertDialog("至少选中一项！");
        }else{
            confirmDialog("数据删除后将不可恢复，您确定要删除吗？", UserDelete.deleteUser)
        }
    });
    return{
        deleteUser: function(){
            var userlist = {useridlist:[]};
            $(".checkboxes:checked").parents("td").each(function () {
                userlist.useridlist.push($(this).siblings().eq(1).text());
            });
            $("#loading_edit").modal("show");
            userDelete(userlist);
        }
    }
}();

var PasswordRest = function() {
    jQuery('#password_reset').click(function() {
        var len = $(".checkboxes:checked").length;
        if(len < 1){
            alertDialog("至少选中一项！");
        }else{
            confirmDialog("您确定要重置密码吗？", PasswordRest.passwordRest)
        }
    });
    return{
        passwordRest: function(){
            var password = hex_md5("123456");
            var userlist = {useridlist:[], password:password};
            $(".checkboxes:checked").parents("td").each(function () {
                userlist.useridlist.push($(this).siblings().eq(0).text());
            });
            $("#loading_edit").modal("show");
            passwordReset(userlist);
        },
        passwordRestResult: function(flg){
            $("#loading_edit").modal("hide");
            var result = "密码重置成功！";
            if(!flg) result = "密码重置失败！";
            alertDialog(result);
        }
    }
}();

function getUserDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {

            var res = result.response;
            userList = res.userlist;
            tableDataSet(res.draw, res.totalcount, res.totalcount, res.userlist, callback);
        }else{
            tableDataSet(0, 0, 0, [], callback);
            alertDialog("用户信息获取失败！");
        }
    }else{
        tableDataSet(0, 0, 0, [], callback);
        alertDialog("用户信息获取失败！");
    }
}

function getRoleDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var roleList = result.response.rolelist;
            roleNameSelectBuild(roleList);
        }
    }
}

function getOrganDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {

            var organList = result.response.list;
            organNameSelectBuild(organList, $("#organtreequery, #organtree"));
        }
    }
}

function userInfoEditEnd(flg, result, type){
    $("#loading_edit").modal("hide");
    var res = "失败";
    var text = "";
    var alert = "";
    switch (type){
        case USERADD:
            text = "新增";
            break;
        case USEREDIT:
            text = "编辑";
            break;
        case USERDELETE:
            text = "删除";
            break;
    }
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg;
        }
        if (result && result.retcode == SUCCESS) {
            res = "成功";
            UserTable.init();
            $('#edit_user').modal('hide');
        }
    }
    if(alert == "") alert = text + "用户" + res + "！";
    App.unblockUI('#lay-out');
    alertDialog(alert);
}

function passwordResetEnd(flg, result){
    App.unblockUI('#lay-out');
    PasswordRest.passwordRestResult(flg);
}

function roleNameSelectBuild(roleList){
    var data = [];
    for (var i = 0;  i < roleList.length ; i++) {
        data.push({ id:roleList[i].roleid, text: roleList[i].rolename });
    }
    $("#rolename").select2({
        placeholder: "角色",
        data: data,
        width:null
    })
}

//选中所属机构
$('#organtreequery, #organtree').on('select_node.jstree', function(e,data) {
    console.info("select_node");
    var ref = $(this).jstree(true);
    var nodes = ref.get_checked();  //使用get_checked方法
    $.each(nodes, function(i, nd) {
        if (nd != data.node.id)
            ref.uncheck_node(nd);
    });
    $(this).siblings("input").val(data.node.text);
    $(this).hide();
});

//取消选中所属机构
$('#organtreequery, #organtree').on('deselect_node.jstree', function(e,data) {
    console.info("deselect_node");
    $(this).siblings("input").val("");
    $(this).hide();
});

//按下input之外的地方，所属机构输入框不显示
$(document).click(function(e){
    if ($(e.target)[0] != $("#organquery")[0]){
        $("#organtreequery").hide();
    }
    if ($(e.target)[0] != $("#organ")[0]){
        $("#organtree").hide();
    }
});

$("#photo").change(function(){
    var file = $(this).get(0).files[0];
    var inputObj = $(this).siblings("input[name=image]");
    var imgObj = $(this).siblings("img");
    inputObj.val(file);
    if(file == undefined){
        imgObj.attr("src", "");
        inputObj.val("");
        return;
    }
    var render = new FileReader();
    render.readAsDataURL(file);
    render.onload = function(e) {
        imgObj.attr("src", e.target.result);
    }
});

$("#user_inquiry").on("click", function(){
    //用户查询
    UserTable.init();
});

//判断用户和机构是否获取完毕
function changeButtonStatus(){
    if(responseComplete.indexOf(0) == -1 ){
        $("#op_edit").trigger('click');
    }
}