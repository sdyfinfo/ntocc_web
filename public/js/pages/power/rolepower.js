/**
 * Created by Administrator on 2019/2/22.
 */
var powerType = 0;//保存权限 0是菜单 1是按钮
if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        //菜单功能相关
        MenuTable.init();
        //角色功能相关
        RoleTable.init();
        FunctionTable.init();

    });
}

//角色功能相关
var RoleTable = function () {
    var initTable = function () {
        var table = $('#role_table');
        table.bootstrapTable({
            striped : true, //是否显示行间隔色
            pageNumber : 1, //初始化加载第一页
            pagination : false,//是否分页
            sidePagination : 'client',//server:服务器端分页|client：前端分页
            pageSize : 10,//单页记录数
            showRefresh : false,//刷新按钮
            idField: 'roleid',
            checkboxHeader: false,
            height: $(window).height() - 250,
            singleSelect:true,//单选
            ajax :function (e) {
                //因为需要做成菜单选择的树形菜单，所以一次获取所有数据，前端分页
                var callback = e.success;
                var da = {
                    roleid: "",
                    rolename: "",
                    currentpage: "",
                    pagesize: "",
                    startindex: "0",
                    draw: 1
                };
                roleDataGet(da, callback);
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
                    title : '角色名称',
                    field : 'rolename',
                    formatter: function(value, row, index){
                        return '<span data-id="' + row.roleid + '">' + value + '</span>'
                    }
                }
            ],
            //选中roleid，根据roleid查找权限
            onCheck:function(row){
                $('#href1')[0].click();
                jsTreeDataClear($('#menutree'));
                $("#function_table").bootstrapTable('destroy');
                FunctionTable.init();
                var data = {
                    roleid: row.roleid,
                    currentpage: "",
                    pagesize: "",
                    startindex: "0",
                    draw: 1
                };
                rolePowerDataGet(data);
            },
            //选中roleid，根据roleid查找权限
            onUncheck:function(row) {
                $('#href1')[0].click();
                jsTreeDataClear($('#menutree'));
                $("#function_table").bootstrapTable('destroy');
                FunctionTable.init();
                $("#menu_table").bootstrapTable('destroy');
                MenuTable.init();
            }
        });
    };
    return {
        init: function () {
            initTable();
        }
    };
}();

$("#menutree").css('height',$(window).height() - 250);


//模块权限相关
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
            height:$(window).height() - 250,
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
                        row.check = (row.power == "1");
                        if (row.check == true) {
                            //设置选中
                            return {  checked: true };
                        }
                    }
                }, {
                    title : '菜单名称',
                    field : 'menuname'
                }, {
                    title : '类型',
                    field : 'menutype',
                    formatter: function (value, row, index) {
                        if (value == "0") {
                            return "模块";
                        }else{
                            return "页面"
                        }
                    }
                } , {
                    title : '备注',
                    field : 'remark'
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
                //勾选子类
                selectChilds(datas,row,"menuid","parentid",true,'#menu_table');
                // 勾选父类
                selectParentChecked(datas,row,"menuid","parentid",'#menu_table');
                //修改power的值
                changeDataPower(datas);
                // 刷新数据
                //table.bootstrapTable('load', datas);
            },
            onUncheck:function(row){
                var datas = table.bootstrapTable('getData');
                selectChilds(datas,row,"menuid","parentid",false,'#menu_table');
                //修改power的值
                changeDataPower(datas);
                // 刷新数据
                //table.bootstrapTable('load', datas);
            }
        });
    };
    return {
        init: function () {
            initTable();
        }
    };

}();

//按钮权限相关
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
            checkboxHeader: false,//取消全部选中
            //height: 300,
            ajax :function (e) {
                //因为需要做成菜单选择的树形菜单，所以一次获取所有数据，前端分页
                var callback = e.success;
                //角色代码
                var roleselect = [];
                var menuselect = [];
                try{
                    roleselect = $("#role_table").bootstrapTable('getSelections');
                    menuselect = $('#menutree').jstree(true).get_selected(true);
                }catch(err) {

                }
                if(roleselect.length == 0 || menuselect.length == 0 ){
                    bootstrapTableDataSet(0, [], callback);
                    return;
                }
                var rolid  = roleselect[0].roleid;
                var menuid = menuselect[0].id;
                var da = {
                    roleid: rolid,
                    menuid: menuid,
                    userid:"",
                    currentpage: "",
                    pagesize: "",
                    startindex: "0",
                    draw: 1
                };
                roleFunctionDataGet(da, callback);
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
                        row.check = (row.power == 1);
                        if (row.check == true) {
                            return {  checked: true };
                        }
                    }
                }, {
                    title : '功能代码',
                    field : 'functioncode'
                }, {
                    title : '功能名称',
                    field : 'functionname'
                },{
                    title : '',
                    field : 'functionid',
                    visible: false
                },
                {
                    title: '备注',
                    field: 'remark'
                }
            ]
        });
    };
    return {
        init: function () {
            initTable();
        }
    };
}();



//模块权限管理/按钮权限管理（树形结构）
function getMenuDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            //给页面上的table赋值
            bootstrapTreeTableDataSet(res.totalcount, res.menulist, "menulist", "menuid", callback);
        }else{
            //给页面上的table赋值
            bootstrapTreeTableDataSet(0, [], "menulist", "menuid", callback);
            alertDialog("菜单信息获取失败！");
        }
    }else{
        //给页面上的table赋值
        bootstrapTreeTableDataSet(0, [], "menulist", "menuid", callback);
        alertDialog("菜单信息获取失败！");
    }
}

