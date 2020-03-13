/**
 * Created by Administrator on 2020/2/8 0008.
 */

var vehicleList = [];
var plateColor,ve_conductor,vehicleType,energy_Type,driverList = [];
var dictTrue = [];   //获取字典结果
var imgInit = "/public/img/img_upload.png";
var getData = false;

if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        fun_power();
        //时间控件初始化
        ComponentsDateTimePickers.init();
        //获取字典相关信息
        var data = {};
        var list = ["10001","10002","10003","10004"];
        for(var i in list){
            data.lx = list[i];
            dictQuery(data);
        }
        //车辆操作和查看
        VehiceEdit.init();
    });
}

//时间控件初始化
var ComponentsDateTimePickers = function () {

    var handleDatePickers = function () {

        if (jQuery().datepicker) {
            $('.date-picker').datepicker({
                rtl: App.isRTL(),
                orientation: "auto",
                autoclose: true,
                language:"zh-CN",
                todayBtn:true,
                format:"yyyy-mm-dd",
                //showButtonPanel:true,
                todayHighlight: true
            });
            var date = getNowFormatDate();
            $("input[name='regdate']").datepicker("setDate","");
            $("input[name='issue_date']").datepicker("setDate","");
        }
    };

    return {
        //main function to initiate the module
        init: function () {
            handleDatePickers();
        }
    };
}();

