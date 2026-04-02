/**
 * Stripe Webhook Handler
 * Mount point: POST /api/webhooks/stripe
 * Expects raw body (mounted in app.js before express.json())
 *
 * Supported events:
 *   - checkout.session.completed     → activates subscription
 *   - invoice.payment_failed         → marks subscription past_due
 *   - customer.subscription.deleted  → marks subscription expired/cancelled
 *   - customer.subscription.updated  → syncs plan changes
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Subscription = require('../models/Subscription');
const Notification = require('../models/Notification');

const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('❌ Stripe webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  console.log(`🔔 Stripe event: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const stripeSubId = session.subscription;
        const stripeCustomerId = session.customer;
        // Activate subscription if matched by stripeSubscriptionId or customerId
        await Subscription.findOneAndUpdate(
          { $or: [{ stripeSubscriptionId: stripeSubId }, { stripeCustomerId }] },
          { status: 'active', stripeSubscriptionId: stripeSubId, stripeCustomerId }
        );
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const sub = await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: invoice.subscription },
          { status: 'past_due' },
          { new: true }
        );
        if (sub?.userId) {
          await Notification.create({
            userId: sub.userId,
            type: 'subscription',
            title: '⚠️ Payment Failed',
            body: 'Your subscription payment failed. Please update your payment method to continue.',
            link: '/dashboard/subscribe',
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const stripeSub = event.data.object;
        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: stripeSub.id },
          { status: 'cancelled' }
        );
        break;
      }

      case 'customer.subscription.updated': {
        const stripeSub = event.data.object;
        const statusMap = {
          active: 'active',
          past_due: 'past_due',
          canceled: 'cancelled',
          trialing: 'trialing',
          unpaid: 'past_due',
        };
        const newStatus = statusMap[stripeSub.status] || 'active';
        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: stripeSub.id },
          {
            status: newStatus,
            currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
          }
        );
        break;
      }

      default:
        console.log(`ℹ️  Unhandled Stripe event: ${event.type}`);
    }
  } catch (err) {
    console.error('❌ Webhook handler error:', err.message);
    return res.status(500).json({ error: 'Internal webhook processing error' });
  }

  res.json({ received: true });
};

module.exports = { stripeWebhook };
