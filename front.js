const stripe=Stripe('pk_test_51NSJEjHHfzMEXIdV09EGF7ORsL8KPaHH7UhlUrsO2BEczBjupB1lqT3V6PyKBFapNBhj3StV6fvHR3hksCNtKOBX00ei3Nw8bL');
var amount=parseFloat(price_el.innerText)*100;
const elements=stripe.elements({
	mode:'payment',
	amount,
	currency:'eur'
});
const express_checkout=elements.create('expressCheckout');
express_checkout.mount(express_checkout_el);
express_checkout.on('click',event=>{
	const new_amount=parseFloat(price_el.innerText)*100;
	if(new_amount!==amount){
		amount=new_amount;
		elements.update({amount});
	}
	//api('/client/update',new FormData(c1730199501i0__form)).then(res=>res?event.resolve():null);
	//get_country_id('el')
	event.resolve();
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
