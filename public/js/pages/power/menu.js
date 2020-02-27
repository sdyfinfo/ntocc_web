/**
 * Created by Administrator on 2019/2/22.
 */
var menuList = [];
var functionList = [];
if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        MenuTable.init();
        FunctionTable.init();
        //菜单新增和编辑
        MenuEdit.init();
        //功能新增和编辑
        FunctionEdit.init();
    });
}

//菜单相关
var MenuTable = function () {
    var initTable = function () {

        var table = $('#menu_table');
        table.bootstrapTable({
            striped : true, //是否显示行间隔色
            pageNumber : 1, //初始化加载第一页
            pagination : false,//是否分页
            sidePagination : 'client',//server:服务器端分页|client：前端分页
            pageSize : 10,//单页记录数
            showRefresh : false,//刷新按钮
            idField: 'menuid',
            checkboxHeader: false,
            height: $(window).height() - 180,
            singleSelect:true,  //限制单选
            ajax :function (e) {
                //因为需要做成菜单选择的树形菜单，所以一次获取所有数据，前端分页
                var callback = e.success;
                var da = {
                    currentpage: "",
                    pagesize: "",
                    startindex: "0",
                    draw: 1
                };
                menuDataGet(da, callback);
            },
            columns : [
                {
                    field: 'xuhao',
                    width: 36,
                    title : '序号',
                    formatter: function (value, row, index) {
                        return index + 1;
                    }
                },{
                    field: 'check',  checkbox: true, formatter: function (value, row, index) {
                        if (row.check == true) {
                            //设置选中
                            return {  checked: true };
                        }
                    }
                }, {
                    title : '菜单名称',
                    field : 'menuname',
                    sortable : true
                }, {
                    title : '菜单ID',
                    field : 'menuid',
                    visible : false
                }, {
                    title : '请求地址',
                    field : 'url'
                }, {
                    title : '排序',
                    field : 'sort'
                }, {
                    title : '类型',
                    field : 'menutype',
                    formatter: function (value, row, index) {
                        if (value == "1") {
                            return "模块";
                        }else if(value == "2"){
                            return "页面"
                        }else{
                            return "按钮"
                        }
                    }
                } , {
                    title : '菜单描述',
                    field : 'remark'
                }, {
                    title : '操作',
                    formatter: function (value, row, index) {
                        if(!window.parent.makeEdit(menu,loginSucc.functionlist,"#op_edit")) return '-';
                        return '<a href="javascript:;" id="op_edit" data-menu-id="' + row.menuid + '">编辑</a>'
                    }
                }
            ],
            //在哪一列展开树形
            treeShowField: 'menuname',
            //指定父id列
            parentIdField: 'parentid',
            onResetView: function(data) {
                //console.log('load');
                table.treegrid({
                    initialState: 'expanded',// 所有节点都折叠
                    // initialState: 'expanded',// 所有节点都展开，默认展开
                    treeColumn: 2,
                    expanderExpandedClass: 'fa fa-folder-open icon-state-warning icon-lg',  //图标样式
                    expanderCollapsedClass: 'fa fa-folder icon-state-warning icon-lg',
                    expanderLeafClass:'fa fa-file-text-o icon-state-warning icon-lg',
                    onChange: function() {
                        //$table.bootstrapTable('resetWidth');
                    }
                });

                //只展开树形的第一级节点
                //table.treegrid('getRootNodes').treegrid('expand');
            },
            onCheck:function(row){
                var datas = table.bootstrapTable('getData');
                //限制单选
                singleSelect(datas, row, "menuid");
                // 刷新数据
                //table.bootstrapTable('load', datas);
                $("#function_table").bootstrapTable('destroy');
                FunctionTable.init();
            },

            onUncheck:function(row){
                $("#function_table").bootstrapTable('destroy');
                FunctionTable.init();
            }
        });

        table.on('change', 'tbody tr .checkboxes', function () {
            $(this).parents('tr').toggleClass("active");
        });
    };
    return {
        init: function () {
            initTable();
        }
    };

}();

