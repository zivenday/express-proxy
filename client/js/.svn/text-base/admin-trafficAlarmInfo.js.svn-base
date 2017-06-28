var loc;
if(!!sessionStorage.getItem("loc")){
    loc = sessionStorage.getItem("loc");
}
else{
    //没有存到session的话，默认使用服务器ip
    loc = "http://10.16.29.101:8080";
}
console.log(loc);

$(document).ready(function(){
	$("#inputSingleICCID").bind('input propertychange', function(){
		if( !$(this).val() ){
			$(".input-error").html("请输入ICCID号");
			if(!$("#checkAlarmThresholdInfo").hasClass("disabled")){
				$("#checkAlarmThresholdInfo").addClass("disabled");
				$("#checkAlarmThresholdInfo").attr("disabled","disabled");
			}
		}
		else{
			$(".input-error").html("&nbsp;");
			if($("#checkAlarmThresholdInfo").hasClass("disabled")){
				$("#checkAlarmThresholdInfo").removeClass("disabled");
				$("#checkAlarmThresholdInfo").removeAttr("disabled");
			}
		}
	});

	//点击"查询"按钮
	$("#checkAlarmThresholdInfo").click(function(){
		$(".input-error").html("&nbsp;");	//清空错误信息

		var iccidVal = $("#inputSingleICCID").val().trim();
		var data = {};
		if(!iccidVal){
			//未输入iccid值
			$(".input-error").html("请输入ICCID号");
		}
		else{
			$("#table-trafficThresholdCheckResult>tbody").html("");	//清空上次查询结果

			data["iccid"] = iccidVal;
			zivenload.start(".wrap-container");
			$.ajax({
				url:loc+'/recharge/manager/getTrafficAlarmInfoByIccid.do',
				type:'GET',
				data:data,
				dataType:'JSON',
				success:function(msg){
					switch( String(msg.msg) ){
						case "0":
							//查询成功
							$("#table-trafficThresholdCheckResult>tbody").append("<tr><td>"+ msg.number +"</td><td>"+ data.iccid +"</td><td>"+ (parseInt(msg.CUMULATION_TOTAL)/1024).toFixed(2) +"</td><td>"+ (parseInt(msg.CUMULATION_ALREADY)/1024).toFixed(2) +"</td><td>"+ (parseInt(msg.CUMULATION_LEFT)/1024).toFixed(2) +"</td><td></td></tr>");
							var isSetValue;
							if(msg.isTrafficAlarm){	//设置了
								switch(msg.trafficAlarmValue.match(/[0-9]+/g).join()){
									case "40":
										isSetValue = "40%";
										break;
									case "80":
										isSetValue = "80%";
										break;
									case "100":
										isSetValue = "100%";
										break;
									case "40,80,100":
										isSetValue = "40%，80%，100%";
										break;
								}
							}
							else{//未设置
								isSetValue = "-";
							}
							var selectDom = $('#table-trafficThresholdCheckResult>tbody>tr:last-child>td:last-child');
							var htmlstr = "<div class='btn-group'><button data-toggle='dropdown' class='btn btn-primary dropdown-toggle' type='button'>"
										+isSetValue
										+"<span class='caret'></span></button>"
										+"<ul role=‘menu’ class='dropdown-menu'><li><a>40%</a></li><li><a>80%</a></li><li><a>100%</a></li><li><a>40%，80%，100%</a></li></ul></div>";
							selectDom.html(htmlstr);
							selectDom.find("a").click(function(){
								var wantSetValue = $.trim($(this).text()).match(/[0-9]+/g).join();
								$.ajax({
	                				url:loc+'/recharge/manager/setTrafficAlarm.do',
	                				context:$(this),
	                				type:'POST',
	                				data:{
	                					iccid: data.iccid,
	                					number: msg.number,
	                					alarmValue: wantSetValue
	                				},
	                				dataType:'JSON',
	                				success:function(msg){
	                					switch( String(msg.msg) ){
	                						case "0":
	                							if(!!msg.code){	//"code":"save success"
	                								selectDom.find('button').html($(this).text()+"<span class='caret'></span>");
	                							}
	                							else{
	                								console.log("成功但记录存储失败");
	                								selectDom.find('button').html($(this).text()+"<span class='caret'></span>");
	                							}
	                							break;
	                						case "1":
	                							alert("设置出错，请稍后重设("+msg.code+")");
	                							break;
	                						case "2":
	                							alert("设置出错，请稍后重设("+msg.code+")");
	                							break;
	                						case "4":
	                							alert("设置出错，请稍后重设("+msg.code+")");
	                							break;
	                						case "10":
	                							alert("未登录或登录超时，请重新登录");
	                							parent.window.location.href="login.html";
	                							break;
	                						default:
	                							alert("设置失败，未知错误");
	                							break;
	                					}
	                				},
	                				error:function(msg){
	                					alert('设置失败，请稍后重设');
	                				}
                				});	
            				});
							// $("#table-trafficThresholdCheckResult").footable();
							break;
						case "1":
							$(".input-error").html("此ICCID号不存在");
							break;
						case "2":
							$(".input-error").html("参数出错");
							break;
						default:
							$(".input-error").html("查询失败，未知错误");
							break;
					}
				},
				error: function(msg){
					$(".input-error").html("查询失败，请检查一下网络连接情况");
					console.log(msg);
				},
				complete: function () {
                    zivenload.end();
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
		zivenload.start(".wrap-container");
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
			},
			complete: function () {
                zivenload.end()
            }
		});
	}
	


	//点击“查询该厂商号卡”按钮
	$("#checkAllAlarmThresholdInfo").click(function(){

		$(".input-error").html("&nbsp;");	//清空错误信息
		$("#table-trafficThresholdCheckResult>tbody").html("");	//清空上次查询结果

		$("#inputSingleICCID").val("");

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
							$.ajax({
								url:loc+'/recharge/manager/listTrafficAlarmInfo.do',
								type:'GET',
								data: {page: 1},
								dataType:'JSON',
								success:function(msg){
									switch(String(msg.msg)){
									case "0":
										if(msg.count){
												//总条数为count
												$.each(msg.trafficAlarmList, function(index, item){
													$("#table-trafficThresholdCheckResult>tbody").append("<tr><td>"+ item.number +"</td><td>"+ item.iccid +"</td><td>"+ (parseInt(item.CUMULATION_TOTAL)/1024).toFixed(2) +"</td><td>"+ (parseInt(item.CUMULATION_ALREADY)/1024).toFixed(2) +"</td><td>"+ (parseInt(item.CUMULATION_LEFT)/1024).toFixed(2) +"</td><td></td></tr>");
													var isSetValue;
													if(item.isTrafficAlarm){
														//设置了预警阈值
														switch(item.trafficAlarmValue.match(/[0-9]+/g).join()){
															case "40":
																isSetValue = "40%";
																break;
															case "80":
																isSetValue = "80%";
																break;
															case "100":
																isSetValue = "100%";
																break;
															case "40,80,100":
																isSetValue = "40%，80%，100%";
																break;
														}
													}
													else{
														//未设置预警阈值
														isSetValue="-";
													}

													var selectDom = $('#table-trafficThresholdCheckResult>tbody>tr:last-child>td:last-child');
													var htmlstr = "<div class='btn-group'><button data-toggle='dropdown' class='btn btn-primary dropdown-toggle' type='button'>"
																	+isSetValue
																	+"<span class='caret'></span></button>"
																	+"<ul role=‘menu’ class='dropdown-menu'><li><a>40%</a></li><li><a>80%</a></li><li><a>100%</a></li><li><a>40%，80%，100%</a></li></ul></div>";

													selectDom.html(htmlstr);
													selectDom.find("a").click(function(){
															var wantSetValue = $.trim($(this).text()).match(/[0-9]+/g).join();
																$.ajax({
								                					url:loc+'/recharge/manager/setTrafficAlarm.do',
								                								type:'POST',
								                								context:$(this),
								                								data:{
								                									iccid: item.iccid,
								                									number: item.number,
								                									alarmValue: wantSetValue
								                								},
								                								dataType:'JSON',
								                								success:function(msg){
								                									switch( String(msg.msg) ){
								                									case "0":
								                										selectDom.find('button').html($(this).text()+"<span class='caret'></span>");
								                										break;
								                									case "1":
						                												alert("设置出错，请稍后重设("+msg.code+")");
										                							break;
										                						case "2":
										                							alert("设置出错，请稍后重设("+msg.code+")");
										                							break;
										                						case "4":
										                							alert("设置出错，请稍后重设("+msg.code+")");
										                							break;
										                						case "10":
										                							alert("未登录或登录超时，请重新登录");
										                							parent.window.location.href="login.html";
										                							break;
										                						default:
										                							alert("设置失败，未知错误");
										                							break;
								                									}
								                								},
								                								error:function(msg){
								                									alert('设置出错，请稍后重设');
								                								}
							                					});	
							            			});
												});	
							                	$('#table-trafficThresholdCheckResult').footable();
											}
											else{
												//没有信息
												$(".input-error").html("查询完毕，无相关信息");
											}
											break;
									case "1": 
										$(".input-error").html(msg.code);
										break;
									case "2": 
										$(".input-error").html(msg.code);
										break;
									case "10":
										$(".input-error").html("未登录或登录超时，请重新登录");
										break;
									default:
										$(".input-error").html("查询失败，未知错误");
										break;
									}
								},
								error: function(){
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

	//---------------- copy --------------------
});