/* jslint node: true, esversion: 6 */
var fs = require('fs'),
	browserPromise = null,
	shutdownRegistered = false,
	systemChromiumPaths = [
		'/snap/bin/chromium',
		'/usr/bin/chromium-browser',
		'/usr/bin/chromium',
		'/usr/bin/google-chrome-stable'
	];

function resolveExecutablePath() {
	var index,
		candidate;

	if (process.env.PUPPETEER_EXECUTABLE_PATH) {
		return process.env.PUPPETEER_EXECUTABLE_PATH;
	}

	for (index = 0; index < systemChromiumPaths.length; index++) {
		candidate = systemChromiumPaths[index];

		if (fs.existsSync(candidate)) {
			return candidate;
		}
	}

	return undefined;
}

function launchOptions() {
	var options = {
		headless: true,
		args: [
			'--no-sandbox',
			'--disable-dev-shm-usage',
			'--disable-gpu'
		]
	},
	executablePath = resolveExecutablePath();

	if (executablePath) {
		options.executablePath = executablePath;
	}

	return options;
}

function registerShutdown() {
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
	registerShutdown();

	if (!browserPromise) {
		browserPromise = puppeteer.launch(launchOptions())
			.then(function (browser) {
				browser.on('disconnected', function () {
					browserPromise = null;
				});

				return browser;
			})
			.catch(function (err) {
				browserPromise = null;
				throw err;
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

exports.changeDomPdf = function (next, locals, puppeteer, urlPath) {
	var url = locals.urlRootPath + locals.webconfig.urlRelativeSubPath + urlPath;

	exports.renderPdf(puppeteer, url)
		.then(function (pdf) {
			locals.dom = pdf;
			next();
		})
		.catch(function (err) {
			console.error('[CaptureAtlas PDF]', url, err.message);
			throw err;
		});
};
