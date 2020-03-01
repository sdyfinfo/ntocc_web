/**
 * Created by zxm on 2019/7/1.
 */

var menuList = [];
var userList = [];
var powerType = 0; //保存权限类型  0：菜单  1：功能  2：功能保存
if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        //菜单相关
        MenuTable.init();
        //机构相关
        organDataGet();
        //功能菜单
        FunctionTable.init();
        //用户列表
        UserTable.init();
    });
}

//菜单相关
var MenuTable = function () {
    var initTable = function () {
        var table = $('#mkuai_table');
        table.bootstrapTable({
            striped : true, //是否显示行间隔色
            pageNumber : 1, //初始化加载第一页
            pagination : false,//是否分页
            sidePagination : 'client',//server:服务器端分页|client：前端分页
            pageSize : 10,//单页记录数
            showRefresh : false,//刷新按钮
            idField: 'menuid',
            checkboxHeader: false,
            height: $(window).height() - 250,
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
                    title : '',
                    formatter: function (value, row, index) {
                        return index + 1;
                    }
                },{
                    field: 'check',
                    checkbox: true,
                    formatter: function(value,row,index){
                        if(row.power == "1" || row.check == true){
                            return {
                                checked:true
                            };
                        }
                    }
                }, {
                    title : '菜单名称',
                    field : 'menuname',
                    sortable : true
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
                selectChilds(datas,row,"menuid","parentid",true,'#mkuai_table');
                // 勾选父类
                selectParentChecked(datas,row,"menuid","parentid",'#mkuai_table');
                //修改power的值
                changeDataPower(datas);
                // 刷新数据
                //table.bootstrapTable('load', datas);
            },
            onUncheck:function(row){
                //将取消勾选的power改为0
                var datas = table.bootstrapTable('getData');
                selectChilds(datas,row,"menuid","parentid",false,'#mkuai_table');
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

//用户列表
var UserTable = function () {
    var initTable = function () {
        var table = $('#user_table');
        table.bootstrapTable({
            striped : true, //是否显示行间隔色
            pageNumber : 1, //初始化加载第一页
            pagination : false,//是否分页
            sidePagination : 'client',//server:服务器端分页|client：前端分页
            pageSize : 10,//单页记录数
            showRefresh : false,//刷新按钮
            idField: 'userid',
            checkboxHeader: false,
            singleSelect:true,
            height: 300,
            ajax :function (e) {
                //因为需要做成菜单选择的树形菜单，所以一次获取所有数据，前端分页
                var callback = e.success;
                //机构代码
                var menuselect = [];
                try{
                    menuselect = $('#organtreequery').jstree(true).get_selected(true);
                }catch(err) {
                }
                if(menuselect.length == 0 ){
                    bootstrapTableDataSet(0, [], callback);
                    return;
                }
                var organid = menuselect[0].id;
                var da = {
                    userid: "",
                    username: "",
                    organid:organid,
                    currentpage: "",
                    pagesize: "",
                    startindex: "0",
                    draw: 1
                };
                userDataGet(da, callback);
            },
            columns : [
                {
                    field: 'xuhao',
                    title : '',
                    width :30,
                    formatter: function (value, row, index) {
                        return index + 1;
                    }
                },{
                    field: 'check',width :36,  checkbox: true, formatter: function (value, row, index) {
                        if (row.check == true) {
                            //设置选中
                            return {  checked: true };
                        }
                    }
                }, {
                    title : '用户列表',
                    field : 'userid',
                    formatter: function (value, row, index) {
                        for(var i in userList){
                            if(value == userList[i].userid){
                                return userList[i].username+"("+value+")";
                            }
                        }
                    }

                }
            ],
            //选中userid，根据userid查找权限
            onCheck:function(row){
                $('#href1')[0].click();
                jsTreeDataClear($('#menutree'));
                $("#function_table").bootstrapTable('destroy');
                FunctionTable.init();
                var data = {
                    userid: row.userid,
                    currentpage: "",
                    pagesize: "",
                    startindex: "0",
                    draw: 1
                };
                userPowerDataGet(data);
            },
            onUncheck:function(){
                $('#href1')[0].click();
                jsTreeDataClear($('#menutree'));
                $("#function_table").bootstrapTable('destroy');
                FunctionTable.init();
                $("#mkuai_table").bootstrapTable('destroy');
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

//功能列表
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
            //height: 500,
            ajax :function (e) {
                //因为需要做成菜单选择的树形菜单，所以一次获取所有数据，前端分页
                var callback = e.success;
                //用户代码
                var userselect = [];
                var menuselect = [];
                try{
                    userselect = $("#user_table").bootstrapTable('getSelections');
                    menuselect = $('#menutree').jstree(true).get_selected(true);
                }catch(err) {
                }
                if(userselect.length == 0 || menuselect.length == 0 ){
                    bootstrapTableDataSet(0, [], callback);
                    return;
                }
                var userid  = userselect[0].userid;
                var menuid = menuselect[0].id;
                var da = {
                    userid: userid,
                    menuid: menuid,
                    roleid:"",
                    currentpage: "",
                    pagesize: "",
                    startindex: "0",
                    draw: 1
                };
                functionDataGet(da, callback);
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
                        if (row.check == true ) {
                            //设置选中
                            return {
                                checked: true
                            };
                        }
                    }
                }, {
                    title : '功能名称',
                    field : 'functionname'
                }, {
                    title : '功能代码',
                    field : 'functioncode'
                } , {
                    title : '',
                    field : 'functionid',
                    visible: false
                } , {
                    title : '功能描述',
                    field : 'remark'
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

function getMenuDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            menuList = res.menulist;
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

function getOrganDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var organList = result.response.list;
            var data = [];
            organListTreeDataMake(organList, data);
            $("#organtreequery").jstree({
                "core" : {
                    "themes" : {
                        "responsive": false
                    },
                    "data": data
                },

                "types" : {
                    "default" : {
                        "icon" : "fa fa-folder icon-state-warning icon-lg"
                    },
                    "file" : {
                        "icon" : "fa fa-file icon-state-warning icon-lg"
                    }
                }
            });
        }else{
            alertDialog("机构列表获取失败！");
        }
    }else{
        alertDialog("机构列表获取失败！");
    }
}

//选择机构获取用户
$('#organtreequery').on("changed.jstree",function(e,node){
    //跳转到模块权限管理
    $('#href1')[0].click();
    //按钮权限树清空
    jsTreeDataClear($('#menutree'));
    //按钮表清空
    $("#function_table").bootstrapTable('destroy');
    FunctionTable.init();
    //菜单表清空
    $("#mkuai_table").bootstrapTable('destroy');
    MenuTable.init();
    //用户表重新做成
    $("#user_table").bootstrapTable('destroy');
    UserTable.init();
});

//用户列表请求结束
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

//用户权限请求结束
function getUserPowerEnd(reg,result){
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
            $('#mkuai_table').bootstrapTable('load',returnData);
        }else{
            menuNameSelectBuild([], $("#menutree"), true);
            alertDialog("用户权限获取失败！");
        }
    }else{
        menuNameSelectBuild([], $("#menutree"), true);
        alertDialog("用户权限获取失败！");
    }
}

//保存用户权限
$('#keep_add').click(function(e) {
    if(powerType == 1){
        powerType = 2;
    }
    switch (powerType){
        case 0:        //菜单权限保存
            //判断用户id和菜单id
            if(!getInfoId()){
                alertDialog("请先选择用户再进行分配权限");
                return;
            }
            //获取用户id和菜单id
            var user_sel = $("#user_table").bootstrapTable('getSelections');
            var menu_sel = $('#mkuai_table').bootstrapTable('getSelections');
            //处理权限菜单
            var menuidlist = [];
            for(var i = 0;i<menu_sel.length;i++){
                menuidlist.push(menu_sel[i].menuid);
            }
            var data = {
                userid:user_sel[0].userid,
                menuidlist:menuidlist
            };
            $("#loading_edit").modal('show');
            userPowerUpdate(data);
            break;
        case 2:         //功能权限保存
            //判断用户id，菜单id和功能id
            //获取用户id和菜单id
            var user_sel = $("#user_table").bootstrapTable('getSelections');
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
                userid:user_sel[0].userid,
                parentmenuid:menu_sel.id,
                functionidlist:funlist
            };
            $("#loading_edit").modal('show');
            userFunctionUpdate(data);
            break;
    }

});

//判断获取到的数据
function getInfoId(){
    var user_sel = $("#user_table").find("input[type=checkbox]:checked");
    var menu_sel = $('#mkuai_table').find('input[type=checkbox]:checked');
    var fun_sel = $('#function_table').find('input[type=checkbox]:checked');
    if(powerType != 2){
        return (user_sel.length > 0 && menu_sel.length > 0)
    }else{
        return (user_sel.length > 0  && fun_sel.length > 0)
    }
}

function userPowerUpdateEnd(flg,result,type){
    $("#loading_edit").modal('hide');
    var retain = "失败";
    var alert = "";
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg;
        }
        if (result && result.retcode == SUCCESS) {
            retain = "成功";
            //获取用户权限
            var user_sel = $("#user_table").bootstrapTable('getSelections');
            var data = {
                userid: user_sel[0].userid,
                currentpage: "",
                pagesize: "",
                startindex: "0",
                draw: 1
            };
            userPowerDataGet(data);
        }
    }
    if(alert == "") alert = "保存用户权限" + retain + "!";
    App.unblockUI("#lay-out");
    alertDialog(alert);
}

//点击按钮权限事件
function buttonPower(){
    powerType = 1;
    if(!getInfoId()){
        alertDialog("请先选择用户再进行分配权限");
        jsTreeDataClear($('#menutree'));
    }
}

//点击菜单权限时间
function menuPower(){
    powerType = 0;
}

function getUserOwnPowerEnd(reg,result){
    App.unblockUI('#lay-out');
    if(reg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            //做成新增或者删除菜单的树形结构
            //menuList = res.menulist;
            menuNameSelectBuild(res.menulist, $("#menutree"));
        }else{
            alertDialog("用户权限获取失败！");
        }
    }else{
        alertDialog("用户权限获取失败！");
    }
}

//选择菜单获取功能
$('#menutree').on("changed.jstree",function(e,node){
    $("#function_table").bootstrapTable('destroy');
    FunctionTable.init();
});

function getFunctionDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
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

function userFunctionUpdateEnd(flg,result){
    $("#loading_edit").modal('hide');
    var retain = "失败";
    var alert = "";
    if(flg){
        if (result && result.retcode == SUCCESS) {
            alert = result.retmsg;
            retain = "成功";
            //menuNameSelectBuild(menuList, $("#menutree"));
            FunctionTable.init();
        }
    }
    if(alert == "") alert = "保存用户功能" + retain + "!";
    App.unblockUI("#lay-out");
    alertDialog(alert);
}