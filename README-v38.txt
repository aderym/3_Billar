OSP Billiards Play — paquete completo v38 (Hostinger / VPS)

Contenido completo: public/, server/, worker/, schema/, package.json y estas instrucciones.
La instalación Node necesita Node 22.13+ y el directorio storage/ existente.

ACTUALIZAR SIN PERDER DATOS
1. Haz copia de seguridad de storage/ o la ruta OSP_DATA_DIR completa.
2. Detén el proceso Node.
3. Sustituye public/, server/, worker/, schema/ y package.json con los archivos completos de este ZIP.
4. No borres ni sobrescribas storage/: contiene la base de datos, fotos, comprobantes y billing.key.
5. Inicia el proceso Node de nuevo. Las nuevas tablas se crean automáticamente con CREATE TABLE IF NOT EXISTS.

CAMBIOS v38
- El portal de pago del venue muestra directamente los métodos disponibles.
- Direct payment abre el enlace que configura osp. Stripe se ofrece cuando osp configura importe, claves y webhook.
- Venue Admin puede enviar a osp un comprobante PNG/JPEG/WebP/PDF de hasta 3 MB tras pagar por Direct payment, Cash App o Zelle.
- osp ve comprobantes pendientes, puede descargar el archivo, rechazarlo o confirmar el pago y activar un mes.
- Enviar el comprobante NO activa acceso. osp debe verificar el ingreso y configurar el precio mensual antes de registrar la activación.
- Los comprobantes en VPS se guardan en storage/payment-proofs/.

Mira README.txt y INSTALL-HOSTINGER.txt para las instrucciones existentes.
