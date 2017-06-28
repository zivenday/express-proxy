var loc;
if(!!sessionStorage.getItem("loc")){
    loc = sessionStorage.getItem("loc");
}
else{
    //没有存到session的话，默认使用服务器ip
    loc = "http://10.16.29.101:8080";
}

//图表：收入金额
var incomeChart = echarts.init(document.getElementById("chart-manufacturer-income"));
var incomeValue={
        year: [],
        quarter: ["第一季度", "第二季度", "第三季度", "第四季度"],
        month: ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],
        yearData: [],
        quarterData: [],
        monthData: []
    };
//图表：流量包订购数量
var trafficBagOrderNumberChart = echarts.init(document.getElementById("chart-trafficBag-order-number"));

var ajaxAPIArray = ["/recharge/manager/listPackageStatisticMonth.do", ""];

var month_data = {
    title_data: [],
    xAxis_data: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
    legend_data: [],
    series_data: [],
    dataZoom_data: {},
    yAxis_data: {},
    isPieAllZero: true
}

var quarter_data = {
    xAxis_data :["第一季度", "第二季度", "第三季度", "第四季度"],
    legend_data: [],
    series_data: [],
    dataZoom_data: {},
    yAxis_data: {},
    isPieAllZero: true
}
var year_data = {
    xAxis_data :[],
    legend_data: [],
    series_data: [],
    dataZoom_data: {},
    yAxis_data: {},
    isPieAllZero: true
}

var now_month = new Date().getMonth() + 1;  //当前的月份
var now_quarter = Math.floor((new Date().getMonth())/3)+1;  //当前的季度

$(document).ready(function(){

    //-----------------显示该厂商的总用户数量----------------------------
    ajax_getIotCardStatusStatistics();
    
    //-----------------------图表：厂商收入金额------------------
    ajax_getPayStatisticMonth();

    //select 选择年季日时
    $("select[name='times']").change(function(){
        if( incomeValue[$("select[name='times']").val()+"Data"].length == 0 ){
            switch( $("select[name='times']").val() ){
                case "month":
                    ajax_getPayStatisticMonth();
                    break;
                case "quarter":
                    ajax_getPayStatisticQuarter();
                    break;
                case "year":
                    ajax_listPayStatisticYear();
                    break;
            }
        }
        else{
            putValueToIncomeChart(incomeValue, incomeChart, $("select[name='times']").val());
        }
    });

    //-----------------------图表：流量包订购数量------------------
    var style_trafficBagOrderNumberChartOption={
        title:[{
            left:'18%'  //左 title
        },{
            left:'80%',
            top: 'auto',
            textAlign: 'center'     //右 title
        }],
        legend:{
            bottom:0,
            height:120
        },  //图例
        grid:{
            left:'0%',
            right:'45%',
            bottom:120,
            containLabel: true
        },  //柱状图
        dataZoom:{
            type:'inside',
            start:0,
            end:100,
            zoomLock:true
        },  //滑动
        xAxis: {
            type: 'category',
            data: month_data.xAxis_data
        },  //x轴，若获取数据不成功，x轴显示1～12个月
        yAxis: {
            axisLine: {show: false},
            axisTick: {show: false},
            name:"(个)",
            minInterval: 1
        },
        tooltip:{
            trigger:'item'
        },
        color:["#bec3c7", "#fab237", "#aad774", "#49c9bf", "#78cbee", "#b5bced"],
        itemStyle: {
            normal: {
                borderWidth: 1,
                borderColor: '#fff'
            }
        }
    };
    trafficBagOrderNumberChart.setOption(style_trafficBagOrderNumberChartOption);

    ajaxAskForTrafficBagMonthData();

    //select 选择年季日时
    $("select[name='times2']").change(function(){
        switch($("select[name='times2']").val()){
            case 'month':
                if(month_data.series_data.length == 0){
                    ajaxAskForTrafficBagMonthData();
                }
                else{
                    putValueToBagChart( month_data, "month");
                }
                break;
            case 'quarter':
                if(quarter_data.series_data.length == 0){
                    ajaxAskForTrafficBagQuarterData();
                }
                else{
                    putValueToBagChart( quarter_data, "quarter");
                }
                break;
            case 'year':
                if(year_data.series_data.length == 0){
                    ajaxAskForTrafficBagYearData();
                }
                else{
                    putValueToBagChart( year_data, "year");
                }
                break;
        }
    });
});
//-----------------------------操作echart图-----------------------------
//图：流量包订购数
function putValueToBagChart( value, dataType){   //dataType: "month" "quarter" "year"

    //判断饼状图是否为0
    if(value.isPieAllZero){
        $("#no_pie_data_tip").css("display", "block");
        $("#no_pie_data_tip").text( value.title_data[1] + "-暂无数量包订购相关数据");
    }
    else{
        $("#no_pie_data_tip").css("display", "none");
    }
    
    var option = {
        title: [
            {text: value.title_data[0]+"流量包订购数"},
            {text: value.title_data[1]+"流量包订购数量占比"}],
        legend: {
            data: value.legend_data
        },
        series: value.series_data,
        xAxis: {data: value.xAxis_data},
        dataZoom: value.dataZoom_data,
        yAxis: value.yAxis_data
    }
    
    trafficBagOrderNumberChart.setOption(option);
}
//图：收入金额
function putValueToIncomeChart(incomeValue, incomeChart, dataType){ //dataType -"month"月度， -“quarter”季度， -“year”年度
    var title = "收入金额";
    switch(dataType){
        case "month":
            title = "月度"+title; 
            break;
        case "quarter":
            title = "季度"+title; 
            break;
        case "year":
            title = "年度"+title; 
            break;

    }

        var incomeChartOption={
            title:{
                text: title,
                left: 'center'
            },
            xAxis: {
                data: incomeValue[dataType]
            },
            yAxis:{
                name: "(元)",
                axisLine:{
                    show: false
                },
                axisTick:{
                    show: false
                }
            },
            series: [{
                name: '收入金额',
                type: 'line',
                lineStyle:{
                    normal:{color: '#f88b00'}
                },
                data: incomeValue[dataType+"Data"],
                itemStyle:{
                    normal:{
                        color:'#f88b00',
                    }
                }
            }],
            tooltip:{
                formatter:'{b}的{a}为：{c}'
            }
        };
        incomeChart.setOption(incomeChartOption);
    }

