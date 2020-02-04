/**
 * Created by Jianggy on 2019/8/12.
 */
var userRightUrl = regulateSucc.userHostUrl;
function userDataGet(data, callback){
    App.blockUI({target: '#lay-out',boxed: true});
    if(data == null){
        data = {userid: "", username: "", organid: "", currentpage: "", pagesize: "", startindex: "0", draw: 1}
    }
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: userRightUrl + "userquery",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("userDataGet:" + JSON.stringify(result));
            getUserDataEnd(true, result, callback);
        },
        error: function (errorMsg) {
            console.info("userDataGet-error:" + JSON.stringify(errorMsg));
            getUserDataEnd(false, "", callback);
        }
    });
}

function organDataGet(data, callback){
    App.blockUI({target: '#lay-out',boxed: true});
    if(data == null){
        data = {organid: "", organname: "", currentpage: "", pagesize: "", startindex: "0", draw: 1}
    }
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: userRightUrl + "organquery",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("organDataGet:" + JSON.stringify(result));
            getOrganDataEnd(true, result, callback);
        },
        error: function (errorMsg) {
            console.info("organDataGet-error:" + JSON.stringify(errorMsg));
            getOrganDataEnd(false, "", callback);
        }
    });
}

function userAdd(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: userRightUrl + "useradd",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("userAdd:" + JSON.stringify(result));
            userInfoEditEnd(true, result, USERADD);
        },
        error: function (errorMsg) {
            console.info("userAdd-error:" + JSON.stringify(errorMsg));
            userInfoEditEnd(false, "", USERADD);
        }
    });
}

function userDelete(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: userRightUrl + "userdelete",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("userDelete:" + JSON.stringify(result));
            userInfoEditEnd(true, result, USERDELETE);
        },
        error: function (errorMsg) {
            console.info("userDelete-error:" + JSON.stringify(errorMsg));
            userInfoEditEnd(false, "", USERDELETE);
        }
    });
}

function userEdit(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: userRightUrl + "useredit",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("userEdit:" + JSON.stringify(result));
            userInfoEditEnd(true, result, USEREDIT);
        },
        error: function (errorMsg) {
            console.info("userEdit-error:" + JSON.stringify(errorMsg));
            userInfoEditEnd(false, "", USEREDIT);
        }
    });
}

function passwordReset(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: userRightUrl + "passwordreset",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("passwordReset:" + JSON.stringify(result));
            passwordResetEnd(true, result);
        },
        error: function (errorMsg) {
            console.info("passwordReset-error:" + JSON.stringify(errorMsg));
            passwordResetEnd(false, "");
        }
    });
}

function passwordModify(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: userRightUrl + "passwordchange",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("passwordModify:" + JSON.stringify(result));
            passwordModifyEnd(true, result);
        },
        error: function (errorMsg) {
            console.info("passwordModify-error:" + JSON.stringify(errorMsg));
            passwordModifyEnd(false, "");
        }
    });
}

function roleAdd(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: userRightUrl + "roleadd",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("roleAdd:" + JSON.stringify(result));
            roleInfoEditEnd(true, result, ROLEADD);
        },
        error: function (errorMsg) {
            console.info("roleAdd-error:" + JSON.stringify(errorMsg));
            roleInfoEditEnd(false, "", ROLEADD);
        }
    });
}

function roleDelete(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: userRightUrl + "roledelete",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("roleDelete:" + JSON.stringify(result));
            roleInfoEditEnd(true, result, ROLEDELETE);
        },
        error: function (errorMsg) {
            console.info("roleDelete-error:" + JSON.stringify(errorMsg));
            roleInfoEditEnd(false, "", ROLEDELETE);
        }
    });
}

function roleEdit(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: userRightUrl + "roleedit",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("roleEdit:" + JSON.stringify(result));
            roleInfoEditEnd(true, result, ROLEEDIT);
        },
        error: function (errorMsg) {
            console.info("roleEdit-error:" + JSON.stringify(errorMsg));
            roleInfoEditEnd(false, "", ROLEEDIT);
        }
    });
}

function organAdd(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: userRightUrl + "organadd",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("organAdd:" + JSON.stringify(result));
            organInfoEditEnd(true, result, ORGANADD);
        },
        error: function (errorMsg) {
            console.info("organAdd-error:" + JSON.stringify(errorMsg));
            organInfoEditEnd(false, "", ORGANADD);
        }
    });
}

function organDelete(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: userRightUrl + "organdelete",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("organDelete:" + JSON.stringify(result));
            organInfoEditEnd(true, result, ORGANDELETE);
        },
        error: function (errorMsg) {
            console.info("organDelete-error:" + JSON.stringify(errorMsg));
            organInfoEditEnd(false, "", ORGANDELETE);
        }
    });
}

