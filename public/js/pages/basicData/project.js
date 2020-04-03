/**
 * Created by Administrator on 2020/2/6 0006.
 */

var projectList = [];
var routeInfo = {};
var goodsTypeList,unitList = [];
var pageSize;  //表格显示页数，全选会用到

if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        fun_power();
        //根据用户判断否显示所属机构
        organDisplayCheck();
        //获取机构
        organDataGet();
        //字典获取
        //货物类型获取
        var list = ["10005","10006"];
        for(var i in list){
            var data = {lx:list[i]};
            dictQuery(data);
        }
        //项目表格
        ProjectTable.init();
        //项目表操作
        ProjectEdit.init();
    });
}

//项目表格
var ProjectTable = function () {
    var initTable = function () {
        var table = $('#pro_table');
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
            "autoWidth": true,
            "scrollY":        ($(window).height())*0.7,
            "deferRender":    true,
            "scrollX":        true,
            "scrollCollapse": true,
            "ajax":function (data, callback, settings) {
                //获取页数
                pageSize = data.length == -1 ? "": data.length;
                $(".group-checkable").prop("checked", false);
                var organname = $("#organids").val() || "";
                var formData = $(".inquiry-form").getFormData();
                var da = {
                    userid:loginSucc.userid,
                    proname: formData.projectname,
                    organids:$("#organlist").find("option[value='"+organname+"']").attr("data-organid") || "",
                    currentpage: (data.start / data.length) + 1,
                    pagesize: data.length == -1 ? "": data.length,
                    startindex: data.start,
                    draw: data.draw
                };
                projectDataGet(da, callback);
            },
            "initComplete": function(settings, json) {
                //根据用户判断否显示所属机构
                organDisplayCheck();
            },
            columns: [//返回的json数据在这里填充，注意一定要与上面的<th>数量对应，否则排版出现扭曲
                { "data": null},
                { "data": null},
                { "data": "proid",visible: false },
                { "data": "organname",sClass:"organ-display" },
                { "data": "proname" },
                { "data": "linelist" },
                { "data": "addtime" },
                { "data": "state"},
                { "data": null }
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
                },{
                    "targets": [5],
                    "render": function (data, type, row, meta) {
                        //做成可收缩格式
                        return formatRoute(data);
                    }
                },
                {
                    "targets": [6],
                    "render": function (data, type, row, meta) {
                        return dateTimeFormat(data);
                    }
                },{
                    "targets": [7],
                    "render": function (data, type, row, meta) {
                        return statusFormat(data);
                    }
                },{
                    "targets": [8],
                    "render": function (data, type, row, meta) {
                        var edit = "";
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
                $('td:eq(0),td:eq(1),td:eq(5),td:eq(7)', nRow).attr('style', 'text-align: center;');
            }
        });
        //table.draw( false );
        $('.group-checkable').change(function () {
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
            if(checkChooseAll("#pro_table",pageSize,projectList)){
                $(".group-checkable").prop("checked",true);
            }else{
                $(".group-checkable").prop("checked",false);
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

//项目查询
$("#pro_inquiry").on("click", function(){
    ProjectTable.init();
});

//查询框所属机构
$("#organids").blur(function(){
    var value = $(this).val();
    var list = [];
    for(var i = 0;i<organList.length;i++){
        list.push(organList[i].organname);
    }
    if(list.indexOf(value) == -1){  //不存在
        $(this).val("");
    }
});

//将路线做成可收缩样式
function formatRoute(data){
    //如果线路不为空，显示data
    if(data.length != 0){
        var content = "";
        for(var i = 0; i<data.length;i++){
            content += "<div><a href='javascript:;' id='route_detail' data-routeid='"+data[i].lineid+"'>"+data[i].line+"</a></div>";
        }
        var main =
            "<div>"+
            "<div id='routeOpen'><i class='iconfont icon-jianhao'>点击收回</i></div>"+
            "<div id='routeContent'>"+content+"</div>"+
            "</div>";
        return main;
    }else{
        return '';
    }
}

//线路展开/收回
$("#pro_table").on('click','#routeOpen',function(){
    if($(this).find(".icon-jianhao").length != 0){ //已展开
        $(this).siblings("#routeContent").hide();
        $(this).find("i").removeClass('icon-jianhao');
        $(this).find("i").addClass('icon-jiahao');
        $(this).find("i").html("点击展开");
    }else{
        $(this).siblings("#routeContent").show();
        $(this).find("i").removeClass('icon-jiahao');
        $(this).find("i").addClass('icon-jianhao');
        $(this).find("i").html("点击收回");
    }
});

//项目状态显示
function statusFormat(data){
    var content;
    switch (data){
        case "0":  //启用
            content =
                "<div class='switch'>"+
                    "<div class='onoffswitch'>"+
                    "<input type='checkbox' checked='' class='onoffswitch-checkbox'>"+
                        "<label class='onoffswitch-label' data-status='1' id='statusChange'>"+
                            "<span class='inner on_inner' style='float: left'>启用</span>"+
                            "<span class='switch' style='float: right'></span>"+
                        "</label>"+
                    "</div>"+
                "</div>";
            break;
        case "1":  //启用
            content =
                "<div class='switch'>"+
                    "<div class='onoffswitch'>"+
                        "<input type='checkbox' checked='' class='onoffswitch-checkbox'>"+
                        "<label class='onoffswitch-label' style='border: 2px solid #ff0000;' data-status='0' id='statusChange'>"+
                            "<span class='inner off_inner' style='float: right'>停用</span>"+
                            "<span class='switch' style='float: left'></span>"+
                        "</label>"+
                    "</div>"+
                "</div>";
            break;
    }
    return content;
}

//项目状态更改
var StatusChange = function(){
    var project = {};
    $("#pro_table").on('click','#statusChange',function(){
        //获取id和status
        var row = $(this).parents('tr')[0];
        var proid = $("#pro_table").dataTable().fnGetData(row).proid;
        project.proid = proid;
        project.proname = $("#pro_table").dataTable().fnGetData(row).proname;
        project.state = $(this).data('status');
        project.userid = loginSucc.userid;
        //先提示
        confirmDialog("您确定要更改该项目状态吗？", StatusChange.changeStatus);
    });
    return{
        changeStatus: function(){
            $("#loading_edit").modal('show');
            projectState(project);
        }
    }
}();

//查看线路详细信息
$("#pro_table").on('click','#route_detail',function(){
    //获取线路id
    var data = {};
    data.lid = $(this).data("routeid");
    lineDataGet(data);
});

//项目表操作
var ProjectEdit = function() {
    var handleRegister = function() {
        var validator = $('.register-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                proname: {
                    required: true
                }
            },

            messages: {
                proname: {
                    required: "项目名称必须输入"
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

        //点击确定按钮
        $('#register-btn').click(function() {
            btnDisable($('#register-btn'));
            if ($('.register-form').validate().form()) {
                var project = $('.register-form').getFormData();
                project.userid = loginSucc.userid;
            }
            if($("input[name=edittype]").val() == PROJECTADD){
                $("#loading_edit").modal('show');
                projectAdd(project);
            }else {
                $("#loading_edit").modal('show');
                projectEdit(project,PROJECTEDIT);
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
            $("input[name=edittype]").val(PROJECTADD);
            $('#edit_pro').modal('show');
        });
        //编辑项目
        $('#pro_table').on('click', '#op_edit', function (e) {
            e.preventDefault();
            //清除校验错误信息
            validator.resetForm();
            $(".register-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("编辑项目");
            var exclude = [];
            var row = $(this).parents('tr')[0];
            var proid = $("#pro_table").dataTable().fnGetData(row).proid;
            var project = new Object();
            for(var i=0; i < projectList.length; i++){
                if(proid == projectList[i].proid){
                    project = projectList[i];
                }
            }
            var options = { jsonValue: project, exclude:exclude,isDebug: false};
            $(".register-form").initForm(options);
            $("input[name=edittype]").val(PROJECTEDIT);
            $('#edit_pro').modal('show');
        });
    };
    return {
        init: function() {
            handleRegister();
        }
    };
}();

//项目删除
var ProjectDelete = function() {
    $('#op_del').click(function() {
        var len = $(".checkboxes:checked").length;
        if(len < 1){
            alertDialog("至少选中一项！");
        }else{
            confirmDialog("数据删除后将不可恢复，您确定要删除吗？", ProjectDelete.deletePro)
        }
    });
    return{
        deletePro: function(){
            var prolist = {proidlist:[]};
            $(".checkboxes:checked").parents("td").each(function () {
                var row = $(this).parents('tr')[0];
                prolist.proidlist.push($("#pro_table").dataTable().fnGetData(row).proid);
            });
            $("#loading_edit").modal('show');
            projectDelete(prolist);
        }
    }
}();

//项目查询返回结果
function getProjectDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {

            var res = result.response;
            projectList = res.projectlist;
            tableDataSet(res.draw, res.totalcount, res.totalcount, res.projectlist, callback);
        }else{
            tableDataSet(0, 0, 0, [], callback);
            alertDialog("项目信息获取失败！");
        }
    }else{
        tableDataSet(0, 0, 0, [], callback);
        alertDialog("项目信息获取失败！");
    }
}

//项目操作返回结果
function projectEditEnd(flg, result, type){
    $("#loading_edit").modal('hide');
    var res = "失败";
    var text = "";
    var alert = "";
    switch (type){
        case PROJECTADD:
            text = "新增";
            break;
        case PROJECTEDIT:
            text = "编辑";
            break;
        case PROJECTDELETE:
            text = "删除";
            break;
        case PROJECTSTATUS:
            text = "状态设置";
            break;
    }
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg;
        }
        if (result && result.retcode == SUCCESS) {
            res = "成功";
            ProjectTable.init();
            $('#edit_pro').modal('hide');
        }
    }
    if(alert == ""){
        if(type == PROJECTSTATUS){
            alert ="项目"+ text + res + "！";
        }else{
            alert = text + "项目" + res + "！";
        }
    }
    App.unblockUI('#lay-out');
    alertDialog(alert);
}

//线路信息获取返回结果
function getlineDataEnd(flg,result){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            routeInfo = res.list[0];
            //显示路线信息
            routeInfoDisplay();
        }else{
            alertDialog("线路信息获取失败！");
        }
    }else{
        alertDialog("线路信息获取失败！");
    }
}

//显示路线信息
function routeInfoDisplay(){
    var exclude = [];
    var options = { jsonValue: routeInfo, exclude:exclude,isDebug: false};
    $(".route-form").initForm(options);
    for(var i in projectList){
        if(routeInfo.project_id == projectList[i].proid){
            $("#edit_route").find("input[name=proname]").val(projectList[i].proname);
        }
    }
    //全部为只读
    $("#edit_route").find('.form-control').attr("disabled","disabled");
    $('#edit_route').modal('show');
}

//字典获取
function getDictDataEnd(flg, result){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            dictList = res.dictlist;
            for(var i = 0; i < dictList.length; i++){
                switch (dictList[i].lx){
                    case "10005":
                        goodsTypeList = dictList;
                        $("#goods_type").append("<option value='"+dictList[i].code+"'>"+ dictList[i].value +"</option>");
                        break;
                    case "10006":
                        unitList = dictList;
                        $("#unit").append("<option value='"+dictList[i].code+"'>"+ dictList[i].value +"</option>");
                        break;
                }
            }
        }
    }
}

//获取机构结果返回
function getOrganDataEnd(flg, result){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            organList = res.list;
            for(var i in organList){
                if(organList[i].organlist == undefined){
                    $("#organlist").append('<option data-organid = "'+organList[i].organid+'" value="'+organList[i].organname+'"></option>');
                }
            }
        }else{
            alertDialog("机构信息获取失败！");
        }
    }else{
        alertDialog("机构信息获取失败！");
    }
}