//------------------------------操作dom--------------------------------
//将获取的数据填充到用户卡号状态区域的html中
function loadValueToCardStatus(totalNumber, statusList, containerDomString){
    var pDomList = $(containerDomString).find("p");    //标签数组：状态名称
    pDomList.text(function(index, oldValue){
        return statusList[index+1].statusCount;
    });
}
//

//------------------------------ajax封装--------------------------------
//显示当年所有月份各类套餐包订购数
function ajaxAskForTrafficBagMonthData(){
        // var msg = {
        //     "packageCountList":
        //         [
        //             {"monthValue":[0,0,0,1,1,13,0,0,0,0,0,0],"packageName":"物联网（数据）月加餐包非定向4元30MB（201604）"},
        //             {"monthValue":[0,0,0,0,0,1,0,0,0,0,0,0],"packageName":"物联网（数据）月加餐包非定向8元100MB（201604） "},
        //             {"monthValue":[0,0,0,0,0,0,0,0,0,0,0,0],"packageName":"物联网（数据）月加餐包非定向16元300MB（201604）"},
        //             {"monthValue":[0,0,0,0,0,0,0,0,0,0,0,0],"packageName":"物联网（数据）月加餐包非定向24元500MB（201604）"},
        //             {"monthValue":[0,0,0,0,0,0,0,0,0,0,0,0],"packageName":"物联网（数据）月加餐包非定向40元1GB（201604）"},
        //             {"monthValue":[0,0,0,0,0,0,0,0,0,0,0,0],"packageName":"物联网（数据）月加餐包非定向80元3GB（201604）"}
        //         ],
        //     "packageNameList":
        //         [
        //             "物联网（数据）月加餐包非定向4元30MB（201604）",
        //             "物联网（数据）月加餐包非定向8元100MB（201604） ",
        //             "物联网（数据）月加餐包非定向16元300MB（201604）",
        //             "物联网（数据）月加餐包非定向24元500MB（201604）",
        //             "物联网（数据）月加餐包非定向40元1GB（201604）",
        //             "物联网（数据）月加餐包非定向80元3GB（201604）"
        //         ],
        //     "msg":0
        // }
        $.ajax({
            url:loc+'/recharge/manager/listPackageStatisticMonth.do',   //获取当年所有月份各类套餐包订购数
            data:{},
            type:'GET',
            dataType:'JSON',
            success:function(msg){
                switch(String(msg.msg)){
                    case "0":
                        month_data.legend_data = msg.packageNameList;   //流量包名的数组
                        var monthDataArrayforData = [];     //饼状图的data数组
                        var monthDataArrayforData2 = [];     //饼状图的data数组
                        var month_trafficBagOrderNumberSubPieChartForSeries = {};   //series中饼状图的部分

                        var isMaxGreaterThree = false;  //为了不让y轴出现负数的判断
                        var max = 0;                    //为了不让y轴出现负数的判断

                        //for (start)
                        for(var i=0; i<month_data.legend_data.length; i++){
                            var objson = {
                                name: msg.packageNameList[i],
                                type:'bar',
                                data: msg.packageCountList[i].monthValue.slice(0,now_month),
                                tooltip:{
                                    formatter: '流量包名称: {a}<br />订购数量&nbsp;&nbsp;&nbsp;&nbsp;: {c}'
                                }
                            };
                            month_data.series_data.push(objson);

                            if(!isMaxGreaterThree){
                                var x = parseInt(Math.max.apply(null, msg.packageCountList[i].monthValue.slice(0,now_month)));
                                if(x>max){max = x};
                                if(x>3){isMaxGreaterThree = true;}
                            }

                            //trafficBagMonthData.push(msg.packageCountList[i].monthValue.slice(0,now_month));
                            var objjson2 = {
                                value: msg.packageCountList[i].monthValue[now_month-1],
                                name: msg.packageCountList[i].packageName,
                                label: {
                                    normal: {
                                        show: true,
                                        position: 'outside',
                                        formatter: function(params){return params.name.slice(0,10)+"...";},
                                        textStyle:{color:'#888888'}
                                    }
                                }
                            }
                            if(objjson2.value == 0){
                                objjson2.label.normal["show"] = false;
                                objjson2["labelLine"] = {normal:{show:false}};
                            }
                            else{
                                month_data.isPieAllZero = false ;
                            }
                            monthDataArrayforData.push(objjson2);

                            var objjson3 = {
                                name: msg.packageCountList[i].packageName,
                                value: msg.packageCountList[i].monthValue[now_month-1],
                                label:{
                                    normal: {
                                        show: true,
                                        position: 'inside',
                                        formatter: '{d}%',
                                        textStyle:{color:'#fff'}
                                    }
                                },
                                labelLine: {
                                    normal:{show: false}
                                }
                            };
                            if(objjson3.value == 0){
                                objjson3.label = {normal:{show:false}};
                            }
                            monthDataArrayforData2.push(objjson3);
                        }
                        //for (end)

                        //折线图是否滑动
                        var end = 100;
                        switch(parseInt(now_month)){
                            case 7: case 8: case 9: case 10: case 11: case 12:
                                end = parseInt((6/now_month)*100);
                                break;
                        };

                        month_trafficBagOrderNumberSubPieChartForSeries = {
                            type: 'pie',
                            center: ['80%', '45%'],
                            radius : [0,'40%'],
                            data: monthDataArrayforData,
                            tooltip: {
                                formatter: '流量包名称: {b}<br />订购数量: {c} ({d}%)'
                            },
                            stillShowZeroSum: false,
                            
                        };

                        var month_trafficBagOrderNumberSubPieChartForSeries2 = {
                            hoverAnimation: false,
                            type: 'pie',
                            center: ['80%', '45%'],
                            radius : [0,'40%'],
                            data: monthDataArrayforData2,
                            stillShowZeroSum: false,
                            tooltip: {
                                formatter: '流量包名称: {b}<br />订购数量: {c} ({d}%)'
                            },
                            label: {
                                normal: {
                                    show: true,
                                    position: 'inside',
                                    formatter: '{d}%'
                                }
                            }
                        };
                        
                        month_data.series_data.push(month_trafficBagOrderNumberSubPieChartForSeries2);
                        month_data.series_data.push(month_trafficBagOrderNumberSubPieChartForSeries);

                        month_data.title_data = ['月度', month_data.xAxis_data[now_month-1]];
                        month_data.xAxis_data = month_data.xAxis_data.slice(0, now_month);
                        month_data.dataZoom_data = {end: end};

                        if(!isMaxGreaterThree){
                            var rate = '';
                            switch(max){
                                case 0:
                                    rate = '400%';break;
                                case 1:
                                    rate = '300%';break;
                                case 2:
                                    rate = '100%';break;
                                case 3:
                                    rate = '40%';break;
                            }
                            month_data.yAxis_data={boundaryGap:[0,rate]};
                        }
                        else{
                            month_data.yAxis_data={boundaryGap:[0,0]};
                        }

                        putValueToBagChart( month_data, "month");
                        break;
                    case "1": 
                        break;
                    case "10":default:
                        x0pAjaxError(msg);
                        console.log("ajax success()-"+msg+"-接口：listPackageStatisticMonth.do-获取当年所有月份各类套餐包订购数");
                        break;
                }
            },
            error:function(msg){
                x0pServerError(msg);
                console.log("ajax error()-"+msg+"-接口：listPackageStatisticMonth.do-获取当年所有月份各类套餐包订购数");
            }
        });
}
//显示当年所有季度各类套餐包订购数
function ajaxAskForTrafficBagQuarterData(){
    // var msg = {
    //     "packageCountList":
    //         [
    //             {"quarterValue":[0,15,0,0],"packageName":"物联网（数据）月加餐包非定向4元30MB（201604）"},
    //             {"quarterValue":[0,1,0,0],"packageName":"物联网（数据）月加餐包非定向8元100MB（201604） "},
    //             {"quarterValue":[0,0,0,0],"packageName":"物联网（数据）月加餐包非定向16元300MB（201604）"},
    //             {"quarterValue":[0,0,0,0],"packageName":"物联网（数据）月加餐包非定向24元500MB（201604）"},
    //             {"quarterValue":[0,0,0,0],"packageName":"物联网（数据）月加餐包非定向40元1GB（201604）"},
    //             {"quarterValue":[0,0,0,0],"packageName":"物联网（数据）月加餐包非定向80元3GB（201604）"}
    //         ],
    //     "packageNameList":
    //         [
    //             "物联网（数据）月加餐包非定向4元30MB（201604）",
    //             "物联网（数据）月加餐包非定向8元100MB（201604） ",
    //             "物联网（数据）月加餐包非定向16元300MB（201604）",
    //             "物联网（数据）月加餐包非定向24元500MB（201604）",
    //             "物联网（数据）月加餐包非定向40元1GB（201604）",
    //             "物联网（数据）月加餐包非定向80元3GB（201604）"
    //         ],
    //     "msg":0};
        $.ajax({
            url: loc+'/recharge/manager/listPackageStatisticQuarter.do',
            data:{},
            type:'GET',
            dataType:'JSON',
            success:function(msg){
                switch(String(msg.msg)){
                    case "0":
                        var quarter_trafficBagOrderNumberSubPieChartForSeries = {};
                        var quarterDataArrayforData = [];
                        var quarterDataArrayforData2 = [];
                        var isMaxGreaterThree = false;
                        var max = 0;

                        quarter_data.legend_data = msg.packageNameList;
                        for(var i=0; i<quarter_data.legend_data.length; i++){
                            var objjson = {
                                name: quarter_data.legend_data[i],
                                type:'bar',
                                data: msg.packageCountList[i].quarterValue,
                                tooltip:{
                                    formatter: '流量包名称: {a}<br />订购数量&nbsp;&nbsp;&nbsp;&nbsp;: {c}'
                                }
                            };
                            quarter_data.series_data.push(objjson);
                            if(!isMaxGreaterThree){
                                var x = parseInt(Math.max.apply(null, msg.packageCountList[i].quarterValue));
                                if(x>max){max = x};
                                if(x>3){isMaxGreaterThree = true;}
                            }

                            var objjson2 = {
                                name: msg.packageCountList[i].packageName,
                                value: msg.packageCountList[i].quarterValue[now_quarter-1],
                                label: {
                                    normal: {
                                        show: true,
                                        position: 'outside',
                                        formatter: function(params){return params.name.slice(0,10)+"...";},
                                        textStyle:{color:'#888888'}
                                    }
                                }
                            };
                            if(objjson2.value == 0){
                                objjson2.label.normal["show"] = false;
                                objjson2["labelLine"] = {normal:{show:false}};
                            }
                            else{
                                quarter_data.isPieAllZero = false;
                            }
                            quarterDataArrayforData.push(objjson2);

                            var objjson3 = {
                                name: msg.packageCountList[i].packageName,
                                value: msg.packageCountList[i].quarterValue[now_quarter-1],
                                label:{
                                    normal: {
                                        show: true,
                                        position: 'inside',
                                        formatter: '{d}%',
                                        textStyle:{color:'#fff'}
                                    }
                                },
                                labelLine: {
                                    normal:{
                                        show: false
                                    }
                                }
                            };
                            if(objjson3.value == 0){
                                objjson3.label = {normal:{show:false}};
                            }
                            quarterDataArrayforData2.push(objjson3);
                        }
                        quarter_trafficBagOrderNumberSubPieChartForSeries = {
                            type: 'pie',
                            center: ['80%', '45%'],
                            radius : [0,'40%'],
                            data: quarterDataArrayforData,
                            tooltip: {
                                formatter: '流量包名称: {b}<br />订购数量: {c} ({d}%)'
                            },
                            stillShowZeroSum: false
                        };

                        var quarter_trafficBagOrderNumberSubPieChartForSeries2 = {
                            hoverAnimation: false,
                            type: 'pie',
                            center: ['80%', '45%'],
                            radius : [0,'40%'],
                            data: quarterDataArrayforData2,
                            stillShowZeroSum: false,
                            tooltip: {
                                formatter: '流量包名称: {b}<br />订购数量: {c} ({d}%)'
                            },
                            label: {
                                normal: {
                                    show: true,
                                    position: 'inside',
                                    formatter: '{d}%'
                                }
                            }
                        };

                        quarter_data.series_data.push(quarter_trafficBagOrderNumberSubPieChartForSeries2);
                        quarter_data.series_data.push(quarter_trafficBagOrderNumberSubPieChartForSeries);
                        quarter_data.title_data = ['季度', quarter_data.xAxis_data[now_quarter-1]];
                        quarter_data.dataZoom_data = {end: 100}; 

                        if(!isMaxGreaterThree){
                            var rate = '';
                            switch(max){
                                case 0:
                                    rate = '400%';break;
                                case 1:
                                    rate = '300%';break;
                                case 2:
                                    rate = '100%';break;
                                case 3:
                                    rate = '40%';break;
                            }
                            quarter_data.yAxis_data={boundaryGap:[0,rate]};
                        }
                        else{
                            quarter_data.yAxis_data={boundaryGap:[0,0]};
                        }
                        putValueToBagChart( quarter_data, "quarter");
                        break;
                    case "1": 
                        console.log("listPackageStatisticQuarter-数据不存在");
                        break;
                    case "10":default:
                        x0pAjaxError(msg);
                        console.log("ajax success()-"+msg+"-接口：listPackageStatisticQuarter.do-获取当年所有季度各类套餐包订购数");
                        break;
                }
            },
            error:function(msg){
                x0pServerError(msg);
                console.log("ajax error()-"+msg+"-接口：listPackageStatisticQuarter.do-获取当年所有季度各类套餐包订购数");
            }
        });
    }
