OSP Billiards Play — paquete completo v39 (Hostinger / VPS)

Reemplaza public/, server/, worker/, schema/ y package.json con estos archivos completos. Conserva storage/ (o tu carpeta OSP_DATA_DIR) para no perder cuentas, torneos, fotos, comprobantes, pagos ni billing.key. Haz una copia de seguridad antes de actualizar y reinicia el proceso Node después.

El login sigue siendo el mismo para osp, administradores y jugadores. osp abre su panel sin restricción de pagos. Si el venue está inactivo, sus cuentas van al formulario de pago y no pueden usar el torneo. Si está activo, pueden entrar al programa según su rol.

osp ahora tiene botones Activar y Desactivar separados. Desactivar bloquea de inmediato; Activar restaura un pago vigente sin crear otro cargo. Si no existe un periodo pagado vigente, Activar abre el formulario para registrar el cobro mensual confirmado (cash, Cash App, Zelle o Direct payment). Subir un comprobante no activa el venue: osp debe verificar el ingreso.

Si el precio mensual sigue en cero, osp debe configurarlo en Monthly billing & payment methods para registrar una nueva mensualidad. Stripe requiere sus claves y webhook.
