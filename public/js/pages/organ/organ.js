/**
 * Created by Administrator on 2019/2/22.
 */
var organList = [];
if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        fun_power();
        //机构表格
        OrganTable.init();
        //新增和编辑
        OrganEdit.init();
    });
}

var OrganTable = function () {
    var initTable = function () {
        $(".group-checkable").prop("checked", false);
        var table = $('#organ_table');
        table.bootstrapTable({
            striped : true, //是否显示行间隔色
            pageNumber : 1, //初始化加载第一页
            pagination : false,//是否分页
            sidePagination : 'client',//server:服务器端分页|client：前端分页
            pageSize : 10,//单页记录数
            showRefresh : false,//刷新按钮
            idField: 'organid',
            checkboxHeader: false,
            height: $(window).height() - 220,
            ajax :function (e) {
                //因为需要做成机构选择的树形机构，所以一次获取所有数据，前端分页
                var data = e.data;
                var callback = e.success;
                var formData = $(".inquiry-form").getFormData();
                var da = {
                    //organname: formData.organname,
                    currentpage: "",
                    pagesize: "",
                    startindex: "0",
                    draw: 1
                };
                organDataGet(da, callback);
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
                        if (row.check == true) {
                            //设置选中
                            return {  checked: true };
                        }
                    }
                }, {
                    title : '机构名称',
                    field : 'organname'
                }, {
                    title : '机构ID',
                    field : 'organid',
                    visible: false
                }, {
                    title : '负责人',
                    field : 'leader'
                }, {
                    title : '电话',
                    field : 'phone'
                }, {
                    title : '地址',
                    field : 'address'
                } , {
                    title : '机构描述',
                    field : 'remark'
                } , {
                    title : '操作',
                    formatter: function (value, row, index) {
                        if(!window.parent.makeEdit(menu,loginSucc.functionlist,"#op_edit")) return '-';
                        return '<a href="javascript:;" id="op_edit" organid="' + row.organid + '">编辑</a>'
                    }
                }
            ],
            //在哪一列展开树形
            treeShowField: 'organname',
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
                // 勾选子类
                //selectChilds(datas,row,"organid","parentid",true);

                // 勾选父类
                //selectParentChecked(datas,row,"organid","parentid");
                //限制单选
                singleSelect(datas, row, "organid");
                // 刷新数据
                table.bootstrapTable('load', datas);
            },

            onUncheck:function(row){
                //var datas = table.bootstrapTable('getData');
                //selectChilds(datas,row,"organid","parentid",false);
                //table.bootstrapTable('load', datas);
            }
        });
        table.on('change', 'tbody tr .checkboxes', function () {
            $(this).parents('tr').toggleClass("active");
        });
    };
    return {
        init: function () {
            initTable();
        }
    };

}();

