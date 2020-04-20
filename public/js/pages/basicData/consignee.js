/**
 * Created by Lenovo on 2020/2/12.
 */
var conList,organList = [];
var pageSize;  //表格显示页数，全选会用到

if(App.isAngularJsApp() == false){
    jQuery(document).ready(function(){
        fun_power();
        //根据用户判断否显示所属机构
        organDisplayCheck();
        //获取机构
        organDataGet();
        //省市区三级联动
        addressDispaly("#unloading_provincecode");
        //收货人信息列表
        ConsTable.init();
        //收货人信息
        ConsEdit.init();
    });
}


//收货人信息列表
var ConsTable = function(){
    var initTable = function(){
        var table = $('#gnee_table');
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
                var formData = $(".inquiry-form").getFormData();
                var organname = $("#organids").val() || "";
                var da = {
                    conid: formData.conid,
                    consignee: formData.consignee,
                    mobile: formData.mobile,
                    state:formData.state,
                    organids:$("#organlist").find("option[value='"+organname+"']").attr("data-organid") || "",
                    currentpage: (data.start / data.length) + 1,
                    pagesize: data.length == -1 ? "": data.length,
                    startindex: data.start,
                    draw: data.draw
                };
                consigneeidDateGet(da, callback);
            },
            "drawCallback": function(settings, json) {
                //根据用户判断否显示所属机构
                organDisplayCheck();
            },
            columns:[ //返回的json 数据在这里填充，注意一定要与上面的<th>数量对应，否则排版出现扭曲
                {"data":null},
                {"data":null},
                {"data":"conid", visible: false},
                {"data":"organname",sClass:"organ-display"},
                {"data":"consignee"},
                {"data":"mobile"},
                {"data":"unloading_place"},
                {"data":"unloading_address"},
                {"data":"state"},
                {"data":null}
            ],
            columnDefs:[
                {
                    "targets":[0],
                    "data":null,
                    "render": function (data, type, row, meta) {
                        return meta.settings._iDisplayStart + meta.row + 1; //行号
                    }
                },
                {
                    "targets":[1],
                    "render":function (data, type, row, meta) {
                        return '<input type="checkbox" class="checkboxes" value="1" />';
                    }
                },
                {
                    "targets":[8],
                    "render": function (data, type, row ,meta) {
                        var text = "";
                        switch(data){
                            case "0":
                                text = "正常";
                                break;
                            case "1":
                                text = "异常";
                                break;
                        }
                        return text;
                    },
                    "createdCell":function(td,cellData,rowData,row,col){
                        console.log(rowData);
                        if(rowData['state'] == "1"){
                            $(td).parent().css('background-color','#ed5565');
                        }
                    }
                },
                {
                    "targets":[9],
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
                $('td:eq(0),td:eq(1),td:eq(4),td:eq(7),td:eq(8)', nRow).attr('style', 'text-align: center;');
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
            if(checkChooseAll("#gnee_table",pageSize,conList)){
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


var ConsEdit = function(){
    var handleRegister = function() {
        var validator = $('.register-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                consignee: {
                    required: true
                },
                mobile:{
                    required: true,
                    phone:true
                },
                credit_code:{
                    creditCode:true
                }

            },

            messages: {
                consignee: {
                    required: "请输入收货人"
                },
                mobile:{
                    required: "请输入收货人电话"
                }
                //,
                //credit_code:{
                //    required: "请输入社会信用代码(或身份证号)"
                //}
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
        jQuery.validator.addMethod("phone", function(value, element) {
            var tel = /^1[3456789]\d{9}$/;
            return this.optional(element) || (tel.test(value));
        }, "请正确填写您的手机号码");

        jQuery.validator.addMethod("creditCode", function(value, element) {
            var reg =/^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
            return this.optional(element) || (reg.test(value));
        }, "请正确填写您的社会信用代码(或身份证号)");

        //点击确定按钮
        $('#register-btn').click(function() {
            btnDisable($('#register-btn'));
            if ($('.register-form').validate().form()) {
                var genn = $('.register-form').getFormData();
                //卸货省市区
                genn.unloading_province = "";
                if(genn.unloading_provincecode != ""){
                    genn.unloading_province = $("#unloading_provincecode").find("option:selected").text();
                }
                genn.unloading_city = "";
                if(genn.unloading_citycode != ""){
                    genn.unloading_city = $("#unloading_citycode").find("option:selected").text();
                }
                genn.unloading_county = "";
                if(genn.unloading_countycode != ""){
                    genn.unloading_county = $("#unloading_countycode").find("option:selected").text();
                }
                if($("input[name=edittype]").val() == GENNADD){
                    $("#loading_edit").modal('show');
                    gennAdd(genn);
                }else {
                    $("#loading_edit").modal('show');
                    geenEdit(genn,GENNEDIT);
                }
            }

        });
        //新增项目
        $('#op_add').click(function() {
            //清除校验错误信息
            validator.resetForm();
            $(".register-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("新增收货人");
            $(":input",".register-form").not(":button,:reset,:submit,:radio,:input[name=birthday],#evaluationneed").val("")
                .removeAttr("checked")
                .removeAttr("selected");
            $(".register-form").find("input[name=conid]").attr("readonly", false);
            $("input[name=edittype]").val(GENNADD);
            $('#edit_gnee').modal('show');
        });
        //编辑项目
        $('#gnee_table').on('click', '#op_edit', function (e) {
            e.preventDefault();
            //清除校验错误信息
            validator.resetForm();
            $(".register-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("编辑收货人");
            var exclude = [];
            var row = $(this).parents('tr')[0];
            var conid = $("#gnee_table").dataTable().fnGetData(row).conid;
            var cons = new Object();
            for(var i=0; i < conList.length; i++){
                if(conid == conList[i].conid){
                    cons = conList[i];
                }
            }
            //省市区显示
            areaDisplay(cons.unloading_provincecode,cons.unloading_citycode,"#unloading_citycode","#unloading_countycode");
            var options = { jsonValue: cons, exclude:exclude,isDebug: false};
            $(".register-form").initForm(options);
            $("input[name=edittype]").val(GENNEDIT);
            $('#edit_gnee').modal('show');
        });
    };
    return {
        init: function() {
            handleRegister();
        }
    };
}();


//查询
$("#cons_inquiry").on("click",function(){
    //发货人查询
    ConsTable.init();
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

//删除
var GennDelete = function() {
    $('#op_del').click(function() {
        var len = $(".checkboxes:checked").length;
        if(len < 1){
            alertDialog("至少选中一项！");
        }else{
            confirmDialog("数据删除后将不可恢复，您确定要删除吗？", GennDelete.deletegenn)
        }
    });
    return{
        deletegenn: function(){
            var geen = {conidlist:[]};
            $(".checkboxes:checked").parents("td").each(function () {
                var row = $(this).parents('tr')[0];
                geen.conidlist.push($("#gnee_table").dataTable().fnGetData(row).conid);
            });
            $("#loading_edit").modal('show');
            gennDelete(geen);
        }
    }
}();

//收货人导入
$("#gnee_import").on("click",function(){
    $("#gnee_upload").find("input[type=file]").value = "";
    $("#upload_name").hide();
    $("#gnee_upload").modal('show');
});

//收货人文件点击上传
$("#gnee_file").change(function(){
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
        $("#loading_edit").modal("show");
        gneeUpload(formData);
    }else{
        $("#upload_name").html("");
    }
});

//收货人文件拖拽上传
function allowDrop(ev) {
    //阻止浏览器默认打开文件的操作
    ev.preventDefault();
};
function drop(ev) {
    ev.preventDefault();
    var files = ev.dataTransfer.files;
    var len = files.length;
    if(len!=0){
        var filesName=files[0].name;
        var extStart=filesName.lastIndexOf(".");
        var ext=filesName.substring(extStart,filesName.length).toUpperCase();
        if(ext ==".xlsx" || ext ==".XLSX"){ //判断是否是需要的问件类型
            //显示上传文件名
            $("#upload_name").show();
            $("#upload_name").html("文件名："+filesName+"   文件大小："+((Number(files[0].size))/1024).toFixed(1)+"KB");
            var formData = new FormData();
            formData.append("file",files[0]);
            var userid = {
                "userid":loginSucc.userid,
                "organid":loginSucc.organid
            }
            var data = sendMessageEdit(DEFAULT,userid);
            formData.append("body",new Blob([data],{type:"application/json"}));
            $("#loading_edit").modal("show");
            gneeUpload(formData);
        }else{
            alertDialog("请选择.xlsx类型的文件上传！");
            return false;
        }
    }else{
        $("#upload_name").html("");
    }
};

//查询返回结果
function getconsigneeidDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if(result && result.retcode == SUCCESS){
            var res = result.response;
            conList = res.conlist;
            tableDataSet(res.draw, res.totalcount, res.totalcount, res.conlist, callback);
        }else {
            tableDataSet(0, 0, 0, [], callback);
            alertDialog("发货人信息获取失败！");
        }
    }else{
        tableDataSet(0, 0, 0, [], callback);
        alertDialog("发货人信息获取失败！");
    }
}


function gennEditEnd(flg, result, type){
    $("#loading_edit").modal('hide');
    var res = "失败";
    var text = "";
    var alert = "";
    switch (type){
        case GENNADD:
            text = "新增";
            break;
        case GENNEDIT:
            text = "编辑";
            break;
        case GENNDELETE:
            text = "删除";
            break;
        case CONSIGNEEUPLOAD:
            text = "导入";
            break;
    }
    if(flg){
        if(result && result.retcode != SUCCESS){
            if(result.retcode == FAILED){
                alert = result.retmsg;
                ConsTable.init();
                $('#edit_gnee,#gnee_upload').modal('hide');
            }
            alert = result.retmsg;
        }
        if (result && result.retcode == SUCCESS) {
            res = "成功";
            ConsTable.init();
            $('#edit_gnee,#gnee_upload').modal('hide');
        }
    }
    if(alert == "")alert = text + "收货人信息" + res;
    App.unblockUI('#lay-out');
    alertDialog(alert);
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