/* TODO:

Θέλουμε να τραβάλει την πληροφορία του χρήστη από το ApplePay account του μέσω Stripe, και να την στέλνει εδώ πριν ολοκληρώσει την αγορά:

api('/client/update',{
	client_first_name:'___',
	client_last_name:'___',
	client_telephone:'___',
	client_email:'___',
	client_country_id:get_country_id('el'),  // by country code
	client_city:'___',
	client_postal_code:'___',
	client_address'___'
});

Στο παραπάνω endpoint όλα τα πεδία είναι προεραιτικά, αλλά για να προχωρήσει η πληρωμή το client_telephone, το client_email και το client_country_id είναι αναγκαστικά.
Για να επαλήθευσεις ότι η αγορά μπορεί αν προχωρήσει καλείς αυτό το endpoint
api('/client/payment/check')

*/

const stripe=Stripe(STRIPE_KEY);
var amount=parseFloat(price_el.innerText)*100;

// ELEMENTS
var elements=stripe.elements({
	mode:'payment',
	amount,
	currency:'eur'
});
var express_checkout=elements.create('expressCheckout');
express_checkout.mount(express_checkout_el);

// EVENTS
express_checkout.on('click',event=>{
	const new_amount=parseFloat(price_el.innerText)*100;
	if(new_amount!==amount){
		amount=new_amount;
		elements.update({amount});
	}
	event.resolve();
});
express_checkout.on('shippingaddresschange',event=>{
	api('/client/update',{
		client_country_id:get_country_id(event.address.country.toLowerCase()),
		client_city:event.address.city??null,
		client_postal_code:event.address.postal_code??null
	});
	event.resolve(payload);
});
express_checkout.on('confirm',event=>{
	stripe.confirmPayment({elements,confirmParams:{return_url:'https://eshop.teticharitou.com/checkout'}}).then(result=>{
		if(result.error){
			alert(result.error.message);
			return;
		}
		api('/buy/stripe',{payment_intent:result.paymentIntent}).then(res=>{
			if(!res)return;
			c1730199501i0.close();
			location.href='/order/'+res.order.id;
		});
	});
});
