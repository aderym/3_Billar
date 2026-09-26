OSP Billiards Play — paquete completo v40 (Hostinger / VPS)

En el enlace principal se muestra siempre primero el formulario de login, aunque el navegador conserve una sesión anterior. osp, el admin y los jugadores usan el mismo formulario. Después del login se verifica el acceso del venue: si está activo se abre el programa, y si está inactivo se muestra la pantalla de pago. osp abre su panel sin bloqueo de pago.

El botón View Project de osp conserva su acceso directo a la vista del venue. El botón de regresar al panel del dueño también conserva esa navegación. El logo del login y pago es más grande y el checkbox de Show password tiene el tamaño normal.

Instalación: detén Node, haz copia de seguridad de storage/ o OSP_DATA_DIR, reemplaza public/, server/, worker/, schema/ y package.json con los archivos completos de este ZIP y reinicia Node. Conserva storage/ y billing.key sin sobrescribir para preservar cuentas, torneos, pagos y comprobantes. Revisa README.txt e INSTALL-HOSTINGER.txt para los demás detalles.
