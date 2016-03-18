//leanengine配置
var AV = require('leanengine');

// 在 Cloud code 里初始化 Express 框架
var express = require('express');
var app = express();
var path = require('path');
var schedule = require("node-schedule");
var http =  require('http');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');

var APP_ID = 'H3uzSTIRP8OPpXNE7qxCrhf1-gzGzoHsz'; // 你的 app id
var APP_KEY =  'AbBvTAexCid6dIJS2LoH0Ytp'; // 你的 app key
var MASTER_KEY =  'q7VGCifyLCEU1MLFaE7A9mYK'; // 你的 master key

AV.initialize(APP_ID, APP_KEY, MASTER_KEY);

// App 全局配置
app.set('views','cloud/views');   // 设置模板目录
app.set('view engine', 'ejs');    // 设置 template 引擎
app.use(express.bodyParser());    // 读取请求 body 的中间件
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(__dirname, 'public'));
app.use(AV.Cloud.CookieSession({ secret: 'my secret', maxAge: 3600000, fetchUser: true }));



/*
**保存公告数据
** data:一个保存了表单信息的json。find：需要查找是否存在相同的元素。callback：回调函数；成功返回“success”，失败返回“error”；
 */
function saveAnnounceData(data,find,callback){
	var post = AV.Object.new('Announce');
	console.log(data);
	var query = new AV.Query('Announce');
	query.equalTo(find, data[find]);
	query.find().then(function(results) {
	  console.log('Successfully retrieved ' + results.length + ' posts.');
	  // 处理返回的结果数据
	  console.log(results.length);
		if(results.length=="0"){
			for(var key in data){
				post.set(key, data[key]);
			}
			post.save().then(function(post) {
			  // 成功保存之后，执行其他逻辑.
			  console.log('New object created with objectId: ' + post.id);
				callback.success("success");
			}, function(err) {
			  // 失败之后执行其他逻辑
			  // error 是 AV.Error 的实例，包含有错误码和描述信息.
			  console.log('Failed to create new object, with error message: ' + err.message);
				callback.error(err);
			});
		}
	}, function(error) {
	  console.log('Error: ' + error.code + ' ' + error.message);
	});
}

	/*
	**查询公告数据
	**
	 */
// function getAnnounceData(){
//
// }


	/*
	**保存公告数据
	**Object
	*/
	// function saveAnnounceData(data,find,callback){
	// 	var post = AV.Object.new('Announce');
	// 	console.log(data);
	// 	var query = new AV.Query('Announce');
	// 	query.equalTo(find, data[find]);
	// 	query.find().then(function(results) {
	// 	  console.log('Successfully retrieved ' + results.length + ' posts.');
	// 	  // 处理返回的结果数据
	// 	  console.log(results.length);
	// 		if(results.length=="0"){
	// 			for(var key in data){
	// 				post.set(key, data[key]);
	// 			}
	// 			post.save().then(function(post) {
	// 			  // 成功保存之后，执行其他逻辑.
	// 			  console.log('New object created with objectId: ' + post.id);
	// 				callback.success(post);
	// 			}, function(err) {
	// 			  // 失败之后执行其他逻辑
	// 			  // error 是 AV.Error 的实例，包含有错误码和描述信息.
	// 			  console.log('Failed to create new object, with error message: ' + err.message);
	// 				callback.error(err);
	// 			});
	// 		}
	// 	}, function(error) {
	// 	  console.log('Error: ' + error.code + ' ' + error.message);
	// 	});


	// for(var key in data){
	// 	// console.log(data[key]);
	// 	post.set(key, data[key]);
	// }
	// post.save().then(function(post) {
	//   // 成功保存之后，执行其他逻辑.
	//   console.log('New object created with objectId: ' + post.id);
	// 	callback.success(post);
	// }, function(err) {
	//   // 失败之后执行其他逻辑
	//   // error 是 AV.Error 的实例，包含有错误码和描述信息.
	//   console.log('Failed to create new object, with error message: ' + err.message);
	// 	callback.error(err);
	// });
// }

function getUrlData(url,charset,callback){
	http.get(url, function(res) {
	    var source = "";
			res.setEncoding('binary');
	    res.on('data', function(data) {
	        source += data;
	    });
	    res.on('end', function() {
					var buf = new Buffer(source, 'binary');
					// var str = iconv.decode(buf, 'GBK');
					// var str = iconv.decode(buf, 'UTF-8');
					console.log(source);

					if(!charset){
						charset = "GBK";
					}
					var str = iconv.decode(buf, charset);
					callback.success(str);
	    });
	}).on('error', function() {
			callback.error("error");
	    console.log("获取数据出现错误");
	});
}