var MenuEdit = function() {
    var handleRegister = function() {
        var validator = $('.menu-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                menucode: {
                    required: true
                },
                menuname: {
                    required: true
                },
                sort: {
                    required: true
                },
                menutype: {
                    required: true
                },
                url: {
                    required: true
                },
                menuicon: {
                    required: true
                },
                parentmenuid:{
                    menu: true
                }
            },

            messages: {
                menucode: {
                    required: "菜单代码必须输入"
                },
                menuname: {
                    required: "菜单名称必须输入"
                },
                sort: {
                    required: "排序号必须输入"
                },
                menutype: {
                    required: "菜单类型必须输入"
                },
                url: {
                    required: "访问地址必须输入"
                },
                menuicon: {
                    required: "菜单图标必须输入"
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
        //所属机构验证，选择所属机构的时候，不能选择自身，也不能选择自身的子机构
        jQuery.validator.addMethod("menu", function(value, element) {
            var menu = $('.menu-form').getFormData();
            var ref = $('#menutree').jstree(true);
            var nodes = ref.get_selected();
            var same = parentOrSelf(nodes, menu.menuid);
            return this.optional(element) || !same;
            }, "不能选择自身和自身的子菜单作为所属菜单");

        //确定按钮按下
        $('#menu-confirm-btn').click(function() {
            btnDisable($('#menu-confirm-btn'));
            if ($('.menu-form').validate().form()) {
                var menu = $('.menu-form').getFormData();
                menu.parentmenuid = "";
                try{
                    var select = $('#menutree').jstree(true).get_selected(true);
                    if( select.length > 0){
                        menu.parentmenuid = select[0].id;
                    }
                }catch(ex){

                }
                if($("input[name=edittype]").val() == MENUADD){
                    $("#loading_edit").modal('show');
                    menuAdd(menu);
                }else{
                    $("#loading_edit").modal('show');
                    menuEdit(menu);
                }
            }
        });
        //增加菜单
            $('#op_add').click(function() {
                btnDisable($('#op_add'));
                validator.resetForm();
                $(".menu-form").find(".has-error").removeClass("has-error");
                $("#edit_menu").find(".modal-title").text("新增菜单");
                $(":input",".menu-form").not(":button,:reset,:submit,:radio").val("")
                    .removeAttr("checked")
                    .removeAttr("selected");
                //清空菜单输入框
                clearSelect($("#menutree"));
                //清空菜单图标
                menuIconSelectedClear();
                //菜单代码可以输入
                $(".menu-form").find("input[name=menucode]").attr("readonly", false);
                //操作类型
                $("input[name=edittype]").val(MENUADD);
                $('#edit_menu').modal('show');
            });
        //编辑菜单
        $("#menu_table").on('click', '#op_edit', function (e) {
            btnDisable($('#menu_table'));
            e.preventDefault();
            validator.resetForm();
            $(".menu-form").find(".has-error").removeClass("has-error");
            $("#edit_menu").find(".modal-title").text("编辑菜单");
            var exclude = ["parentmenuid", "menuicon"];
            var menuid = $(this).attr("data-menu-id");
            var menulist = $("#menu_table").bootstrapTable('getData');
            var menu = new Object();
            for(var i=0; i < menulist.length; i++){
                if(menuid == menulist[i].menuid){
                    menu = menulist[i];
                }
            }
            var options = { jsonValue: menu, exclude:exclude,isDebug: false};
            $(".menu-form").initForm(options);
            //所属菜单初始化
            if(menu.parentid == 0){
                clearSelect($("#menutree"));
            }else{
                $('#menutree').jstree(true).select_node(menu.parentid);
            }

            //菜单图标初始化：
            menuIconSelected(menu.menuicon);
            //菜单代码不可以输入
            $(".menu-form").find("input[name=menucode]").attr("readonly", true);
            //操作类型
            $("input[name=edittype]").val(MENUEDIT);
            $('#edit_menu').modal('show');
        })
    };

    return {
        //main function to initiate the module
        init: function() {
            handleRegister();
        }
    };
}();

var MenuDelete = function() {
    $('#op_del').click(function() {
        var len = $("#menu_table").bootstrapTable('getSelections');
        if(len < 1){
            alertDialog("至少选中一项！");
        }else{
            confirmDialog("数据删除后将不可恢复，您确定要删除吗？", MenuDelete.deleteMenu)
        }
    });
    return{
        deleteMenu: function(){
            var menulist = {menuidlist:[]};
            var select = $("#menu_table").bootstrapTable('getSelections');
            for(var i=0; i<select.length;i++) {
                menulist.menuidlist.push(select[i].menuid);
            }
            $("#loading_edit").modal('show');
            menuDelete(menulist);
        }
    }
}();

function getMenuDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            menuList = res.menulist;
            //做成新增或者删除菜单的树形结构
            menuNameSelectBuild1(menuList, $("#menutree"), false);
            //给页面上的table赋值
            bootstrapTreeTableDataSet(res.totalcount, res.menulist, "menulist", "menuid", callback);
        }else{
            menuNameSelectBuild1([], $("#menutree"), false);
            //给页面上的table赋值
            bootstrapTreeTableDataSet(0, [], "menulist", "menuid", callback);
            alertDialog("菜单信息获取失败！");
        }
    }else{
        menuNameSelectBuild1([], $("#menutree"), false);
        //给页面上的table赋值
        bootstrapTreeTableDataSet(0, [], "menulist", "menuid", callback);
        alertDialog("菜单信息获取失败！");
    }
}

