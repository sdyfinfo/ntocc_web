/**
 * Created by Administrator on 2019/12/4.
 */
var priceList = [];
if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        PriceTable.init();
        PriceEdit.init();
    });
}

var PriceTable = function () {
    var initTable = function () {
        var table = $('#price_table');
        pageLengthInit(table);
        table.dataTable({
            "language": TableLanguage,
            "bStateSave": false, // save datatable state(pagination, sort, etc) in cookie.
            "lengthMenu": TableLengthMenu,
            "destroy": true,
            "pageLength": PageLength,
            "serverSide": true,
            "pagingType": "bootstrap_extended",
            "processing": true,
            "searching": false,
            "ordering": false,
            "autoWidth": false,
            "ajax":function (data, callback, settings) {
                var formData = $(".inquiry-form").getFormData();
                var da = {
                    protype: formData.protype,
                    currentpage: (data.start / data.length) + 1,
                    pagesize: data.length == -1 ? "": data.length,
                    startindex: data.start,
                    draw: data.draw
                };
                priceDataGet(da, callback);
            },
            columns: [//返回的json数据在这里填充，注意一定要与上面的<th>数量对应，否则排版出现扭曲
                { "data": null},
                { "data": null},
                { "data": "priceid", visible: false },
                { "data": "protype" },
                { "data": "price" },
                { "data": "wordnum" },
                { "data": "discount" },
                { "data": null }
            ],
            columnDefs: [
                {
                    "targets":[1],
                    "render":function(data, type, row, meta){
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
                    "targets":[3],
                    "render": function(data, type, row, meta) {
                        var cType;
                        switch (data) {
                            case "0":
                                cType = "Turnin查重";
                                break;
                            case "1":
                                cType = "Grammarian语法检测";
                                break;

                        }
                        return cType;
                    }
                },
                {
                    "targets":[4],
                    "render": function(data, type, row, meta) {
                        return data + "元";
                    }
                },
                {
                    "targets":[5],
                    "render": function(data, type, row, meta) {
                        return data + "字";
                    }
                },
                {
                    "targets":[6],
                    "render": function(data, type, row, meta) {
                        return discountNumberChange(data);
                    }
                },{
                    "targets":[7],
                    "render": function(data, type, row, meta) {
                        if(!makeEdit(menu,loginSucc.functionlist,"#op_edit")) return '-';
                        return '<a href="javascript:;" id="op_edit">编辑</a>'
                    }
                }
            ],
            fnRowCallback: function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
                $('td:eq(1)', nRow).attr('style', 'text-align: center;');
            }
        });
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

var PriceEdit = function() {
    var handleRegister = function() {
        var validator = $('.register-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                protype: {
                    required: true
                },
                price: {
                    required: true,
                    number: true
                },
                wordnum: {
                    required: true,
                    digits: true
                },
                discount: {
                    number: true,
                    range: [0, 1],
                    maxlength: 4
                }
            },

            messages: {
                protype: {
                    required: "产品类别必须输入"
                },
                price: {
                    required: "价格必须输入",
                },
                wordnum: {
                    required: "字数必须输入",
                },
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
        $('#register-btn').click(function() {
            btnDisable($('#register-btn'));
            if ($('.register-form').validate().form()) {
                var price = $('.register-form').getFormData();
                if ($("input[name=edittype]").val() == PRICEADD) {
                    priceAdd(price);
                } else {
                    priceEdit(price);
                }
            }
        });
        //新增角色
        $('#op_add').click(function() {
            validator.resetForm();
            $(".register-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("新增产品价格");
            $(":input",".register-form").not(":button,:reset,:submit,:radio").val("")
                .removeAttr("checked")
                .removeAttr("selected");
            $("input[name=edittype]").val(PRICEADD);
            $('#edit_price').modal('show');
        });
        //编辑产品价格
        $("#price_table").on('click', '#op_edit', function (e) {
            e.preventDefault();
            validator.resetForm();
            $(".register-form").find(".has-error").removeClass("has-error");
            $(".modal-title").text("编辑产品价格");
            var exclude = [""];
            var row = $(this).parents('tr')[0];     //通过获取该td所在的tr，即td的父级元素，取出第一列序号元素
            var priceid = $("#price_table").dataTable().fnGetData(row).priceid;
            var price = new Object();
            for(var i=0; i < priceList.length; i++){
                if(priceid == priceList[i].priceid){
                    price = priceList[i];
                }
            }
            var options = { jsonValue: price, exclude:exclude, isDebug: false};
            $(".register-form").initForm(options);
            $("input[name=edittype]").val(PRICEEDIT);
            $('#edit_price').modal('show');
        });
    };

    return {
        init: function() {
            handleRegister();
        }
    };
}();

var PriceDelete = function() {
    $('#op_del').click(function() {
        var len = $(".checkboxes:checked").length;
        if(len < 1){
            alertDialog("至少选中一项！");
        }else{
            var para = 1;
            confirmDialog("数据删除后将不可恢复，您确定要删除吗？", PriceDelete.deletePrice, para)
        }
    });
    return{
        deletePrice: function(){
            var pricelist = {priceidlist:[]};
            $(".checkboxes:checked").parents("td").each(function () {
                var row = $(this).parents('tr')[0];     //通过获取该td所在的tr，即td的父级元素，取出第一列序号元素
                var priceid = $("#price_table").dataTable().fnGetData(row).priceid;
                pricelist.priceidlist.push(priceid);
            });
            priceDelete(pricelist);
        }
    }
}();

function getPriceDataEnd(flg, result, callback){
    App.unblockUI('#lay-out');
    if(flg){
        if (result && result.retcode == SUCCESS) {
            var res = result.response;
            priceList = res.pricelist;
            tableDataSet(res.draw, res.totalcount, res.totalcount, res.pricelist, callback);
        }else{
            tableDataSet(0, 0, 0, [], callback);
            alertDialog(result.retmsg);
        }
    }else{
        tableDataSet(0, 0, 0, [], callback);
        alertDialog("产品价格获取失败！");
    }
}

function priceInfoEditEnd(flg, result, type){
    var res = "失败";
    var text = "";
    var alert = "";
    switch (type){
        case PRICEADD:
            text = "新增";
            break;
        case PRICEEDIT:
            text = "编辑";
            break;
        case PRICEDELETE:
            text = "删除";
            break;
    }
    if(flg){
        if(result && result.retcode != SUCCESS){
            alert = result.retmsg;
        }
        if (result && result.retcode == SUCCESS) {
            res = "成功";
            PriceTable.init();
            $('#edit_price').modal('hide');
        }
    }
    if(alert == "") alert = text + "产品价格" + res + "！";
    App.unblockUI('#lay-out');
    alertDialog(alert);
}

$("#price_inquiry").on("click", function(){
    //用户查询
    PriceTable.init();
});

