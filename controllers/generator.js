/* jslint node: true, esversion: 6 */
exports.changeDom = function (next, locals) {
	var NA = this,
		puppeteerHelper = require('./puppeteerHelper'),
		url = locals.urlRootPath + locals.webconfig.urlRelativeSubPath + '/pdf/';

	puppeteerHelper.renderPdf(NA.modules.puppeteer, url)
		.then(function (pdf) {
			locals.dom = pdf;
			next();
		})
		.catch(function (err) {
			next(err);
		});
};
