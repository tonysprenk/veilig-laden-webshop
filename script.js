(()=>{
  const cfg = window.SHOP;
  const money = n => n.toLocaleString('nl-NL',{style:'currency',currency:'EUR'});
  const el = id => document.getElementById(id);

  function setText(id, txt){ const e = el(id); if(e) e.textContent = txt; }

  function calc(){
    const qty = Math.max(1, parseInt((el('qty')?.value||'1'),10));
    const price = Number(cfg.product.priceEur || 0);
    const shipKey = el('shipping')?.value || 'pickup';
    const ship = Number(cfg.shipping?.[shipKey] ?? 0);
    const subtotal = qty * price;
    const total = subtotal + ship;
    setText('price', price>0? money(price): '€–');
    setText('subtotal', price>0? money(subtotal): '€–');
    setText('shipcost', money(ship));
    setText('grand', price>0? money(total): '€–');

    // Payment Link (if used)
    const pay = el('paylink');
    if (pay){
      const base = cfg.stripe?.paymentLinkUrl || '#';
      let url = base;
      pay.href = url;
      pay.textContent = 'Afrekenen met Stripe';
    }
  }

  function jsonLd(){
    const data = {
      "@context":"https://schema.org/",
      "@type":"Product",
      "name": cfg.product.name,
      "sku": cfg.product.sku,
      "brand": {"@type":"Brand","name": cfg.product.brand || "Onbekend"},
      "image": ["assets/product.png"],
      "description": "Stevige kabelmat/kabelgoot voor EV-laadkabels. Buitengebruik, anti-struikel, beschermt je kabel.",
      "url": location.href,
      "offers": {
        "@type":"Offer",
        "priceCurrency":"EUR",
        "price": String(cfg.product.priceEur || 0),
        "availability":"https://schema.org/InStock",
        "url": location.href
      }
    };
    document.getElementById('jsonld-product').textContent = JSON.stringify(data);
  }

  function init(){
    setText('year', String(new Date().getFullYear()));
    setText('sku', cfg.product.sku);
    setText('price', money(cfg.product.priceEur));

    // Stripe Buy Button
    const buyWrap = document.getElementById('stripe-buybutton-wrapper');
    const buyId = cfg?.stripe?.buyButtonId;
    const pk = cfg?.stripe?.publishableKey;
    if (buyWrap && buyId && pk && !buyId.includes('HERE') && !pk.includes('HERE')){
      buyWrap.hidden = false;
      const buyEl = buyWrap.querySelector('stripe-buy-button');
      buyEl.setAttribute('buy-button-id', buyId);
      buyEl.setAttribute('publishable-key', pk);
    } else {
      buyWrap.hidden = true;
    }

    // Hide fallback if no payment link and buy button shown
    const pay = el('paylink');
    if (pay){
      const hasLink = cfg?.stripe?.paymentLinkUrl && !cfg.stripe.paymentLinkUrl.includes('YOUR_PAYMENT_LINK');
      if (!hasLink && !buyWrap.hidden){ pay.style.display = 'none'; }
    }

    el('qty')?.addEventListener('input', calc);
    el('shipping')?.addEventListener('change', calc);
    calc();
    jsonLd();
  }
  init();
})();