/**
 *Created by DuckyRao on 2016/3/1
 */
+(function(){

    var cherry = {};
    cherry.tipShow = function(tipText,showTime){
        var showTime = showTime ? showTime : 1000;
        el=$.tips({
            content:tipText,
            stayTime:showTime,
            type:"faild"
        })
        el.on("tips:hide",function(){
            console.log("tips hide");
        })
     }

     /**
          * 初始化Session对象
          */
        var session = new IFlyTtsSession({
                                      'url' : 'http://webapi.openspeech.cn/',
                                      'interval' : '30000',
                                      'disconnect_hint' : 'disconnect',
                                      'sub' : 'tts'
                                 });
        var audio = null;

        /**
          * 输入文本，输出语音播放链接
          * @content 待合成文本(不超过4096字节)
          */
        cherry.play = function(content,vcn,callback) {

            /************* 等待框 **************/
            var $loadingEl = $.loading({
                content:'正在生成...'
            });

            if(!vcn){
                vcn = "aisduck";
            }

            /***********************************************************以下签名过程需根据实际应用信息填入***************************************************/

            var appid = "54c88b8d";                              //应用APPID，在open.voicecloud.cn上申请即可获得

            // var timestamp = new Date().toLocaleTimeString();
            var timestamp = (new Date()).valueOf();                      //当前时间戳，例new Date().toLocaleTimeString()
            var expires = 60000;                          //签名失效时间，单位:ms，例60000
            //!!!为避免secretkey泄露，签名函数调用代码建议在服务器上完成
            var signature = faultylabs.MD5(appid + '&' + timestamp + '&' + expires + '&' + "6a97bfd7fa4531f7");
           /************************************************************以上签名过程需根据实际应用信息填入**************************************************/

            var params = { "params" : "aue = speex-wb;7, ent = intp65, spd = 50, vol = 50, tte = utf8,vcn = "+vcn+", caller.appid=" + appid + ",timestamp=" + timestamp + ",expires=" + expires, "signature" : signature, "gat" : "mp3"};

            // $(".content").text("timestamp:"+signature);

            session.start(params, content, function (err, obj)
            {

                if(err) {
                    $loadingEl.loading("hide");
                    tip("语音合成发生错误，错误代码 ：" + err);
                    callback.error("语音合成发生错误，错误代码 ：" + err);
                } else {
                    $loadingEl.loading("hide");
                    if(audio != null)
                    {
                        audio.pause();
                    }
                    $loadingEl.loading("hide");
                    audio = new Audio();
                    audio.src = '';
                    audio.play();
                    audio.src = "http://webapi.openspeech.cn/" + obj.audio_url;
                    // audio.play();
                    callback.success(audio);
                    // $loadingEl.loading("hide");
                    // $("#audio").attr("src","http://webapi.openspeech.cn/" + obj.audio_url);
                    // callback.success("http://webapi.openspeech.cn/" + obj.audio_url);
                    // document.getElementById('audio').play();
                }
            });
        };

        cherry.weixin = function(url){
          window.location.href = url;
        }

     //全局化
    window.cherry = cherry;
    // window.audio = audio;
 }());
