/**
 * Created by Lenovo on 2020/2/7.
 */

var lineList = [];

if(App.isAngularJsApp() == false){
    jQuery(document).ready(function(){
        //项目列表
      //  LineTable.init();

    });
}

//项目列表
var LineTable = function(){
    var initTable = function(){
        var table = $('#line_table');
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
            "autoWidth": false,
            "ajax":function (data, callback, settings) {
                var formData = $(".inquiry-form").getFormData();
                var da = {
                    projectname: formData.projectname,
                    linename: formData.linename,
                    currentpage: (data.start / data.length) + 1,
                    pagesize: data.length == -1 ? "": data.length,
                    startindex: data.start,
                    draw: data.draw
                };
                lineDataGet(da, callback);
            },
            columns:[ //返回的json 数据在这里填充，注意一定要与上面的<th>数量对应，否则排版出现扭曲
                {"data":null},
                {"data":null},
                {"data":"lineid",visible:false},
                {"data":"projectname"},
                {"data":"linename"},
                {"data":"placeol"},
                {"data":"unloading"},
                {"data":"consignor"},
                {"data":"consignee"},
                {"data":"cargotype"},
                {"data":"goodsname"},
                {"data":"chargeunit"},
                {"data":"freight"},
                {"data":"state"},
                {"data":"create_time"},
                {"data":"update_time"},
                {"data":null}
            ],
            columnDefs:[
                {
                    "tragest":[1],
                    "render":function (data, type, row, meta) {
                        return '<input type="checkbox" class="checkbox" value="1" />'
                    }
                },
                {
                    "tragets":[15],
                    "render": function (data, type, row ,meta) {
                        return conferenceDateFormat(data);
                    }
                },
                {
                    "tragets":[16],
                    "render": function (data, type, row ,meta) {
                        return conferenceDateFormat(data);
                    }
                },
                {
                    "tragets":[17],
                    "render": function (data, type, row, meta) {
                        var edit = '<a href="javascripts" id="op_edit">编辑</a>'
//                        if(!window.parent.makeEdit(menu,loginSucc.functionlist,"#op_edit")){
//                            edit = '-';
//                        }else{
//                            edit = '<a href="javascript:;" id="op_edit">编辑</a>';
//                        }
                        return edit;
                    }
                }
            ]
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
    }
}