//车辆表格
var VehiceTable = function () {
    var initTable = function () {
        var table = $('#vehice_table');
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
                    platenumber: formData.platenumber,
                    platecolor:formData.platecolor,
                    vehicletype:formData.vehicletype,
                    currentpage: (data.start / data.length) + 1,
                    pagesize: data.length == -1 ? "": data.length,
                    startindex: data.start,
                    draw: data.draw
                };
                vehiceDataGet(da, callback);
            },
            columns: [//返回的json数据在这里填充，注意一定要与上面的<th>数量对应，否则排版出现扭曲
                { "data": null},
                { "data": null},
                { "data": "vehid", visible: false},
                { "data": "platenumber"},
                { "data": "platecolor" },
                { "data": "vehicletype"},
                { "data": "conductor"},
                { "data": "load" },
                { "data": "proprietor" },
                { "data": "transport_number"},
                { "data": "license_key"},
                { "data": "driving_img"},
                { "data": "updatetime"},
                { "data": null}
            ],
            columnDefs: [
                {
                    "targets": [0],
                    "data": null,
                    "render": function (data, type, row, meta) {
                        return meta.settings._iDisplayStart + meta.row + 1;  //行号
                    }

                },{
                    "targets": [1],
                    "render": function (data, type, row, meta) {
                        return '<input type="checkbox" class="checkboxes" value="1" />';
                    }
                },{
                    "targets": [3],
                    "render": function (data, type, row, meta) {
                        return '<a href="javascript:;" id="vehice_detail">'+data+'</a>';
                    }
                },{
                    "targets": [4],
                    "render": function (data, type, row, meta) {
                        //车辆颜色
                        return plateColorDisplay(data);
                    }
                },{
                    "targets": [5],
                    "render": function (data, type, row, meta) {
                        //车型
                        return vehiceTypeDisplay(data);
                    }
                },{
                    "targets": [6],
                    "render": function (data, type, row, meta) {
                        //车长
                        return conductorDisplay(data);
                    }
                },{
                    "targets": [7],
                    "render": function (data, type, row, meta) {
                        //载重
                        return subStringNum((data/1000),3);
                    }
                },{
                    "targets": [11],
                    "render": function (data, type, row, meta) {
                        if(data == ""){
                            return "暂无图片";
                        }else{
                            return '<a href="javascript:;" class="imgCheck">查看图片<span hidden="hidden">'+data+'</span></a>';
                        }
                    }
                },{
                    "targets": [12],
                    "render": function (data, type, row, meta) {
                        return dateTimeFormat(data);
                    }
                },{
                    "targets": [13],
                    "render": function (data, type, row, meta) {
                        var edit = '';
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
                $('td:eq(0),td:eq(1),td:eq(2),td:eq(3),td:eq(4),td:eq(8),td:eq(9),td:eq(10),td:eq(11),td:eq(12)', nRow).attr('style', 'text-align: center;');
                $('td:eq(5), td:eq(6)', nRow).attr('style', 'text-align: right;');
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
            var checklength = $("#vehice_table").find(".checkboxes:checked").length;
            if(checklength == vehicleList.length){
                $("#vehice_table").find(".group-checkable").prop("checked",true);
            }else{
                $("#vehice_table").find(".group-checkable").prop("checked",false);
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

//车辆查询
$("#vehice_inquiry").on("click", function(){
    VehiceTable.init();
});

//车辆信息查看和编辑
var VehiceEdit = function() {
    var handleRegister = function() {
        var validator = $('.edit-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                platenumber: {
                    required: true,
                    platenumber:true
                },
                platecolor: {
                    required: true
                },
                conductor:{
                    required: true
                },
                vehicletype:{
                    required: true
                },
//                vin:{
//                    required: true
//                },
                energy_type:{
                    required: true
                },
//                proprietor:{
//                    required: true
//                },
//                nature:{
//                    required: true
//                },
//                office:{
//                    required: true
//                },
//                regdate:{
//                    required: true
//                },
//                issue_date:{
//                    required: true
//                },
                load:{
                    required: true,
                    load:true
                },
                total_mass:{
                    required: true,
                    load:true
                },
                transport_number:{
                    required: true
                },
                //licensekey:{
                //    required: true
                //},
                driving_img: {
                    required: true
                }
//                transport_img:{
//                    required: true
//                },
//                license_img:{
//                    required: true
//                },
//                insurance_img:{
//                    required: true
//                },
//                group_photo:{
//                    required: true
//                }
            },

            messages: {
                platenumber: {
                    required: "车牌号必须输入"
                },
                platecolor: {
                    required: "车牌颜色必须选择"
                },
                conductor:{
                    required: "车长必须选择"
                },
                vehicletype:{
                    required: "车型必须选择"
                },
//                vin:{
//                    required: "车架号必须输入"
//                },
                energy_type:{
                    required: "能源类型必须输入"
                },
//                proprietor:{
//                    required: "车辆所有人必须输入"
//                },
//                nature:{
//                    required: "使用性质必须输入"
//                },
//                office:{
//                    required: "发证机关必须输入"
//                },
//                regdate:{
//                    required: "注册日期不能为空"
//                },
//                issue_date:{
//                    required: "发证日期不能为空"
//                },
                load:{
                    required: "核定载质量必须输入"
                },
                total_mass:{
                    required: "总质量必须输入"
                },
                transport_number:{
                    required: "道路运输证号必须输入"
                },
                //licensekey:{
                //    required: "道路经营许可证号必须输入"
                //},
                driving_img: {
                    required: "行驶证必须上传"
                }
//                transport_img:{
//                    required: "道路运输证必须上传"
//                },
//                license_img:{
//                    required: "道路运输经营许可证必须上传"
//                },
//                insurance_img:{
//                    required: "保险卡必须上传"
//                },
//                group_photo:{
//                    required: "人车合影必须上传"
//                }
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

        // 车牌号码验证
        jQuery.validator.addMethod("platenumber", function(value, element) {
            var plate = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/;
            return this.optional(element) || (plate.test(value));
        }, "请正确填写您的车牌号");

        //核载重
        jQuery.validator.addMethod("load", function(value, element){
            var num = /(^[1-9]\d*$)/;
            return this.optional(element) || (num.test(value));
        }, "只能输入数字");

        //司机信息联动
        $("#driver_add").blur(function(){
            var value = $(this).val();
            var list = [];
            for(var i = 0;i<driverList.length;i++){
                list.push(driverList[i].name+driverList[i].id_number);
            }
            if(list.indexOf(value) == -1){  //不存在
                $(this).val("");
                $("input[name=did]").val("");
            }
        });
        $("#driver_add").change(function(e){
            var value = $(this).val();
            if(value != ""){
                var id = $("#driverList").find("option[value='"+value+"']").attr("data-did");
                for(var i in driverList){
                    if(id == driverList[i].did){
                        $("input[name=did]").val(driverList[i].did);
                    }
                }
            }else{
                $("input[name=did]").val("");
            }
        });

        //点击确定按钮
        $('#edit-btn').click(function() {
            btnDisable($('#edit-btn'));
            if ($('.edit-form').validate().form()) {
                var vehice = $('.edit-form').getFormData();
                vehice.regdate = vehice.regdate.replace(/-/g,'');
                vehice.issue_date = vehice.issue_date.replace(/-/g,'');
                vehice.organid = loginSucc.organid;
                var formData = new FormData();
                var data = sendMessageEdit(DEFAULT,vehice);
                formData.append("body",new Blob([data],{type:"application/json"}));
                var list = ["driving_img","transport_img","insurance_img","group_photo"];
                for(var i in list){
                    formData.append(list[i],null);
                }
                //判断是否上传文件
                for(var i in list){
                    if($("#"+list[i]).get(0).files[0]){
                        formData.set(list[i],$("#"+list[i]).get(0).files[0]);
                    }
                }
                if($("input[name=edittype]").val() == VEHICEADD){
                    $("#loading_edit").modal('show');
                    vehiceAdd(formData);
                }else{
                    $("#loading_edit").modal('show');
                    vehiceEdit(formData);
                }
            }
        });
        //查看车辆信息
        $('#vehice_table').on('click', '#vehice_detail', function (e) {
            var that = this;
            e.preventDefault();
            //清除校验错误信息
            validator.resetForm();
            $(".edit-form").find(".has-error").removeClass("has-error");
            $("#edit_vehice").find(".modal-title").text("查看车辆");
            //获取司机信息
            getData = false;
            driverDataGet();
            var Timer;
            Timer = setInterval(
              function(){
                  if(getData){
                      clearInterval(Timer);
                      var exclude = [];
                      var row = $(that).parents('tr')[0];
                      var vehid = $("#vehice_table").dataTable().fnGetData(row).vehid;
                      var vehice = new Object();
                      for(var i=0; i < vehicleList.length; i++){
                          if(vehid == vehicleList[i].vehid){
                              vehice = vehicleList[i];
                          }
                      }
                      var options = { jsonValue: vehice, exclude:exclude,isDebug: false};
                      $(".edit-form").initForm(options);
                      //日期框赋值
                      $("input[name=regdate]").datepicker("setDate",dateFormat(vehice.regdate, "-"));
                      $("input[name=issue_date]").datepicker("setDate",dateFormat(vehice.issue_date, "-"));
                      //显示司机
                      if(vehice.did!=""){
                          for(var i in driverList){
                              if(vehice.did == driverList[i].did){
                                  $("#driver_add").val(driverList[i].name+driverList[i].id_number);
                              }
                          }
                      }else{
                          $("#driver_add").val("");
                      }
                      //清空文件
                      clearFile();
                      //显示图片
                      $("#driving_img").siblings("label").find("img").attr("src",vehice.driving_img || imgInit);
                      $("#transport_img").siblings("label").find("img").attr("src",vehice.transport_img || imgInit);
                      //$("#license_img").siblings("label").find("img").attr("src",vehice.license_img || imgInit);
                      $("#insurance_img").siblings("label").find("img").attr("src",vehice.insurance_img || imgInit);
                      $("#group_photo").siblings("label").find("img").attr("src",vehice.group_photo || imgInit);
                      //是否允许上传图片
                      fileUploadAllowed(0);
                      $(".modal-footer").hide();
                      $('#edit_vehice').modal('show');
                  }
              },500
            );
        });
        //编辑车辆信息
        $('#vehice_table').on('click', '#op_edit', function (e) {
            var that = this;
            e.preventDefault();
            //清除校验错误信息
            validator.resetForm();
            $(".edit-form").find(".has-error").removeClass("has-error");
            $("#edit_vehice").find(".modal-title").text("编辑车辆");
            //获取司机信息
            getData = false;
            driverDataGet();
            var Timer;
            Timer = setInterval(
                function(){
                    if(getData){
                        clearInterval(Timer);
                        var exclude = [];
                        var row = $(that).parents('tr')[0];
                        var vehid = $("#vehice_table").dataTable().fnGetData(row).vehid;
                        var vehice = new Object();
                        for(var i=0; i < vehicleList.length; i++){
                            if(vehid == vehicleList[i].vehid){
                                vehice = vehicleList[i];
                            }
                        }
                        var options = { jsonValue: vehice, exclude:exclude,isDebug: false};
                        $(".edit-form").initForm(options);
                        //日期框赋值
                        $("input[name=regdate]").datepicker("setDate",dateFormat(vehice.regdate, "-"));
                        $("input[name=issue_date]").datepicker("setDate",dateFormat(vehice.issue_date, "-"));
                        //显示司机
                        if(vehice.did!=""){
                            for(var i in driverList){
                                if(vehice.did == driverList[i].did){
                                    $("#driver_add").val(driverList[i].name+driverList[i].id_number);
                                }
                            }
                        }else{
                            $("#driver_add").val("");
                        }
                        //清空文件
                        clearFile();
                        //显示图片
                        $("#driving_img").siblings("label").find("img").attr("src",vehice.driving_img || imgInit);
                        $("#transport_img").siblings("label").find("img").attr("src",vehice.transport_img || imgInit);
                        //$("#license_img").siblings("label").find("img").attr("src",vehice.license_img || imgInit);
                        $("#insurance_img").siblings("label").find("img").attr("src",vehice.insurance_img || imgInit);
                        $("#group_photo").siblings("label").find("img").attr("src",vehice.group_photo || imgInit);
                        //是否允许上传图片
                        fileUploadAllowed(1);
                        //车牌号只读
                        $("#platenumber_edit").attr("disabled",true);
                        $("input[name=edittype]").val(VEHICEEDIT);
                        $(".modal-footer").show();
                        $('#edit_vehice').modal('show');
                    }
                },500
            );
        });
        //新增车辆
        $('#op_add').click(function() {
            //清除校验错误信息
            validator.resetForm();
            $(".edit-form").find(".has-error").removeClass("has-error");
            $("#edit_vehice").find(".modal-title").text("新增车辆");
            $(":input",".edit-form").not(":button,:reset,:submit,:radio,#evaluationneed").val("")
                .removeAttr("checked")
                .removeAttr("selected");
            ComponentsDateTimePickers.init();
            //获取司机信息
            driverDataGet();
            //清空文件
            clearFile();
            fileUploadAllowed(1);
            $("input[name=edittype]").val(VEHICEADD);
            $(".modal-footer").show();
            $('#edit_vehice').modal('show');
        });
    };
    return {
        init: function() {
            handleRegister();
        }
    };
}();

//查看图片
$("#vehice_table").on('click',".imgCheck",function(e){
    var src = $(this).children("span")[0].innerText;
    $("#img_check").find("img").attr('src',src);
//    $("#vehice_table").find(".modal-title").text("图片查看");
//    $("#img_check").modal('show');
    $("#img_check img").trigger('click');
});

$("#img_check img").viewer({
    navbar: false,
    button: true,
    toolbar: true,
    title: false
});

//图片上传显示
$("input[type=file]").change(function(){
    var img = $(this).siblings("label").find("img");
    if(this.files[0]){
        var path = window.URL.createObjectURL(this.files[0]);
        $(this).siblings("input[type=text]").val(path);
        img.attr('src',path);
    }else{
        $(this).siblings("input[type=text]").val("");
        img.attr('src','/public/img/img_upload.png');
    }
});

//车辆删除
var VehiceDelete = function() {
    $('#op_del').click(function() {
        var len = $(".checkboxes:checked").length;
        if(len < 1){
            alertDialog("至少选中一项！");
        }else{
            confirmDialog("数据删除后将不可恢复，您确定要删除吗？", VehiceDelete.deletePro)
        }
    });
    return{
        deletePro: function(){
            var vehice = {vehidlist:[]};
            $(".checkboxes:checked").parents("td").each(function () {
                var row = $(this).parents('tr')[0];
                vehice.vehidlist.push($("#vehice_table").dataTable().fnGetData(row).vehid);
            });
            $("#loading_edit").modal('show');
            vehiceDelete(vehice);
        }
    }
}();

//导入车辆
$("#vehice_import").on("click",function(){
    $("#vehice_upload").find("input[type=file]").value = "";
    $("#upload_name").hide();
    $("#vehice_upload").modal('show');
});

//车辆文件点击上传
$("#vehice_file").change(function(){
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
        vehiceUpload(formData);
    }else{
        $("#upload_name").html("");
    }
});

//车辆文件拖拽上传
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
            $("#loading_edit").modal('show');
            vehiceUpload(formData);
        }else{
            alertDialog("请选择.xlsx类型的文件上传！");
            return false;
        }
    }else{
        $("#upload_name").html("");
    }
};

