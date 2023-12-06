const fs = require('fs');
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

(async () => {
    const userAgent = puppeteer.userAgent;
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setUserAgent(userAgent);
    await page.waitForTimeout(2000);
    await page.goto(
        "https://www.dns-shop.ru/catalog/17a8d26216404e77/vstraivaemye-xolodilniki/",
        {
            waitUntil: "load",
        }
    );



    let isBtnDisabled = false;
    while (!isBtnDisabled) {
        await page.waitForTimeout(7000);
        await page.waitForSelector(".catalog-product")
        const productsHandles = await page.$$(".catalog-product");
        for (const productHandle of productsHandles) {
            let title = "Null";
            let price = "Null";
            try {
                title = await page.evaluate(
                    (el) =>
                        el.querySelector("a.catalog-product__name > span")
                            .textContent,
                    productHandle
                );
            } catch (error) {}
            try {
                price = await page.evaluate(
                    (el) =>
                        el
                            .querySelector(".product-buy__price")
                            .textContent.replace(/₽.*/, "₽")
                            .trim(),
                    productHandle
                );
            } catch (error) {}

            if (title !== "null") {
                //items.push({ title, price });

                fs.appendFile('result.csv', 
                `${title.replace(/,/g, '.')},${price}\n`,
                function(err){
                    if (err) throw err;
                })
            
            }
        }
        await page.waitForSelector(
            "#products-list-pagination > ul > li:nth-child(8) > a",
            { visible: true }
        );
        const isDisabled =
            (await page.$('.pagination-widget__page-link_next.pagination-widget__page-link_disabled')) !== null;
        isBtnDisabled = isDisabled;
        if (!isDisabled) {
            await Promise.all([
                page.click("#products-list-pagination > ul > li:nth-child(8) > a"),
                page.waitForNavigation({ waitUntil: "networkidle2" })
            ]);
        }
        
    }
    

    await browser.close();
    
})();
