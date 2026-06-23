/* jslint node: true, esversion: 6 */
exports.changeDom = function (next, locals) {
	var NA = this,
		puppeteerHelper = require('./puppeteerHelper');

	puppeteerHelper.changeDomPdf(
		next,
		locals,
		NA.modules.puppeteer,
		'/ff9-guide-mots-de-passe-playonline-francais/'
	);
};