function organEdit(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: userRightUrl + "organedit",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("organEdit:" + JSON.stringify(result));
            organInfoEditEnd(true, result, ORGANEDIT);
        },
        error: function (errorMsg) {
            console.info("organEdit-error:" + JSON.stringify(errorMsg));
            organInfoEditEnd(false, "", ORGANEDIT);
        }
    });
}

function menuDataGet(data, callback){
    App.blockUI({target:'#lay-out',boxed: true});
    if(data == null){
        data = {currentpage: "", pagesize: "", startindex: "0", draw: 1}
    }
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: userRightUrl + "menuquery",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("menuDataGet:" + JSON.stringify(result));
            getMenuDataEnd(true, result, callback);
        },
        error: function (errorMsg) {
            console.info("menuDataGet-error:" + JSON.stringify(errorMsg));
            getMenuDataEnd(false, "", callback);
        }
    });
}

function menuAdd(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: userRightUrl + "menuadd",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("menuAdd:" + JSON.stringify(result));
            menuInfoEditEnd(true, result, MENUADD);
        },
        error: function (errorMsg) {
            console.info("menuAdd-error:" + JSON.stringify(errorMsg));
            menuInfoEditEnd(false, "", MENUADD);
        }
    });
}

function menuDelete(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: userRightUrl + "menudelete",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("menuDelete:" + JSON.stringify(result));
            menuInfoEditEnd(true, result, MENUDELETE);
        },
        error: function (errorMsg) {
            console.info("menuDelete-error:" + JSON.stringify(errorMsg));
            menuInfoEditEnd(false, "", MENUDELETE);
        }
    });
}

function menuEdit(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: userRightUrl + "menuedit",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("menuEdit:" + JSON.stringify(result));
            menuInfoEditEnd(true, result, MENUEDIT);
        },
        error: function (errorMsg) {
            console.info("menuEdit-error:" + JSON.stringify(errorMsg));
            menuInfoEditEnd(false, "", MENUEDIT);
        }
    });
}

function functionDataGet(data, callback){
    App.blockUI({target:'#lay-out',boxed: true});
    if(data == null){
        data = {menuid:"", currentpage: "", pagesize: "", startindex: "0", draw: 1}
    }
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: userRightUrl + "functionquery",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("functionDataGet:" + JSON.stringify(result));
            getFunctionDataEnd(true, result, callback);
        },
        error: function (errorMsg) {
            console.info("functionDataGet-error:" + JSON.stringify(errorMsg));
            getFunctionDataEnd(false, "", callback);
        }
    });
}

function functionAdd(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: userRightUrl + "functionadd",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("functionAdd:" + JSON.stringify(result));
            functionInfoEditEnd(true, result, FUNCTIONADD);
        },
        error: function (errorMsg) {
            console.info("functionAdd-error:" + JSON.stringify(errorMsg));
            functionInfoEditEnd(false, "", FUNCTIONADD);
        }
    });
}

function functionDelete(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: userRightUrl + "functiondelete",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("functionDelete:" + JSON.stringify(result));
            functionInfoEditEnd(true, result, FUNCTIONDELETE);
        },
        error: function (errorMsg) {
            console.info("functionDelete-error:" + JSON.stringify(errorMsg));
            functionInfoEditEnd(false, "", FUNCTIONDELETE);
        }
    });
}

function functionEdit(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: userRightUrl + "functionedit",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("functionEdit:" + JSON.stringify(result));
            functionInfoEditEnd(true, result, FUNCTIONEDIT);
        },
        error: function (errorMsg) {
            console.info("functionEdit-error:" + JSON.stringify(errorMsg));
            functionInfoEditEnd(false, "", FUNCTIONEDIT);
        }
    });
}

//用户权限请求
function userPowerDataGet(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: userRightUrl + "userpowerquery",
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("userPowerDataGet:" + JSON.stringify(result));
            getUserPowerEnd(true, result);
        },
        error: function (errorMsg) {
            console.info("userPowerDataGet-error:" + JSON.stringify(errorMsg));
            getUserPowerEnd(false, "");
        }
    });
}


//角色查询
function roleDataGet(data, callback){
    App.blockUI({target: '#lay-out',boxed: true});
    if(data == null){
        data = {roleid: "", rolename: "", currentpage: "", pagesize: "", startindex: "0", draw: 1}
    }
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: userRightUrl + "rolequery",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("roleDataGet:" + JSON.stringify(result));
            getRoleDataEnd(true, result, callback);
        },
        error: function (errorMsg) {
            console.info("roleDataGet-error:" + JSON.stringify(errorMsg));
            getRoleDataEnd(false, "", callback);
        }
    });
}

