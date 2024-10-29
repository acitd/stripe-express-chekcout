/* Stripe setup */
const stripe = Stripe(STRIPE_KEY);
let amount = parseFloat(price_el.innerText) * 100;

// ELEMENTS
const elements = stripe.elements({
    mode: 'payment',
    amount,
    currency: 'eur'
});

const expressCheckout = elements.create('expressCheckout');
expressCheckout.mount(express_checkout_el);

// EVENTS
expressCheckout.on('click', event => {
    const new_amount = parseFloat(price_el.innerText) * 100;
    if (new_amount !== amount) {
        amount = new_amount;
        elements.update({ amount });
    }
    event.resolve();
});

// CONFIRM PAYMENT WITH CLIENT DETAILS FROM APPLE PAY
expressCheckout.on('confirm', async event => {
	try {
		// Confirm Payment and retrieve client details from Apple Pay
		const result = await stripe.confirmPayment({
			elements,
			confirmParams: {
				return_url: 'https://eshop.teticharitou.com/checkout',
			},
		});

		if (result.error) {
			alert(result.error.message);
			return;
		}

		// Extract client details from Apple Pay
		const { paymentIntent, paymentMethod } = result;
		const clientDetails = paymentMethod.billing_details;

		// Send client details to your backend endpoint
		await api('/client/update', {
			client_first_name: clientDetails.name.split(' ')[0] || '',
			client_last_name: clientDetails.name.split(' ')[1] || '',
			client_telephone: clientDetails.phone || '',
			client_email: clientDetails.email || '',
			client_country_id: get_country_id(clientDetails.address.country || 'el'),
			client_city: clientDetails.address.city || '',
			client_postal_code: clientDetails.address.postal_code || '',
			client_address: clientDetails.address.line1 || ''
		});

		// Check if purchase can proceed
		const canProceed = await api('/client/payment/check');
		if (!canProceed) {
			alert("Payment cannot proceed. Please complete all required fields.");
			return;
		}

		// Complete the purchase
		const response = await api('/buy/stripe', { payment_intent: paymentIntent });
		if (response) {
			c1730199501i0.close();
			location.href = '/order/' + response.order.id;
		}

	} catch (error) {
		console.error("Error in payment confirmation:", error);
		alert("Payment failed. Please try again.");
	}
});
