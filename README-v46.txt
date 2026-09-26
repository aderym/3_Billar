OSP Billiards Play v46 — Hostinger / VPS complete files

This package includes the Node server, bundled Worker, public UI and database schema.

Changes in v46:
- OSP payment history displays clear Correct payment and Delete payment actions for manual records. Selecting an action scrolls directly to its form/confirmation. Stripe invoices remain read-only in the app.
- The venue payment gate uses a wide, two-column desktop layout with Stripe on the left and proof/history on the right. Phone screens stay in a single column.

Deployment: See INSTALL-HOSTINGER.txt and README.txt. Replace code files, then restart the Node process. Preserve your existing storage/ folder and its database, billing.key, and uploaded files. Do not run setup on an existing installation.
