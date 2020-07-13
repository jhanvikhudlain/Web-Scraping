let request=require("request");
let cheerio=require("cheerio");
let fs=require("fs");
let allmatchFile=require("./allmatch.js"); //path is provided

let url="https://sports.ndtv.com/ipl-2019";

request(url,cb);

function cb(error,header,body)
{
    if(error==null && header.statusCode==200)
    {
        //console.log(body);
        console.log("got the response");
        //fs.writeFileSync("page.html",body);
        parseHTML(body);
    }
    else if(header.statuscode==404)
    {
        console.log("page not found");
    }
    else
    {
        console.log(header);
        console.log(error);
    }
}

function parseHTML(body)
{
    let $=cheerio.load(body);

    let tabs=$("#subnav_hr .sub-nv_li a");
    //console.log(tabs.length);
    let fixture=$(tabs[4]);
    let fixtureLink=fixture.attr("href");
    let cLink="https://sports.ndtv.com/"+fixtureLink;

    //console.log(cLink);
    allmatchFile.allmatchHandler(cLink);
}