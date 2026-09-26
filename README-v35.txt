OSP Billiards Play - Hostinger Complete v35

This version is an additive update to v34. Existing tournament and account data is preserved when the existing storage directory is retained.

Owner (osp) changes:
- View Project button for each venue. Opens that venue under the authenticated OSP owner session.
- Activate / Deactivate control for every venue.
- Manual activation supports cash or other externally confirmed payments.
- Monthly price is independent of Stripe.
- Optional Stripe configuration remains available.
- Configurable Direct Payment URL.
- Configurable Cash App value/link.
- Configurable Zelle email/phone.
- Configurable payment instructions.
- Default Direct Payment URL: https://app.autobooks.co/pay/e-and-i-construction

Venue access changes:
- If monthly billing is enabled and venue access is inactive, the venue administrator is sent to the payment screen.
- Payment screen shows every payment method configured by OSP.
- "I already paid - Check access" refreshes access after OSP confirms/activates the venue.
- Stripe subscriptions can activate access automatically; OSP manual activate/deactivate overrides automatic access.

Team administration:
- The first administrator created with a venue is the Venue Owner / Primary Admin.
- The Venue Owner / Primary Admin can add team administrators from Venue Access.
- Secondary administrators cannot create venues or additional administrators.
- OSP retains full owner control.

VPS DATA SAFETY:
Keep your existing OSP_DATA_DIR/storage folder when updating. Replace the application files, not the live storage database. New database tables are created additively on startup.
