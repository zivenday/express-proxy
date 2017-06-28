var loc;
if(!!sessionStorage.getItem("loc")){
    loc = sessionStorage.getItem("loc");
}
else{
    //没有存到session的话，默认使用服务器ip
    loc = "http://10.16.29.101:8080";
}
//输入面板
var inputDomArray = [
                        "#check-btn1-group",
                        "#check-btn2-group"
                    ];
var datePickerDomArray = ["#select-date2","#select-date1"];
var tableDomArray = [ 
                        ["#table-totalResult", "#table-detailResult"],
                        ["#table-s-totalResult, #table-s-totalResult-tip", "#table-detailResult"]
                    ];
var ajaxAPIArray = [
                        ["/recharge/manager/listRechargeStatementByManager.do", "/recharge/manager/listRechargeStatementDetail.do"],
                        ["/recharge/manager/listRechargeStatement.do", "/recharge/manager/listRechargeStatementDetail.do"]
                    ];
                    //month、mid二选一，page，num             month，page,num
                    //month可空,page,num                     month，page，num
var tdListOrder_type1 = [["manufacturerDO","id"], ["manufacturerDO","name"], ["contractNumber"],["time"],["grossPrice"],["payWay"],["payWayCost"],["packagePrice"],["grossProfit"],["customerRatio"],["platformProfit"],["customerProfit"],["cardNum"],["managerRatio"],["managerPrice"],["platformIncome"],["customerIncome"]];
var tdListOrder_type2 = [["orderId"], ["ptId"], ["ptName"], ["ptPrice"], ["discount"], ["realPrice"], ["orderPrice"],["grossProfit"]];
var tdListOrder_type3 = [["time"], ["contractNumber"], ["grossPrice"], ["customerRatio"],["packagePrice"], ["managerPrice"], ["customerProfit"]];
var tdListOrderArray = [
                            [ tdListOrder_type1, tdListOrder_type2],
                            [ tdListOrder_type3, tdListOrder_type2]
                        ];

var firstInit = true;   //是否第一次加载，“管理员-厂商结算”一进页面时用
var page_capacity = 10;
//-------------------------------提交参数
//选择参数
var submitData = {
    month: "",
    mid: 0,
    page: 0,
    num: page_capacity,
};
//-------------------------------样式
//厂商选择相关
var inputPanelData = {
    inputDomString: "",
    selectDomString: "#select_manufacturer",
    dateSelectDomString: ''
};
//table显示相关
var tableShowData = {
    showTableDomString: "",
    count: 0
};
//分页相关
var pagerShowData = {
    pager_domString: '.pager2',

};
//------------------------------其他参数
var needDateData = {
    now_month: 0,
    now_quarter: 0,
    now_year: 0,
    now_month_string: "",
    now_quarter_string: "",
    now_year_string: "" 
}
//-------------------------------账户相关
var rounterChooseData = {
    accountType: parseInt(sessionStorage.getItem("type")),  //1-管理员； 2-厂商
    tablecheckType: 0,
    ajaxAPI: ""
}


