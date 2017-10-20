## 基于nodejs编写小爬虫
------------------
在通过learnyounode的课程初步了解nodejs的各大模块之后，不禁感慨于nodejs的强大，让我们这些前端小白也可以进行进阶的功能实现，同时发现自己也已经可以通过nodejs实现一些比较日常的小功能。比如在看完fs模块之后，我就用nodejs写了一个批量修改文件名的小demo，还是相当好用的。技术服务于生活，这才是硬道理~  
上周用nodejs写了一个小爬虫，但是由于当时的认知有限，爬虫虽然工作了，但是在爬图片的时候总是丢图漏图，也经常出现http请求并发太多造成链接超时导致爬虫挂掉的情况。在研究别人的爬虫代码之后，我决定用async重写一个爬安居客租房信息的异步爬虫，写下这篇笔记记录自己的心得~  
爬虫完整代码：https://github.com/zzuzsj/myNodejs/blob/master/spider/ajkSpider.js  

***
    需求：利用爬虫将安居客杭州市全部区域规定页数内的租房信息以文件夹形式保存到本地，并将租房的图片保存到相应文件夹里。  
### 思路整理
在写爬虫之前，我们需要整理我们的思路，首先我们需要分析安居客租房的网页跳转路径：  
租房信息分页路径：https://hz.zu.anjuke.com/fangyuan/p1  
租房信息帖子路径：https://hz.zu.anjuke.com/fangyuan/1103167210?from=Filter_1  
租房信息帖子内房源图片路径：https://pic1.ajkimg.com/display/hj/f487b229d00ec48c955333803ad3409f/600x450.jpg?t=1  
emmmm，事实证明，只有分页路径有迹可循，这也是我们爬虫的突破点所在。
在需求中，我们需要访问指定页面的租房信息，规定的页数我们可以通过node传参传入指定，拼接成对应分页的url并储存。用request模块请求所有的分页url，利用cheerio将页面结构解码之后获取所有租房信息帖子的路径并储存。将所有帖子url路径保存之后，继续请求这些路径，获取到所有租房图片的src路径并储存。等将所有图片路径储存之后，利用request和fs在本地建立相应文件夹并将图片下到本地。然后利用async将上诉的这些操作进行异步化，并在并发请求的时候对并发数进行限制。就酱，完美~  
#### *1.模块引用*
cheerio和async是nodejs的第三方模块，需要先下载，在命令行中运行：  
`npm init`  
`npm install cheerio async --save-dev`  
安装完毕之后，我们在当前目录下建立一个ajkSpider.js，同时建立一个rent_image文件夹，拿来存放爬虫所爬到的信息。我们在ajkSpider.js先引用模块：
```js
const fs = require('fs');
const cheerio = require('cheerio');
const request = require('request');
const async = require('async');
```
#### *2.分页路径获取*  
我们需要获取所有分页路径，并将其存到数组里面，开始页和结束页通过在执行文件的时候传参指定。例如  
`node ajkSpider.js 1 5`  
```js
let pageArray = [];
let startIndex = process.argv[2];
let endIndex = process.argv[2];
for (let i = startIndex; i < endIndex; i++) {
    let pageUrl = 'https://hz.zu.anjuke.com/fangyuan/quanbu/p' + i;
    pageArray.push(pageUrl);
}
```
#### *3.帖子路径获取*  
利用async对pageArray进行遍历操作，获取到url之后发起request请求，解析页面结构，获取所有帖子的dom节点，解析出帖子标题、价格、地段、url存到对象中，将对象存入数组以利于下一步的分析。
```js
let topicArray = [];
function saveAllPage(callback) {
    let pageindex = startIndex;
    async.map(pageArray, function (url, cb) {
        request({
            'url': url,
            'method': 'GET',
            'accept-charset': 'utf-8',
            'headers': {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36"
            }
        }, (err, res, body) => {
            if (err) cb(err, null);
            let $ = cheerio.load(res.body.toString());
            $('.zu-itemmod').each((i, e) => {
                let topicObj = {};
                let title = $(e).find('h3').find('a').attr('title').replace(/[(\s+)\：\、\，\*\\\:]/g, '');
                let topicUrl = $(e).find('h3').find('a').attr('href');
                let address = $(e).find('address').text().replace(/\<a(.+)a\>/g, '').replace(/\s+/g, '');
                let price = $(e).find('.zu-side').find('strong').text();
                let fileName = price + '_' + address + '_' + title;
                topicObj.fileName = fileName;
                topicObj.topicUrl = topicUrl;
                topicArray.push(topicObj);
                if (!fs.existsSync('./rent_image/' + fileName)) {
                    fs.mkdirSync('./rent_image/' + fileName);
                }
                // console.log(topicObj.topicUrl + '\n' + topicObj.fileName + '\n');
            })
            console.log('=============== page ' + pageindex + ' end =============');
            cb(null, 'page ' + pageindex);
            pageindex++;
        });
    }, (err, result) => {
        if (err) throw err;
        console.log(topicArray.length);
        console.log(result + ' finished');
        console.log('\n> 1 saveAllPage end');
        if (callback) {
            callback(null, 'task 1 saveAllPage');
        }
    })
}
```
为了方便查看，我将帖子的标题价格地段都存了下来，并将价格+地段+贴子标题结合在一起做成了文件名。为了保证文件路径的有效性，我对标题进行了特殊符号的去除，所以多了一串冗余的代码，不需要的可以自行去掉。在信息获取完毕之后，同步创建相应文件，以便于后续存放帖子内的房源图片。代码中的cb函数是async进行map操作所必要的内部回调，如果异步操作出错调用 `cb(err,null)` 中断操作，异步操作成功则调用 `cb(null,value)` ，后续代码中的cb大致都是这个意思。在async将所有的异步操作遍历完毕之后，会调用map后的那个回调函数，我们可以利用这个回调进行下一个异步操作。  
#### *4.房源图片路径获取*  
我们已经将所有的帖子路径保存下来了，那么接下来我们就要获取帖子内所有房源图片的路径。同样的，我们可以参照上一步的步骤，将所有图片路径保存下来。但需要注意的一点是，如果帖子数量很多，用async的map函数来做request请求容易造成导致爬虫挂掉。所以为了爬虫的稳定，我决定用async的mapLimit函数来遍历帖子路径，好处是可以控制同时并发的http请求数目，让爬虫更加稳定，写法也和map函数差不多，增加了第二个参数--并发数目限制。  
```js
let houseImgUrlArray = [];
function saveAllImagePage(topicArray, callback) {
    async.mapLimit(topicArray, 10, function (obj, cb) {
        request({
            'url': obj.topicUrl,
            'method': 'GET',
            'accept-charset': 'utf-8',
            'headers': {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36"
            }
        }, (err, res, body) => {
            if (err) cb(err, null);
            let $ = cheerio.load(res.body.toString());
            let index = 0;
            $('.bigps').find('.picMove').find('li').find('img').each((i, e) => {
                index++;
                let imgUrlArray = {};
                imgUrlArray.fileName = obj.fileName;
                var imgsrc = ($(e).attr('src').indexOf('default') != -1 || $(e).attr('src').length <= 0) ? $(e).attr('data-src') : $(e).attr('src');
                imgUrlArray.imgsrc = imgsrc;
                console.log(imgUrlArray.imgsrc + '\n');
                imgUrlArray.index = index;
                houseImgUrlArray.push(imgUrlArray);
            });
            cb(null, obj.topicUrl + '\n');
        });
    }, (err, result) => {
        if (err) throw err;
        console.log(houseImgUrlArray.length);
        console.log('\n> 2 saveAllImagePage end');
        if (callback) {
            callback(null, 'task 2 saveAllImagePage');
        }
    })
}
```
由于页面中的大图采用了懒加载的模式，所以大部分图片我们无法直接从dom节点的src属性上获取图片路径，变通一下，获取dom节点的data-src属性即可获取到。获取到图片路径之后我们就可以将其储存，进行最后一步--下载图片啦~  
#### *5.房源图片下载保存*  
图片保存的文件夹信息已经记录在houseImageUrlArray里了，发送请求之后我们只需要将文件写入到对应文件夹里就行。不过我在爬虫启动的时候经常出现文件夹不存在导致爬虫中断，所以在写入文件之前，我都检查相应路径是否存在，如果不存在就直接创建文件，以免爬虫经常中断
。下载图片是一个较为繁重的操作，所以我们不妨将并发请求数控制的低一些，保证爬虫稳定性。  
```js
function saveAllImage(houseImgUrlArray, callback) {
    async.mapLimit(houseImgUrlArray, 4, function (obj, cb) {
        console.log(obj);
        if (!fs.existsSync('./rent_image/' + obj.fileName)) {
            fs.mkdirSync('./rent_image/' + obj.fileName);
        }
        request({
            'url': obj.imgsrc,
            'method': 'GET',
            'accept-charset': 'utf-8',
            'headers': {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36",
            }
        }).pipe(fs.createWriteStream('./rent_image/' + obj.fileName + '/' + obj.index + '.jpg').on('close', function () {
            cb(null, obj.title + ' img respose');
        }));
    }, (err, result) => {
        if (err) throw err;
        console.log('\n> 3 saveAllImage end');
        if (callback) {
            callback(null, 'task 3 saveAllImage');
        }
    })
}
```
通过这一步你就可以把帖子内房源的图片下载到本地文件夹啦~看到这么多图片被保存到本地，开不开心！刺不刺激！学会了你可以肆意去爬图啦！好吧，开玩笑的，规模稍微大些的网站都会做一些反爬虫策略。就拿安居客来说，懒加载勉强也算是一种反爬虫的方法，更可怕的是，如果同一ip高频率请求安居客网页，它会要求图片验证码验证，所以有时候运行爬虫什么东西都爬不到。至于这种高等爬虫技巧，等以后进阶再说吧，现在也是小白练手而已~  
#### *6.组织异步流程*  
其实靠上面那些步骤通过异步回调组织一下就已经可以形成一个完整的爬虫了。不过既然用了async，那就干脆用到底，将这些操作组织一下，让代码更好看、更有逻辑性，async的series方法就可以很轻易地帮我们组织好。
```js

function startDownload() {
    
    async.series([
        function (callback) {
            // do some stuff ...
            saveAllPage(process.argv[2], process.argv[3], callback);
        },
        function (callback) {
            // do some more stuff ...
            saveAllImagePage(topicArray, callback);
        },
        // function (callback) {
            //     // do some more stuff ...
        //     saveAllImageUrl(imgPageArray, callback);
        // },
        function (callback) {
            // do some more stuff ...
            saveAllImage(houseImgUrlArray, callback);
        }
    ],
        // optional callback
        function (err, results) {
            // results is now equal to ['one', 'two']
            if (err) throw err;
            console.log(results + ' success');
        });
}
startDownload();
```  
------------
### 本文小结  
虽然这只是一个最初级的爬虫，没有稳定性的保证，也没有反爬虫措施的破解。但是值得开心的是，它已经是可以正常运行的啦~记得写出的第一版本的时候，虽然可以记录帖子标题，但是图片无论如何也是存不全的，最多存一两百张图爬虫就结束了。多方参考之后，引入了async模块，重构代码逻辑，终于能够存一千多张图了，已经挺满意了~可以说，async模块是写这个爬虫收获最多的地方了，你们也可以用一下。  
学习nodejs之后，发现能做的事多了很多，很开心，同时也发现自己能做的还很少，很忧心。作为一个前端小白，不知道什么好的学习方法，但是我知道，能做一些对自己有用的东西总归是好的。利用所学的知识服务于生活则是更好的。每个走在成长道路上的人，都该为自己打打气，坚持走下一步。  
常规性的为自己立一个下一阶段的小目标：将nodejs与electron结合，写一个具有爬虫功能的桌面软件~也不知道能不能完成，做了再说~