//导入车辆证照
$("#vehiceImg_import").on('click',function(){
    $("#vehiceImg_file").value = "";
    $("#vehiceimg_upload").modal('show');
});

//车辆证照点击上传
$("#vehiceImg_file").change(function(){
    var filelist = this.files;
    if(filelist.length!=0){
        if(filelist.length > 200){
            alertDialog("单次最多可选200张图片！");
            $("#vehiceImg_file").value = "";
            return;
        }
        var formData = new FormData();
        for(var i = 0; i < filelist.length;i++){
            //判断图片文件命名格式
            if(!imgNameCheck(this.files[i].name)){
                alertDialog("图片文件命名格式不正确！"+this.files[i].name);
                $("#vehiceImg_file").value = "";
                return false;
            }
            if((Number(this.files[i].size)/1024/1024)>20){
                alertDialog("单张照片大小不可超过20M！"+this.files[i].name);
                $("#vehiceImg_file").value = "";
                return false;
            }
            formData.append("file",this.files[i]);
        }
        var userid = {
            "userid":loginSucc.userid,
            "organid":loginSucc.organid
        }
        var data = sendMessageEdit(DEFAULT,userid);
        formData.append("body",new Blob([data],{type:"application/json"}));
        $("#loading_edit").modal('show');
        vehiceImgUpload(formData);
        $("#vehiceImg_file").value = "";
    }else{
        $("#vehiceImg_file").value = "";
    }
});

