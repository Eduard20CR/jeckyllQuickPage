const readXlsxFile = require("read-excel-file/node");
const puppeteer = require("puppeteer");

const fs = require("fs/promises");

const urlToGo = `file:///Users/oscar.vasquez/Downloads/03_sites/educational_jeckyll/NOBORRAR/index.html`;

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  // const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1080, deviceScaleFactor: 1 });
  await page.goto(urlToGo);

  const [options, ...data] = await readXlsxFile("./articles.xlsx");

  for (const [title, layout, direction, language, slideshow, order, text] of data) {
    const layoutInput = await page.$("#layout");
    const directionInput = await page.$("#direction");
    const languageInput = await page.$("#language");
    const slideShowInput = await page.$("#slideshow");

    await page.$eval("#markdown", (input) => {
      return (input.value = "");
    });
    await page.$eval(
      "#order",
      (input, order) => {
        return (input.value = order);
      },
      order
    );
    await layoutInput.select(layout);
    await directionInput.select(direction);
    await languageInput.select(language);
    await slideShowInput.select(`${slideshow}`);

    await page.$eval("#main", (input, args) => (input.value = args), text);

    await page.click("#btnSubmit");
    await new Promise((r) => setTimeout(r, 500));

    const mdContent = await page.$eval("#markdown", (input) => {
      return input.value;
    });

    await fs.writeFile(`./md/${title}.md`, mdContent);
  }

  console.log("Doneee....");
  browser.close();
})();