//显示最近三年各类套餐包订购数
function ajaxAskForTrafficBagYearData(){
    // var msg = {
    //         "packageCountList":
    //             [
    //                 {"yearCountList":[0,0,15],"packageName":"物联网（数据）月加餐包非定向4元30MB（201604）"},
    //                 {"yearCountList":[0,0,1],"packageName":"物联网（数据）月加餐包非定向8元100MB（201604） "},
    //                 {"yearCountList":[0,0,0],"packageName":"物联网（数据）月加餐包非定向16元300MB（201604）"},
    //                 {"yearCountList":[0,0,0],"packageName":"物联网（数据）月加餐包非定向24元500MB（201604）"},
    //                 {"yearCountList":[0,0,0],"packageName":"物联网（数据）月加餐包非定向40元1GB（201604）"},
    //                 {"yearCountList":[0,0,0],"packageName":"物联网（数据）月加餐包非定向80元3GB（201604）"}
    //             ],
    //         "packageYearList":
    //             ["2015","2016","2017"],
    //         "packageNameList":
    //             [
    //                 "物联网（数据）月加餐包非定向4元30MB（201604）",
    //                 "物联网（数据）月加餐包非定向8元100MB（201604） ",
    //                 "物联网（数据）月加餐包非定向16元300MB（201604）",
    //                 "物联网（数据）月加餐包非定向24元500MB（201604）",
    //                 "物联网（数据）月加餐包非定向40元1GB（201604）",
    //                 "物联网（数据）月加餐包非定向80元3GB（201604）"
    //             ],
    //         "msg":0
    //     };
        $.ajax({
            url: loc+'/recharge/manager/listPackageStatisticYear.do',
            data:{},
            type:'GET',
            dataType:'JSON',
            success:function(msg){
                switch(String(msg.msg)){
                    case "0":
                        year_data.legend_data = msg.packageNameList;   //流量包名的数组
                        year_data.xAxis_data = msg.packageYearList;     //年的数组

                        var yearDataArrayforData = [];     //饼状图的data数组
                        var yearDataArrayforData2 = [];     //饼状图的data数组,显示inside的label
                        var year_trafficBagOrderNumberSubPieChartForSeries = {};   //series中饼状图的部分

                        var isMaxGreaterThree = false;
                        var max = 0;
                        var now_year = new Date().getFullYear();
                        var now_year_index = msg.packageYearList.indexOf(String(now_year));

                        for(var i=0; i<year_data.legend_data.length; i++){
                            var objjson = {
                                name: year_data.legend_data[i],
                                type:'bar',
                                data: msg.packageCountList[i].yearCountList,
                                tooltip:{
                                    formatter: '流量包名称: {a}<br />订购数量&nbsp;&nbsp;&nbsp;&nbsp;: {c}'
                                }
                            };
                            year_data.series_data.push(objjson);
                            if(!isMaxGreaterThree){
                                var x = parseInt(Math.max.apply(null, msg.packageCountList[i].yearCountList));
                                if(x>max){max = x};
                                if(x>3){isMaxGreaterThree = true;}
                            }

                            var objjson2 = {
                                name: msg.packageCountList[i].packageName,
                                value: msg.packageCountList[i].yearCountList[now_year_index],
                                label:{
                                    normal: {
                                        show: true,
                                        position: 'outside',
                                        formatter: function(params){return params.name.slice(0,10)+"...";},
                                        textStyle:{color:'#888888'}
                                    }
                                },
                                labelLine:{
                                    normal: {
                                        lineStyle: {color: '#888888'}
                                    }
                                }
                            };
                            if(objjson2.value == 0){
                                objjson2.label = {normal:{show:false},emphasis:{show: false}};
                                objjson2.labelLine = {normal: {show:false}};
                            }
                            else{
                                year_data.isPieAllZero = false;
                            }
                            yearDataArrayforData.push(objjson2);

                            var objjson3 = {
                                name: msg.packageCountList[i].packageName,
                                value: msg.packageCountList[i].yearCountList[now_year_index],
                                label:{
                                    normal: {
                                        show: true,
                                        position: 'inside',
                                        formatter: '{d}%',
                                        textStyle:{color:'#fff'}
                                    }
                                },
                                labelLine:{
                                    normal: {
                                        show: false
                                    }
                                }
                            };
                            if(objjson3.value == 0){
                                objjson3.label = {normal:{show:false}};
                            }
                            yearDataArrayforData2.push(objjson3);
                        }

                        year_trafficBagOrderNumberSubPieChartForSeries = {
                            type: 'pie',
                            center: ['80%', '45%'],
                            radius : [0,'40%'],
                            data: yearDataArrayforData,
                            tooltip: {
                                formatter: '流量包名称: {b}<br />订购数量: {c} ({d}%)'
                            },
                            stillShowZeroSum: false
                        };
                        var year_trafficBagOrderNumberSubPieChartForSeries2 = {
                            hoverAnimation: false,
                            type: 'pie',
                            center: ['80%', '45%'],
                            radius : [0,'40%'],
                            data: yearDataArrayforData2,
                            stillShowZeroSum: false,
                            tooltip: {
                                formatter: '流量包名称: {b}<br />订购数量: {c} ({d}%)'
                            },
                            label: {
                                normal: {
                                    show: true,
                                    position: 'inside',
                                    formatter: '{d}%'
                                }
                            }
                        };
                        year_data.series_data.push(year_trafficBagOrderNumberSubPieChartForSeries2);
                        year_data.series_data.push(year_trafficBagOrderNumberSubPieChartForSeries);

                        year_data.title_data = ['年度', year_data.xAxis_data[now_year_index]];
                        year_data.dataZoom_data = {end: 100};

                        if(!isMaxGreaterThree){
                            var rate = '';
                            switch(max){ 
                                case 0:
                                    rate = '400%';break;
                                case 1:
                                    rate = '300%';break;
                                case 2:
                                    rate = '100%';break;
                                case 3:
                                    rate = '40%';break;
                            }
                            year_data.yAxis_data={boundaryGap:[0,rate]};
                        }
                        else{
                            year_data.yAxis_data={boundaryGap:[0,0]};
                        }
                        putValueToBagChart(year_data,  "year");
                        //trafficBagOrderNumberChart.setOption(year_trafficBagOrderNumberChartOption);
                        break;
                    case "1": 
                        console.log("listPackageStatisticYear-数据不存在");
                        break;
                    case "10":default:
                        x0pAjaxError(msg);
                        console.log("ajax success()-"+msg+"-接口：listPackageStatisticYear.do-获取最近三年各类套餐包订购数");
                        break;
                }
            },  
            error:function(msg){
                x0pServerError(msg);
                console.log("ajax error()-"+msg+"-接口：listPackageStatisticYear.do-获取最近三年各类套餐包订购数");
            }
        });
    }

