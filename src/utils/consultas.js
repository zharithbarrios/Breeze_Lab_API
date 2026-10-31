// Construye el WHERE de las consultas GET a partir de los parámetros de consulta (?campo=valor)
function construirFiltros(query, filtros) {
    const condiciones = [];
    const params = [];

    filtros.forEach((f) => {
        let valor = query[f.param];
        if (Array.isArray(valor)) valor = valor[0];
        if (valor === undefined || valor === '') return;

        if (f.operador === 'LIKE') {
            condiciones.push(`${f.columna} LIKE ?`);
            params.push(`%${valor}%`);
        } else {
            condiciones.push(`${f.columna} = ?`);
            params.push(valor);
        }
    });

    return {
        where: condiciones.length ? ' WHERE ' + condiciones.join(' AND ') : '',
        params
    };
}

module.exports = { construirFiltros };
