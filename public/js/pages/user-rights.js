/**
 * Created by Jianggy on 2019/8/12.
 */
var userRightUrl = regulateSucc.userHostUrl;
var businessUrl = regulateSucc.businessUrl;
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


function userInformationGet(data, callback){
    App.blockUI({target: '#lay-out',boxed: true});
    if(data == null){
        data = {userid: "", username: "", organid: "", currentpage: "", pagesize: "", startindex: "0", draw: 1}
    }
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: userRightUrl + "userquerys",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("userInformationGet:" + JSON.stringify(result));
            getUserInformationEnd(true, result, callback);
        },
        error: function (errorMsg) {
            console.info("userInformationGet-error:" + JSON.stringify(errorMsg));
            getUserInformationEnd(false, "", callback);
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
        contentType: false,
        processData:false,
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: userRightUrl + "useredit",    //请求发送到TestServlet处
        data: data,
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

//收货人
function consigneeidDateGet(data,callback){
    App.blockUI({target: '#lay-out',boxed: true});
    if(data == null){
        data = {conid: "", consignee:"", currentpage: "", pagesize: "", startindex: "0", draw: 1}
    }
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: businessUrl + "consigneequery",               //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("consigneeidDateGet:" + JSON.stringify(result));
            getconsigneeidDataEnd(true, result, callback);
        },
        error: function (errorMsg) {
            console.info("consigneeidDateGet-error:" + JSON.stringify(errorMsg));
            getconsigneeidDataEnd(false, "", callback);
        }
    });
}

//收货人信息新增
function gennAdd(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: businessUrl + "consigneeadd",    //请求发送到TestServlet处
        data: sendMessageEdit('', data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("consigeenEdit:" + JSON.stringify(result));
            gennEditEnd(true, result, GEENADD);
        },
        error: function (errorMsg) {
            console.info("consigeenEdit-error:" + JSON.stringify(errorMsg));
            gennEditEnd(false, "", GEENADD);
        }
    });
}

//收货人信息修改
function geenEdit(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: businessUrl + "consigneeedit",    //请求发送到TestServlet处
        data: sendMessageEdit('', data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("geenEdit:" + JSON.stringify(result));
            gennEditEnd(true, result, GENNEDIT);
        },
        error: function (errorMsg) {
            console.info("geenEdit-error:" + JSON.stringify(errorMsg));
            gennEditEnd(false, "", GENNEDIT);
        }
    });
}


//货物类型
function didDateGet(data,callback){
    App.blockUI({target: '#lay-out',boxed: true});
    if(data == null){
        data = {did: "", lx:"10005", currentpage: "", pagesize: "", startindex: "0", draw: 1}
    }
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: userHostUrl + "dictquery",               //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("didDateGet:" + JSON.stringify(result));
            getdidDataEnd(true, result, callback);
        },
        error: function (errorMsg) {
            console.info("didDateGet-error:" + JSON.stringify(errorMsg));
            getdidDataEnd(false, "", callback);
        }
    });
}

//项目查询
function projectDataGet(data,callback){
    App.blockUI({target: '#lay-out',boxed: true});
    if(data == null){
        data = {proname: "", currentpage: "", pagesize: "", startindex: "0", draw: 1}
    }
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: businessUrl + "projectquery",                    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("projectDataGet:" + JSON.stringify(result));
            getProjectDataEnd(true, result, callback);
        },
        error: function (errorMsg) {
            console.info("projectDataGet-error:" + JSON.stringify(errorMsg));
            getProjectDataEnd(false, "", callback);
        }
    });
}

//项目新增
function projectAdd(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: businessUrl + "projectadd",    //请求发送到TestServlet处
        data: sendMessageEdit('', data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("projectAdd:" + JSON.stringify(result));
            projectEditEnd(true, result, PROJECTADD);
        },
        error: function (errorMsg) {
            console.info("projectAdd-error:" + JSON.stringify(errorMsg));
            projectEditEnd(false, "", PROJECTADD);
        }
    });
}

//项目编辑
function projectEdit(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: businessUrl + "projectedit",    //请求发送到TestServlet处
        data: sendMessageEdit('', data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("projectEdit:" + JSON.stringify(result));
            projectEditEnd(true, result, PROJECTEDIT);
        },
        error: function (errorMsg) {
            console.info("projectEdit-error:" + JSON.stringify(errorMsg));
            projectEditEnd(false, "", PROJECTEDIT);
        }
    });
}

//项目状态更改
function projectState(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: businessUrl + "projectprohibit",    //请求发送到TestServlet处
        data: sendMessageEdit('', data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("projectState:" + JSON.stringify(result));
            projectEditEnd(true, result, PROJECTSTATUS);
        },
        error: function (errorMsg) {
            console.info("projectState-error:" + JSON.stringify(errorMsg));
            projectEditEnd(false, "", PROJECTSTATUS);
        }
    });
}

