const combineAddress = (address: {
	street: string
	city: string
	state: string
	zip: string
}) => {
	return `${address.street}, ${address.city}, ${address.state} ${address.zip}`
}

export { combineAddress }
