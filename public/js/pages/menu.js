/**
 * Created by Administrator on 2019/2/19.
 */
var menuMake = '<ul class="nav" id="side-menu"><li class="nav-header">' +
        '<div class="profile-element">' +
        '<a href="#">' +
        '<span class="clear" style="text-align: center">' +
            '<span><img alt="image" class="img-circle user-logo" src="' + "/public/img/user.png" + '" /></span>' +
            '<span class="block m-t-xs"><strong class="font-bold">' + loginSucc.userid + '</strong></span>' +
            '<span class="text-muted text-xs block">' + loginSucc.username + '</span>' +
        '</span>' +
        '</a>' +
        '</div>' +
    '</li>';

function makeMenu(data){
    for(var i=0; i<data.length; i++){
        if(data[i].power == 0) {
            if( i == data.length - 1) menuMake += "</ul>";
            continue;
        }
        if(data[i].menutype == 1){
            menuMake += '<li>' +
                '<a href="#" name="' + data[i].menuid + '">' +
                    '<i class="'+ data[i].menuicon +'"></i>' +
                    '<span class="nav-label"> '+ data[i].menuname +' </span>' +
                    '<span class="fa arrow"></span>' +
                '</a>' +
                    '<ul class="nav nav-second-level">'
        }else{
            menuMake += '<li class="nav-item">' +
                '<a href="' + data[i].url + '?username=' + loginSucc.userid + '" class="J_menuItem" data-index="' + data[i].menuid + '">' +
                    '<i class="'+ data[i].menuicon +'"></i>' +
                    '<span class="nav-label"> '+ data[i].menuname +' </span>' +
                '</a>'
        }
        if(data[i].hasOwnProperty("menulist") && data[i].menulist != undefined && data[i].menulist != null ){
            makeMenu(data[i].menulist);
        }else{
            menuMake += "</li>";
            if( i == data.length - 1) menuMake += "</ul>"
        }
    }
    menuMake += "</li>";

}

function makeFunction(menu,data){
    var dataList = data.usermenulist;
    for(var i in dataList){
        if(dataList[i].menuid == menu.substr(0, menu.indexOf("?"))){
            for(var j in dataList[i].functionlist){
                var functionid = "#" + dataList[i].functionlist[j].functioncode;
                if(dataList[i].functionlist[j].power == 1){
                    $(functionid).show();
                }else{
                    $(functionid).hide();
                }
            }
        }
    }
}

//编辑功能判断
function makeEdit(menu,data,id){
    var dataList = data.usermenulist;
    for(var i in dataList){
        if(dataList[i].menuid == menu.substr(0, menu.indexOf("?"))){
            for(var j in dataList[i].functionlist){
                var functionid = "#" + dataList[i].functionlist[j].functioncode;
                //判断该页面的编辑id是否存在
                if(functionid == id){
                    return (dataList[i].functionlist[j].power == 1);
                }
            }
        }
    }
}

function logOutEnd(flg, result){
    if(flg){
        if(result.retcode == SUCCESS){
            //跳转页面
            var form = $("<form></form>").attr("action", "/logout").attr("method", "get");
            form.append($("<input/>").attr("type", "hidden").attr("name", "username").attr("value", loginSucc.userid));
            form.appendTo('body').submit().remove();
        }else{
            alertDialog(result.retmsg)
        }
    }else{
        alertDialog("退出登录失败！")
    }

}