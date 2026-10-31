// Validación de los datos que llegan en el body de las peticiones.
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FECHA = /^\d{4}-\d{2}-\d{2}([ T]\d{2}:\d{2}(:\d{2})?)?$/;

function vacio(v) {
    return v === undefined || v === null || v === '';
}

// Devuelve una lista de errores (vacía si todo está bien)
function validarDatos(datos, reglas) {
    const errores = [];
    const body = datos || {};

    reglas.forEach((r) => {
        const v = body[r.campo];

        if (vacio(v)) {
            if (r.requerido) errores.push(`El campo ${r.campo} es obligatorio`);
            return;
        }

        switch (r.tipo) {
            case 'texto':
                if (typeof v !== 'string') {
                    errores.push(`El campo ${r.campo} debe ser texto`);
                } else if (r.min && v.trim().length < r.min) {
                    errores.push(`El campo ${r.campo} debe tener al menos ${r.min} caracteres`);
                } else if (r.max && v.length > r.max) {
                    errores.push(`El campo ${r.campo} no puede superar ${r.max} caracteres`);
                }
                break;
            case 'correo':
                if (typeof v !== 'string' || !CORREO.test(v)) {
                    errores.push(`El campo ${r.campo} debe ser un correo válido`);
                } else if (r.max && v.length > r.max) {
                    errores.push(`El campo ${r.campo} no puede superar ${r.max} caracteres`);
                }
                break;
            case 'entero': {
                const n = Number(v);
                if (typeof v === 'boolean' || (typeof v !== 'number' && typeof v !== 'string') || !Number.isInteger(n)) {
                    errores.push(`El campo ${r.campo} debe ser un número entero`);
                } else if (r.min !== undefined && n < r.min) {
                    errores.push(`El campo ${r.campo} debe ser mayor o igual a ${r.min}`);
                }
                break;
            }
            case 'decimal': {
                const n = Number(v);
                if (typeof v === 'boolean' || (typeof v !== 'number' && typeof v !== 'string') || !Number.isFinite(n)) {
                    errores.push(`El campo ${r.campo} debe ser un número`);
                } else if (r.min !== undefined && n < r.min) {
                    errores.push(`El campo ${r.campo} debe ser mayor o igual a ${r.min}`);
                }
                break;
            }
            case 'booleano':
                if (![true, false, 0, 1].includes(v)) {
                    errores.push(`El campo ${r.campo} debe ser true o false`);
                }
                break;
            case 'fecha':
                if (typeof v !== 'string' || !FECHA.test(v) || isNaN(Date.parse(v.replace(' ', 'T')))) {
                    errores.push(`El campo ${r.campo} debe tener formato AAAA-MM-DD o AAAA-MM-DD HH:MM:SS`);
                }
                break;
            case 'opcion':
                if (!r.valores.includes(v)) {
                    errores.push(`El campo ${r.campo} debe ser uno de: ${r.valores.join(', ')}`);
                }
                break;
        }
    });

    return errores;
}

// El id de la ruta debe ser un entero positivo
function idValido(id) {
    return /^\d+$/.test(String(id)) && Number(id) > 0;
}

// Convierte "no enviado" en NULL para la base de datos
function valorONulo(v) {
    return v === undefined || v === '' ? null : v;
}

function boolONulo(v) {
    return v === undefined || v === null || v === '' ? null : v ? 1 : 0;
}

module.exports = { validarDatos, idValido, valorONulo, boolONulo };
