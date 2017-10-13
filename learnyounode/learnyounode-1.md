## learnyounode 13课总结（上）
-------------
最近对nodejs比较感兴趣，但是苦于无法下手，直接啃文档又觉得十分生硬无趣。  
幸好有热心网友推荐了learnyounode这个好玩的入门课程系列，在下载安装之后确实觉得这几篇课程作者做的很用心，于是决定花几天时间把13课通关。  
不过下载安装之后，发现界面都是全英文的，有些词汇还是比较难懂的，特别是提示的方面。  
这里推荐一篇learnyounode的汉化版，它将learnyounode的界面翻译并附出了答案，对于完成教程还是很有帮助的。（当然，不是抄。。。）  
中文版地址：[https://www.kancloud.cn/kancloud/learnyounode/47115](https://www.kancloud.cn/kancloud/learnyounode/47115)
### *lesson 1*
    编写一个程序，在终端（标准输出 stdout）打印出 “HELLO WORLD”。
我们知道，在安装node之后，我们只要在命令行输入 `node program.js` 就可以运行该目录下的program.js文件，并输出结果。  
所以此题较为简单，我们只要在js文件里写一行console代码就行。
* program.js
``` js
console.log("HELLO WORLD")
```
### *lesson 2*
    编写一个简单的程序，使其能接收一个或者多个命令行参数，并且在终端（标准输出 stdout）中打印出这些参数的总和。
在本题中，涉及到了node的内置对象--process。  
我们可以在命令行中输入node，进入node命令行模式，然后继续输入 `console.log(process)` 来查看process对象的各个属性，包括node版本、运行平台、内置模块、域名等各个信息。  
根据learnyounode的提示，我们知道，获取参数信息需要用到process对象中的argv属性，它是一个数组。  
例如在命令行中输入 `node program.js 1` ,那么argv数组将会是这样的：`[ 'C:\\Program Files\\nodejs\\node.exe',
  'C:\\Users\\zsai\\Desktop\\mygit\\node\\program.js',
  '1' ]`  
了解这个之后，我们就可以解答本题了。
* program.js
``` js
var argvArray=process.argv;
var numArray=argvArray.slice(2,argvArray.length);
var sum=0;
for(var n=0;n<numArray.length;n++){
    sum+=parseInt(numArray[n]);
}
console.log(sum);
```
### *lesson 3*
    编写一个程序，执行一个同步的文件系统操作，读取一个文件，并且在终端（标准输出stdout）打印出这个文件中的内容的行数。类似于执行 cat file | wc -l 这个命令。
    所要读取的文件的完整路径会在命令行第一个参数提供。
首先我们先在当前目录下，创建一个test.txt文件，然后输入几行文字，保存之后，在命令行中输入 `cat test.txt` ，然后在命令行中就会输出test.txt中的内容，这与我们所要做的事情类似。  
在本题中，我们要用node同步打开一个文件，并计算文件中内容的行数。这里我们需要用到node的内置模块--fs，只有在引入fs之后，我们利用node进行相应的文件操作。  
翻阅node文档中的fs模块，可以知道打开文件所需要用的方法有readFile和readFileSync，根据要求，我们需要同步读取文件，故采用readFileSync。  
填入路径，确定解码方法(也可以用toString方法将读取的内容转为字符串)之后，我们就可以得到文件的内容了，然后通过读取'\n'的个数我们就可以知道有几行文本，整个题目差不多就可以完成了~
* program.js
``` js
const fs = require('fs');
const { Url } = require('url');
let content=fs.readFileSync(absUrl).toString();
let lineArray=content.split('\n');
console.log(lineArray.length-1);
```
### *lesson 4*
    编写一个程序，执行一个异步的对文件系统的操作：读取一个文件，并且在终端（标准输出stdout）打印出这个文件中的内容的行数。类似于执行 cat file | wc -l 这个命令。 
    所要读取的文件的完整路径会在命令行第一个参数提供。
这题与上题大同小异，唯一不同的是本题要求用异步读取的方法读取文件，即调用readFile方法。  
值得注意的是，既然是异步方法，就需要写回调函数，而既然是回调函数，就要考虑读取出错的情况，即需要增加对err的处理。
* program.js
``` js
const fs = require('fs');
const absUrl=process.argv[2];
fs.readFile(absUrl,'utf-8', (err, data) => {
    if (err) throw err;
    let content=data.split('\n').length-1;
    console.log(content);
});
```
### *lesson 5*
    编写一个程序来打印出指定目录下的文件列表，并且以特定的文件名扩展名来过滤这个列表。命令行提供两个参数提，第一个是所给的文件目录路径（如：path/to/dir），第二个参数则是需要过滤出来的文件的扩展名。
    举个例子：如果第二个参数是 txt，那么需要过滤出那些扩展名为 .txt的文件。
    注意，第二个参数将不会带有开头的”.”。
    需要在终端中打印出这个被过滤出来的列表，每一行一个文件。另外，必须使用异步的I/O 操作。
分析题目，我们可以知道在本题中，我们最主要的是做两个操作：1、读取给定目录下的所有文件 2、解析文件的扩展名  
根据提示，fs和path两个模块可以对应完成两个操作。fs的readdir方法可以获取目录下的所有文件，而通过path的extname可以获取获得file的扩展名，再通过匹配即可进行筛选。（不过在我自己写的代码中我未引用path，在准确度上比不上learnyounode提供的标准代码）
* program.js
``` js
const fs = require('fs');
const dir=process.argv[2];
let ext=process.argv[3];
if(ext.indexOf('.')===-1){
    ext='.'+ext;
}
fs.readdir(dir,'utf-8',(err,data) => {
    if(err) throw err;
    let filelist = [];
    data.forEach((f) => {
        if(f.match(ext)){
            console.log(f);
        }
    }, this);
})
```
### *lesson 6*
    这个问题和前面一个一样，但是这次需要使用模块。将需要创建两个文件来解决这个问题。
    编写一个程序来打印出所给文件目录的所含文件的列表，并且以特定的文件名后缀来过滤这个列表。这次将会提供两个参数，第一个参数是要列举的目录，第二个参数是要过滤的文件扩展名。在终端中打印出过滤出来的文件列表（一个文件一行）。此外，必须使用异步 I/O。
    这里有四则规定，模块必须遵守：
        1.导出一个函数，这个函数能准确接收上述的参数。
        2.当有错误发生，或者有数据的时候，准确调用回调函数。
        3.不要改变其他的任何东西，比如全局变量或者 stdout。
        4.处理所有可能发生的错误，并把它们传递给回调函数。
    遵循一些约定的好处是，模块可以被任何其他也遵守这些约定的人所使用。
模块化一直是前端开发者努力的一个方向，因为被封装后的模块更为系统，在项目中的引用也更为便利，复用性更高，个人感觉和面向对象编程有异曲同工之妙。  
在本题中，我们需要封装一个自己的模块，来完成上一题的功能。现在的问题就是，功能已经有了，我们怎么将它封装到模块里，又怎么去引用。  
我们首先来看一下提示中的代码：  
`module.exports = function (args) { /* ... */ }`
`var mymodule = require('./mymodule.js')`  
我们可以看到，我们可以通过 `module.exports` 将一个函数方法输出，并通过 `require` 将输出的函数获取并赋值给某个变量便于调用，这样这个变量就对应模块中的函数，并可以直接被调用了。  
而且在模块中，我们不仅可以输出一个函数，还可以输出一个变量、一个对象，因此灵活度将会很高，十分便于在项目中开发。  
不过我觉得，一个模块文件只能被require一次，所以最好不要输出多个变量，不然在调用的时候可能会比较麻烦，最好是单一模块文件输出单个变量或对象，便于调用。（不知道这样理解对不对）  
PS：模块中的错误处理函数最好根据提示中的 `reture callback(err);` 这种形式来写，不过我不知道原因，希望有大神解答。还有learnyounode答案中的Array.filter是一个很方便的写法，以前一直没有注意到，以后会试着用这个方法来做数组的过滤的。
* program.js
``` js
var readdirFun = require('./readdir');
var dir = process.argv[2];
var ext = process.argv[3];
readdirFun(dir,ext,(err,data) => {
    if(err){
        console.log(err);
    }
    data.forEach(function(f) {
        console.log(f);
    }, this);
});
```
* readdir.js
``` js
const fs = require('fs');
const path = require('path');
function ReadDir(dir, ext, callback) {
    fs.readdir(dir, (err, data) => {
        if (err) {
            return callback(err);
        }
        data = data.filter(function (file) {
            return path.extname(file) === '.' + ext
        })
        callback(null, data);
    })
}
module.exports = ReadDir;
```
### *lesson 7*
    编写一个程序来发起一个 HTTP GET 请求，所请求的 URL 为命令行参数的第一个。然后将每一个 “data” 事件所得的数据，以字符串形式在终端（标准输出 stdout）的新的一行打印出来。
在前端页面中发起http请求并获取数据是每个前端都需要知道和了解的，但是如何在node环境下，或者说在后台中发起http请求就不是很了解了。  
经过提示，我们知道node中有个http模块是专门处理http请求的，在本题中，我们需要用http模块中的get方法，来对接口发起get请求，然后得到返回数据并打印。  
但是跟前端的get请求不太一样的是，在回调中的response并不是最终的数据，我们需要对response做各种监听处理，最终得到的数据才是接口返回的数据，这和前端http请求返回的数据不太一样。  
按我的理解是，node的http模块在发起接口请求之后，两个接口建立起持续的数据通道，数据传输期间，通道不会断开，知道触发 `res.end()` 事件。所以我们需要对期间的数据进行收集整合，才能得到完整的数据。（个人理解，希望有大神解惑）
* program.js
``` js
const http = require('http');
const requrl = process.argv[2];
http.get(requrl, (res) => {
    res.setEncoding('utf-8');
    let rawData = '';
    res.on('data', (data) => {
        console.log(data);
    })
    res.on('error', () => {
        console.log(error);
    })
})
```
***
整理这篇博客也是为了让自己更好的消化从learnyounode中吸收的关于nodejs的知识，其中对提出的一些观点和语法可能存在偏差，如果有大神看到的话，希望能指出，不胜感激。由于时间关系，只整理了前7课的内容，等到下次有空的时间，将剩余6课的内容也一并整理出来，当作自己入node的纪念~