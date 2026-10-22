# Stripe Payment Integration

Concise Stripe payment component, ready to use out of the box.

## 📁 File Description

```
stripe/
├── CheckoutForm.tsx     # Payment form component (includes Stripe initialization)
└── README.md           # This document
```

## 🚀 Quick Start

### 1. Configure Environment Variables

Create a `.env` file in the project root directory:

```bash
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key_here
```

### 2. Install Dependencies

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 3. Use Payment Form

```tsx
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise, CheckoutForm } from './stripe/CheckoutForm';

function App() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        paymentData={{
          amount: 9900,  // $99.00 USD (in cents)
          currency: 'usd',
          productIds: ['product-1'],
          customerInfo: {
            name: 'John Doe',
            email: 'john@example.com'
          }
        }}
        onSuccess={(paymentIntent) => {
          console.log('Payment successful!', paymentIntent);
        }}
        onError={(error) => {
          console.error('Payment failed:', error);
        }}
      />
    </Elements>
  );
}
```

## 🔧 Component Description

### CheckoutForm - Complete Payment Solution
Includes Stripe initialization and payment form logic:

```tsx
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise, CheckoutForm } from './stripe/CheckoutForm';

<Elements stripe={stripePromise}>
  <CheckoutForm
    paymentData={{
      amount: 5000,
      currency: 'usd',
      productIds: ['prod-1'],
      customerInfo: { name: 'User', email: 'user@example.com' }
    }}
    onSuccess={(paymentIntent) => {/* Handle success */}}
    onError={(error) => {/* Handle error */}}
  />
</Elements>
```

### Exportable Features
- `stripePromise` - Stripe instance
- `CheckoutForm` - Payment form component
- `validateStripeSetup` - Validate Stripe configuration
- `getStripeInstance` - Get Stripe instance
- `StripeConfig` - Configuration type interface

## 🧪 Testing

Use test card numbers:
- **Card Number**: 4242 4242 4242 4242
- **Expiry**: Any future date
- **CVC**: Any 3 digits

## ⚠️ Important Notes

1. **Environment Variables**: Ensure `VITE_STRIPE_PUBLIC_KEY` is correctly configured
2. **Amount Unit**: Pass amount in cents (e.g., 100 = $1.00)
3. **Edge Function**: Need to create corresponding Supabase Edge Function to handle payments

## 🔍 FAQ

**Q: Payment form is blank?**
A: Check if environment variables are correctly configured and if there are any error messages in the console

**Q: Payment failed?**  
A: Confirm if Supabase Edge Function is running normally, check network requests

**Q: How to customize styles?**
A: CheckoutForm component already includes complete functionality, you can customize layout by modifying component internal styles or wrapping with an outer div