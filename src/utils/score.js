function calculateBand(correctAnswers) {
	let band = 0;
	if (correctAnswers >= 1)
		band++						// 1.0

	if (correctAnswers >= 2)
		band++						// 2.0

	if (correctAnswers >= 4)
		band += 0.5					// 2.5
	
	if (correctAnswers >= 6)
		band += 0.5					// 3.0
	
	if (correctAnswers >= 8)
		band += 0.5					// 3.5

	if (correctAnswers >= 10)
		band += 0.5					// 4.0

	if (correctAnswers >= 13)
		band += 0.5					// 4.5

	if (correctAnswers >= 15)
		band += 0.5					// 5.0
	
	if (correctAnswers >= 19)
		band += 0.5					// 5.5

	if (correctAnswers >= 23)
		band += 0.5					// 6.0

	if (correctAnswers >= 27)
		band += 0.5					// 6.5

	if (correctAnswers >= 30)
		band += 0.5					// 7.0

	if (correctAnswers >= 33)
		band += 0.5					// 7.5

	if (correctAnswers >= 35)
		band += 0.5					// 8.0

	if (correctAnswers >= 37)
		band += 0.5					// 8.5

	if (correctAnswers >= 39)
		band += 0.5					// 9.0

	return band
}

module.exports = {
	calculateBand
}