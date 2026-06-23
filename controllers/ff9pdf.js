/* jslint node: true, esversion: 6 */
exports.changeDom = function (next, locals) {
	var NA = this,
		puppeteerHelper = require('./puppeteerHelper'),
		url = locals.urlRootPath + locals.webconfig.urlRelativeSubPath + '/ff9-guide-mots-de-passe-playonline-francais/';

	puppeteerHelper.renderPdf(NA.modules.puppeteer, url)
		.then(function (pdf) {
			locals.dom = pdf;
			next();
		})
		.catch(function (err) {
			next(err);
		});
};
