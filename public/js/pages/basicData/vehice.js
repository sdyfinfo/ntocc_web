/**
 * Created by Administrator on 2020/2/8 0008.
 */

var vehicleList = [];

if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        //时间控件初始化
        ComponentsDateTimePickers.init();
        //初始化相关信息
        vehiceDataInit();
        //车辆表格
        VehiceTable.init();
        //车辆新增
        VehiceAdd.init();
        //车辆编辑和查看
        VehiceEdit.init();
    });
}

//初始化相关信息
function vehiceDataInit(){
    //车型
    for(var i = 0;i < VehiceType.length; i++){
        $("#vehicletype").append("<option value='"+VehiceType[i].value+"'>"+VehiceType[i].name+"</option>");
        $("#vehicletype_edit").append("<option value='"+VehiceType[i].value+"'>"+VehiceType[i].name+"</option>");
    }
    //车长
    for(var i =0; i< VehiceConductor.length; i++){
        $("#conductor").append("<option value='"+VehiceConductor[i].value+"'>"+VehiceConductor[i].name+"</option>");
    }
}

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
            $("input[name='birthday']").datepicker("setDate",date);
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
                { "data": "vehid",visible: false },
                { "data": "platenumber"},
                { "data": "platecolor" },
                { "data": "addtime" },
                { "data": "load" },
                { "data": "vehicletype"},
                { "data": "conductor"},
                { "data": "vin"},
                { "data": "transport_number"},
                { "data": "licensekey"},
                { "data": "driving_img"},
                { "data": "updatetime"},
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
                        return '<a href="javascript:;" id="vehice_detail">'+data+'</a>';
                    }
                },
                {
                    "targets": [4],
                    "render": function (data, type, row, meta) {
                        //车辆颜色
                        return plateColorDisplay(data);
                    }
                },
                {
                    "targets": [5],
                    "render": function (data, type, row, meta) {
                        return dateTimeFormat(data);
                    }
                },{
                    "targets": [13],
                    "render": function (data, type, row, meta) {
                        return dateTimeFormat(data);
                    }
                },{
                    "targets": [7],
                    "render": function (data, type, row, meta) {
                        //车型
                        return vehiceTypeDisplay(data);
                    }
                },{
                    "targets": [12],
                    "render": function (data, type, row, meta) {
                        return '<a href="javascript:;" class="imgCheck">查看图片<span hidden="hidden">'+data+'</span></a>';
                    }
                },{
                    "targets": [14],
                    "render": function (data, type, row, meta) {
                        var edit = '<a href="javascript:;" id="op_edit">编辑</a>';
//                        if(!window.parent.makeEdit(menu,loginSucc.functionlist,"#op_edit")){
//                            edit = '-';
//                        }else{
//                            edit = '<a href="javascript:;" id="op_edit">编辑</a>';
//                        }
                        return edit;
                    }
                }
            ],
            fnRowCallback: function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
                $('td:eq(0),td:eq(1),td:eq(11),td:eq(13)', nRow).attr('style', 'text-align: center;');
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

//车辆新增
var VehiceAdd = function() {
    var handleRegister = function() {
        var validator = $('.add-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                platenumber: {
                    required: true
                },
                platecolor: {
                    required: true
                },
                driving_img: {
                    required: true
                }
            },

            messages: {
                platenumber: {
                    required: "车牌号必须输入"
                },
                platecolor: {
                    required: "车牌颜色必须选择"
                },
                driving_img: {
                    required: "行驶证必须上传"
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
        $('#add-btn').click(function() {
            btnDisable($('#add-btn'));
            if ($('.add-form').validate().form()) {
                var vehice = $('.add-form').getFormData();
                var formData = new FormData();
                var data = sendMessageEdit(DEFAULT,vehice);
                formData.append("body",new Blob([data],{type:"application/json"}));
                formData.set("driving_img",$("#driving_img").get(0).files[0]);
                vehiceAdd(formData);
            }
        });
        //新增车辆
        $('#op_add').click(function() {
            //清除校验错误信息
            validator.resetForm();
            $(".add-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("新增车辆");
            $(":input",".add-form").not(":button,:reset,:submit,:radio,#evaluationneed").val("")
                .removeAttr("checked")
                .removeAttr("selected");
            //清空文件
            clearFile();
            $('#add_vehice').modal('show');
        });
    };
    return {
        init: function() {
            handleRegister();
        }
    };
}();

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
                    required: true
                },
                platecolor: {
                    required: true
                },
                driving_img: {
                    required: true
                }
            },

            messages: {
                platenumber: {
                    required: "车牌号必须输入"
                },
                platecolor: {
                    required: "车牌颜色必须选择"
                },
                driving_img: {
                    required: "行驶证必须上传"
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
        $('#add-btn').click(function() {
            btnDisable($('#add-btn'));
            if ($('.add-form').validate().form()) {
                var vehice = $('.add-form').getFormData();
                var formData = new FormData();
                var data = sendMessageEdit(DEFAULT,vehice);
                formData.append("body",new Blob([data],{type:"application/json"}));
                formData.set("driving_img",$("#driving_img").get(0).files[0]);
                vehiceAdd(formData);
            }
        });
        //编辑车辆
        $('#vehice_table').on('click', '#op_edit', function (e) {
            e.preventDefault();
            //清除校验错误信息
            validator.resetForm();
            $(".edit-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("编辑车辆");
            $(":input",".edit-form").not(":button,:reset,:submit,:radio,#evaluationneed").val("")
                .removeAttr("checked")
                .removeAttr("selected");
            //清空文件
            clearFile();
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
    $(".modal-title").text("图片查看");
    $("#img_check").modal('show');
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
    switch (data){
        case "01":
            color = "黄色";
            break;
        case "02":
            color = "蓝色";
            break;
        case "03":
            color = "绿色";
            break;
        case "04":
            color = "黄绿色";
            break;
    }
    return color;
}

//显示车型
function vehiceTypeDisplay(data){
    var type = "";
    for(var i = 0; i < VehiceType.length; i++){
        if(data == VehiceType[i].value){
            type = VehiceType[i].name;
        }
    }
    return type;
}

//车辆信息操作返回结果
function vehiceEditEnd(flg, result, type){
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
    }
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg;
        }
        if (result && result.retcode == SUCCESS) {
            res = "成功";
            VehiceTable.init();
            $('#add_vehice').modal('hide');
        }
    }
    if(alert == "") alert = text + "车辆信息" + res + "！";
    App.unblockUI('#lay-out');
    alertDialog(alert);
}

//清空文件
function clearFile(){
    $(".add-form").find("input[type=file]").value = "";
    $("#driving_img").siblings("label").find("img").attr('src','/public/img/img_upload.png');
}