//显示该厂商的总用户数量
function ajax_getIotCardStatusStatistics(){
    zivenload.start(".wrap-container");
        $.ajax({
        url:loc+'/recharge/manager/getIotCardStatusStatistics.do',
        data:{},
        type:'GET',
        dataType:'JSON',
        success:function(msg){
            switch(String(msg.msg)){
                case "0":
                    $(".span_user_number").text(msg.cardCount);
                    loadValueToCardStatus(parseInt(msg.cardCount),msg.statisticsList, ".user-container");
                    break;
                case "1": 
                    console.log("getIotCardStatusStatistics-数据不存在");
                    break;
                case "10": default:
                    console.log(msg.code);

                    $(".span_user_number").text("-");
                    x0pAjaxError(msg);
                    break;
                }
            },
            error:function(msg){
                console.log("ajax error()-接口：getIotCardStatusStatistics.do-显示该厂商的总用户数量");

                $(".span_user_number").text("-");
                x0pServerError(msg);
            },
            complete: function(){
                zivenload.end();
            }
        });
    }

//获取当年所有月份流水统计数据
function ajax_getPayStatisticMonth(){
    var msg = {"may":0.03,"dec":0.0,"oct":0.0,"apr":0.03,"feb":0.0,"nov":0.0,"jul":0.0,"sep":0.0,"jun":0.124,"mar":0.0,"jan":0.0,"aug":0.0,"msg":0};
    // $.ajax({
    //     url:loc+'/recharge/manager/getPayStatisticMonth.do',    //获取当年所有月份流水统计数据
    //     data:{},
    //     type:'GET',
    //     dataType:'JSON',
    //     success:function(msg){
            switch(String(msg.msg)){
                case "0":
                    incomeValue.monthData.push(msg.jan, msg.feb, msg.mar, msg.apr, msg.may, msg.jun, msg.jul, msg.aug, msg.sep, msg.oct, msg.nov, msg.dec);
                    incomeValue.monthData.splice(now_month, incomeValue.monthData.length-now_month);
                    incomeValue.month.splice(now_month, incomeValue.month.length-now_month);
                    putValueToIncomeChart(incomeValue, incomeChart, "month");
                    break;
                case "1": 
                    console.log("getPayStatisticMonth-数据不存在");
                    break;
                case "10":default:
                    x0pAjaxError(msg);
                    console.log("ajax success()-"+msg+"-接口：获取当年所有月份流水统计数据-getPayStatisticMonth.do");
                    break;
            }
    //     },
    //     error:function(msg){
    //         x0pServerError(msg);
    //         console.log("ajax error()-"+msg+"-接口：获取当年所有月份流水统计数据-getPayStatisticMonth.do");
    //     }
    // });
}

