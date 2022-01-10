'acelerometroX=' +
	'&acelerometroY=' +
	'&password=' +
	'&ParkingID=' +
	'&desbloqueo=' +
	'&proximidad='

// Hay algo parqueado
if (proximidad && !desbloqueo) {
	//Si pasados 30 seg proximidad es falso y desbloqueo es false SE ROBARON LA CICLA
	if (time > '30seg' && !desbloqueo) {
		// Enviar Notificación (Admin y Usuario)
	}
}

if (!proximidad && !desbloqueo && time > '2min') {
	// Desbloquear parqueadero por que no hay bicicleta
}

if (acelerometroX > 10 && !desbloqueo) {
	// Enviar Notificación (Admin y Usuario)
}
