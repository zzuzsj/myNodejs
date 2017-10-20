const fs = require('fs');
const cheerio = require('cheerio');
const request = require('request');
const async = require('async');

let topicArray = [];
let houseImgUrlArray = [];

startDownload();

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


function saveAllPage(startIndex, endIndex, callback) {
    let pageArray = [];
    for (let i = startIndex; i < endIndex; i++) {
        let pageUrl = 'https://hz.zu.anjuke.com/fangyuan/quanbu/p' + i;
        console.log(pageUrl);
        pageArray.push(pageUrl);
    }
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
                'Referer': 'https://anjuke.com/'
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

function DeleteFolder(path) {
    var files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) { // recurse
                DeleteFolder(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
    }
};