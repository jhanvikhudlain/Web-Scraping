let request=require("request");
let cheerio=require("cheerio");
let fs=require("fs");
let path=require("path");
let xlsx=require("xlsx");

let url="https://sports.ndtv.com/cricket/live-scorecard/chennai-super-kings-vs-royal-challengers-bangalore-match-1-chennai-ckbc03232019189310";

function matchHandler(url)
{
    request(url,cb);
}

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
    let $ = cheerio.load(body);
    let res=$(".scr_ftr-txt.matchresult");
    //console.log(res.text());

    let bothInnings=$(".ful_scr-crd .swiper-container.scr_crd_tbA .ful_scr-ul.swiper-wrapper .swiper-slide.ful_scr-li");
    let temp=$(".ful_scr-crd .swiper-container.scr_crd_tbB .swiper-wrapper#inng-slds-scr-dtl .swiper-slide .ful_scr-cnt .ful_scr-tbl");
    console.log(temp.length);

    let k=0,m=0;
    for(let i=0;i<temp.length;i++) //0,3-> batsman 1,4->extra 2,5->bowler 
    {
        if(i==0 || i==3)
        {
            if(i==0)
            {
                k=0;m=1;
            }
            else
            {
                k=1;m=0;
            }
           
            let teamNameEle=$(bothInnings[k]);
            let teamName=teamNameEle.text().split(" ");
            teamName=teamName[0].trim();
            console.log(teamName);

            let opponent=$(bothInnings[m]);
            let opponentTeam=opponent.text().split(" ");
            opponentTeam=opponentTeam[0].trim();

            let allRows=$(temp[i]).find("tr");
            //let allRows=$0;
            //console.log(allRows.length);

            for(let j=0;j<allRows.length;j++)
            {
                let allcols=$(allRows[j]).find("td");
                
                if(allcols.length>4)
                {
                    let pname = $(allcols[0]).text().split("*")[0].trim();
                    let runs = $(allcols[1]).text().trim();
                    let balls = $(allcols[2]).text().trim();
                    let fours = $(allcols[3]).text().trim();
                    let sixes = $(allcols[4]).text().trim();
                    let sr = $(allcols[5]).text().trim();
                    //console.log(pName);
                    //console.log(teamName +" " + pname +" " + runs +" " + balls +" " + sixes +" " + fours +" " + sr);
                    processPlayer(teamName,pname,runs,balls,fours,sixes,sr,opponentTeam);
                }
            }
        }
    }  
}

function excelReader(filePath, name) {
    if (!fs.existsSync(filePath)) {
        return null;
    }
    // workbook 
    let wt = xlsx.readFile(filePath);
    let excelData = wt.Sheets[name];
    let ans = xlsx.utils.sheet_to_json(excelData);
    return ans;
}

function excelWriter(filePath, json, name) {
    // console.log(xlsx.readFile(filePath));
    var newWB = xlsx.utils.book_new();
    // console.log(json);
    var newWS = xlsx.utils.json_to_sheet(json)
    xlsx.utils.book_append_sheet(newWB, newWS, name)//workbook name as param
    xlsx.writeFile(newWB, filePath);
}

function processPlayer(team,pname,runs,balls,fours,sixes,sr,opponentTeam)
{
    let obj={
        runs,balls,fours,sixes,sr,opponentTeam
    };

    let teamPath=team;
    if(!fs.existsSync(teamPath)) 
    {
        fs.mkdirSync(teamPath);
    }

    let playerFile=path.join(teamPath,pname) + '.xlsx';

    let fileData=excelReader(playerFile,pname);
    let json=fileData;

    if(fileData==null)
        json=[];

    json.push(obj);

    excelWriter(playerFile,json,pname);
}

module.exports.exp=matchHandler;