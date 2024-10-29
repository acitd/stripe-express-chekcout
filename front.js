function stripe_express_checkout(checkout_el,price_el,return_url,onconfirm){
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
		api('/client/update',new FormData(c1730196748i0__form)).then(res=>res?event.resolve():null);
	});
	express_checkout.on('confirm',event=>{
		stripe.confirmPayment({elements,confirmParams:{return_url}}).then(result=>{
			if(result.error){
				alert(result.error.message);
				return;
			}
			console.log(result);
			onconfirm(result.paymentIntent);
		});
	});
}
stripe_express_checkout(
	express_checkout_el,
	price_el,
	'https://eshop.teticharitou.com/checkout',
	payment_intent=>api('/buy/stripe',{payment_intent}).then(res=>{
		if(!res)return;
		c1730196748i0.close();
		location.href='/order/'+res.order.id;
	})
);