$(document).ready(function(){

    //显示“>。。。”路径title
    var title = sessionStorage.getItem("leftSiderTitle");
    if(!!title){
        $("h2.tittle-content-header").append(title);
        if(title == "月度账单"){
                rounterChooseData.tablecheckType = 1;
            }
            else if(title == "月度详单"){
                rounterChooseData.tablecheckType = 2;
            }
    }

    //初始化当前时间
    var now = new Date();
    needDateData.now_month = parseInt(now.getMonth()) + 1;
    needDateData.now_quarter = Math.ceil((parseInt(now.getMonth()) + 1)/3);
    needDateData.now_year = now.getFullYear();
    needDateData.now_month_string = needDateData.now_month<10 ? '0'+needDateData.now_month : needDateData.now_month+"";
    needDateData.now_quarter_string = "第"+needDateData.now_quarter+"季度";
    needDateData.now_year_string = needDateData.now_year +"年";

    //初始化账户类型
    if(!!rounterChooseData.accountType){
        //已登陆
        initInput(rounterChooseData.accountType);
    }
    else{
        x0p('您还未登录','即将跳转至登录页面','error',function(data){
            if(data == 'error'){
                parent.window.location.href = "login.html";
            }
        });
    }

    //点击“查询”(厂商)
    $("#check-btn").click(function(){
        var checkMonth = "";
        if(!$(inputPanelData.dateSelectDomString).val() && rounterChooseData.tablecheckType == 2){
            x0pERROR('query', '未选择月份');
        }
        else{
            if(!!$(inputPanelData.dateSelectDomString).val()){
                checkMonth = $(inputPanelData.dateSelectDomString).val().substr(0,4)+$(inputPanelData.dateSelectDomString).val().substr(5,2);
                submitData.month = checkMonth;
            }
            else{
                submitData.month = "";
            }
            submitData.mid = 0;
            submitData.page = 1;
            rounterChooseData.ajaxAPI = ajaxAPIArray[rounterChooseData.accountType - 1][rounterChooseData.tablecheckType - 1];
            tableShowData.showTableDomString = tableDomArray[rounterChooseData.accountType - 1][rounterChooseData.tablecheckType - 1];

            askForData();
        }
    });

    //点击“查询账单”(管理员)-月份、厂商二选一, 不用授权
    $("#check-btn2-1").click(function(){
        rounterChooseData.tablecheckType = 1;

        var checkMonth = "";
        var checkMid = 0;
        if(!$(inputPanelData.dateSelectDomString).val() && !parseInt($(inputPanelData.selectDomString).val()) ){
            x0pERROR('query',"请选择某一月份或某一厂商");
        }
        else{
            if(!!$(inputPanelData.dateSelectDomString).val()){
                checkMonth = $(inputPanelData.dateSelectDomString).val().substr(0,4)+$(inputPanelData.dateSelectDomString).val().substr(5,2);
            }
            if( !!parseInt( $(inputPanelData.selectDomString).val()) ){
                checkMid = parseInt( $(inputPanelData.selectDomString).val());
            }
        }

        if(!!checkMonth || !!checkMid){
            rounterChooseData.ajaxAPI = ajaxAPIArray[rounterChooseData.accountType - 1][rounterChooseData.tablecheckType - 1];
            tableShowData.showTableDomString = tableDomArray[rounterChooseData.accountType - 1][rounterChooseData.tablecheckType - 1];
            submitData.page = 1;
            if(!!checkMonth){submitData.month = checkMonth;};
            if(!!checkMid){submitData.mid = checkMid;}
            askForData();
        }
    });

    //点击“查询详单”(管理员)-月份、厂商都必选，要授权
    $("#check-btn2-2").click(function(){
        rounterChooseData.tablecheckType = 2;

        var checkMonth = "";
        var checkMid = 0;
        if(!$(inputPanelData.dateSelectDomString).val() || !parseInt($(inputPanelData.selectDomString).val()) ){
            x0pERROR('query',"请选择某一月份及某一厂商");
        }
        else{
            checkMonth = $(inputPanelData.dateSelectDomString).val().substr(0,4)+$(inputPanelData.dateSelectDomString).val().substr(5,2);
            checkMid = parseInt( $(inputPanelData.selectDomString).val() );
        }

        if(!!checkMonth && !!checkMid){

            rounterChooseData.ajaxAPI = ajaxAPIArray[rounterChooseData.accountType - 1][rounterChooseData.tablecheckType - 1];
            tableShowData.showTableDomString = tableDomArray[rounterChooseData.accountType - 1][rounterChooseData.tablecheckType - 1];
            submitData.page = 1;
            submitData.month = checkMonth;
            submitData.mid = checkMid;
            //需要授权
            askForData();    //授权->查询
        }
    });

});

