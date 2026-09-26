OSP Billiards Play v41

Payment UI fixes from v40:
- OSP Owner now has explicit Save Stripe Credentials button.
- OSP Owner now has explicit Save Payment Methods button.
- Direct Payment URL is persisted and the currently saved URL is shown after save.
- Venue payment screen embeds Stripe's secure card checkout inside OSP Billiards Play.
- Card numbers are handled by Stripe.js/Stripe Embedded Checkout and never pass through the OSP server.
- Cash App button opens the configured Cash App destination.
- Zelle button opens a configured URL when provided; otherwise it copies the configured Zelle email/phone for use in the user's banking app.
- Existing cash/manual activation, proof upload, owner activation/deactivation, venue roles, tournament and TV functions remain intact.