function menuInfoEditEnd(flg, result, type){
    $("#loading_edit").modal('hide');
    var res = "失败";
    var text = "";
    var alert = "";
    switch (type){
        case MENUADD:
            text = "新增";
            break;
        case MENUEDIT:
            text = "编辑";
            break;
        case MENUDELETE:
            text = "删除";
            break;
    }
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg;
        }
        if (result && result.retcode == SUCCESS) {
            res = "成功";
            $("#menu_table").bootstrapTable('destroy');
            MenuTable.init();
            $('#edit_menu').modal('hide');
        }
    }
    if(alert == "") alert = text + "菜单" + res + "！";
    App.unblockUI('#lay-out');
    alertDialog(alert);
}

//选中所属菜单
$('#menutree').on('select_node.jstree', function(e,data) {
    /*var ref = $(this).jstree(true);
    var nodes = ref.get_checked();  //使用get_checked方法
    $.each(nodes, function(i, nd) {
        if (nd != data.node.id)
            ref.uncheck_node(nd);
    });*/
    $(this).siblings("input").val(data.node.text);
    $(this).hide();
});

//取消选中所属菜单
$('#menutree').on('deselect_node.jstree', function(e,data) {
    $(this).siblings("input").val("");
    $(this).hide();
});

//按下input之外的地方，所属菜单输入框不显示
$(document).click(function(e){
    if ($(e.target)[0] != $("#parentmenuid")[0]){
        $("#menutree").hide();
    }
    if ($(e.target)[0] != $("#menuicon")[0]){
        $("#menuicondiv").hide();
    }
});

//选中图标
$(".item-box").on("click", function(){
    var that = this;
    $(".item-box").each(function(){
        if(this == that){
            //选中
            $(this).addClass("item-box-active");
            $("#menuicon").val($(this).find("span[aria-hidden=true]").attr("class"));
        }else{
            //取消选中
            $(this).removeClass("item-box-active");
        }
    })
});

//图标全部取消选中
function menuIconSelectedClear(){
    $("#menuicon").val("");
    $(".item-box").each(function(){
        $(this).removeClass("item-box-active");
    })
}
//图标选中一个
function menuIconSelected(icon){
    var that = this;
    $(".item-box").each(function(){
        var cla = $(this).find("span[aria-hidden=true]").attr("class");
        if(cla == icon){
            //选中
            $(this).addClass("item-box-active");
            $("#menuicon").val(icon);
        }else{
            //取消选中
            $(this).removeClass("item-box-active");
        }
    })
}

//功能相关
var FunctionTable = function () {
    var initTable = function () {

        var table = $('#function_table');
        table.bootstrapTable({
            striped : true, //是否显示行间隔色
            pageNumber : 1, //初始化加载第一页
            pagination : false,//是否分页
            sidePagination : 'client',//server:服务器端分页|client：前端分页
            pageSize : 10,//单页记录数
            showRefresh : false,//刷新按钮
            idField: 'functionid',
            ajax :function (e) {
                //因为需要做成菜单选择的树形菜单，所以一次获取所有数据，前端分页
                var callback = e.success;
                var menuid = menuIdGet();
                //如果menuid为空，即未选中menu,功能列表不显示
                if(menuid == ""){
                    bootstrapTableDataSet(0, [], callback);
                }else{
                    var da = {
                        userid: "",
                        menuid: menuid,
                        roleid:"",
                        currentpage: "",
                        pagesize: "",
                        startindex: "0",
                        draw: 1
                    };
                    functionDataGet(da, callback);
                }
            },
            columns : [
                {
                    field: 'xuhao',
                    width: 36,
                    title : '序号',
                    formatter: function (value, row, index) {
                        return index + 1;
                    }
                },{
                    field: 'check',  checkbox: true, formatter: function (value, row, index) {
                        if (row.check == true) {
                            //设置选中
                            return {  checked: true };
                        }
                    }
                }, {
                    title : '功能名称',
                    field : 'functionname',
                    sortable : true
                }, {
                    title : '功能代码',
                    field : 'functionid',
                    visible: false
                } , {
                    title : '功能描述',
                    field : 'remark'
                }, {
                    title : '操作',
                    formatter: function (value, row, index) {
                        if(!window.parent.makeEdit(menu,loginSucc.functionlist,"#function_edit")) return '-';
                        return '<a href="javascript:;" id="function_edit" data-id="' + row.functionid + '">编辑</a>'
                    }
                }
            ]
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
        });
    };
    return {
        init: function () {
            initTable();
        }
    };
}();

