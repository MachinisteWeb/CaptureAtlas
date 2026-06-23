/* jslint node: true, esversion: 6 */
exports.changeDom = function (next, locals) {
	var NA = this,
		puppeteerHelper = require('./puppeteerHelper');

	puppeteerHelper.changeDomPdf(next, locals, NA.modules.puppeteer, '/pdf/');
};