var OrganEdit = function() {
    var handleRegister = function() {
        var validator = $('.register-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                organname: {
                    required: true
                },
                organ: {
                    organ: true
                },
                sort: {
                    required: true
                },
                phone: {
                    digits: true
                }
            },

            messages: {
                organname: {
                    required: "机构名称必须输入"
                },
                sort: {
                    required: "排序号必须输入"
                }
            },

            invalidHandler: function(event, validator) { //display error alert on form submit

            },

            highlight: function(element) { // hightlight error inputs
                $(element)
                    .closest('.form-group').addClass('has-error'); // set error class to the control group
                $("#href1").addClass('tab_error');
            },

            success: function(label) {
                $("#href1").removeClass('tab_error');
                label.closest('.form-group').removeClass('has-error');
                label.remove();
            },

            errorPlacement: function(error, element) {
                if (element.closest('.input-icon').size() === 1) {
                    error.insertAfter(element.closest('.input-icon'));
                } else {
                    error.insertAfter(element);
                }
            },

            submitHandler: function(form) {
                form.submit();
            }
        });
        var invoicerise_validator = $('.invoicerise-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                taxpayer: {
                    required: true
                },
                rate: {
                    organRate: true,
                    rate:true
                },
                invoicerise_address:{
                    address:true
                },
                bank:{
                    required: true,
                    bank_validator:true
                },
                bankname:{
                    required: true
                }
            },

            messages: {
                taxpayer: {
                    required: "统一社会信用代码必须输入"
                },
                bankname:{
                    required: "开户银行必须输入"
                },
                bank:{
                    required: "银行账号必须输入"
                }
            },

            invalidHandler: function(event, validator) { //display error alert on form submit

            },

            highlight: function(element) { // hightlight error inputs
                $(element)
                    .closest('.form-group').addClass('has-error'); // set error class to the control group
                $("#href2").addClass('tab_error');
            },

            success: function(label) {
                $("#href2").removeClass('tab_error');
                label.closest('.form-group').removeClass('has-error');
                label.remove();
            },

            errorPlacement: function(error, element) {
                if (element.closest('.input-icon').size() === 1) {
                    error.insertAfter(element.closest('.input-icon'));
                } else {
                    error.insertAfter(element);
                }
            },

            submitHandler: function(form) {
                form.submit();
            }

        });

        //所属机构验证，选择所属机构的时候，不能选择自身，也不能选择自身的子机构
        jQuery.validator.addMethod("organ", function(value, element) {
            var organ = $('.register-form').getFormData();
            var ref = $('#organtree').jstree(true);
            var nodes = ref.get_selected();
            var same = parentOrSelf(nodes, organ.organid);
            return this.optional(element) || !same;
        }, "不能选择自身和自身的子机构作为所属机构");

        //服务费率
        jQuery.validator.addMethod("rate", function(value, element) {
            var rate = /^(\d|[1-9]\d|100)(\.\d{1,2})?$/;
            return this.optional(element) || (rate.test(value));
        }, "请输入0-100且小数点后最多两位的数字");

        jQuery.validator.addMethod("organRate", function(value, element) {
            var result = true;
            if($(".invoicerise-form").find("input[name=types]").val() != "0"){  //非运营方
                if($(".invoicerise-form").find("input[name=rate]").val() == ""){
                    result = false;
                }
            }
            return result;
        }, "服务费率必须输入！");

        jQuery.validator.addMethod("address", function(value, element) {
            var rate = /\//;
            var result = true;
            if(rate.test(value)){
                result = false;
            }
            return this.optional(element) || result;
        }, "不能输入带/的特殊字符");

        jQuery.validator.addMethod("bank_validator", function(value, element) {
            var reg = /^[0-9]*$/;
            return this.optional(element) || (reg.test(value));
        }, "请正确填写您的银行卡号");

        //选择所属机构事件
        $("#organtree").on('changed.jstree',function(e,data){
            var id = data.instance.get_node(data.selected[0]).id || "";
            if(id == ""){
                //没有所属机构为一级机构，显示开票信息
                $("#href2").parents('li').show();
            }else{
                $("#href2").parents('li').hide();
            }
        });

        //确定按钮按下
        $('#register-btn').click(function() {
            if(($('#organtree').jstree(true).get_selected(true)).length != 0){  //子级，只有基本信息
                if($('.register-form').validate().form()){
                    var organ = $('.register-form').getFormData();
                    organ.parentorganid = "";
                    var select = $('#organtree').jstree(true).get_selected(true);
                    if( select.length > 0){
                        organ.parentorganid = select[0].id;
                    }
                    organ.taxpayer = "";
                    organ.address_phone = "";
                    organ.bank_id = "";
                    organ.bank = "";
                    organ.banknumber = "";
                    organ.bankname = "";
                    organ.rate = "";
                    if($("input[name=edittype]").val() == ORGANADD){
                        $("#loading_edit").modal("show");
                        organAdd(organ);
                    }else{
                        $("#loading_edit").modal("show");
                        organEdit(organ);
                    }
                }
            }else{  //非子级，有基本信息和开票信息
                if (($('.register-form').validate().form()) && ($('.invoicerise-form').validate().form())) {
                    var organ = $('.register-form').getFormData();
                    organ.parentorganid = "";
                    var select = $('#organtree').jstree(true).get_selected(true);
                    if( select.length > 0){
                        organ.parentorganid = select[0].id;
                    }
                    var invoicerise = $('.invoicerise-form').getFormData();
                    organ.taxpayer = invoicerise.taxpayer;
                    organ.address_phone = invoicerise.invoicerise_address+"/"+invoicerise.invoicerise_tel;
                    organ.bankname = invoicerise.bankname;
                    organ.bank = invoicerise.bank;
                    organ.rate = invoicerise.rate;
                    if($("input[name=edittype]").val() == ORGANADD){
                        $("#loading_edit").modal("show");
                        organAdd(organ);
                    }else{
                        $("#loading_edit").modal("show");
                        organEdit(organ);
                    }
                }
            }
        });
        //增加机构
        $('#op_add').click(function() {
            validator.resetForm();
            invoicerise_validator.resetForm();
            $(".register-form").find(".has-error").removeClass("has-error");
            $(".invoicerise-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("新增机构");
            $(":input",".register-form,.invoicerise-form").not(":button,:reset,:submit,:radio").val("")
                .removeAttr("checked")
                .removeAttr("selected");
            $("#href1,#href2").removeClass('tab_error');
            $("#rate").show();
            //清空机构输入框
            clearSelect($("#organtree"));
            //操作类型
            $("input[name=edittype]").val(ORGANADD);
            $("#rate").find("input").removeAttr("readonly");
            //tab显示
            tabDisplay();
            $('#edit_organ').modal('show');
        });
        //编辑机构
        $("#organ_table").on('click', '#op_edit', function (e) {
            e.preventDefault();
            validator.resetForm();
            invoicerise_validator.resetForm();
            $(".register-form").find(".has-error").removeClass("has-error");
            $(".invoicerise-form").find(".has-error").removeClass("has-error");
            $("#href1,#href2").removeClass('tab_error');
            $(".modal-title").text("编辑机构");
            var exclude = ["organ"];
            var organid = $(this).attr("organid");
            var organlist = $("#organ_table").bootstrapTable('getData');
            var organ = new Object();
            for(var i=0; i < organlist.length; i++){
                if(organid == organlist[i].organid){
                    organ = organlist[i];
                }
            }
            var options = { jsonValue: organ, exclude:exclude,isDebug: false};
            if(organ.fjdid == ''){   //一级机构
                $("#href2").parents('li').show();
            }else{
                $("#href2").parents('li').hide();
            }
            $(".register-form").initForm(options);
            $(".invoicerise-form").initForm(options);
            //地址、电话
            if(organ.address_phone != ""){
                var addresseeTel = (organ.address_phone.replace("/",",")).split(",");
                $("input[name=invoicerise_address]").val(addresseeTel[0]);
                $("input[name=invoicerise_tel]").val(addresseeTel[1]);
            }else{
                $("input[name=invoicerise_address],input[name=invoicerise_tel]").val("");
            }
            //所属机构初始化
            clearSelectCheck($("#organtree"));
            if(organ.parentid != 0){
                $('#organtree').jstree(true).select_node(organ.parentid);
            }
            //操作类型
            $("input[name=edittype]").val(ORGANEDIT);
            //运营方不显示服务率
            if(organ.types == "0"){
                $("#rate").hide();
            }else{
                $("#rate").show();
                $("#rate").find("input").attr("readonly","readonly");
            }
            //tab显示
            tabDisplay();
            $('#edit_organ').modal('show');
        })
    };

    return {
        //main function to initiate the module
        init: function() {
            handleRegister();
        }
    };
}();