//function -- 初始化input面板
function initInput(accountType){

    inputPanelData.inputDomString = inputDomArray[accountType - 1];
    inputPanelData.dateSelectDomString = datePickerDomArray[accountType - 1];

    $(inputPanelData.inputDomString).css('display', 'block');
    $(inputPanelData.dateSelectDomString).val(needDateData.now_year + '/' + needDateData.now_month_string);    //初始化时间选择弃

    switch(String(accountType)){
        case "1":                       //角色：管理员
            //初始化“选择厂商”的select框
            if(!!window.sessionStorage.getItem("manufacturerList_JSONString")){
                //已经有厂商列表的sessionStoragechaxu
                initManufacturerListSelect( JSON.parse(window.sessionStorage.getItem("manufacturerList_JSONString")) );
            }
            else{
                listManufacturerGeneral();
            }
            break;
        case "2":                      //角色：厂商
            var checkMonth = $(inputPanelData.dateSelectDomString).val().substr(0,4)+$(inputPanelData.dateSelectDomString).val().substr(5,2);
            submitData.month = checkMonth;
            submitData.mid = 0;
            submitData.page = 1;
            rounterChooseData.ajaxAPI = ajaxAPIArray[rounterChooseData.accountType - 1][rounterChooseData.tablecheckType - 1];
            tableShowData.showTableDomString = tableDomArray[rounterChooseData.accountType - 1][rounterChooseData.tablecheckType - 1];

            askForData();
            break;
    }

}
//ajax——获取厂商列表
function listManufacturerGeneral() {
    // var msg = {"mList":[
    //                         {"mname":"世纪龙信息网络有限责任公司","mid":1},
    //                         {"mname":"21cn","mid":2}
    //                     ],
    //             "msg":0};
        $.ajax({
            url: loc+"/recharge/manager/listManufacturerGeneral.do",
            data: {},
            type: 'GET',
            dataType:'JSON',
            success: function(msg){
                $(".input-error").html("&nbsp;");
                switch(String(msg.msg)){
                    case "0":
                        window.sessionStorage.setItem("manufacturerList_JSONString", JSON.stringify(msg.mList));
                        initManufacturerListSelect(msg.mList);
                        break;
                    case "1": 
                        //厂商列表无数据
                        break;
                    case "10": default:
                        x0p('查询出错','登录超时或未登录', 'error', function(data){
                            if(data == 'error'){
                                parent.window.location.href = "login.html";
                            }
                        });
                    break;
                }
            },
            error: function(msg){
                x0pServerError(msg);
            }
        });
}

//----------------------选取厂商button----------------
function initManufacturerListSelect(dataList){

    $(inputPanelData.selectDomString).html("");

    $.each(dataList, function(index, item){
        $(inputPanelData.selectDomString).append("<option value='"+ item.mid +"'>"+ item.mname +"</option>");
    });
    $(inputPanelData.selectDomString+">option:first-child").attr("selected","selected");

    rounterChooseData.tablecheckType = 1;

    if(firstInit && rounterChooseData.accountType == 1 && rounterChooseData.tablecheckType == 1 ){
        //第一次加载 厂商列表 完毕
        
        tableShowData.showTableDomString = tableDomArray[rounterChooseData.accountType - 1][rounterChooseData.tablecheckType - 1];
        rounterChooseData.ajaxAPI = ajaxAPIArray[rounterChooseData.accountType - 1][rounterChooseData.tablecheckType - 1];

        var checkMonth = $(inputPanelData.dateSelectDomString).val().substr(0,4)+$(inputPanelData.dateSelectDomString).val().substr(5,2);

        submitData.month = checkMonth;     //"格式：201706"
        submitData.mid = parseInt($(inputPanelData.selectDomString).val());
        submitData.page = 1;

        askForData();
    }
}