var FunctionEdit = function() {
    var handleRegister = function() {
        var validator = $('.function-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                functioncode: {
                    required: true
                },
                functionname: {
                    required: true
                }
            },

            messages: {
                functioncode: {
                    required: "功能代码必须输入"
                },
                functionname: {
                    required: "功能名称必须输入"
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

        //确定按钮按下
        $('#function-confirm-btn').click(function() {
            if ($('.function-form').validate().form()) {
                var func = $('.function-form').getFormData();
                func.menuid = menuIdGet();
                if($(".function-form").find("input[name=edittype]").val() == FUNCTIONADD){
                    delete func["functionid"];
                    $("#loading_edit").modal('show');
                    functionAdd(func);
                }else{
                    $("#loading_edit").modal('show');
                    functionEdit(func);
                }
            }
        });
        //增加功能
        $('#fun_add').click(function() {
            if(menuIdGet() == ""){
                alertDialog("请先选择菜单，再增加功能！");
                return;
            }
            validator.resetForm();
            $(".function-form").find(".has-error").removeClass("has-error");
            $("#edit_function").find(".modal-title").text("新增功能");
            $(":input",".function-form").not(":button,:reset,:submit,:radio").val("")
                .removeAttr("checked")
                .removeAttr("selected");
            //操作类型
            $(".function-form").find("input[name=edittype]").val(FUNCTIONADD);
            $('#edit_function').modal('show');
        });
        //编辑菜单
        $("#function_table").on('click', '#function_edit', function (e) {
            e.preventDefault();
            if(menuIdGet() == ""){
                alertDialog("请先选择菜单，再编辑功能！");
                return;
            }
            validator.resetForm();
            $(".function-form").find(".has-error").removeClass("has-error");
            $("#edit_function").find(".modal-title").text("编辑功能");
            var exclude = [];
            var functionid = $(this).attr("data-id");
            var functionlist = $("#function_table").bootstrapTable('getData');
            var func = new Object();
            for(var i=0; i < functionlist.length; i++){
                if(functionid == functionlist[i].functionid){
                    func = functionlist[i];
                }
            }
            var options = { jsonValue: func, exclude:exclude,isDebug: false};
            $(".function-form").initForm(options);
            //操作类型
            $(".function-form").find("input[name=functionid]").val(functionid);
            $(".function-form").find("input[name=edittype]").val(FUNCTIONEDIT);
            $('#edit_function').modal('show');
        })
    };

    return {
        init: function() {
            handleRegister();
        }
    };
}();

var FunctionDelete = function() {
    $('#fun_delete').click(function() {
        if(menuIdGet() == ""){
            alertDialog("请先选择菜单，再编辑功能！");
            return;
        }
        var len = $("#function_table").bootstrapTable('getSelections');
        if(len < 1){
            alertDialog("至少选中一项！");
        }else{
            confirmDialog("数据删除后将不可恢复，您确定要删除吗？", FunctionDelete.deleteFunction)
        }
    });
    return{
        deleteFunction: function(){
            var functionlist = {functionidlist:[]};
            var select = $("#function_table").bootstrapTable('getSelections');
            for(var i=0; i<select.length;i++) {
                functionlist.functionidlist.push(select[i].functionid);
            }
            $("#loading_edit").modal('show');
            functionDelete(functionlist);
        }
    }
}();

function getFunctionDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            functionList = res.functionlist;
            //给页面上的table赋值
            bootstrapTableDataSet(res.totalcount, res.functionlist,  callback);
        }else{
            //给页面上的table赋值
            bootstrapTableDataSet(0, [], callback);
            alertDialog("功能信息获取失败！");
        }
    }else{
        //给页面上的table赋值
        bootstrapTableDataSet(0, [], callback);
        alertDialog("功能信息获取失败！");
    }
}

function functionInfoEditEnd(flg, result, type){
    $("#loading_edit").modal('hide');
    var res = "失败";
    var text = "";
    var alert = "";
    switch (type){
        case FUNCTIONADD:
            text = "新增";
            break;
        case FUNCTIONEDIT:
            text = "编辑";
            break;
        case FUNCTIONDELETE:
            text = "删除";
            break;
    }
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg;
        }
        if (result && result.retcode == SUCCESS) {
            res = "成功";
            $("#function_table").bootstrapTable('destroy');
            FunctionTable.init();
            $('#edit_function').modal('hide');
        }
    }
    if(alert == "") alert = text + "功能" + res + "！";
    App.unblockUI('#lay-out');
    alertDialog(alert);
}

function menuIdGet(){
    var check = $("#menu_table").find("input[type=checkbox]:checked");
    if(check.length <= 0) return "";
    return check.parents("td").siblings().eq(6).find("a").attr("data-menu-id");
}


function parentOrSelf(node, checkId){
    var ref = $("#menutree").jstree(true);
    if(node == checkId){
        return true
    }else{
        var pnode = ref.get_parent(node);
        if(pnode){
            return parentOrSelf(pnode, checkId);
        }else{
            return false;
        }
    }
}