//角色一览（角色名称）
function getRoleDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            bootstrapTableDataSet(res.totalcount, res.rolelist, callback);
        }else{
            bootstrapTableDataSet(0, [], callback);
            alertDialog(result.retmsg);
        }
    }else{
        bootstrapTableDataSet(0, [], callback);
        alertDialog("角色信息获取失败！");
    }
}

//角色按钮权限管理（功能代码，功能名称，备注）
function getRoleFunctionEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            bootstrapTableDataSet(res.totalcount, res.functionlist, callback);
        }else{
            bootstrapTableDataSet(0, [], callback);
            //alertDialog(result.retmsg);
            alertDialog("角色功能信息获取失败！");
        }
    }else{
        bootstrapTableDataSet(0, [], callback);
        alertDialog("角色功能信息获取失败！");
    }
}

//角色菜单权限获取结束
function getRoleOwnPowerEnd(reg,result){
    App.unblockUI('#lay-out');
    if(reg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            menuNameSelectBuild(res.menulist, $("#menutree"), true);
        }else{
            alertDialog("角色权限获取失败！");
        }
    }else{
        alertDialog("角色权限获取失败！");
    }
}

function getRolePowerEnd(reg,result){
    App.unblockUI('#lay-out');
    if(reg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            menuNameSelectBuild(res.menulist, $("#menutree"), true);
            var listNew = [];
            treeGridDataMake(listNew, res.menulist, "menulist", 0, "menuid");
            var returnData = {
                "total": res.totalcount,
                "data": listNew         //服务端分页这个字段名为rows，客户端分页这个字段名为data
            };
            $('#menu_table').bootstrapTable('load',returnData);
        }else{
            menuNameSelectBuild([], $("#menutree"), true);
            alertDialog("角色菜单权限获取失败！");
        }
    }else{
        menuNameSelectBuild([], $("#menutree"), true);
        alertDialog("角色菜单权限获取失败！");
    }
}


//保存
$('#keep_add').click(function(e) {
    if(powerType == 1){
        powerType = 2;
    }
    switch (powerType){
        case 0:        //菜单权限保存
            //判断角色id和菜单id
            if(!getInfoId()){
                alertDialog("请先选择角色再进行分配权限");
                return;
            }
            //获取角色id和菜单id
            var role_sel = $("#role_table").bootstrapTable('getSelections');
            var menu_sel = $('#menu_table').bootstrapTable('getSelections');
            //处理权限菜单
            var menuidlist = [];
            for(var i = 0;i<menu_sel.length;i++){
                menuidlist.push(menu_sel[i].menuid);
            }
            var data = {
                roleid:role_sel[0].roleid,
                menuidlist:menuidlist
            };
            $("#loading_edit").modal('show');
            rolePowerUpdate(data);
            break;
        case 2:         //功能权限保存
            //获取角色id和菜单id
            var role_sel = $("#role_table").bootstrapTable('getSelections');
            var menu_sel = $('#menutree').jstree(true).get_selected(true)[0];
            var fun_sel = $('#function_table').bootstrapTable('getSelections');
            if(menu_sel == undefined || menu_sel.length <= 0){
                alertDialog("请选择菜单再分配权限");
                return;
            }
            //处理功能菜单
            var funlist = [];
            for(var i = 0;i<fun_sel.length;i++){
                funlist.push(fun_sel[i].functionid);
            }
            var data = {
                roleid:role_sel[0].roleid,
                menuid:menu_sel.id,
                functionidlist:funlist
            };
            $("#loading_edit").modal('show');
            roleFunctionUpdate(data);
            break;
    }
});

//判断获取到的数据
function getInfoId(){
    //powerType == 0 保存角色权限
    //powerType == 1 获取角色菜单
    //powerType == 2 保存角色功能
    var role_sel = $("#role_table").bootstrapTable('getSelections');
    var menu_sel = $('#menu_table').bootstrapTable('getSelections');
    var fun_sel = $('#function_table').bootstrapTable('getSelections');
    if(powerType == 0){
        return (role_sel.length > 0 && menu_sel.length > 0)
    }else if(powerType == 1){
        return (role_sel.length > 0)
    }else{
        return (role_sel.length > 0  && fun_sel.length > 0)
    }
}

//选择菜单获取功能
$('#menutree').on("changed.jstree",function(e,node){
    $("#function_table").bootstrapTable('destroy');
    FunctionTable.init();
});

//点击按钮权限事件
function buttonPower(){
    powerType = 1;
    if(!getInfoId()){
        alertDialog("请先选择角色再进行分配权限");
        jsTreeDataClear($('#menutree'));
    }
}

//点击菜单权限时间
function menuPower(){
    powerType = 0;
}

function rolePowerUpdateEnd(flg,result){
    $("#loading_edit").modal('hide');
    var retain = "失败";
    var alert = "";
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg;
        }
        if (result && result.retcode == SUCCESS) {
            retain = "成功";
            //获取角色权限
            var role_sel = $("#role_table").bootstrapTable('getSelections');
            var data = {
                roleid: role_sel[0].roleid,
                currentpage: "",
                pagesize: "",
                startindex: "0",
                draw: 1
            };
            rolePowerDataGet(data);
        }
    }
    if(alert == "") alert = "保存角色权限" + retain + "!";
    App.unblockUI("#lay-out");
    alertDialog(alert);
}

function roleFunctionUpdateEnd(flg,result){
    $("#loading_edit").modal('hide');
    var retain = "失败";
    var alert = "";
    if(flg){
        if (result && result.retcode == SUCCESS) {
            alert = result.retmsg;
            retain = "成功";
            FunctionTable.init();
        }
    }
    if(alert == "") alert = "保存角色功能" + retain + "!";
    App.unblockUI("#lay-out");
    alertDialog(alert);
}
