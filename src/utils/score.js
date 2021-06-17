function calculateBand(correctAnswers) {
	let band = 0;
	if (correctAnswers >= 1)
		band++

	if (correctAnswers >= 2)
		band++

	if (correctAnswers >= 4)
		band += 0.5
	
	if (correctAnswers >= 6)
		band += 0.5
	
	if (correctAnswers >= 8)
		band += 0.5

	if (correctAnswers >= 10)
		band += 0.5

	if (correctAnswers >= 13)
		band += 0.5

	if (correctAnswers >= 15)
		band += 0.5
	
	if (correctAnswers >= 19)
		band += 0.5

	if (correctAnswers >= 23)
		band += 0.5

	if (correctAnswers >= 27)
		band += 0.5

	if (correctAnswers >= 30)
		band += 0.5

	if (correctAnswers >= 33)
		band += 0.5

	if (correctAnswers >= 35)
		band += 0.5

	if (correctAnswers >= 37)
		band += 0.5

	if (correctAnswers >= 39)
		band += 0.5

	return band
}

module.exports = {
	calculateBand
}