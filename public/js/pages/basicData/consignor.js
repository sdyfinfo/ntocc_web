/**
 * Created by haiyang on 2020/2/11.
 */

var invoiceList = [];
var ConsignorList = [];
var getData = false;

if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        fun_power();
        //省市区三级联动
        addressDispaly("#loading_provincecode");
        //获取发票信息
        invoiceDataGet();
        //发货人表格
        ConsignorTable.init();
        //司机编辑和查看
        ConsignorEdit.init();
    });
}

//发货人表格
var ConsignorTable = function () {
    var initTable = function () {
        $(".group-checkable").prop("checked", false);
        var table = $('#consignor_table');
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
            "bAutoWidth": false,
            "ajax":function (data, callback, settings) {
                var formData = $(".inquiry-form").getFormData();
                var da = {
                    consignor: formData.consignor,
                    invoice_rise:formData.invoiceRise,
                    state:formData.state,
                    currentpage: (data.start / data.length) + 1,
                    pagesize: data.length == -1 ? "": data.length,
                    startindex: data.start,
                    draw: data.draw
                };
                consignorDataGet(da, callback);
            },
            columns: [//返回的json数据在这里填充，注意一定要与上面的<th>数量对应，否则排版出现扭曲
                { "data": null},
                { "data": null},
                { "data": "conid",visible: false },
                { "data": "consignor"},
                { "data": "mobile" },
                { "data": "loading_place" },
                { "data": "loading_address" },
                { "data": "state"},           //状态  0正常  1异常
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
                },{
                    "targets": [3],
                    "render": function (data, type, row, meta) {
                        return '<a href="javascript:;" id="consignor_detail">'+data+'</a>';
                    }
                },{
                    "targets": [7],
                    "render": function (data, type, row, meta) {
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
                    }
                },
                {
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
                $('td:eq(0),td:eq(1),td:eq(3),td:eq(6),td:eq(7)', nRow).attr('style', 'text-align: center;');
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
            var checklength = $("#consignor_table").find(".checkboxes:checked").length;
            if(checklength == ConsignorList.length){
                $("#consignor_table").find(".group-checkable").prop("checked",true);
            }else{
                $("#consignor_table").find(".group-checkable").prop("checked",false);
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


//发货人操作
var ConsignorEdit = function() {
    var handleRegister = function() {
        var validator = $('.edit-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
//                invoice_rise: {
//                    required: true
//                },
                consignor: {
                    required: true
                },
                mobile:{
                    required: true,
                    phone:true
                }
            },

            messages: {
//                invoice_rise: {
//                    required: "发票抬头必须选择"
//                },
                consignor: {
                    required: "发货人必须输入"
                },
                mobile:{
                    required: "联系电话必须输入"
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
        jQuery.validator.addMethod("phone", function(value, element) {
            var tel = /^1[3456789]\d{9}$/;
            return this.optional(element) || (tel.test(value));
        }, "请正确填写您的手机号码");

        //发票抬头判断
        $("input[name=invoice_rise],input[name=invoiceRise]").blur(function(){
            var value = $(this).val();
            var list = [];
            for(var i = 0;i<invoiceList.length;i++){
                list.push(invoiceList[i].rise_name);
            }
            if(list.indexOf(value) == -1){  //不存在
                $(this).val("");
            }
        });

        //点击确定按钮
        $('#edit-btn').click(function() {
            btnDisable($('#edit-btn'));
            if ($('.edit-form').validate().form()) {
                var consignor = $('.edit-form').getFormData();
                for(var i in invoiceList){
                    if(consignor.invoice_rise == invoiceList[i].rise_name){
                        consignor.invid = invoiceList[i].invid
                    }
                }
                //装货省市区
                consignor.loading_province = "";
                if(consignor.loading_provincecode != ""){
                    consignor.loading_province = $("#loading_provincecode").find("option:selected").text();
                }
                consignor.loading_city = "";
                if(consignor.loading_citycode != ""){
                    consignor.loading_city = $("#loading_citycode").find("option:selected").text();
                }
                consignor.loading_county = "";
                if(consignor.loading_countycode != ""){
                    consignor.loading_county = $("#loading_countycode").find("option:selected").text();
                }
                if($("input[name=edittype]").val() == CONSIGNORADD){
                    $("#loading_edit").modal('show');
                    consignorAdd(consignor);
                }else{
                    $("#loading_edit").modal('show');
                    consignorEdit(consignor);
                }
            }
        });
        //查看发货人信息
        $('#consignor_table').on('click', '#consignor_detail', function (e) {
            var that = this;
            e.preventDefault();
            //清除校验错误信息
            validator.resetForm();
            $(".edit-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("查看发货人");
            //获取发票信息
            getData = false;
            var Timer;
            invoiceDataGet();
            Timer = setInterval(
              function(){
                if(getData){
                    clearInterval(Timer);
                    var exclude = [];
                    var row = $(that).parents('tr')[0];
                    var conid = $("#consignor_table").dataTable().fnGetData(row).conid;
                    var consignor = new Object();
                    for(var i=0; i < ConsignorList.length; i++){
                        if(conid == ConsignorList[i].conid){
                            consignor = ConsignorList[i];
                        }
                    }
                    //省市区显示
                    areaDisplay(consignor.loading_provincecode,consignor.loading_citycode,"#loading_citycode","#loading_countycode");
                    var options = { jsonValue: consignor, exclude:exclude,isDebug: false};
                    $(".edit-form").initForm(options);
                    $(".edit-form").find("input,select").attr("disabled",true);
                    $(".modal-footer").hide();
                    $('#edit_consignor').modal('show');
                }
              },500
            );
        });
        //编辑发货人信息
        $('#consignor_table').on('click', '#op_edit', function (e) {
            var that = this;
            e.preventDefault();
            //清除校验错误信息
            validator.resetForm();
            $(".edit-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("编辑发货人");
            //获取发票信息
            getData = false;
            var Timer;
            invoiceDataGet();
            Timer = setInterval(
                function(){
                    clearInterval(Timer);
                    var exclude = [];
                    var row = $(that).parents('tr')[0];
                    var conid = $("#consignor_table").dataTable().fnGetData(row).conid;
                    var consignor = new Object();
                    for(var i=0; i < ConsignorList.length; i++){
                        if(conid == ConsignorList[i].conid){
                            consignor = ConsignorList[i];
                        }
                    }
                    //省市区显示
                    areaDisplay(consignor.loading_provincecode,consignor.loading_citycode,"#loading_citycode","#loading_countycode");
                    if(consignor.line == "0"){  //该发货人绑定了线路
                        alertDialog("该发货人绑定了线路,不能进行编辑操作！");
                    }else{
                        var options = { jsonValue: consignor, exclude:exclude,isDebug: false};
                        $(".edit-form").initForm(options);
                        $("input[name=edittype]").val(CONSIGNOREDIT);
                        $(".edit-form").find("input,select").attr("disabled",false);
                        //发票抬头不能编辑
                        $("input[name=invoice_rise]").attr("disabled",true);
                        $(".modal-footer").show();
                        $('#edit_consignor').modal('show');
                    }
                },500
            );
        });
        //新增发货人
        $('#op_add').click(function() {
            //清除校验错误信息
            validator.resetForm();
            $(".edit-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("新增发货人");
            $(":input",".edit-form").not(":button,:reset,:submit,:radio,#evaluationneed").val("")
                .removeAttr("checked")
                .removeAttr("selected");
            //获取发票信息
            invoiceDataGet();
            $("input[name=edittype]").val(CONSIGNORADD);
            $(".edit-form").find("input,select").attr("disabled",false);
            $(".modal-footer").show();
            $('#edit_consignor').modal('show');
        });
    };
    return {
        init: function() {
            handleRegister();
        }
    };
}();

//发货人查询查询
$("#consignor_inquiry").on("click", function(){
    ConsignorTable.init();
});

//发货人删除
var ConsignorDelete = function() {
    $('#op_del').click(function() {
        var len = $(".checkboxes:checked").length;
        if(len < 1){
            alertDialog("至少选中一项！");
        }else{
            confirmDialog("数据删除后将不可恢复，您确定要删除吗？", ConsignorDelete.deletePro)
        }
    });
    return{
        deletePro: function(){
            var consignor = {conidlist :[]};
            $(".checkboxes:checked").parents("td").each(function () {
                var row = $(this).parents('tr')[0];
                consignor.conidlist.push($("#consignor_table").dataTable().fnGetData(row).conid);
            });
            $("#loading_edit").modal('show');
            consignorDelete(consignor);
        }
    }
}();

//发货人导入
$("#consignor_import").on("click",function(){
    $("#consignor_upload").find("input[type=file]").value = "";
    $("#upload_name").hide();
    $("#consignor_upload").modal('show');
});

//发货人文件点击上传
$("#consignor_file").change(function(){
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
        consignorUpload(formData);
    }else{
        $("#upload_name").html("");
    }
});

//发货人文件拖拽上传
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
            consignorUpload(formData);
        }else{
            alertDialog("请选择.xlsx类型的文件上传！");
            return false;
        }
    }else{
        $("#upload_name").html("");
    }
};

//发票信息获取结果返回
function getInvoiceDataEnd(flg,result){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            invoiceList = res.invlist;
            $("#invoiceList,#invoiceList_edit").empty();
            //给发票信息datalist赋值
            for(var i = 0;i<invoiceList.length;i++){
                $("#invoiceList").append("<option>"+invoiceList[i].rise_name+"</option>");
                $("#invoiceList_edit").append("<option>"+invoiceList[i].rise_name+"</option>");
            }
            getData = true;
        }else{
            getData = true;
        }
    }else{
        getData = true;
    }
}

//发货人信息货物结果
function getConsignorDataEnd(flg,result,callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            ConsignorList = res.conlist;
            tableDataSet(res.draw, res.totalcount, res.totalcount, ConsignorList, callback);
        }else{
            tableDataSet(0, 0, 0, [], callback);
            alertDialog("发货人信息获取失败！");
        }
    }else{
        tableDataSet(0, 0, 0, [], callback);
        alertDialog("发货人信息获取失败！");
    }
}

//发货人操作结果返回
function consignorEditEnd(flg, result, type){
    $("#loading_edit").modal('hide');
    var res = "失败";
    var text = "";
    var alert = "";
    switch (type){
        case CONSIGNORADD:
            text = "新增";
            break;
        case CONSIGNOREDIT:
            text = "编辑";
            break;
        case CONSIGNORDELETE:
            text = "删除";
            break;
        case CONSIGNORUPLOAD:
            text = "导入";
            break;
    }
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg;
        }
        if (result && result.retcode == SUCCESS) {
            res = "成功";
            ConsignorTable.init();
            $('#edit_consignor').modal('hide');
        }
    }
    if(alert == "") alert = text + "发货人" + res + "！";
    App.unblockUI('#lay-out');
    alertDialog(alert);
}