OSP BILLIARDS PLAY v37 — HOSTINGER/VPS

This package is complete: public/, server/, worker/, schema/, package.json.
Deploy the Node application with npm start (Node.js 22.13+); do not serve
public/ alone. Keep the existing storage/ or OSP_DATA_DIR folder unchanged.
It holds osp.sqlite, images and billing.key. Back it up before replacing files.

Owner: osp. Only the owner creates venues. Venue access begins inactive and
requires an active Stripe subscription or an owner-recorded monthly payment.
The owner can deactivate a venue immediately. The owner records cash, Cash App,
Zelle or direct payments in the venue row; each grants one calendar month and requires at least the configured monthly amount.
All venue payments appear in Monthly subscription. Team administrators can be
created by the primary venue administrator, only within that venue.

Configure the monthly amount and payment methods in osp. For Stripe, provide
public, secret and webhook signing keys and configure the webhook endpoint
https://YOUR-DOMAIN/api/stripe/webhook for:
checkout.session.completed, customer.subscription.created,
customer.subscription.updated, customer.subscription.deleted, invoice.paid,
invoice.payment_failed.
The owner's Stripe account receives the Stripe payments. Direct payment,
Cash App and Zelle require owner confirmation in the dashboard. The Stripe
portal must be enabled in the Stripe account to manage an existing subscription.

/health must return OK and /api/session must return JSON. The public Sites
preview and VPS use separate databases; this ZIP updates VPS files only.