//项目删除
function projectDelete(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: businessUrl + "projectdelete",    //请求发送到TestServlet处
        data: sendMessageEdit('', data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("projectEdit:" + JSON.stringify(result));
            projectEditEnd(true, result, PROJECTDELETE);
        },
        error: function (errorMsg) {
            console.info("projectEdit-error:" + JSON.stringify(errorMsg));
            projectEditEnd(false, "", PROJECTDELETE);
        }
    });
}

//获取线路详细信息
function routeDataGet(data){
    App.blockUI({target: '#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: "http://127.0.0.1:8007/ywt/web/front/routequery",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("routeDataGet:" + JSON.stringify(result));
            getRouteDataEnd(true, result);
        },
        error: function (errorMsg) {
            console.info("routeDataGet-error:" + JSON.stringify(errorMsg));
            getRouteDataEnd(false, "");
        }
    });
}


//线路查询
function lineDataGet(data,callback){
    App.blockUI({target: '#lay-out',boxed: true});
    if(data == null){
        data = {projectname: "", currentpage: "", pagesize: "", startindex: "0", draw: 1}
    }
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: businessUrl + "linequery",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("lineDataGet:" + JSON.stringify(result));
            getlineDataEnd(true, result, callback);
        },
        error: function (errorMsg) {
            console.info("lineDataGet-error:" + JSON.stringify(errorMsg));
            getlineDataEnd(false, "", callback);
        }
    });
}

//车辆查询
function vehiceDataGet(data,callback){
    App.blockUI({target: '#lay-out',boxed: true});
    if(data == null){
        data = {platenumber: "", platecolor:"",vehicletype:"",currentpage: "", pagesize: "", startindex: "0", draw: 1}
    }
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: businessUrl + "vehiclequery",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("vehiceDataGet:" + JSON.stringify(result));
            getVehiceDataEnd(true, result, callback);
        },
        error: function (errorMsg) {
            console.info("vehiceDataGet-error:" + JSON.stringify(errorMsg));
            getVehiceDataEnd(false, "", callback);
        }
    });
}

//车辆新增
function vehiceAdd(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: false,
        processData:false,
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: businessUrl + "vehicleadd",    //请求发送到TestServlet处
        data: data,
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("vehiceAdd:" + JSON.stringify(result));
            vehiceEditEnd(true, result, VEHICEADD);
        },
        error: function (errorMsg) {
            console.info("vehiceAdd-error:" + JSON.stringify(errorMsg));
            vehiceEditEnd(false, "", VEHICEADD);
        }
    });
}

//车辆编辑
function vehiceEdit(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: false,
        processData:false,
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: businessUrl + "vehicleedit",    //请求发送到TestServlet处
        data: data,
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("vehiceEdit:" + JSON.stringify(result));
            vehiceEditEnd(true, result, VEHICEEDIT);
        },
        error: function (errorMsg) {
            console.info("vehiceEdit-error:" + JSON.stringify(errorMsg));
            vehiceEditEnd(false, "", VEHICEEDIT);
        }
    });
}

//车辆删除
function vehiceDelete(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: businessUrl + "vehicledelete",    //请求发送到TestServlet处
        data: sendMessageEdit('', data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("vehiceDelete:" + JSON.stringify(result));
            vehiceEditEnd(true, result, VEHICEDELETE);
        },
        error: function (errorMsg) {
            console.info("vehiceDelete-error:" + JSON.stringify(errorMsg));
            vehiceEditEnd(false, "", VEHICEDELETE);
        }
    });
}

//车辆导入
function vehiceUpload(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: false,
        processData:false,
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: businessUrl + "vehicleimport",    //请求发送到TestServlet处
        data: data,
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("vehiceUpload:" + JSON.stringify(result));
            vehiceEditEnd(true, result, VEHICEUPLOAD);
        },
        error: function (errorMsg) {
            console.info("vehiceUpload-error:" + JSON.stringify(errorMsg));
            vehiceEditEnd(false, "", VEHICEUPLOAD);
        }
    });
}

//线路新增
function lineAdd(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: businessUrl + "lineadd",    //请求发送到TestServlet处
        data: sendMessageEdit('', data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("lineAdd:" + JSON.stringify(result));
            lineEditEnd(true, result, PROJECTADD);
        },
        error: function (errorMsg) {
            console.info("lineAdd-error:" + JSON.stringify(errorMsg));
            lineEditEnd(false, "", PROJECTADD);
        }
    });
}

