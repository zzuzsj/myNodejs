## learnyounode 13课总结（下）
-------------
前断时间较为忙碌，所以learnyounode的下半部分总结一直拖到了现在，罪过罪过。那么今天我就将8-13课的内容整理出来，将后半部分的知识稍微梳理一下。  
这里推荐一篇learnyounode的汉化版，它将learnyounode的界面翻译并附出了答案，对于完成教程还是很有帮助的。（当然，不是抄。。。）  
中文版地址：[https://www.kancloud.cn/kancloud/learnyounode/47115](https://www.kancloud.cn/kancloud/learnyounode/47115)  
### lesson 8
    编写一个程序，发起一个 HTTP GET 请求，请求的 URL 为所提供的命令行参数的第一个。收集所有服务器所返回的数据（不仅仅包括 “data” 事件）然后在终端（标准输出 std out）用两行打印出来。
    所打印的内容，第一行应该是一个整数，用来表示收到的字符串内容长度，第二行则是服务器返回的完整的字符串结果。
首先需要确定的是，从6、7题我们知道了，在利用node发送请求的时候，数据是片段流的方式进行传递的，这就要求我们在收到请求之后，需要将完整的请求解析出来。  
我们可以利用node的http模块去请求一个接口，然后对接口返回对应的参数res进行事件处理。根据文档可以知道res有error、data、end等事件，那这里我们只要对res做好事件处理就可以达到获取所有请求信息的效果啦。下面是代码~  
```js
const http = require('http');
http.get(process.argv[2],function(res){
    let rawData = '';
    res.on('data',function(data){
        rawData += data;
    })
    res.on('error',function(err){
        console.log(err);
    })
    res.on('end',function(data){
        console.log(rawData.length);
        console.log(rawData);
    })
})
```
### lesson 9
    这次的问题和之前的问题（HTTP 收集器）很像，也是需要使用到 http.get() 方法。然而，这一次，将有三个 URL 作为前三个命令行参数提供。
    需要收集每一个 URL 所返回的完整内容，然后将它们在终端（标准输出stdout）打印出来。这次不需要打印出这些内容的长度，仅仅是内容本身即可（字符串形式）；每个 URL对应的内容为一行。重点是必须按照这些 URL 在参数列表中的顺序将相应的内容排列打印出来才算完成。
本题与上题类似，获取接口返回的完整信息应该相当容易了，难的是，如何将三个接口返回的信息顺序打印出来。当然了，现在npm上的三方库这么多，我们完全可以通过三方库将接口请求事件顺序排列，在完成一个接口之后输出返回信息，然后再进行下一个请求。  
不过我用的是以前在页面中处理异步的笨方法。给每个接口事件对应一个状态，请求接口成功并返回数据之后将对应状态设为true，请求完成之后，所有接口状态为true再顺序输出所有接口的返回信息。
```js
http = require('http');
let isEnd1=false;
let isEnd2=false;
let isEnd3=false;
let data1,data2,data3;
http.get(process.argv[2],function(res){
    let rawData = '';
    res.on('data',function(data){
        rawData += data;
    })
    res.on('error',function(err){
        console.log(err);
    })
    res.on('end',function(data){
        data1=rawData;
        isEnd1=true;
        if(isEnd1&&isEnd2&&isEnd3){
            console.log(data1);
            console.log(data2);
            console.log(data3);
        }
    })
})
http.get(process.argv[3],function(res){
    let rawData = '';
    res.on('data',function(data){
        rawData += data;
    })
    res.on('error',function(err){
        console.log(err);
    })
    res.on('end',function(data){
        data2=rawData;
        isEnd2=true;
        if(isEnd1&&isEnd2&&isEnd3){
            console.log(data1);
            console.log(data2);
            console.log(data3);
        }
    })
})

http.get(process.argv[4],function(res){
    let rawData = '';
    res.on('data',function(data){
        rawData += data;
    })
    res.on('error',function(err){
        console.log(err);
    })
    res.on('end',function(data){
        data3=rawData;
        isEnd3=true;
        if(isEnd1&&isEnd2&&isEnd3){
            console.log(data1);
            console.log(data2);
            console.log(data3);
        }
    })
})
```
### lesson 10
    编写一个 TCP 时间服务器
    服务器监听一个端口，以获取一些TCP连接，这个端口会经由第一个命令行参数传递给程序。针对每一个 TCP 连接，都必须写入当前的日期和24小时制的时间，如下格式："YYYY-MM-DD hh:mm"
    然后紧接着是一个换行符。
    月份、日、小时和分钟必须用零填充成为固定的两位数："2013-07-06 17:42"
在提示中，本题是需要用net模块去创建一个服务器，而不是用http模块创建的。作为后端小白不懂tcp服务器和普通服务器的区别orz，希望了解的大神能提点一下。  
在了解到用什么搭建服务器之后，后续的问题倒是不用担心了，只需要记得把时间格式处理一下就行。下面是手动格式化时间的代码，答案中好像有不用手动格式化的，找个时间研究一下它的写法。    
```js
const net = require('net');

net.createServer(function(socket){
 var date= new Date();
 socket.end(formatDate(date)+'\n');
}).listen(process.argv[2]);

function formatDate(datee){
    var year = datee.getFullYear();
    var month = datee.getMonth()+1;
    var date = datee.getDate();
    var hour = datee.getHours();
    var minute = datee.getMinutes();
    var second = datee.getSeconds();

    month = month < 10 ? '0'+month:month;
    date = date < 10 ? '0'+date:date;
    hour = hour < 10 ? '0'+hour:hour;
    minute = minute < 10 ? '0'+minute:minute;
    second = second < 10 ? '0'+second:second;

    return year+'-'+month+'-'+date+' '+hour+':'+minute;
}
```
### lesson 11
    编写一个 HTTP 文件 服务器，它用于将每次所请求的文件返回给客户端。
    服务器需要监听所提供的第一个命令行参数所制定的端口。
    同时，第二个会提供给程序的参数则是所需要响应的文本文件的位置。在这一题中必须使用fs.createReadStream() 方法以 stream 的形式作出请求相应。
我们可以利用http和fs两个模块，在服务端发送请求的时候，去读取文件的内容，并将它的内容作为流输入到接口的返回中。只需要好好利用fs模块的createStream方法即可完成任务。  
在生成文件流之后，我们可以通过pipe方法将其输入到接口的res里。pipe方法是独属于stream的一种方法，我们可以将其理解成流变量像通过管道一样流向及输出，是一种非常抽象的方法，使用的地方很多，我们可以多了解一下。  
```js
const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
    const url = process.argv[3];
    const fsdata = fs.createReadStream(url, {
        flags: 'r',
        encoding: 'utf-8',
        fd: null,
        mode: 0o666,
        autoClose: true
    });
    fsdata.on('readable', () => {
        console.log('readable:', fsdata.read());
    }).pipe(res);

});

server.on('clientError', (err, socket) => {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
})
server.on('error',(err) => {
    console.log(err);
})
server.listen(Number(process.argv[2]), '127.0.0.1', () => {
    console.log('listen success');
});
```
### lesson 12
    编写一个 HTTP 服务器，它只接受 POST 形式的请求，并且将 POST 请求主体（body）所带的字符转换成大写形式，然后返回给客户端。
    服务器需要监听由第一个命令行参数所指定的端口。
在前端页面中，最常见的有get和post两种与接口进行交互的方式，而具体的方式则由接口来指定。这说明后端做接口的时候是可以对前端提交的所有信息进行筛选和判断并加以利用的，这也是一般接口所做的事情。  
提交给接口的所有信息都存在server的req参数里面，所以我们需要围绕着这个参数做信息的判断和提取，并将其返回。
```js
const http = require('http');

http.createServer(function(req,res){
    var postData = '';
    req.addListener("data", function (postDataChunk) {
        if(req.method==='POST'){
            postData += postDataChunk;
        }
    });
    req.addListener("end", function(){
        if(req.method==='POST'){
            res.end(postData.toUpperCase(),'utf8');
        }
    });
}).listen(process.argv[2]);
```
### lesson 13
    编写一个 HTTP 服务器，每当接收到一个路径为 '/api/parsetime' 的 GET 请求的时候，响应一些 JSON 数据。我们期望请求会包含一个查询参数（query string），key 是 “iso ，值是 ISO 格式的时间。
    如:
    /api/parsetime?iso=2013-08-10T12:10:15.474Z
    所响应的 JSON 应该只包含三个属性：'hour'，'minute' 和 'second'。例如：
    {
    "hour": 14,
    "minute": 23,
    "second": 15
    }
    然后增再加一个接口，路径为 '/api/unixtime'，它可以接收相同的查询参数（query strng），但是它的返回会包含一个属性：'unixtime'，相应值是一个 UNIX 时间戳。例如:
    { "unixtime": 1376136615474 }
    服务器需要监听第一个命令行参数所指定的端口。
最后一题的意思十分的简单明了，利用前面所以题目学到的信息，正儿八经的写一个给前端页面用的接口。虽然接口功能十分简单，可是涉及到了前端信息判断、获取、处理、返回等一连串系统的接口处理。  
本题的难点在于，我们需要判断信息提交的接口路径来做出不同的处理，这种类似于路由的东西我们在前面的题目中都没提到过。不过前文提到过了，server的req信息包含了所提交的所有信息，包括提交的接口路径、提交方式、提交内容等等，所以我们按照提示中，利用url模块将req中的url信息提取出来再做判断即可达成目的。  
（ 题目中所提到的isotime比较难找，本文提供一个isotime以供测试：2016-01-18T23:41:00 ）
```js
const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
    let urlObj = url.parse(req.url);
    let pathname = urlObj.pathname;
    if (pathname === '/api/parsetime') {
        let param = urlObj.query;
        if(param.indexOf('&') === -1){
            let params = param.split('=');
            if(params[0] === 'iso'){
                let isotime = params[1];
                let time = new Date(isotime);
                console.log(time);
                let resObj = {
                    hour : time.getHours(),
                    minute : time.getMinutes(),
                    second : time.getSeconds()
                };
                res.end(JSON.stringify(resObj));
            }
        }
    }else if (pathname === '/api/unixtime') {
        let param = urlObj.query;
        if(param.indexOf('&') === -1){
            let params = param.split('=');
            if(params[0] === 'iso'){
                let isotime = params[1];
                let time = new Date(isotime);
                let timeTamp = time.getTime();
                let resObj = {
                    unixtime : timeTamp
                };
                res.end(JSON.stringify(resObj));
            }
        }
    }
})

server.on('clientError', (err, socket) => {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
})
server.on('error', (err) => {
    console.log(err);
})
server.listen(Number(process.argv[2]), () => {
    console.log('listen success');
})
```
***
learnyounode的归纳总结到这里就结束了，感觉离node距离进了一步，不再是和以前一样连node官方文档都看不进去了。大致了解各个模块的功能和调用方法，也终于将node和express算是区分开了一些哈哈哈。  
我感觉learnyounode虽然没有将node的方方面面包含进去，但是它确实适用于刚入门、对node一门雾水的人。它将node的重要模块单独或结合在一起，列出了它们的适用场景以及使用方法，题目难度适中，是需要看文档去了解才能写出来的。不过更大程度上我更喜欢它的提示，提示就是我们以后解决node问题的思路（提示几乎是题题必看~还是太菜了~）。  
在解题过程这段期间，也算是学到了不少东西，最起码对后端平时所做的工作以及权限有了一定的了解，对node的各个模块也有了一定的认识。这其中有不少知识只是自己的臆测，有失偏颇，只能等不断深入慢慢修正观念了。  
在练习的过程中，感慨于fs以及http模块的强大，大致了解到网页爬虫的工作原理，后面一段时间应该会写一直爬虫来巩固深化这块知识。在这立个flag，也算是为自己立个小目标吧~