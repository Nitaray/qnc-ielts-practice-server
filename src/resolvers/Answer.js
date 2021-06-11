function id(parent, args, context, info) {
	return parent.id
}

function text(parent, args, context, info) {
	return parent.text;
}

module.exports = {
	id,
	text
}