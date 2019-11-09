const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

const baseurl = "https://www.bankmega.com/";

var category = [""];
var res = {}

const writeJson = (filename, data) => {
    fs.writeFile(filename, data, 'utf-8', err => {
        if(err){
            console.log(err);
        }
    })
}

const init = () => {
    request(`${baseurl}promolainnya.php`, (err, req, body) => {
        const $ = cheerio.load(body);
        $('#subcatpromo').find('div').each((idx, ele) => {
            const $$ = cheerio.load($(ele).html());
            category.push($$('img').attr('id'));
        });
        // category.forEach()
        category.forEach((ele, idx) => {
            if(ele !== ""){
                var page = 1;
                request(`${baseurl}promolainnya.php?subcat=${idx}&page=${page}`, (err, req, body) => {
                    const $ = cheerio.load(body);
                    $('#promolain').find('li').each((i, ele) => {
                        var detail = {}
                        const $$ = cheerio.load($(ele).html());
                        const url = $$('a').attr('href');
                        const details_url = url.startsWith('promo_detail') ? `${baseurl}${url}` : url;
                        
                        request(details_url, (err, req, body) => {
                            const $$ = cheerio.load(body);
                            // console.log($$('#contentpromolain2').html());
                            detail['title'] = $$('#contentpromolain2').find('div h3').html()
                            if(detail.title === null){
                                // console.log(details_url)
                            }
                            // console.log(detail)
                        })
                    })
                    // console.log($('#promolain').html());
                });
            }
        });

    })
}

init();

