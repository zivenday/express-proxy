var loc;
if(!!sessionStorage.getItem("loc")){
    loc = sessionStorage.getItem("loc");
}
else{
    //没有存到session的话，默认使用服务器ip
	loc = "http://10.16.29.101:8080";
}
//input框的id: $("#inputIccidForCheckAlarmInfo")
//“查询”button的id: $("#btn-checkAlarmInfoByIccid")
//"查询所有"button的id: $("#btn-checkAllAlarmInfo")
//"出错"提示span: $(".input-error")
//显示查询结果table的id: $("#table-trafficInfoCheckResult")

$(document).ready(function(){


	$("#inputIccidForCheckAlarmInfo").bind('input propertychange',function(){
		if( !$(this).val() ){
			//未填入iccid，输出“输入为空”的提示
			$(".input-error").html("请输入ICCID号");
		}
		else{
			$(".input-error").html("&nbsp;");
		}
	});

	//点击"查询"按钮
	$("#btn-checkAlarmInfoByIccid").click(function(){

		$(".input-error").html("&nbsp;");	//清空错误信息
		$("#table-trafficInfoCheckResult>tbody").html("");

		var data = {};
		var iccidVal = $("#inputIccidForCheckAlarmInfo").val().trim();

		if(!iccidVal){
			$(".input-error").html("请输入ICCID号");
		}
		else{
			data["iccid"] = iccidVal;
			data["num"] = 10;
			data["page"] = 1;
		
			$.ajax({
				url:loc+'/recharge/manager/listWarningInfoByIccid.do',
				type:'GET',
				data:data,
				dataType:'JSON',
				success:function(msg){
					switch(String(msg.msg)){
						case "0":
							if(!!msg.count){
								if(!msg.warningList){
									$(".input-error").html("数据返回出错，请重试");
								}
								else{
									$.each(msg.warningList, function(index, item){
										$("#table-trafficInfoCheckResult>tbody").append("<tr><td>"+ item.number +"</td><td>"+ item.iccid +"</td><td>"+ item.type +"</td><td>"+ item.time +"</td><td>"+ item.content +"</td></tr>");
									});
								}
							}
							else{
								$("#table-trafficInfoCheckResult>tbody").append("<tr><td colspan='5' id='td-no-info'>查询完毕，无相关信息</td></tr>");
							}
							$("#table-trafficInfoCheckResult").footable();
							break;
						case "1":
							$(".input-error").html("查询出错，请稍后重设("+msg.code+")");
							break;
						case "2":
							$(".input-error").html("查询出错，请稍后重设("+msg.code+")");
							break;
						case "10":
							$(".input-error").html("未登录或登录超时，请重新登录");
							break;
						default:
							$(".input-error").html("查询失败，未知错误");
							break;
					}
				},
				error:function(msg){
					$(".input-error").html("查询失败，请检查一下网络连接情况");
				}
			});
		}
	});

	//---------------- 厂商列表btn --------------------
	var select_manufacturer_button = $("#btn-select-manufacturer");
	var select_manufacturer_div = $("#div-select-manufacturer");

	//----------------------选取厂商button----------------
	function addManufacturerListBtn(manufacturerListJSON, dropdown_btn, dropdown_parent_div){
		var arrow_html = "<span class='caret'></span>";
		if( manufacturerListJSON.length == 0){
			
			dropdown_btn.html("无可选厂商" + arrow_html);
		}
		else{
			dropdown_parent_div.find("ul.dropdown-menu").remove();
			var dropdown_html = "<ul class='dropdown-menu'>";
			for(var i=0; i<manufacturerListJSON.length; i++){
				dropdown_html = dropdown_html + "<li data-mid='"+ manufacturerListJSON[i].mid +"'><a href='#'>" + manufacturerListJSON[i].mname +"</a></li>";
			}
			dropdown_html = dropdown_html + "</ul>";
			dropdown_parent_div.append(dropdown_html);
		}
		dropdown_btn.dropdown();
		dropdown_parent_div.find('.dropdown-menu li').on('click', function () {
  			dropdown_btn.html($(this).text()+arrow_html);
  			dropdown_btn.attr("data-mid",$(this).attr("data-mid"));
		});
	}

	//判断sessionStorage中是否已经有厂商列表
	if(!!window.sessionStorage.getItem("manufacturerList_JSONString")){
		//已经有厂商列表的sessionStorage
		addManufacturerListBtn(JSON.parse(window.sessionStorage.getItem("manufacturerList_JSONString")), select_manufacturer_button, select_manufacturer_div);
	}
	else{
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

						addManufacturerListBtn(msg.mList, select_manufacturer_button, select_manufacturer_div);
						break;
					case "1": case "10": default:
						$(".input-error").html("获取厂商列表失败，出错原因："+msg.code);
						break;
				}
			},
			error: function(msg){
				$(".input-error").html("获取厂商列表失败");
			}
		});
	}

	//点击“查询该厂商号卡”按钮
	$("#btn-checkAllAlarmInfo").click(function(){

		$(".input-error").html("&nbsp;");	//清空错误信息
		$("#table-trafficInfoCheckResult>tbody").html("");
		$("#inputIccidForCheckAlarmInfo").val("");

		if(!parseInt(select_manufacturer_button.attr("data-mid"))){
			//未选择厂商
			$(".input-error").html("没有选择要查询的厂商");
		}
		else{
			$.ajax({
				url: loc+"/recharge/manager/giveManufacturerAuthority.do",
				data: {mid: parseInt(select_manufacturer_button.attr('data-mid')) },
				type: 'POST',
				dataType: "JSON",
				success: function(msg){
					switch(String(msg.msg)){
						case "0":

							//得到授权之后------查询该厂商下的预警消息
							$.ajax({
								url:loc+'/recharge/manager/listWarningInfoByMid.do',
								type:'GET',
								data:{page:'1',num:'10'},
								dataType:'JSON',
								success:function(msg){
									switch(String(msg.msg)){
									case "0":
										if(!!msg.count){
											if(!msg.warningList){
												$(".input-error").html("数据返回出错，请重试");
											}
											else{
												$.each(msg.warningList, function(index, item){
													$("#table-trafficInfoCheckResult>tbody").append("<tr><td>"+ item.number +"</td><td>"+ item.iccid +"</td><td>"+ item.type +"</td><td>"+ item.time +"</td><td>"+ item.content +"</td></tr>");
												});
											}
										}
										else if(msg.count === 0){
											$("#table-trafficInfoCheckResult>tbody").append("<tr><td colspan='5' id='td-no-info'>查询完毕，无相关信息</td></tr>");
										}
										// $("#table-trafficInfoCheckResult").footable();
										break;
									case "1": 
										$(".input-error").html("查询出错，请稍后重设("+msg.code+")");
										break;
									case "2": 
										$(".input-error").html("查询出错，请稍后重设("+msg.code+")");
										break;
									case "10":
										$(".input-error").html("未登录或登录超时，请重新登录");
										break;
									default:
										$(".input-error").html("查询失败，未知错误");
										break;
									}
								},
								error:function(msg){
									$(".input-error").html("查询失败，请检查一下网络连接情况");
								}
							});

							break;
						case "1": case "10": case "2": default:
							$(".input-error").html("查询失败，出错原因："+msg.code);
							break;
					}
				},
				error: function(msg){
					$(".input-error").html("查询失败，请检查一下网络连接情况");
				}
			});
		}
	});
	
});