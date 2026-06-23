/* jslint node: true, esversion: 6 */
var browserPromise = null,
	shutdownRegistered = false;

function launchOptions() {
	return {
		headless: true,
		args: [
			'--no-sandbox',
			'--disable-dev-shm-usage',
			'--disable-gpu'
		]
	};
}

function registerShutdown(puppeteer) {
	if (shutdownRegistered) {
		return;
	}

	shutdownRegistered = true;

	function closeBrowser() {
		if (!browserPromise) {
			return Promise.resolve();
		}

		return browserPromise
			.then(function (browser) {
				return browser.close();
			})
			.catch(function () {
				return undefined;
			})
			.finally(function () {
				browserPromise = null;
			});
	}

	process.on('exit', function () {
		closeBrowser();
	});

	['SIGINT', 'SIGTERM', 'SIGHUP'].forEach(function (signal) {
		process.on(signal, function () {
			closeBrowser().finally(function () {
				process.exit(0);
			});
		});
	});
}

function getBrowser(puppeteer) {
	registerShutdown(puppeteer);

	if (!browserPromise) {
		browserPromise = puppeteer.launch(launchOptions()).then(function (browser) {
			browser.on('disconnected', function () {
				browserPromise = null;
			});

			return browser;
		});
	}

	return browserPromise;
}

exports.renderPdf = function (puppeteer, url, pdfOptions) {
	var options = pdfOptions || {};

	return getBrowser(puppeteer).then(function (browser) {
		return browser.newPage().then(function (page) {
			return page.goto(url, {
				waitUntil: 'networkidle2',
				timeout: 30000
			}).then(function () {
				return page.pdf(Object.assign({ format: 'A4' }, options));
			}).finally(function () {
				return page.close();
			});
		});
	});
};