var OrganDelete = function() {
    $('#op_del').click(function() {
        var len = $("input[name=btSelectItem]:checked").length;
        if(len < 1){
            alertDialog("至少选中一项！");
        }else{
            confirmDialog("数据删除后将不可恢复，您确定要删除吗？", OrganDelete.deleteOrgan)
        }
    });
    return{
        deleteOrgan: function(){
            var organlist = {organidlist:[]};
            var select = $("#organ_table").bootstrapTable('getSelections');
            for(var i=0; i<select.length;i++) {
                if(select[i].types == "0"){
                    alertDialog("运营方不可进行删除操作！");
                    return;
                }
                organlist.organidlist.push(select[i].organid);
            }
            $("#loading_edit").modal("show");
            organDelete(organlist);
        }
    }
}();

function getOrganDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            organList = res.list;
            //做成新增或者删除机构的树形结构
            organNameSelectBuild(organList, $("#organtree"));
            //给页面上的table赋值
            bootstrapTreeTableDataSet(res.totalcount, res.list, "organlist", "organid", callback);
        }else{
            //给页面上的table赋值
            bootstrapTreeTableDataSet(0, [], "organlist", "organid", callback);
            alertDialog("机构信息获取失败！");
        }
    }else{
        //给页面上的table赋值
        bootstrapTreeTableDataSet(0, [], "organlist", "organid", callback);
        alertDialog("机构信息获取失败！");
    }
}

function organInfoEditEnd(flg, result, type){
    $("#loading_edit").modal("hide");
    var res = "失败";
    var text = "";
    var alert = "";
    switch (type){
        case ORGANADD:
            text = "新增";
            break;
        case ORGANEDIT:
            text = "编辑";
            break;
        case ORGANDELETE:
            text = "删除";
            break;
    }
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg;
        }
        if (result && result.retcode == SUCCESS) {
            res = "成功";
            $("#organ_table").bootstrapTable('destroy');
            OrganTable.init();
            $('#edit_organ').modal('hide');
        }
    }
    if(alert == "") alert = text + "机构" + res + "！";
    App.unblockUI('#lay-out');
    alertDialog(alert);
}

//选中所属机构
$('#organtree').on('select_node.jstree', function(e,data) {
    var ref = $(this).jstree(true);
    var nodes = ref.get_checked();  //使用get_checked方法
    $.each(nodes, function(i, nd) {
        if (nd != data.node.id)
            ref.uncheck_node(nd);
    });
    $(this).siblings("input").val(data.node.text);
    $(this).hide();
});

//取消选中所属机构
$('#organtree').on('deselect_node.jstree', function(e,data) {
    $(this).siblings("input").val("");
    $(this).hide();
});

//按下input之外的地方，所属机构输入框不显示
$(document).click(function(e){
    if ($(e.target)[0] != $("#organ")[0]){
        $("#organtree").hide();
    }
});

//查询按钮按下
$("#organ_inquiry").on("click", function(){
   $("#organ_table").bootstrapTable('destroy');
   OrganTable.init();
});

function parentOrSelf(node, checkId){
    var ref = $("#organtree").jstree(true);
    if(node == checkId){
        return true
    }else{
        var pnode = ref.get_parent(node);
        if(pnode){
            return parentOrSelf(pnode, checkId);
        }else{
            return false;
        }
    }
}


//tab显示(默认显示tab_1_1)
function tabDisplay(){
    $("#href2").parents('li').removeClass('active');
    $("#href1").parents('li').addClass('active');
    $("#tab_1_2").removeClass('active');
    $("#tab_1_2").removeClass('in');
    $("#tab_1_1").addClass('active');
    $("#tab_1_1").addClass('in');
}