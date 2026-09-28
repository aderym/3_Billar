(() => {
  'use strict';

  const dictionaries = {
    en: {
      label: 'English',
      language: 'Language',
      english: 'English',
      spanish: 'Español',
      signIn: 'Sign in',
      signOut: 'Sign out',
      login: 'Login',
      password: 'Password',
      usernameEmailPhone: 'Username / email / phone',
      myProfile: 'My profile',
      loadingVenue: 'Loading venue…',
      broadcastUnavailable: 'Broadcast unavailable',
      monthlyPaymentRequired: 'Monthly payment required',
      paySecurelyByCard: 'Pay securely by card',
      sendPaymentProof: 'Send payment proof to OSP',
      paymentHistory: 'Payment history',
      noPaymentsRecorded: 'No payments recorded yet.',
      paymentMethod: 'Payment method',
      directPayment: 'Direct payment',
      amountPaidUsd: 'Amount paid (USD)',
      transactionReference: 'Transaction reference (optional)',
      receiptImage: 'Receipt image or PDF (up to 3 MB)',
      sendProof: 'Send proof to OSP',
      alreadyPaid: 'I already paid · Check access',
      otherWaysToPay: 'Other ways to pay',
      payMyAccount: 'Pay my account · payment options',
      monthlySubscription: 'Monthly subscription',
      accessActive: 'ACTIVE',
      paymentDue: 'PAYMENT DUE',
      manageStripe: 'Manage Stripe subscription',
      reloadCardForm: 'Reload card form',
      noElectronicPayment: 'No electronic payment method is configured. Contact OSP to arrange payment.',
      ownerDashboard: 'Owner Dashboard',
      venuesBilling: 'Venues & billing',
      changeInitialPassword: 'Change initial password',
      currentPassword: 'Current password',
      newPassword: 'New password',
      saveNewPassword: 'Save new password',
      save: 'Save',
      cancel: 'Cancel',
      close: 'Close',
      yes: 'Yes',
      no: 'No'
    },
    es: {
      label: 'Español',
      language: 'Idioma',
      english: 'English',
      spanish: 'Español',
      signIn: 'Iniciar sesión',
      signOut: 'Cerrar sesión',
      login: 'Iniciar sesión',
      password: 'Contraseña',
      usernameEmailPhone: 'Usuario / correo / teléfono',
      myProfile: 'Mi perfil',
      loadingVenue: 'Cargando local…',
      broadcastUnavailable: 'Transmisión no disponible',
      monthlyPaymentRequired: 'Pago mensual requerido',
      paySecurelyByCard: 'Paga de forma segura con tarjeta',
      sendPaymentProof: 'Enviar comprobante de pago a OSP',
      paymentHistory: 'Historial de pagos',
      noPaymentsRecorded: 'Todavía no hay pagos registrados.',
      paymentMethod: 'Método de pago',
      directPayment: 'Pago directo',
      amountPaidUsd: 'Monto pagado (USD)',
      transactionReference: 'Referencia de transacción (opcional)',
      receiptImage: 'Imagen o PDF del comprobante (hasta 3 MB)',
      sendProof: 'Enviar comprobante a OSP',
      alreadyPaid: 'Ya pagué · Comprobar acceso',
      otherWaysToPay: 'Otras formas de pago',
      payMyAccount: 'Pagar mi cuenta · opciones de pago',
      monthlySubscription: 'Suscripción mensual',
      accessActive: 'ACTIVO',
      paymentDue: 'PAGO PENDIENTE',
      manageStripe: 'Administrar suscripción de Stripe',
      reloadCardForm: 'Recargar formulario de tarjeta',
      noElectronicPayment: 'No hay ningún método de pago electrónico configurado. Contacta a OSP para coordinar el pago.',
      ownerDashboard: 'Panel del propietario',
      venuesBilling: 'Locales y cobros',
      changeInitialPassword: 'Cambiar contraseña inicial',
      currentPassword: 'Contraseña actual',
      newPassword: 'Nueva contraseña',
      saveNewPassword: 'Guardar nueva contraseña',
      save: 'Guardar',
      cancel: 'Cancelar',
      close: 'Cerrar',
      yes: 'Sí',
      no: 'No'
    }
  };

  const phrases = {
    'Sign in': 'signIn', 'Sign out': 'signOut', Login: 'login', Password: 'password',
    'Username / email / phone': 'usernameEmailPhone', 'My profile': 'myProfile',
    'Loading venue…': 'loadingVenue', 'Broadcast unavailable': 'broadcastUnavailable',
    'Monthly payment required': 'monthlyPaymentRequired', 'Pay securely by card': 'paySecurelyByCard',
    'Send payment proof to OSP': 'sendPaymentProof', 'Payment history': 'paymentHistory',
    'No payments recorded yet.': 'noPaymentsRecorded', 'Payment method': 'paymentMethod',
    'Direct payment': 'directPayment', 'Amount paid (USD)': 'amountPaidUsd',
    'Transaction reference (optional)': 'transactionReference',
    'Receipt image or PDF (up to 3 MB)': 'receiptImage', 'Send proof to OSP': 'sendProof',
    'I already paid · Check access': 'alreadyPaid', 'Pay my account · payment options': 'payMyAccount',
    'Monthly subscription': 'monthlySubscription', 'ACTIVE': 'accessActive', 'PAYMENT DUE': 'paymentDue',
    'Manage Stripe subscription': 'manageStripe', 'Reload card form': 'reloadCardForm',
    'Owner Dashboard': 'ownerDashboard', 'Venues & billing': 'venuesBilling',
    'Change initial password': 'changeInitialPassword', 'Current password': 'currentPassword',
    'New password': 'newPassword', 'Save new password': 'saveNewPassword', Save: 'save',
    Cancel: 'cancel', Close: 'close'
  };

  // Substrings cover dynamic sentences that contain values such as prices,
  // dates or player names. Add new English -> Spanish pairs here as features grow.
  const replacements = language => language === 'es' ? [
    ['Need a player account or password reset?', '¿Necesitas una cuenta de jugador o restablecer tu contraseña?'],
    ['Enter your owner, administrator, or player account.', 'Ingresa con tu cuenta de propietario, administrador o jugador.'],
    ['Show password', 'Mostrar contraseña'],
    ['OSP BILLIARDS PLAY · VENUE ACCESS', 'OSP BILLIARDS PLAY · ACCESO AL LOCAL'],
    ['Monthly payment required', 'Pago mensual requerido'],
    ['Venue access is inactive.', 'El acceso al local está inactivo.'],
    ['OSP has not set the monthly amount yet.', 'OSP aún no ha establecido el monto mensual.'],
    ['Access returns after a confirmed Stripe payment or after OSP records your payment and activates this venue for one month.', 'El acceso se restablece después de confirmar el pago en Stripe o cuando OSP registre tu pago y active este local por un mes.'],
    ['Enter your card information below. Stripe processes the card securely; OSP never receives the card number.', 'Ingresa los datos de tu tarjeta. Stripe procesa la tarjeta de forma segura; OSP nunca recibe el número de tarjeta.'],
    ['After paying by direct link, Cash App, or Zelle, upload your receipt.', 'Después de pagar mediante enlace directo, Cash App o Zelle, sube tu comprobante.'],
    ['OSP reviews it and records your monthly payment. Submitting a receipt does not activate access automatically.', 'OSP lo revisará y registrará tu pago mensual. Enviar un comprobante no activa el acceso automáticamente.'],
    ['Monthly amount:', 'Monto mensual:'],
    ['Proofs sent to OSP', 'Comprobantes enviados a OSP'],
    ['No proofs sent yet.', 'Todavía no hay comprobantes enviados.'],
    ['Pay with Cash App', 'Pagar con Cash App'],
    ['Pay with Zelle', 'Pagar con Zelle'],
    ['Direct Payment ↗', 'Pago directo ↗'],
    ['Pay securely by card', 'Paga de forma segura con tarjeta'],
    ['Loading secure card form…', 'Cargando formulario seguro de tarjeta…'],
    ['Reload card form', 'Recargar formulario de tarjeta'],
    ['Messages & callouts', 'Mensajes y avisos'],
    ['Match assignments notify players automatically when a table becomes ready.', 'Las asignaciones de partidas avisan automáticamente a los jugadores cuando una mesa está lista.'],
    ['Next players, sponsor message or tournament notice', 'Próximos jugadores, mensaje del patrocinador o aviso del torneo'],
    ['e.g. Table 2 is ready', 'ej. La mesa 2 está lista'],
    ['Venue access', 'Acceso al local'],
    ['Manage team administrators, player accounts, and monthly billing for this venue.', 'Administra los usuarios del equipo, las cuentas de jugadores y el cobro mensual de este local.'],
    ['Owner control center for project review, venue access, team accounts, and payments.', 'Centro del propietario para revisar el proyecto, administrar locales, cuentas del equipo y pagos.'],
    ['Venues', 'Locales'],
    ['Monthly billing & payment methods', 'Cobro mensual y métodos de pago'],
    ['Only OSP can change these settings. Venues see these payment options automatically when their access is inactive.', 'Solo OSP puede cambiar esta configuración. Los locales verán estas opciones automáticamente cuando su acceso esté inactivo.'],
    ['Monthly price (USD)', 'Precio mensual (USD)'],
    ['Save Monthly Price', 'Guardar precio mensual'],
    ['Current monthly price:', 'Precio mensual actual:'],
    ['Stripe card payments', 'Pagos con tarjeta mediante Stripe'],
    ['Stripe Public Key', 'Clave pública de Stripe'],
    ['Stripe Secret Key', 'Clave secreta de Stripe'],
    ['SAVED · leave blank to keep current key', 'GUARDADA · déjala vacía para conservar la clave actual'],
    ['Save Stripe Credentials', 'Guardar credenciales de Stripe'],
    ['✓ Stripe card payments are enabled.', '✓ Los pagos con tarjeta de Stripe están habilitados.'],
    ['Other payment methods', 'Otros métodos de pago'],
    ['PAYMENT SETTINGS v42', 'CONFIGURACIÓN DE COBROS v42'],
    ['Only OSP can change these settings.', 'Solo OSP puede cambiar esta configuración.'],
    ['Venues see these payment options automatically when their access is inactive.', 'Los locales verán estas opciones automáticamente cuando su acceso esté inactivo.'],
    ['Direct payment link', 'Enlace de pago directo'],
    ['Cash App', 'Cash App'],
    ['Zelle', 'Zelle'],
    ['Payment instructions / note', 'Instrucciones / nota de pago'],
    ['Save Payment Methods', 'Guardar métodos de pago'],
    ['Current direct payment:', 'Pago directo actual:'],
    ['Stripe webhook URL:', 'URL del webhook de Stripe:'],
    ['Direct Payment, Cash App and Zelle can be changed at any time and venues receive the saved values immediately.', 'El pago directo, Cash App y Zelle pueden cambiarse en cualquier momento y los locales reciben inmediatamente los valores guardados.'],
    ['Change owner password', 'Cambiar contraseña del propietario'],
    ['are enabled.', 'están habilitados.'],
    ['Create venue with Venue Owner', 'Crear local con propietario'],
    ['Add administrator to a venue', 'Agregar administrador a un local'],
    ['Manage', 'Administrar'],
    ['Project', 'Proyecto'],
    ['Payments', 'Pagos'],
    ['Deactivate', 'Desactivar'],
    ['Activate', 'Activar'],
    ['Primary:', 'Principal:'],
    ['administrator(s)', 'administrador(es)'],
    ['ACTIVE', 'ACTIVO'],
    ['INACTIVE', 'INACTIVO'],
    ['Price pending from OSP', 'Precio pendiente de OSP'],
    ['Hide payment options', 'Ocultar opciones de pago'],
    ['Pay my account · payment options', 'Pagar mi cuenta · opciones de pago'],
    ['First recorded meeting', 'Primer enfrentamiento registrado'],
    ['Bracket & scores', 'Cuadro y puntuaciones'],
    ['Players & analysis', 'Jugadores y análisis'],
    ['Tables & cameras', 'Mesas y cámaras'],
    ['Tournament setup', 'Configuración del torneo'],
    ['● Shared server', '● Servidor compartido'],
    ['● Local mode', '● Modo local'],
    ['● In play', '● En juego'],
    ['Ready for next match', 'Listo para la próxima partida'],
    ['Camera can be connected when assigned', 'La cámara puede conectarse cuando sea asignada'],
    ['Tournament command center', 'Centro de control del torneo'],
    ['Save each game and see which players and tables are next.', 'Guarda cada juego y mira qué jugadores y mesas siguen.'],
    ['Live matches', 'Partidas en vivo'],
    ['Matches played', 'Partidas jugadas'],
    ['Prize pool', 'Bolsa de premios'],
    ['Single elimination', 'Eliminación sencilla'],
    ['Double elimination', 'Doble eliminación'],
    ['Round robin', 'Todos contra todos'],
    ['Triple elimination', 'Eliminación triple'],
    ['No money entry', 'Sin inscripción pagada'],
    ['Save each game to advance the match and schedule the next players.', 'Guarda cada juego para avanzar la partida y programar a los próximos jugadores.'],
    ['Players exit after three match losses.', 'Los jugadores salen después de perder tres partidas.'],
    ['Select the format before generating matches.', 'Selecciona el formato antes de generar las partidas.'],
    ['Mark a game winner and save.', 'Marca el ganador del juego y guarda.'],
    ['Matches are generated from the player order.', 'Las partidas se generan según el orden de los jugadores.'],
    ['Track match results, individual game wins and losses, and ball points separately.', 'Registra por separado los resultados, las victorias y derrotas de cada juego y los puntos de bolas.'],
    ['Login active', 'Acceso activo'],
    ['Login disabled', 'Acceso desactivado'],
    ['Login account missing', 'Cuenta de acceso inexistente'],
    ['Each table can show several camera angles and its current match.', 'Cada mesa puede mostrar varios ángulos de cámara y su partida actual.'],
    ['Set the tournament date, streaming destinations, and start time before inviting players.', 'Configura la fecha, los destinos de transmisión y la hora de inicio antes de invitar jugadores.'],
    ['Straight pool', 'Bola nueve / pool libre'],
    ['One pocket', 'Una tronera'],
    ['Bank pool', 'Bank pool'],
    ['Table cameras', 'Cámaras de mesa'],
    ['Add a table to connect cameras.', 'Agrega una mesa para conectar cámaras.'],
    ['Attach more than one USB camera to capture different angles of this table.', 'Conecta más de una cámara USB para capturar distintos ángulos de esta mesa.'],
    ['Switch devices', 'Cambiar dispositivos'],
    ['Start angle', 'Iniciar ángulo'],
    ['Sponsor or tournament notice', 'Aviso del patrocinador o del torneo'],
    ['Stand by for the next match assignments', 'Espera las próximas asignaciones de partidas'],
    ['Players will appear when assigned', 'Los jugadores aparecerán cuando sean asignados'],
    ['Tournament bracket pending', 'Cuadro del torneo pendiente'],
    ['Table pending', 'Mesa pendiente'],
    ['No tables configured', 'No hay mesas configuradas'],
    ['Live scores update when a game is saved', 'Las puntuaciones en vivo se actualizan al guardar un juego'],
    ['Live tournament results', 'Resultados del torneo en vivo'],
    ['Tournament announcements', 'Avisos del torneo'],
    ['Create player from request', 'Crear jugador desde la solicitud'],
    ['Add player', 'Agregar jugador'],
    ['Profile photo', 'Foto de perfil'],
    ['Choose result', 'Elegir resultado'],
    ['✓ Won game', '✓ Ganó el juego'],
    ['Mark win', 'Marcar victoria'],
    ['The table is free. The next pairing will be assigned when the other required results arrive.', 'La mesa está libre. La próxima pareja se asignará cuando lleguen los demás resultados necesarios.'],
    ['Main navigation', 'Navegación principal'],
    ['Venue sync active', 'Sincronización del local activa'],
    ['Local preview', 'Vista previa local'],
    ['Changes are shared with your venue.', 'Los cambios se comparten con tu local.'],
    ['Changes are saved on this device.', 'Los cambios se guardan en este dispositivo.'],
    ['Camera access needs HTTPS or localhost.', 'El acceso a la cámara requiere HTTPS o localhost.'],
    ['Angle started. Keep this page open to broadcast.', 'Ángulo iniciado. Mantén esta página abierta para transmitir.'],
    ['Venue logo removed.', 'Logotipo del local eliminado.'],
    ['Account photo removed.', 'Foto de la cuenta eliminada.'],
    ['Venue activated for the remaining paid period.', 'Local activado por el período pagado restante.'],
    ['Venue deactivated.', 'Local desactivado.'],
    ['Payment information copied.', 'Información de pago copiada.'],
    ['Request updated.', 'Solicitud actualizada.'],
    ['Request no longer available.', 'La solicitud ya no está disponible.'],
    ['Invitation link copied.', 'Enlace de invitación copiado.'],
    ['Copy the link shown on screen.', 'Copia el enlace que aparece en pantalla.'],
    ['Join this pool tournament', 'Únete a este torneo de pool'],
    ['Why can’t you join this tournament?', '¿Por qué no puedes unirte a este torneo?'],
    ['You joined the tournament.', 'Te uniste al torneo.'],
    ['Your response was sent.', 'Tu respuesta fue enviada.'],
    ['Registration is closed.', 'Las inscripciones están cerradas.'],
    ['Photo removed.', 'Foto eliminada.'],
    ['Alerts enabled.', 'Alertas activadas.'],
    ['Use this page for match calls.', 'Usa esta página para recibir llamados de partidas.'],
    ['Response sent to your administrator.', 'Respuesta enviada a tu administrador.'],
    ['TV announcement removed.', 'Aviso de TV eliminado.'],
    ['Keys saved on this device.', 'Claves guardadas en este dispositivo.'],
    ['Wait until current changes are saved.', 'Espera a que se guarden los cambios actuales.'],
    ['Tournament imported.', 'Torneo importado.'],
    ['Announcement published to the TV display.', 'Aviso publicado en la pantalla de TV.'],
    ['Your request was sent to the administrator.', 'Tu solicitud fue enviada al administrador.'],
    ['Password reset. Sign in with the administrator username.', 'Contraseña restablecida. Inicia sesión con el usuario del administrador.'],
    ['Could not send proof.', 'No se pudo enviar el comprobante.'],
    ['Proof sent to OSP for review. Access remains inactive until OSP confirms payment.', 'Comprobante enviado a OSP para revisión. El acceso permanecerá inactivo hasta que OSP confirme el pago.'],
    ['Venue name saved.', 'Nombre del local guardado.'],
    ['Team member created.', 'Miembro del equipo creado.'],
    ['Team account updated.', 'Cuenta del equipo actualizada.'],
    ['Payment updated and the change was logged.', 'Pago actualizado y cambio registrado.'],
    ['Payment recorded. Venue active for one month.', 'Pago registrado. Local activo por un mes.'],
    ['Venue and administrator created.', 'Local y administrador creados.'],
    ['Administrator created.', 'Administrador creado.'],
    ['Monthly price saved.', 'Precio mensual guardado.'],
    ['Stripe credentials saved securely.', 'Credenciales de Stripe guardadas de forma segura.'],
    ['Payment methods saved and updated for all venues.', 'Métodos de pago guardados y actualizados para todos los locales.'],
    ['Billing settings saved.', 'Configuración de cobros guardada.'],
    ['Team administrator created.', 'Administrador del equipo creado.'],
    ['Player access updated.', 'Acceso del jugador actualizado.'],
    ['Player login created.', 'Acceso del jugador creado.'],
    ['Notice sent.', 'Aviso enviado.'],
    ['Tournament settings saved.', 'Configuración del torneo guardada.'],
    ['Solo training', 'Entrenamiento individual'],
    ['Opponent turn', 'Turno del oponente'],
    ['Professional virtual 8-ball aiming table', 'Mesa virtual profesional de precisión de bola ocho'],
    ['Shot power', 'Potencia del tiro'],
    ['Your turn', 'Tu turno'],
    ['Waiting for opponent', 'Esperando al oponente'],
    ['No contact', 'Sin contacto'],
    ['Shot completed. The other player’s turn.', 'Tiro completado. Turno del otro jugador.'],
    ['Choose an active match and one of its players', 'Elige una partida activa y uno de sus jugadores'],
    ['Administrator access required', 'Se requiere acceso de administrador'],
    ['Bracket already generated', 'El cuadro ya fue generado'],
    ['Ball points must be nonnegative integers', 'Los puntos de bolas deben ser enteros no negativos'],
    ['Record match result', 'Registrar resultado de partida'],
    ['Match unavailable', 'Partida no disponible']
  ] : [];

  let language = localStorage.getItem('osp-language') || 'es';
  const t = (key, vars = {}) => {
    let value = dictionaries[language]?.[key] ?? dictionaries.en[key] ?? key;
    return value.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? '');
  };

  function translateElement(root = document) {
    const nodes = root.querySelectorAll ? root.querySelectorAll('*') : [];
    for (const element of nodes) {
      if (element.matches('script,style')) continue;
      if (element.dataset.i18n) element.textContent = t(element.dataset.i18n);
      for (const attribute of ['placeholder', 'title', 'aria-label']) {
        const key = element.dataset[`i18n${attribute[0].toUpperCase()}${attribute.slice(1)}`];
        if (key) element.setAttribute(attribute, t(key));
      }
      if (element.children.length) continue;
      const source = element.dataset.i18nSource || element.textContent.trim();
      const key = phrases[source];
      element.dataset.i18nSource = source;
      if (key) element.textContent = t(key);
      else if (language === 'es') {
        let translated = source;
        for (const [from, to] of replacements(language)) translated = translated.split(from).join(to);
        if (translated !== source) element.textContent = translated;
      }
    }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    for (const node of textNodes) {
      if (node.parentElement?.closest('script,style,select,#osp-language-control')) continue;
      const source = node.nodeValue.trim();
      if (!source) continue;
      const key = phrases[source];
      let translated = key ? t(key) : source;
      if (!key && language === 'es') for (const [from, to] of replacements(language)) translated = translated.split(from).join(to);
      if (translated !== source) node.nodeValue = node.nodeValue.replace(source, translated);
    }
  }

  function setLanguage(next) {
    language = dictionaries[next] ? next : 'es';
    localStorage.setItem('osp-language', language);
    document.documentElement.lang = language;
    translateElement(document);
    const selector = document.querySelector('#osp-language');
    if (selector) selector.value = language;
  }

  function install() {
    document.documentElement.lang = language;
    const control = document.createElement('label');
    control.id = 'osp-language-control';
    const options = Object.entries(dictionaries).map(([key, dictionary]) => `<option value="${key}">${dictionary.label || key}</option>`).join('');
    control.innerHTML = `<span>${t('language')}</span><select id="osp-language" aria-label="${t('language')}">${options}</select>`;
    Object.assign(control.style, { position: 'fixed', top: '10px', right: '12px', zIndex: '9999', display: 'flex', gap: '6px', alignItems: 'center', padding: '5px 8px', borderRadius: '8px', background: '#082238e8', color: '#d9f4ff', font: '12px Arial, sans-serif' });
    control.querySelector('select').style.cssText = 'border:0;border-radius:4px;padding:2px 4px;background:#eaf8ff;color:#10263a;';
    control.querySelector('select').value = language;
    control.querySelector('select').addEventListener('change', event => setLanguage(event.target.value));
    document.body.appendChild(control);
    translateElement(document);
    new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => { if (node.nodeType === 1) translateElement(node); }))).observe(document.body, { childList: true, subtree: true });
  }

  window.OSPI18n = { dictionaries, t, setLanguage, translate: translateElement };
  window.t = t;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true }); else install();
})();