//角色菜单权限查询
function rolePowerDataGet(data, callback){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: userRightUrl + "rolepowerquery",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("rolePowerDataGet:" + JSON.stringify(result));
            getRolePowerEnd(true, result, callback);
        },
        error: function (errorMsg) {
            console.info("rolePowerDataGet-error:" + JSON.stringify(errorMsg));
            getRolePowerEnd(false, "", callback);
        }
    });
}

//角色功能查詢(按钮管理权限)
function roleFunctionDataGet(data, callback){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: userRightUrl + "functionquery",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("roleFunctionDataGet:" + JSON.stringify(result));
            getRoleFunctionEnd(true, result, callback);
        },
        error: function (errorMsg) {
            console.info("roleFunctionDataGet-error:" + JSON.stringify(errorMsg));
            getRoleFunctionEnd(false, "", callback);
        }
    });
}

//角色权限保存
function rolePowerUpdate(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: userRightUrl + "rolepoweredit",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("rolePowerUpdate:" + JSON.stringify(result));
            rolePowerUpdateEnd(true, result, '');
        },
        error: function (errorMsg) {
            console.info("rolePowerUpdate-error:" + JSON.stringify(errorMsg));
            rolePowerUpdateEnd(false, "", '');
        }
    });
}

//角色功能保存
function roleFunctionUpdate(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: userRightUrl + "rolefunctionedit",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("roleFunctionUpdate:" + JSON.stringify(result));
            roleFunctionUpdateEnd(true, result, '');
        },
        error: function (errorMsg) {
            console.info("roleFunctionUpdate-error:" + JSON.stringify(errorMsg));
            roleFunctionUpdateEnd(false, "", '');
        }
    });
}

//用户权限保存
function userPowerUpdate(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: userRightUrl + "userpoweredit",    //请求发送到TestServlet处
        data: sendMessageEdit('', data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("userPowerUpdate:" + JSON.stringify(result));
            userPowerUpdateEnd(true, result, '');
        },
        error: function (errorMsg) {
            console.info("userPowerUpdate-error:" + JSON.stringify(errorMsg));
            userPowerUpdateEnd(false, "", '');
        }
    });
}

//用户功能保存
function userFunctionUpdate(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: userRightUrl + "userfunctionedit",    //请求发送到TestServlet处
        data: sendMessageEdit('', data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("userFunctionUpdate:" + JSON.stringify(result));
            userFunctionUpdateEnd(true, result, '');
        },
        error: function (errorMsg) {
            console.info("userFunctionUpdate:" + JSON.stringify(errorMsg));
            userFunctionUpdateEnd(false, "", '');
        }
    });
}

//用户登录获取功能权限
function userFunctionListGet(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: userRightUrl + "userfunctionquerys",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("functionDataGet:" + JSON.stringify(result));
            userFunctionListEnd(true, result);
        },
        error: function (errorMsg) {
            console.info("functionDataGet-error:" + JSON.stringify(errorMsg));
            userFunctionListEnd(false, "");
        }
    });
}


//获取系统参数管理
function regulateDataGet(data, callback){
    App.blockUI({target: '#lay-out',boxed: true});
    if(data == null){
        data = {id: "", currentpage: "", pagesize: "", startindex: "0", draw: 1}
    }
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: userRightUrl + "regquery",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("regulateDataGet:" + JSON.stringify(result));
            getRegulateDataEnd(true, result, callback);
        },
        error: function (errorMsg) {
            console.info("regulateDataGet-error:" + JSON.stringify(errorMsg));
            getRegulateDataEnd(false, "", callback);
        }
    });
}

//新增参数
function regAdd(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: userRightUrl + "regadd",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("regAdd:" + JSON.stringify(result));
            regInfoEditEnd(true, result, REGADD);
        },
        error: function (errorMsg) {
            console.info("regAdd-error:" + JSON.stringify(errorMsg));
            regInfoEditEnd(false, "", REGADD);
        }
    });
}

//服务商信息编辑
function regEdit(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: userRightUrl + "regedit",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("regEdit:" + JSON.stringify(result));
            regInfoEditEnd(true, result, REGEDIT);
        },
        error: function (errorMsg) {
            console.info("regEdit-error:" + JSON.stringify(errorMsg));
            regInfoEditEnd(false, "", REGEDIT);
        }
    });
}


//删除参数
function regDelete(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: userRightUrl + "regdelete",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("regDelete:" + JSON.stringify(result));
            regInfoEditEnd(true, result, REGDELETE);
        },
        error: function (errorMsg) {
            console.info("regDelete-error:" + JSON.stringify(errorMsg));
            regInfoEditEnd(false, "", REGDELETE);
        }
    });
}