//车辆证照拖拽上传
function allowDrop(ev) {
    //阻止浏览器默认打开文件的操作
    ev.preventDefault();
};
function imgDrop(ev) {
    ev.preventDefault();
    var files = ev.dataTransfer.files;
    var len = files.length;
    if(len!=0){
        if(len > 200){
            alertDialog("单次最多可选200张图片！");
            return;
        }
        var formData = new FormData();
        for(var i = 0; i<len;i++){
            var filesName=files[i].name;
            var extStart=filesName.lastIndexOf(".");
            var ext=filesName.substring(extStart,filesName.length).toUpperCase();
            if(ext ==".jpg" || ext ==".JPG" || ext ==".png" || ext ==".PNG" || ext ==".gif" || ext ==".GIF"){ //判断是否是需要的问件类型
                //判断图片文件命名格式
                if(!imgNameCheck(filesName)){
                    alertDialog("图片文件命名格式不正确！"+filesName);
                    return false;
                }
                if((Number(files[i].size)/1024/1024)>20){
                    alertDialog("单张照片大小不可超过20M！"+files[i].name);
                    return false;
                }
                formData.append("file",files[i]);
            }else{
                alertDialog("请选择.jpg .png .gif类型的文件上传！"+filesName);
                return false;
            }
        }
        var userid = {
            "userid":loginSucc.userid,
            "organid":loginSucc.organid
        };
        var data = sendMessageEdit(DEFAULT,userid);
        formData.append("body",new Blob([data],{type:"application/json"}));
        $("#loading_edit").modal('show');
        vehiceImgUpload(formData);
    }
};

