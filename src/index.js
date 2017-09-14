'use strict';

/**
 * Adds commas to a number
 * @param {number} number
 * @param {string} locale
 * @return {string}
 */
 
module.exports = function(number, locale) {
    return number.toLocaleString(locale);
};

module.exports = {
	connect: require('./connect.js'),
	initializeStreams: require('./initializeStreams.js'),
	utils: require('./utils.js')
}