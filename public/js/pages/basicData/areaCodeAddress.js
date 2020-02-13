/**
 * Created by Lenovo on 2020/2/11.
 */
var load_citylist,unload_citylist,add_citylist = [];

//省赋值
function addressDispaly(province){
    for(var i in areaCode){
        $(province).append("<option value='"+areaCode[i].code+"'>"+areaCode[i].name+"</option>");
    }
}

//省
$("#loading_provincecode").change(function(){
    var province = $(this).val();
    cityDisplay(province,"#loading_citycode","#loading_countycode");
});
$("#unloading_provincecode").change(function(){
    var province = $(this).val();
    cityDisplay(province,"#unloading_citycode","#unloading_countycode");
});
$("#provincecode").change(function(){
    var province = $(this).val();
    cityDisplay(province,"#citycode","#countycode");
});


//市
$("#loading_citycode").change(function(){
    var city = $(this).val();
    countyDisplay(city,"#loading_countycode");
});
$("#unloading_citycode").change(function(){
    var city = $(this).val();
    countyDisplay(city,"#unloading_countycode");
});
$("#citycode").change(function(){
    var city = $(this).val();
    countyDisplay(city,"#countycode");
});



//省联动市
function cityDisplay(province,city,county){
    $(city).empty();
    $(county).empty();
    $(city).append("<option value=''>请选择市</option>");
    $(county).append("<option value=''>请选择区/县</option>");
    if(province != ""){
        for(var i in areaCode){
            if(province == areaCode[i].code){
                switch (city){
                    case "#loading_citycode":
                        load_citylist = areaCode[i].city;
                        break;
                    case "#unloading_citycode":
                        unload_citylist = areaCode[i].city;
                        break;
                    case "#citycode":
                        add_citylist = areaCode[i].city;
                        break;
                }
                for(var j in areaCode[i].city){
                    $(city).append("<option value='"+areaCode[i].city[j].code+"'>"+areaCode[i].city[j].name+"</option>");
                }
            }
        }
    }
}

//市联动县
function countyDisplay(city,county){
    $(county).empty();
    $(county).append("<option value=''>请选择区/县</option>");
    if(city!=""){
        var citylist = "";
        switch (county){
            case "#loading_countycode":
                citylist = load_citylist;
                break;
            case "#unloading_countycode":
                citylist = unload_citylist;
                break;
            case "#countycode":
                citylist = add_citylist;
                break;
        }
        for(var i in citylist){
            if(city == citylist[i].code){
                for(var j in citylist[i].county){
                    $(county).append("<option value='"+citylist[i].county[j].code+"'>"+citylist[i].county[j].name+"</option>");
                }
            }
        }
    }
}


//省市区显示
function areaDisplay(proCode,cityCode,city_sel,county_sel){
    for(var i in areaCode){
        //根据省代码找市列表
        if(proCode == areaCode[i].code){
            switch (city_sel){
                case "#loading_citycode":
                    load_citylist = areaCode[i].city;
                    break;
                case "#unloading_citycode":
                    unload_citylist = areaCode[i].city;
                    break;
                case "#citycode":
                    add_citylist = areaCode[i].city;
                    break;
            }
            $(city_sel).empty();
            $(city_sel).append('<option value="">请选择市</option>');
            for(var j in areaCode[i].city){
                $(city_sel).append('<option value="'+areaCode[i].city[j].code+'">'+areaCode[i].city[j].name+'</option>');
            }
            //显示县
            countyNameDisplay(cityCode,county_sel);
        }
    }
}

function countyNameDisplay(cityCode,county_sel){
    $(county_sel).empty();
    $(county_sel).append('<option value="">请选择区/县</option>');
    var citylist = "";
    switch (county_sel){
        case "#loading_countycode":
            citylist = load_citylist;
            break;
        case "#unloading_countycode":
            citylist = unload_citylist;
            break;
        case "#countycode":
            citylist = add_citylist;
            break;
    }
    for(var i in citylist){
        if(cityCode == citylist[i].code){
            var county = citylist[i].county;
            for(var j in county){
                $(county_sel).append('<option value="'+county[j].code+'">'+county[j].name+'</option>');
            }
        }
    }
}