//车辆查询结果返回
function getVehiceDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            vehicleList = res.vehicleList;
            tableDataSet(res.draw, res.totalcount, res.totalcount, res.vehicleList, callback);
        }else{
            tableDataSet(0, 0, 0, [], callback);
            alertDialog("车辆信息获取失败！");
        }
    }else{
        tableDataSet(0, 0, 0, [], callback);
        alertDialog("车辆信息获取失败！");
    }
}

//显示车辆颜色
function plateColorDisplay(data){
    var color = "";
    for(var i in plateColor){
        if(data == plateColor[i].code){
            color = plateColor[i].value;
        }
    }
    return color;
}

//显示车型
function vehiceTypeDisplay(data){
    var type = "";
    for(var i = 0; i < vehicleType.length; i++){
        if(data == vehicleType[i].code){
            type = vehicleType[i].value;
        }
    }
    return type;
}

//显示车长
function conductorDisplay(data){
    var value = "";
    for(var i = 0; i < ve_conductor.length; i++){
        if(data == ve_conductor[i].code){
            value = ve_conductor[i].value;
        }
    }
    return value;
}

//车辆信息操作返回结果
function vehiceEditEnd(flg, result, type){
    $("#loading_edit").modal('hide');
    var res = "失败";
    var text = "";
    var alert = "";
    switch (type){
        case VEHICEADD:
            text = "新增";
            break;
        case VEHICEEDIT:
            text = "编辑";
            break;
        case VEHICEDELETE:
            text = "删除";
            break;
        case VEHICEUPLOAD:
            text = "导入";
            break;
        case VEHICEIMGUPLOAD:
            text = "证照导入";
            break;
    }
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg;
        }
        if (result && result.retcode == SUCCESS) {
            res = "成功";
            VehiceTable.init();
            $('#add_vehice').modal('hide');
            $('#edit_vehice').modal('hide');
            $('#vehice_upload').modal('hide');
            $('#vehiceimg_upload').modal('hide');
        }
    }
    if(alert == ""){
        if(type == VEHICEIMGUPLOAD){
            alert = "车辆"+ text + res + "！";
        }else{
            alert = text + "车辆信息" + res + "！";
        }
    }
    App.unblockUI('#lay-out');
    alertDialog(alert);
}