//线路编辑
function lineEdit(data,type){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: businessUrl + "lineedit",    //请求发送到TestServlet处
        data: sendMessageEdit('', data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("lineEdit:" + JSON.stringify(result));
            lineEditEnd(true, result, type);
        },
        error: function (errorMsg) {
            console.info("lineEdit-error:" + JSON.stringify(errorMsg));
            lineEditEnd(false, "", type);
        }
    });
}

//删除线路信息
function lineDelete(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: businessUrl + "linedelete",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("lineDelete:" + JSON.stringify(result));
            lineEditEnd(true, result, LINEDELETE);
        },
        error: function (errorMsg) {
            console.info("lineDelete-error:" + JSON.stringify(errorMsg));
            lineEditEnd(false, "", LINEDELETE);
        }
    });
}


//地址管理查询列表
function addressDataGet(data,callback){
    App.blockUI({target: '#lay-out',boxed: true});
    if(data == null){
        data = {aid: "", mailing_address:"", currentpage: "", pagesize: "", startindex: "0", draw: 1}
    }
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: "http://127.0.0.1:8007/ywt/web/front/addressquery",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("addressDataGet:" + JSON.stringify(result));
            getaddressDataEnd(true, result, callback);
        },
        error: function (errorMsg) {
            console.info("addressDataGet-error:" + JSON.stringify(errorMsg));
            getaddressDataEnd(false, "", callback);
        }
    });
}
//地址管理新增
function addrsAdd(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: businessUrl + "addressadd",    //请求发送到TestServlet处
        data: sendMessageEdit('', data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("addrsAdd:" + JSON.stringify(result));
            addrEditEnd(true, result, ADDRADD);
        },
        error: function (errorMsg) {
            console.info("addrsAdd-error:" + JSON.stringify(errorMsg));
            addrEditEnd(false, "", ADDRADD);
        }
    });
}

//地址管理修改
function addrsEdit(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: businessUrl + "addressedit",    //请求发送到TestServlet处
        data: sendMessageEdit('', data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("addrsEdit:" + JSON.stringify(result));
            addrEditEnd(true, result, ADDRSEDIT);
        },
        error: function (errorMsg) {
            console.info("addrsEdit-error:" + JSON.stringify(errorMsg));
            addrEditEnd(false, "", ADDRSEDIT);
        }
    });
}

//地址管理删除
function addrDelete(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: businessUrl + "addressdelete",    //请求发送到TestServlet处
        data: sendMessageEdit('', data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("addrDelete:" + JSON.stringify(result));
            addrEditEnd(true, result, ADDRDELETE);
        },
        error: function (errorMsg) {
            console.info("addrDelete-error:" + JSON.stringify(errorMsg));
            addrEditEnd(false, "", ADDRDELETE);
        }
    });
}


//司机查询
function deiverDataGet(data,callback){
    App.blockUI({target: '#lay-out',boxed: true});
    if(data == null){
        data = {platenumber: "", name:"",id_number:"",receivables:"",currentpage: "", pagesize: "", startindex: "0", draw: 1}
    }
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: businessUrl + "driverquery",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("deiverDataGet:" + JSON.stringify(result));
            getDriverDataEnd(true, result, callback);
        },
        error: function (errorMsg) {
            console.info("deiverDataGet-error:" + JSON.stringify(errorMsg));
            getDriverDataEnd(false, "", callback);
        }
    });
}

//司机新增
function driverAdd(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: false,
        processData:false,
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: businessUrl + "driveradd",    //请求发送到TestServlet处
        data: data,
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("driverAdd:" + JSON.stringify(result));
            driverEditEnd(true, result, DRIVERADD);
        },
        error: function (errorMsg) {
            console.info("driverAdd-error:" + JSON.stringify(errorMsg));
            driverEditEnd(false, "", DRIVERADD);
        }
    });
}

//司机编辑
function driverEdit(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: false,
        processData:false,
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: businessUrl + "driveredit",    //请求发送到TestServlet处
        data: data,
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("driverEdit:" + JSON.stringify(result));
            driverEditEnd(true, result, DRIVEREDIT);
        },
        error: function (errorMsg) {
            console.info("driverEdit-error:" + JSON.stringify(errorMsg));
            driverEditEnd(false, "", DRIVEREDIT);
        }
    });
}

//司机删除
function driverDelete(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: businessUrl + "driverdelete",    //请求发送到TestServlet处
        data: sendMessageEdit('', data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("driverDelete:" + JSON.stringify(result));
            driverEditEnd(true, result, DRIVERDELETE);
        },
        error: function (errorMsg) {
            console.info("driverDelete-error:" + JSON.stringify(errorMsg));
            driverEditEnd(false, "", DRIVERDELETE);
        }
    });
}

