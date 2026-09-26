OSP BILLIARDS PLAY — PAQUETE COMPLETO NODE.JS PARA HOSTINGER / VPS

Esta versión contiene public/, server/, worker/, schema/ y package.json.
Usa Node.js 22.13 o superior. En Hostinger despliega el ZIP como aplicación
Node.js, con npm start y el dominio apuntando al proceso Node. No uses .htaccess
para /api: las rutas de login, torneos, pagos y webhook requieren Node.

ACTUALIZAR SIN PERDER DATOS
1. Haz copia de seguridad de storage/ (o toda la carpeta OSP_DATA_DIR),
   incluyendo osp.sqlite, fotos, tv-images y billing.key.
2. Detén el proceso Node; reemplaza public/, server/, worker/, schema/ y
   package.json con los del ZIP. NO borres ni reemplaces storage/.
3. Reinicia con npm start. La aplicación crea las dos nuevas tablas de cobro
   en la base SQLite existente; no borra locales, usuarios ni torneos.
4. /health debe mostrar OK y /api/session debe devolver JSON.

PRIMER INGRESO
La cuenta original del propietario es username osp, password 10101010.
Entra como osp y cambia la contraseña en el panel del propietario antes de
crear locales. Solo osp crea locales y administradores; los administradores
de un local crean jugadores. No es necesario ejecutar npm run setup.

COBROS STRIPE
En el panel osp introduce precio mensual USD, Stripe Public Key, Stripe Secret
Key y el secreto de firma del webhook (whsec_...). En Stripe registra
https://TU-DOMINIO/api/stripe/webhook para estos eventos:
checkout.session.completed, customer.subscription.created,
customer.subscription.updated y customer.subscription.deleted.
El administrador de cada local paga desde Venue access. Los locales existentes
tienen 30 días de prueba al activar los cobros. Nuevos locales creados con
cobros activos también reciben 30 días. El precio modificado se aplica a nuevas
suscripciones; para cambiar las existentes usa Stripe Billing. Las claves
secretas se guardan cifradas y el archivo storage/billing.key es necesario para
leerlas después de una migración. No publiques storage/ ni lo incluyas en ZIP.

Las bases de ChatGPT Sites y VPS siguen siendo independientes; este paquete
conserva los datos de tu instalación VPS cuando mantienes su storage/.
