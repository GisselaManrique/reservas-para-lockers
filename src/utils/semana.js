function obtenerSemana(date) {
    const diaActual  = new Date(date);
    const iniSemana  = new Date(diaActual .setDate(diaActual .getDate() - diaActual .getDay() + 1)); // Ajustar al primer día de la semana (lunes)
    const finSemana  = new Date(iniSemana);
    finSemana.setDate(finSemana.getDate() + 6); // Ajustar al último día de la semana (domingo)

    const format = (date) => {
        const d = new Date(date);
        let mes = '' + (d.getMonth() + 1),
            dia = '' + d.getDate(),
            año = d.getFullYear();

        if (mes.length < 2)  mes = '0' + mes;
        if (dia.length < 2)  dia = '0' + dia;

        return [año, mes, dia].join('-');
    };

    return { start: format(iniSemana), end: format(finSemana) };
}

module.exports = {
    obtenerSemana
};