function askForData(){
    if( rounterChooseData.accountType==1 && rounterChooseData.tablecheckType == 2 ){
        //要授权
        giveManufacturerAuthority();
    }
    else{
        getChuangShangList();
    }
}
//ajax——授权
function giveManufacturerAuthority(){
    $.ajax({
                    url:loc+'/recharge/manager/giveManufacturerAuthority.do',   //授予管理员某厂商权限
                    data:{mid: submitData.mid},
                    type:'POST',
                    dataType:'JSON',
                    success:function(msg){
                        switch(String(msg.msg)){
                            case "0":
                                授权成功
                                getChuangShangList();
                                break;
                            case "1": 
                                //厂商选择出错
                                x0pAjaxError(msg);
                                break;
                            case "2": 
                                console.log("ajax success()-"+msg.code+"-接口：giveManufacturerAuthority.do-授予厂商权限");
                                x0pAjaxError(msg);
                                break;
                            case "10":
                                    x0p('查询出错','登录超时或未登录', 'error', function(data){
                                        if(data == 'error'){
                                            parent.window.location.href = "login.html";
                                        }
                                    });
                                break;
                            default:
                                console.log("ajax success()-未知因素-接口：giveManufacturerAuthority.do-授予厂商权限");
                                //$(".input-error").html("查询出错");
                                break;
                        }
                    },
                    error:function(msg){
                        console.log("ajax error()-"+msg+"-接口：giveManufacturerAuthority.do-授予厂商权限");
                        //$(".input-error").html("查询出错，请检查网络连接");
                    }
                })
};
//ajax--查询
function getChuangShangList() {
    // var msgArray = [
    //     [{"statementsList":[{"platformIncome":2.097,"grossProfit":0.2,"packagePrice":0.36,"customerProfit":0.1,"managerRatio":1,"customerIncome":0.46,"managerPrice":2,"grossPrice":0.56,"payWayCost":0.003,"time":"201706","customerRatio":0.5,"manufacturerDO":{"id":1,"name":"世纪龙信息网络有限责任公司","discount":0},"payWay":"微信","contractNumber":"1234567890","platformProfit":0.097,"cardNum":2},{"platformIncome":0.03,"grossProfit":0.05,"packagePrice":0.2,"customerProfit":0.02,"managerRatio":0,"customerIncome":0.22,"managerPrice":0,"grossPrice":0.25,"payWayCost":0,"time":"201706","customerRatio":0.6,"manufacturerDO":{"id":1,"name":"世纪龙信息网络有限责任公司","discount":0},"payWay":"微信","contractNumber":"1234567890123","platformProfit":0.03,"cardNum":0}],"count":2,"msg":0},
    //     {"statementDetailList":[{"ptName":"物联网（数据）月加餐包非定向4元30MB（201604）","grossProfit":0.01,"orderPrice":0.05,"ptId":2007,"realPrice":0.04,"ptPrice":4.0,"orderId":"20170622175912054115","discount":0.01},{"ptName":"物联网（数据）月加餐包非定向4元30MB（201604）","grossProfit":0.01,"orderPrice":0.05,"ptId":2007,"realPrice":0.04,"ptPrice":4.0,"orderId":"20170622172923939075","discount":0.01},{"ptName":"物联网（数据）月加餐包非定向4元30MB（201604）","grossProfit":0.01,"orderPrice":0.05,"ptId":2007,"realPrice":0.04,"ptPrice":4.0,"orderId":"20170622172337599062","discount":0.01},{"ptName":"物联网（数据）月加餐包非定向4元30MB（201604）","grossProfit":0.01,"orderPrice":0.05,"ptId":2007,"realPrice":0.04,"ptPrice":4.0,"orderId":"20170622171943931065","discount":0.01},{"ptName":"物联网（数据）月加餐包非定向4元30MB（201604）","grossProfit":0.01,"orderPrice":0.05,"ptId":2007,"realPrice":0.04,"ptPrice":4.0,"orderId":"20170621185272177441","discount":0.01},{"ptName":"物联网（数据）月加餐包非定向8元100MB（201604） ","grossProfit":0.02,"orderPrice":0.1,"ptId":2008,"realPrice":0.08,"ptPrice":8.0,"orderId":"20170616110804745139","discount":0.01},{"ptName":"物联网（数据）月加餐包非定向4元30MB（201604）","grossProfit":0.01,"orderPrice":0.05,"ptId":2007,"realPrice":0.04,"ptPrice":4.0,"orderId":"20170614090173130644","discount":0.01},{"ptName":"物联网（数据）月加餐包非定向4元30MB（201604）","grossProfit":0.01,"orderPrice":0.05,"ptId":2007,"realPrice":0.04,"ptPrice":4.0,"orderId":"20170614084911401664","discount":0.01},{"ptName":"物联网（数据）月加餐包非定向4元30MB（201604）","grossProfit":0.01,"orderPrice":0.05,"ptId":2007,"realPrice":0.04,"ptPrice":4.0,"orderId":"20170613191352320041","discount":0.01},{"ptName":"物联网（数据）月加餐包非定向4元30MB（201604）","grossProfit":0.01,"orderPrice":0.05,"ptId":2007,"realPrice":0.04,"ptPrice":4.0,"orderId":"20170527153215686989","discount":0.01}],"count":13,"msg":0}],
    //             [{"statementsList":[{"time":"201706","packagePrice":0.36,"customerProfit":0.1,"customerRatio":0.5,"managerPrice":2.0,"grossPrice":0.56,"contractNumber":"1234567890"},{"time":"201706","packagePrice":0.2,"customerProfit":0.02,"customerRatio":0.6,"managerPrice":0.0,"grossPrice":0.25,"contractNumber":"1234567890123"}],"count":2,"msg":0},
    //             {"statementDetailList":[{"ptName":"物联网（数据）月加餐包非定向4元30MB（201604）","grossProfit":0.01,"orderPrice":0.05,"ptId":2007,"realPrice":0.04,"ptPrice":4.0,"orderId":"20170622175912054115","discount":0.01},{"ptName":"物联网（数据）月加餐包非定向4元30MB（201604）","grossProfit":0.01,"orderPrice":0.05,"ptId":2007,"realPrice":0.04,"ptPrice":4.0,"orderId":"20170622172923939075","discount":0.01},{"ptName":"物联网（数据）月加餐包非定向4元30MB（201604）","grossProfit":0.01,"orderPrice":0.05,"ptId":2007,"realPrice":0.04,"ptPrice":4.0,"orderId":"20170622172337599062","discount":0.01},{"ptName":"物联网（数据）月加餐包非定向4元30MB（201604）","grossProfit":0.01,"orderPrice":0.05,"ptId":2007,"realPrice":0.04,"ptPrice":4.0,"orderId":"20170622171943931065","discount":0.01},{"ptName":"物联网（数据）月加餐包非定向4元30MB（201604）","grossProfit":0.01,"orderPrice":0.05,"ptId":2007,"realPrice":0.04,"ptPrice":4.0,"orderId":"20170621185272177441","discount":0.01},{"ptName":"物联网（数据）月加餐包非定向8元100MB（201604） ","grossProfit":0.02,"orderPrice":0.1,"ptId":2008,"realPrice":0.08,"ptPrice":8.0,"orderId":"20170616110804745139","discount":0.01},{"ptName":"物联网（数据）月加餐包非定向4元30MB（201604）","grossProfit":0.01,"orderPrice":0.05,"ptId":2007,"realPrice":0.04,"ptPrice":4.0,"orderId":"20170614090173130644","discount":0.01},{"ptName":"物联网（数据）月加餐包非定向4元30MB（201604）","grossProfit":0.01,"orderPrice":0.05,"ptId":2007,"realPrice":0.04,"ptPrice":4.0,"orderId":"20170614084911401664","discount":0.01},{"ptName":"物联网（数据）月加餐包非定向4元30MB（201604）","grossProfit":0.01,"orderPrice":0.05,"ptId":2007,"realPrice":0.04,"ptPrice":4.0,"orderId":"20170613191352320041","discount":0.01},{"ptName":"物联网（数据）月加餐包非定向4元30MB（201604）","grossProfit":0.01,"orderPrice":0.05,"ptId":2007,"realPrice":0.04,"ptPrice":4.0,"orderId":"20170527153215686989","discount":0.01}],"count":13,"msg":0}]
    // ];
    // var msg = msgArray[rounterChooseData.accountType - 1][rounterChooseData.tablecheckType - 1];

    //month、mid二选一，page，num             month，page,num
    //month可空,page,num                     month，page，num
        var ajaxData = {page:submitData.page, num: submitData.num};
        if(!!submitData.month){ajaxData["month"] = submitData.month};
        if(!!submitData.mid && rounterChooseData.accountType==1 && rounterChooseData.tablecheckType == 1){ajaxData["mid"] = submitData.mid};

        if(firstInit && rounterChooseData.accountType == 1 && rounterChooseData.tablecheckType == 1){firstInit = false;}
        $.ajax({
            url: loc+rounterChooseData.ajaxAPI,
            data: ajaxData,
            type:'GET',
            dataType:'JSON',
            success: function(msg){
                 switch(String(msg.msg)){
                    case "0":
                        var dataList;
                        if(rounterChooseData.tablecheckType == 1){
                            dataList = msg.statementsList;
                        }
                        else if(rounterChooseData.tablecheckType == 2){
                            dataList = msg.statementDetailList;
                            console.log(msg);
                        }
                        if( submitData.page == 1 && !!msg.count){tableShowData.count = msg.count;}
                        writeToTable( dataList);
                        break;
                    case "1": 
                        writeToTable([]);
                    break;
                    case "10": 
                        x0p('查询出错','登录超时或未登录', 'error', function(data){
                            if(data == 'error'){
                                parent.window.location.href = "login.html";
                            }
                        });
                        break;
                    case "2":default:
                        x0pAjaxError(msg);
                    break;
                }
            },
            error: function(msg){
                x0pServerError(msg);
            }
        });
    }