//司机状态修改
function driverState(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: businessUrl + "driverStateUpdate",    //请求发送到TestServlet处
        data: sendMessageEdit('', data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("driverState:" + JSON.stringify(result));
            driverEditEnd(true, result, DRIVERSTATUS);
        },
        error: function (errorMsg) {
            console.info("driverState-error:" + JSON.stringify(errorMsg));
            driverEditEnd(false, "", DRIVERSTATUS);
        }
    });
}

//司机导入
function driverUpload(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: false,
        processData:false,
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: businessUrl + "driverimport",    //请求发送到TestServlet处
        data: data,
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("driverUpload:" + JSON.stringify(result));
            driverEditEnd(true, result, DRIVERUPLOAD);
        },
        error: function (errorMsg) {
            console.info("driverUpload-error:" + JSON.stringify(errorMsg));
            driverEditEnd(false, "", DRIVERUPLOAD);
        }
    });
}

//字典获取
function dictQuery(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: userRightUrl + "dictquery",    //请求发送到TestServlet处
        data: sendMessageEdit('', data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("dictQuery:" + JSON.stringify(result));
            getDictDataEnd(true, result);
        },
        error: function (errorMsg) {
            console.info("dictQuery-error:" + JSON.stringify(errorMsg));
            getDictDataEnd(false, "");
        }
    });
}

//发货人信息查询
function consignorDataGet(data,callback){
    App.blockUI({target: '#lay-out',boxed: true});
    if(data == null){
        data = {consignor: "",invoice_rise:"", currentpage: "", pagesize: "", startindex: "0", draw: 1}
    }
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: businessUrl + "consignorquery",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("consignorDataGet:" + JSON.stringify(result));
            getConsignorDataEnd(true, result, callback);
        },
        error: function (errorMsg) {
            console.info("consignorDataGet-error:" + JSON.stringify(errorMsg));
            getConsignorDataEnd(false, "", callback);
        }
    });
}

//发货人新增
function consignorAdd(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: businessUrl + "consignoradd",    //请求发送到TestServlet处
        data: sendMessageEdit('', data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("consignorAdd:" + JSON.stringify(result));
            consignorEditEnd(true, result, CONSIGNORADD);
        },
        error: function (errorMsg) {
            console.info("consignorAdd-error:" + JSON.stringify(errorMsg));
            consignorEditEnd(false, "", CONSIGNORADD);
        }
    });
}

//发货人编辑
function consignorEdit(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: businessUrl + "consignoredit",    //请求发送到TestServlet处
        data: sendMessageEdit('', data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("consignorEdit:" + JSON.stringify(result));
            consignorEditEnd(true, result, CONSIGNOREDIT);
        },
        error: function (errorMsg) {
            console.info("consignorEdit-error:" + JSON.stringify(errorMsg));
            consignorEditEnd(false, "", CONSIGNOREDIT);
        }
    });
}

//发货人删除
function consignorDelete(data){
    App.blockUI({target:'#lay-out',boxed: true});
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: businessUrl + "consignordelete",    //请求发送到TestServlet处
        data: sendMessageEdit('', data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("consignorDelete:" + JSON.stringify(result));
            consignorEditEnd(true, result, CONSIGNORDELETE);
        },
        error: function (errorMsg) {
            console.info("consignorDelete-error:" + JSON.stringify(errorMsg));
            consignorEditEnd(false, "", CONSIGNORDELETE);
        }
    });
}

//获取发票抬头信息
function invoiceDataGet(data,callback){
    App.blockUI({target: '#lay-out',boxed: true});
    if(data == null){
        data = {invoice_rise: "", currentpage: "", pagesize: "", startindex: "0", draw: 1}
    }
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: businessUrl + "invoicequery",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("invoiceDataGet:" + JSON.stringify(result));
            getInvoiceDataEnd(true, result, callback);
        },
        error: function (errorMsg) {
            console.info("invoiceDataGet-error:" + JSON.stringify(errorMsg));
            getInvoiceDataEnd(false, "", callback);
        }
    });
}

//获取收款人信息
function payeeDataGet(data,callback){
    App.blockUI({target: '#lay-out',boxed: true});
    if(data == null){
        data = {consignor: "",invoice_rise:"", currentpage: "", pagesize: "", startindex: "0", draw: 1}
    }
    $.ajax({
        type: "post",
        contentType: "application/json",
        async: true,           //异步请求（同步请求将会锁住浏览器，用户其他操作必须等待请求完成才可以执行）
        url: businessUrl + "payeequery",    //请求发送到TestServlet处
        data: sendMessageEdit(DEFAULT, data),
        dataType: "json",        //返回数据形式为json
        success: function (result) {
            console.info("payeeDataGet:" + JSON.stringify(result));
            getPayeeDataEnd(true, result, callback);
        },
        error: function (errorMsg) {
            console.info("payeeDataGet-error:" + JSON.stringify(errorMsg));
            getPayeeDataEnd(false, "", callback);
        }
    });
}