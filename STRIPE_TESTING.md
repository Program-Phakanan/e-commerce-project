# 💳 Stripe Test Cards Reference

## Test Card Numbers

### ✅ Successful Payments

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Visa - Success (Most common) |
| `4000 0566 5566 5556` | Visa (debit) - Success |
| `5555 5555 5555 4444` | Mastercard - Success |
| `3782 822463 10005` | American Express - Success |
| `6011 1111 1111 1117` | Discover - Success |

### ❌ Failed Payments

| Card Number | Error Type |
|-------------|------------|
| `4000 0000 0000 0002` | Card declined |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0000 0000 0069` | Expired card |
| `4000 0000 0000 0127` | Incorrect CVC |
| `4000 0000 0000 0119` | Processing error |

### 🔐 3D Secure Authentication

| Card Number | Description |
|-------------|-------------|
| `4000 0025 0000 3155` | Requires authentication (success) |
| `4000 0082 6000 0000` | Requires authentication (declined) |

## Test Data for Other Fields

### Expiration Date
- Use any **future date**
- Format: `MM/YY`
- Example: `12/34`

### CVC
- Use any **3 digits** for Visa, Mastercard, Discover
- Use any **4 digits** for American Express
- Example: `123` or `1234`

### ZIP Code
- Use any **5 digits**
- Example: `12345`

## PromptPay Testing (Thailand)

In **Test Mode**, Stripe simulates PromptPay payments:

1. Select PromptPay as payment method
2. QR code will be displayed
3. Payment is automatically marked as successful after a few seconds
4. No actual scanning required in test mode

## Testing Webhooks Locally

### Using Stripe CLI

1. **Install Stripe CLI**
   ```bash
   # Windows (using Scoop)
   scoop install stripe
   
   # Or download from https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe**
   ```bash
   stripe login
   ```

3. **Forward webhooks to local server**
   ```bash
   stripe listen --forward-to localhost:3000/api/payment/stripe/webhook
   ```

4. **Get webhook signing secret**
   The CLI will display a webhook secret like `whsec_...`
   Add this to your `.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

5. **Trigger test events**
   ```bash
   stripe trigger checkout.session.completed
   stripe trigger payment_intent.succeeded
   ```

## Testing Flow

### 1. Test Successful Payment
1. Add items to cart
2. Go to checkout
3. Select "Credit Card" payment method
4. Use card: `4242 4242 4242 4242`
5. Enter any future expiry, any CVC, any ZIP
6. Complete payment
7. Verify order status changes to "Paid"

### 2. Test Failed Payment
1. Add items to cart
2. Go to checkout
3. Select "Credit Card" payment method
4. Use card: `4000 0000 0000 0002` (declined)
5. Payment should fail with error message

### 3. Test PromptPay
1. Add items to cart
2. Go to checkout
3. Select "PromptPay" payment method
4. QR code should be displayed
5. In test mode, payment auto-completes

### 4. Test Webhook
1. Make a test payment
2. Check Stripe Dashboard > Developers > Webhooks
3. Verify webhook was received
4. Check your database - order status should be "Paid"

## Stripe Dashboard

### Test Mode vs Live Mode

**Test Mode** (Orange banner):
- Use test API keys (`pk_test_...`, `sk_test_...`)
- No real money involved
- Test cards work

**Live Mode** (Green banner):
- Use live API keys (`pk_live_...`, `sk_live_...`)
- Real money transactions
- Real cards only

### Useful Dashboard Pages

- **Payments**: See all test payments
- **Customers**: See test customers
- **Products**: Manage products (if using Stripe Products)
- **Webhooks**: Monitor webhook events
- **Logs**: Debug API requests
- **Developers > API keys**: Get your keys
- **Developers > Webhooks**: Configure webhooks

## Common Issues

### Webhook not working
- ✅ Check `STRIPE_WEBHOOK_SECRET` is set correctly
- ✅ Verify webhook URL in Stripe Dashboard
- ✅ Check Vercel function logs
- ✅ Ensure webhook endpoint is deployed

### Payment succeeds but order not updated
- ✅ Check webhook is configured
- ✅ Verify webhook secret matches
- ✅ Check database has "Paid" status in OrderStatus table
- ✅ Look at Stripe webhook logs for errors

### PromptPay not showing
- ✅ Ensure payment method includes `'promptpay'` in checkout session
- ✅ Currency must be `'thb'`
- ✅ PromptPay only works for Thailand

## Resources

- 📖 [Stripe Testing Docs](https://stripe.com/docs/testing)
- 💳 [Test Card Numbers](https://stripe.com/docs/testing#cards)
- 🔗 [Webhooks Guide](https://stripe.com/docs/webhooks)
- 🇹🇭 [PromptPay Docs](https://stripe.com/docs/payments/promptpay)

---

**Pro Tip:** Always test in Test Mode first before going live! 🚀