//获取当年所有季度流水统计数据
function ajax_getPayStatisticQuarter(){
    $.ajax({
        url:loc+"/recharge/manager/getPayStatisticQuarter.do",  
        data:{},
        type:'GET',
        dataType:'JSON',
        success: function(msg){
            switch(String(msg.msg)){
                case "0":
                    incomeValue.quarterData.push(msg.one, msg.two, msg.three, msg.four);
                    incomeValue.quarterData.splice(now_quarter, incomeValue.quarterData.length-now_quarter );
                    incomeValue.quarter.splice(now_quarter, incomeValue.quarter.length-now_quarter);
                    putValueToIncomeChart(incomeValue, incomeChart, "quarter");
                    break;
                case "1": 
                    console.log("getPayStatisticQuarter-数据不存在");
                    break;
                case "10":default:
                    x0pAjaxError(msg);
                    console.log("ajax success()-"+msg+"-接口：getPayStatisticQuarter.do-获取当年所有季度流水统计数据");
                    break;
            }
        },
        error:function(msg){
            x0pServerError(msg);
            console.log("ajax error()-"+msg+"-接口：getPayStatisticQuarter.do-获取当年所有季度流水统计数据");
        }
    });

}
//获取最近三年流水统计数据
function ajax_listPayStatisticYear(){
    var msg = {"yearSort":["2015","2016","2017"],"msg":0,"yearIncomeList":[{"income":0.184,"year":"2017"},{"income":0,"year":"2015"},{"income":0,"year":"2016"}]};
    // $.ajax({
    //     url:loc+'/recharge/manager/listPayStatisticYear.do',
    //     data:{},
    //     type:'GET',
    //     dataType:'JSON',
    //     success:function(msg){
            switch(String(msg.msg)){
            case "0":
                for(var i=0;i<msg.yearSort.length;i++){
                    for(var j=0;j<msg.yearIncomeList.length;j++){
                        if(msg.yearIncomeList[j].year == msg.yearSort[i]){
                            incomeValue.year.push(msg.yearIncomeList[j].year+"年");
                            incomeValue.yearData.push(msg.yearIncomeList[j].income);
                        }
                    }
                }
                putValueToIncomeChart(incomeValue, incomeChart, "year");
                break;
            case "1": 
                console.log("listPayStatisticYear-数据不存在");
                break;
            case "10":default:
                x0pAjaxError(msg);
                console.log("ajax success()-"+msg+"-接口：listPayStatisticYear.do-获取最近三年流水统计数据");
                break;
            }
    //     },
    //     error:function(msg){
    //         x0pServerError(msg);
    //         console.log("ajax error()-"+msg+"-接口：listPayStatisticYear.do-获取最近三年流水统计数据");
    //     },
    //     complete: function(){
    //         //zivenload.end();
    //     }
    // });
}