/**
 * Created by Lenovo on 2020/2/14.
 */

var organList = [];
var ushList = [];
var pageSize;  //表格显示页数，全选会用到

if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function () {
        fun_power();
        //时间控件
        ComponentsDateTimePickers.init();
        //获取机构信息
        organDataGet();
        //U盾列表
        ushTable.init();
        ushEdit.init();
    })
}

var ComponentsDateTimePickers = function () {
    var handleDatePickers = function () {

        if (jQuery().datepicker) {
            var data = {
                rtl: App.isRTL(),
                orientation: "auto",
                autoclose: true,
                //language:"zh-CN",
                todayBtn:true,
                format:"yyyy-mm-dd",
                todayHighlight: true
            };
            $("#startdate").datepicker(data).on('changeDate',function(e){
                var startTime = e.date;
                $('#enddate').datepicker('setStartDate',startTime);
            });
            $("#enddate").datepicker(data).on('changeDate',function(e){
                var endTime = e.date;
                $('#startdate').datepicker('setEndDate',endTime);
            });
        }
    };

    return {
        init: function () {
            handleDatePickers();
        }
    };
}();


//表格
var ushTable = function () {
    var initTable = function () {
        var table = $('#ush_table');
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
            "bAutoWidth": true,
            "scrollY":        ($(window).height())*0.7,
            "deferRender":    true,
            "scrollX":        true,
            "scrollCollapse": true,
            "ajax":function (data, callback, settings) {
                //获取页数
                pageSize = data.length == -1 ? "": data.length;
                $(".group-checkable").prop("checked", false);
                var formData = $(".inquiry-form").getFormData();
                var startdate = formData.startdate.replace(/-/g,'');
                var enddate = formData.enddate.replace(/-/g,'');
                var da = {
                    startdate: startdate,
                    enddate:enddate,
                    unumber:formData.unumber,
                    shieid: formData.shieid,
                    currentpage: (data.start / data.length) + 1,
                    pagesize: data.length == -1 ? "": data.length,
                    startindex: data.start,
                    draw: data.draw
                };
                ushieldGet(da, callback);
            },
            columns: [//返回的json数据在这里填充，注意一定要与上面的<th>数量对应，否则排版出现扭曲
                { "data": null},
                { "data": null},
                { "data": "shieid",visible: false},
                { "data": "unumber"},
                { "data": "secret_key"},
                { "data": "check"},
                { "data": "status"},
                { "data": "uname"},
                { "data": "addtime"},
                { "data": null}
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
                    "targets":[5],
                    "render":function (data, type, row, meta) {
                        if (data == "0") {
                           return  '<a href="javascript:;" id="op_check">否</a>';
                        }else{
                            return  '已通过';
                        }
                    }
                },
                {
                    "targets":[6],
                    "render":function (data, type, row, meta) {
                        var status = "已绑定";
                        if(data == "0"){
                            status = "未绑定";
                        }
                        return status;
                    }
                },
                {
                    "targets":[8],
                    "render": function (data, type, row ,meta) {
                        return dateTimeFormat(data);
                    }
                },
                {
                    "targets": [9],
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
                $('td:eq(0),td:eq(1),td:eq(2),td:eq(3),td:eq(4),td:eq(5),td:eq(7),td:eq(8)', nRow).attr('style', 'text-align: center;');
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
            if(checkChooseAll("#ush_table",pageSize,ushList)){
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



var ushEdit = function(){
    var handleRegister = function() {
        var validator = $('.register-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                unumber:{
                    required: true
                },
                secret_key:{
                    required: true
                }
            },

            messages: {
                unumber: {
                    required: "请输入U盾编号"
                },
                secret_key: {
                    required: "请输入U盾秘钥"
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

        //关联机构判断
        $("#organname").blur(function(){
            var value = $(this).val();
            var list = [];
            for(var i = 0;i<organList.length;i++){
                list.push(organList[i].organname);
            }
            if(list.indexOf(value) == -1){  //不存在
                $(this).val("");
                $("#organid").val("");
            }
        });
        $("#organname").change(function(e){
            var value = $(this).val();
            var id = $("#organList").find("option[value='"+value+"']").attr("data-oid");
            if(id != undefined){
                $("#organid").val(id);
            }else{
                $("#organid").val("");
            }
        });

        //点击确定按钮edittype
        $('#register-btn').click(function() {
            btnDisable($('#register-btn'));
            if ($('.register-form').validate().form()) {
                var ush = $('.register-form').getFormData();
                ush.organid = $("#organid").val();
                if($("input[name=edittype]").val() == USHADD) {
                    $("#loading_edit").modal('show');
                    ushieldAdd(ush);
                }if($("input[name=edittype]").val() == USHEDIT){
                    if(ush.organid_before == ush.organid){
                        alertDialog("请选择您要修改的其他关联机构！");
                        return;
                    }
                    delete ush.organid_before;
                    $("#loading_edit").modal('show');
                    ushieldEdit(ush,USHEDIT);
                }if($("input[name=edittype]").val() == USHCHECK){
                    if (ush.passwd == "") {
                        alertDialog("请输密码！");
                        return;
                    }
                    $("#loading_edit").modal('show');
                    ushieldCheck(ush, USHCHECK);
                }
            }
        });
        //新增u盾
        $('#op_add').click(function() {
            //清除校验错误信息
            validator.resetForm();
            $(".register-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("新增U盾信息");
            $(":input",".register-form").not(":button,:reset,:submit,:radio,:input[name=birthday],#evaluationneed").val("")
                .removeAttr("checked")
                .removeAttr("selected");
            ushieldAllone(1);
            $(".register-form").find("input[name=shieid]").attr("readonly", false);
            $("input[name=edittype]").val(USHADD);
            //隐藏关联一级机构和动态密码
            $(".con-hide2,.con-hide3").hide();
            $(".con-hide1").show();
            $('#edit_ush').modal('show');
        });
        //编辑u盾
        $('#ush_table').on('click', '#op_edit', function (e) {
            e.preventDefault();
            //清除校验错误信息
            validator.resetForm();
            $(".register-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("编辑U盾信息");
            var exclude = [];
            var row = $(this).parents('tr')[0];
            var shieid = $("#ush_table").dataTable().fnGetData(row).shieid;
            var ushield = new Object();
            for(var i=0; i < ushList.length; i++){
                if(shieid == ushList[i].shieid){
                    ushield = ushList[i];
                }
            }
            //效验通过或者已绑定状态
            if(ushield.check == "1"){
                //U盾相关只读
                ushieldAllone(0);
                //机构可编辑
                ushieldAlltwo(1);
            }else{
                //机构只读
                ushieldAlltwo(0);
                //U盾相关可编辑
                ushieldAllone(1);
            }
            var options = { jsonValue: ushield, exclude:exclude,isDebug: false};
            $(".register-form").initForm(options);
            //显示关联机构
            if(ushield.organid!=""){
                for(var i in organList){
                    if(ushield.organid == organList[i].organid){
                        $("#organname").val(organList[i].organname)
                    }
                }
            }else{
                $("#organname").val("");
            }
            $("#organid").val(ushield.organid);
            $("input[name=organid_before]").val(ushield.organid);
            $("input[name=edittype]").val(USHEDIT);
            $(".con-hide1,.con-hide2").show();
            $(".con-hide3").hide();
            $('#edit_ush').modal('show');
        });
        //输入动态密码
        $("#ush_table").on('click', "#op_check", function(e){
            e.preventDefault();
            //清除校验错误信息
            validator.resetForm();
            $(".register-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("输入动态密码");
            var exclude = [];
            var row = $(this).parents('tr')[0];
            var shieid = $("#ush_table").dataTable().fnGetData(row).shieid;
            var ushield = new Object();
            for(var i=0; i < ushList.length; i++){
                if(shieid == ushList[i].shieid){
                    ushield = ushList[i];
                }
            }
            var options = { jsonValue: ushield, exclude:exclude,isDebug: false};
            $(".register-form").initForm(options);
            $("input[name=edittype]").val(USHCHECK);
            $(".con-hide1,.con-hide2").hide();
            $(".con-hide3").show();
            //清空动态密码输入框
            $("#passwd").val("");
            $('#edit_ush').modal('show');
        });
    };
    return {
        init: function() {
            handleRegister();
        }
    };
}();

//效验
function ushieldAllone(id){
    if(id == 0){ //不允许
        //全部只读
        $(".register-form").find("input[name=unumber],input[name=secret_key]").attr("readonly", "readonly");
    }else{
        $(".register-form").find("input[name=unumber],input[name=secret_key]").removeAttr("readonly");
    }
}

//关联机构
function ushieldAlltwo(id){
    if(id == 0){ //不允许
        //全部只读
        $(".register-form").find("input[name=organ]").attr("readonly", "readonly");
    }else{
        $(".register-form").find("input[name=organ]").removeAttr("readonly");
    }
}

//查询按钮
$("#us_inquiry").on("click",function(){
    ushTable.init();
});



//返回U盾管理结果
function getushieldDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            ushList = res.shielist;
            tableDataSet(res.draw, res.totalcount, res.totalcount, res.shielist, callback);
        }else{
            tableDataSet(0, 0, 0, [], callback);
            alertDialog("U盾管理获取失败！");
        }
    }else{
        tableDataSet(0, 0, 0, [], callback);
        alertDialog("U盾管理获取失败！");
    }
}

//获取机构信息
function getOrganDataEnd(flg, result){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            organList = res.list;
            for(var i = 0; i < organList.length; i++){
                $("#organList").append("<option data-oid='"+organList[i].organid+"' value='"+organList[i].organname+"'></option>");
            }
        }else{
            alertDialog("机构信息获取失败！");
        }
    }else{
        alertDialog("机构信息获取失败！");
    }
}


function getushEditEnd(flg, result, type){
    $("#loading_edit").modal('hide');
    var res = "失败";
    var text = "";
    var alert = "";
    switch (type){
        case USHADD:
            text = "新增";
            break;
        case USHEDIT:
            text = "编辑";
            break;
        case USHDELETE:
            text = "删除";
            break;
        case USHPLOAD:
            text = "导入";
            break;
        case USHCHECK:
            text = "效验";
            break;
    }
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg;
        }
        if (result && result.retcode == SUCCESS) {
            res = "成功";
            ushTable.init();
            $('#edit_ush').modal('hide');
            $('#ush_upload').modal('hide');
        }
    }
    if(alert == ""){
        if(type == USHPLOAD){
            alert ="U盾信息"+ text + res + "！";
        }else{
            alert = text + "U盾信息" + res + "！";
        }
    }
    if(alert == ""){
        if(type == USHCHECK){
            alert = "效验" + text + res + "！";
        }else{
            alert = text + "效验" + res + "！";
        }
    }
    App.unblockUI('#lay-out');
    alertDialog(alert);
}

//删除
var UshDelete = function() {
    $('#op_del').click(function() {
        var len = $(".checkboxes:checked").length;
        if(len < 1){
            alertDialog("至少选中一项！");
        }else{
            confirmDialog("数据删除后将不可恢复，您确定要删除吗？", UshDelete.deleteush)
        }
    });
    return{
        deleteush: function(){
            var ush = {shieidlist:[]};
            $(".checkboxes:checked").parents("td").each(function () {
                var row = $(this).parents('tr')[0];
                ush.shieidlist.push($("#ush_table").dataTable().fnGetData(row).shieid);
            });
            $("#loading_edit").modal('show');
            ushieldDelete(ush);
        }
    }
}();

//导入U盾
$("#us_import").on("click",function(){
    $(".pay_upload").find("input[type=file]").value = "";
    $("#upload_name").hide();
    $("#ush_upload").modal('show');
});

//U盾点击上传
$("#ush_file").change(function(){
    var img = $(this).siblings("label").find("img");
    if(this.files[0]){
        //显示上传文件名
        $("#upload_name").show();
        $("#upload_name").html("文件名："+this.files[0].name+"   文件大小："+((Number(this.files[0].size))/1024).toFixed(1)+"KB");
        var formData = new FormData();
        formData.append("file",this.files[0]);
        var userid = {
            "userid":loginSucc.userid,
            "organid":loginSucc.organid
        }
        var data = sendMessageEdit(DEFAULT,userid);
        formData.append("body",new Blob([data],{type:"application/json"}));
        $("#loading_edit").modal('show');
        ushieldUpload(formData);
    }else{
        $("#upload_name").html("");
    }
});


//U盾文件拖拽上传
function allowDrop(ev) {
    //阻止浏览器默认打开文件的操作
    ev.preventDefault();
}
function drop(ev) {
    ev.preventDefault();
    var files = ev.dataTransfer.files;
    var len = files.length;
    if(len!=0){
        var filesName=files[0].name;
        var extStart=filesName.lastIndexOf(".");
        var ext=filesName.substring(extStart,filesName.length).toUpperCase();
        if(ext ==".txt" || ext ==".TXT"){ //判断是否是需要的问件类型
            //显示上传文件名
            $("#upload_name").show();
            $("#upload_name").html("文件名："+filesName+"   文件大小："+((Number(files[0].size))/1024).toFixed(1)+"KB");
            var formData = new FormData();
            formData.append("file",files[0]);
            var userid = {
                "userid":loginSucc.userid,
                "organid":loginSucc.organid
            };
            var data = sendMessageEdit(DEFAULT,userid);
            formData.append("body",new Blob([data],{type:"application/json"}));
            $("#loading_edit").modal('show');
            ushieldUpload(formData);
        }else{
            alertDialog("请选择.txt类型的文件上传！");
            return false;
        }
    }else{
        $("#upload_name").html("");
    }
}