//操作dom
function writeToTable(dataList){
        //显示对应的table
        for(var i=0;i<tableDomArray.length;i++){
            for(var j=0; j<tableDomArray[i].length;j++){
                $(tableDomArray[i][j]).css("display","none");
            }
        }
        $(tableShowData.showTableDomString).css("display","table");
        $(tableShowData.showTableDomString).find("tbody").html("");
        
        tableShowData.thList = tdListOrderArray[rounterChooseData.accountType - 1][rounterChooseData.tablecheckType - 1];
        if(!dataList.length || tableShowData.count == 0){
            $(tableShowData.showTableDomString).find("tbody").html("<tr><td class='td-no-border' colspan='"+ tableShowData.thList.length +"'>暂无数据</<td></tr>");
        }
        else{
            for(var k=0; k<dataList.length;k++){
                var htmlstr = "<tr><td>";
                var obj = dataList[k];
                for(var i=0; i<tableShowData.thList.length;i++){
                    for(var j=0; j<tableShowData.thList[i].length; j++){

                        obj = obj[tableShowData.thList[i][j]];

                        if(j == tableShowData.thList[i].length-1){
                            if( rounterChooseData.accountType == 2 && rounterChooseData.tablecheckType == 1){
                                if( tableShowData.thList[i][j] == "customerRatio"){   //数据特殊处理：厂商月度账单“分成比例”
                                    obj = (1 - obj) *100;
                                }
                            }
                            htmlstr += obj+"</td>";
                            
                            if(i != tableShowData.thList.length-1){
                                htmlstr += "<td>";
                            }
                            obj = dataList[k];
                        }
                    }
                }
                htmlstr += "</tr>";
                $(tableShowData.showTableDomString).find("tbody").append(htmlstr);
            }

            //分页
            //count
            $(pagerShowData.pager_domString).html("");

            var pager_capacity2 = dataList.length <= submitData.num? dataList.length : submitData.num;
            if(!pagerShowData.total_page){ pagerShowData.total_page = Math.ceil(tableShowData.count / submitData.num)};

            var pager_html = '';
            for(var i=0; i<pagerShowData.total_page; i++){
               var addClass= "";
                if(submitData.page == i+1){addClass= " class='selected'";}
                pager_html = pager_html + "<li"+ addClass +"><span>"+ (i+1) +"</span></li>";
            }
            $(pagerShowData.pager_domString).html(pager_html);
            $(pagerShowData.pager_domString+">li").click(function(){
                submitData.page = parseInt($(this).find('span').text());
                askForData();
            });

        }
}