//清空文件
function clearFile(){
    $(".edit-form").find("input[type=file]").val("");
    var list = ["#driving_img","#transport_img","#insurance_img","#group_photo"];
    for(var i = 0;i<list.length;i++){
        $(list[i]).siblings("label").find("img").attr('src',imgInit);
    }
}

//是否允许上传图片
function fileUploadAllowed(id){
    var list = $(".edit-form").find("input[type=file]");
    for(var i = 0; i<list.length;i++){
        var fid = "#"+list[i].id;
        if(id == 0){ //不允许
            $(fid).attr("disabled",true);
            //全部只读
            $(".edit-form").find("select").attr("disabled", true);
            $(".edit-form").find("input").attr("disabled", true);
        }else{
            $(fid).attr("disabled",false);
            $(".edit-form").find("select").attr("disabled", false);
            $(".edit-form").find("input").attr("disabled", false);
        }
    }
}

//获取字典信息返回
function getDictDataEnd(flg,result){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            var dictlist = res.dictlist;
            //给准驾车型赋值
            dictTrue.push("1");
            for(var i = 0;i<dictlist.length;i++){
                switch (dictlist[i].lx){
                    case "10001":
                        plateColor = dictlist;
                        $("#platecolor").append("<option value='"+dictlist[i].code+"'>"+dictlist[i].value+"</option>");
                        $("#platecolor_edit").append("<option value='"+dictlist[i].code+"'>"+dictlist[i].value+"</option>");
                        break;
                    case "10002":
                        ve_conductor = dictlist;
                        $("#conductor").append("<option value='"+dictlist[i].code+"'>"+dictlist[i].value+"</option>");
                        break;
                    case "10003":
                        vehicleType = dictlist;
                        $("#vehicletype").append("<option value='"+dictlist[i].code+"'>"+dictlist[i].value+"</option>");
                        $("#vehicletype_edit").append("<option value='"+dictlist[i].code+"'>"+dictlist[i].value+"</option>");
                        break;
                    case "10004":
                        energy_Type = dictlist;
                        $("#energy_type").append("<option value='"+dictlist[i].code+"'>"+dictlist[i].value+"</option>");
                        break;
                }
            }
            vehiceInfoRequest();
        }else{
            dictTrue.push("0");
            vehiceInfoRequest();
        }
    }else{
        dictTrue.push("0");
        vehiceInfoRequest();
    }
}

//判断是否可以请求车辆信息
function vehiceInfoRequest(){
    if(dictTrue.length ==  4){
        //车辆表格
        VehiceTable.init();
    }
}

//判断车辆证照文件命名格式
function imgNameCheck(name){
    //先判断有没有-
    if(name.indexOf('-') == -1){
        return false;
    }
    var namelist = name.split("-");
    //判断车牌号格式
    var plate = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/;
    if(!(plate.test(namelist[0]))){
        return false;
    }
    //判断-后只能是不大于5的数字
    var num=/^([1-5]|5)$/;
    var index = namelist[1].lastIndexOf('.');
    var number = namelist[1].substring(0,index);
    if(!(num.test(number))){
        return false;
    }
    return true;
}

//司机信息结果返回
function getDriverDataEnd(flg, result){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            driverList = res.list;
            $("#driverList").empty();
            for(var i in driverList){
                if(driverList[i].state == "0"){
                    var value = driverList[i].name+driverList[i].id_number;
                    $("#driverList").append("<option data-did='"+driverList[i].did+"' value='"+value+"'></option>");
                }
            }
            getData = true;
        }else{
            getData = true;
        }
    }else{
        getData = true;
    }
}