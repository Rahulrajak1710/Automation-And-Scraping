let puppeteer = require('puppeteer');
let fs=require('fs');
let PDFDocument = require('pdfkit');
(async () => {

  let browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      slowMo:100
    });

  let page = await browser.newPage();
  await page.goto('https://www.cowin.gov.in/');



  await page.waitForSelector("#mat-tab-label-1-1",{visible:true});
//   await page.click("#mat-tab-label-1-1");
  await page.evaluate(() => {
    document.querySelector('#mat-tab-label-1-1').click();
  });
  
//   await page.waitForSelector("#mat-input-0",{visible:true});
await page.focus("#mat-input-0");
await page.keyboard.type("125050");
await page.keyboard.press("Enter");


await page.waitForSelector(".row.ng-star-inserted",{visible:true});

let constant=await page.$$(".row.ng-star-inserted");
let obj={};
// console.log(constant.length);

for(let i=0;i<constant.length;i++){
    let record= await constant[i];

    let place =await record.$eval("div.row-disp",(ele)=>{
        return ele.innerText;
    });
    //  console.log(place.length);
    //  console.log(place);
    let  slot=[];

  let date= await page.$$("div.availability-box ul li");
  let vacsine= await page.$$("div.slot-available-main ul li");

  for(let i=0;i<7;i++){

    let vacsineDate=await date[i].$eval("p",(ele)=>{
        return ele.innerText;
    })

    // console.log(vacsineDate);
    let vacsineslot=await vacsine[i].$eval("a",(ele)=>{
        return ele.innerText;
    })
    slot.push(vacsineDate+"->"+vacsineslot);

}
obj[place]=slot;
// console.log(obj);
}

fs.writeFileSync("covidData.json",JSON.stringify(obj));


  let doc = new PDFDocument();
doc.pipe(fs.createWriteStream('covidData.pdf'));// write to PDF
doc.fontSize(10);
doc.fillColor('black');
doc.text(JSON.stringify(obj,null,2,),100,100);
// doc.pipe(res);                                       // HTTP response

// add stuff to PDF here using methods described below...

// finalize the PDF and end the stream
doc.end();



await browser.close();
 
})();