function getJWCImportentData(){
	getUrlData("http://www1.cuit.edu.cn/NewsList.asp?bm=32&type=448","GBK",{
		success:function(result){
			$ = cheerio.load(result);
			var time = '';
			var title = '';
			var url = '';
			var type = 'JWC';
			$(".newstext table td a").each(function(i, elem){
				if($(this).text()){
					if(i%2){
						//这里显示的是时间
						time = $(this).text();
						var data = {};
						data.time = time;
						data.title = title;
						data.url = url;
						data.type = type;
						saveAnnounceData(data,"title",{
							success:function(result){
								// console.log(result);
							},
							error:function(error){
								console.log(error)
							}
						});

					}else{
						//这里显示的是标题
						title = $(this).text();
						url = $(this).attr("href");
					}
				}
			})
		},
		error:function(error){
			console.log(error)
		}
	});
}
function getCUITImportentData(){
	console.log("测试");
	getUrlData("http://www.cuit.edu.cn/NewsList?id=2","UTF-8",{
		success:function(result){
			$ = cheerio.load(result);
			console.log(result);
			$("#NewsListContent li").each(function(i, elem){
				if($(this).text()){
						console.log($(this).children("a").text());
						var title = $(this).children("a").text();
						var url = "http://www.cuit.edu.cn/"+$(this).children("a").attr("href");
						var time = $(this).children(".datetime").text();
						var type = 'CUIT';
						time = time.replace("[","");
						time = time.replace("]","");
						var data = {};
						data.time = time;
						data.title = title;
						data.url = url;
						data.type = type;
						console.log(data);
						saveAnnounceData(data,"title",{
							success:function(result){
								console.log(result);
							},
							error:function(error){
								console.log(error)
							}
						});
				}
			})
		},
		error:function(error){
			console.log(error)
		}
	});
}

/*
**定时执行爬取学校公告信息
**
 */
 exports.cronGetData = function(){
	getCUITImportentData();
 	getJWCImportentData();
 }
function getCUITImportentDataByAV(){
	// getCUITImportentData();
	AV.Cloud.httpRequest({
	  url: 'http://www.cuit.edu.cn/NewsList?id=2',
		headers: {
	    'Content-Type': 'application/json'
	  },
	  success: function(httpResponse) {
			console.log(httpResponse.text);
			$ = cheerio.load(httpResponse.text);
			$("#NewsListContent li").each(function(i, elem){
				if($(this).text()){
						console.log($(this).children("a").text());
						var title = $(this).children("a").text();
						var url = "http://www.cuit.edu.cn/"+$(this).children("a").attr("href");
						var time = $(this).children(".datetime").text();
						var type = 'CUIT';
						time = time.replace("[","");
						time = time.replace("]","");
						var data = {};
						data.time = time;
						data.title = title;
						data.url = url;
						data.type = type;
						console.log(data);
						saveAnnounceData(data,"title",{
							success:function(result){
								console.log(result);
							},
							error:function(error){
								console.log(error)
							}
						});
				}
			})
	  },
	  error: function(httpResponse) {
	    console.error('Request failed with response code ' + httpResponse.status);
	  }
	});
 }
 // getCUITImportentDataByAV();
 exports.getCUITImportentData = function(){
	 getCUITImportentDataByAV();
 }
 exports.getJWCImportentData = function(){
	getJWCImportentData();
 }

// getJWCImportentData();
// getCUITImportentData();

// var url = "http://www1.cuit.edu.cn/NewsList.asp?bm=32&type=448";
// http.get(url, function(res) {
//     var source = "";
// 		res.setEncoding('binary');
//     res.on('data', function(data) {
//         source += data;
//     });
//     res.on('end', function() {
// 				var buf = new Buffer(source, 'binary');
// 				var str = iconv.decode(buf, 'GBK');
// 				$ = cheerio.load(str);
// 				var time = '';
// 				var title = '';
// 				var url = '';
// 				$(".newstext table td a").each(function(i, elem){
// 					if($(this).text()){
// 						if(i%2){
// 							//这里显示的是时间
// 							// console.log($(this).text());
// 							time = $(this).text();
// 						}else{
// 							//这里显示的是标题
// 							// console.log($(this).text());
// 							// console.log($(this).attr("href"));
// 							title = $(this).text();
// 							url = $(this).attr("href");
// 							var data = {};
// 							data.time = time;
// 							data.title = title;
// 							data.url = url;
// 							saveAnnounceData(data,"title",{
// 								success:function(result){
// 									console.log(result);
// 								},
// 								error:function(error){
// 									console.log(error)
// 								}
// 							});
// 						}
// 					}
// 				})
//     });
// }).on('error', function() {
//     console.log("获取数据出现错误");
// });


app.get('/announce', function(req, res) {
		var query = new AV.Query('Announce');
		query.addDescending('time');
		query.find().then(function(results) {
			// 处理返回的结果数据
			console.log(results);
			res.render('announce', {results:results});
		}, function(error) {
			console.log('Error: ' + error.code + ' ' + error.message);
			res.render('announce', {results:error});
		});
});

app.get('/', function(req, res) {
	res.render('test', {});
});

app.get('/test', function(req, res) {
  res.render('test', {});
});

// 最后，必须有这行代码来使 express 响应 HTTP 请求
app.listen();

// module.exports = app;
