const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');



const baseurl = "https://www.bankmega.com";

var category = [""];
var res = {}

const writeJson = (filename, data) => {
    fs.writeFile(filename, data, 'utf-8', err => {
        if(err){
            console.log(err);
        }
    })
}

const get_title = (dom) => {
    const $ = cheerio.load(dom.html());
    return $('img').attr('title')
}


const traverse = (idx, page, arr, ele) => {
    return new Promise((resolve, reject) => {
        var flag = true
        // var arr = []
        request(`${baseurl}/promolainnya.php?subcat=${idx}&page=${page}`, (err, req, body) => {
            const $ = cheerio.load(body);
            if($('#promolain').find('li').length === 0){
                flag = false
            }

            $('#promolain').find('li').each(async (i, elem) => {
                var detail = {}
                const $$ = cheerio.load($(elem).html());
                const url = $$('a').attr('href');
                detail.title = get_title($$('a'));
                const details_url = url.startsWith('promo_detail') ? `${baseurl}/${url}` : url;
                
                detail = await get_detail(details_url, detail)
                arr.push(detail);
                res[ele] = arr;
                writeJson('solution.json', JSON.stringify(res));
            })
            
            resolve(flag)
        });
    })
}


const get_detail = (url, detail) => {
    return new Promise((resolve, reject) => {
        request(url, (err, req, body) => {
            const $ = cheerio.load(body);
            try {
                const content = cheerio.load($('#contentpromolain2').html());
                detail.area = content('.area b').html();
            }catch(except){
                detail.area = null;
            }

            try{
                const content = cheerio.load($('#contentpromolain2').html());
                img_content = content('.keteranganinside').find('img').attr('src');
                detail.img = baseurl + img_content;
            }catch(except){
                detail.img = null;
            }
            detail.url = url;
            resolve(detail)
        });
    })
}

function init(){
    
    request(`${baseurl}/promolainnya.php`, (err, req, body) => {
        const $ = cheerio.load(body);
        $('#subcatpromo').find('div').each((idx, ele) => {
            const $$ = cheerio.load($(ele).html());
            category.push($$('img').attr('id'));
        });

        category.forEach(async (ele, idx) => {
            if(ele !== ""){
                console.log(`Starting scrapping ${ele} category`)
                var page = 1;
                var arr = [];
                var flag = true;
                while(flag){
                    flag = await traverse(idx, page, arr, ele)
                    page++;
                }
                console.log(`${ele} category finished`);
            }
        });
    })
}

init();