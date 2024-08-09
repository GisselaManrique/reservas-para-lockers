function cargarLockers() {
    const lockersContenedor = document.getElementById('lockers');
    lockersContenedor.innerHTML = ""; // Limpiar el contenedor de casilleros antes de cargar nuevos.
    const seleccionFecha = document.getElementById('diaIni').value; // Obtener la fecha seleccionada.
    fetch(`/api/getLockers?date=${seleccionFecha}`) // Enviar fecha como parámetro al endpoint
        .then(response => response.json())
        .then(lockers => {
            console.log(lockers);
            for (let i = 1; i <= 72; i++) {
                const locker = document.createElement('div');
                locker.classList.add('locker', 'p-2', 'border', 'text-center');
                locker.dataset.lockerId = i; // Asignar ID del casillero para referencia futura.
                locker.textContent = i; // Mostrar número del casillero.

                // Establecer colores según la disponibilidad
                const actualLocker = lockers.find(l => l.numLocker === i);
                if (actualLocker && actualLocker.isReserved) {
                    locker.classList.add('unavailable', 'bg-danger', 'text-white');
                    locker.title = `Reservado desde ${formatoFecha(actualLocker.diaIni)} hasta ${formatoFecha(actualLocker.diaFin)}`;
                } else {
                    locker.classList.add('available', 'bg-success', 'text-white');
                    locker.title = 'Disponible';
                }

                locker.addEventListener('click', function() {
                    document.getElementById('numLocker').value = i; // Establecer el número de casillero en el formulario.
                });
                lockersContenedor.appendChild(locker);
            }
        })
        .catch(error => console.error('Error al cargar los lockers:', error));
}

function formatoFecha(dateString) {
    const date = new Date(dateString);
    let dia = date.getDate();
    let mes = date.getMonth() + 1; 
    const año = date.getFullYear();

    // Agregando un cero adelante si el día o el mes son menores a 10
    dia = dia < 10 ? '0' + dia : dia;
    mes = mes < 10 ? '0' + mes : mes;

    return `${dia}/${mes}/${año}`;
}

function formatoFechaHora(dateString) {
    const date = new Date(dateString);
    let dia = date.getDate();
    let mes = date.getMonth() + 1; // getMonth() devuelve un índice basado en cero, por lo que se suma 1
    const año = date.getFullYear();
    let hora = date.getHours();
    let minutos = date.getMinutes();
    let segundos = date.getSeconds();

    // Agregando un cero adelante si el día, mes, horas, minutos o segundos son menores a 10
    dia = dia < 10 ? '0' + dia : dia;
    mes = mes < 10 ? '0' + mes : mes;
    hora = hora < 10 ? '0' + hora : hora;
    minutos = minutos < 10 ? '0' + minutos : minutos;
    segundos = segundos < 10 ? '0' + segundos : segundos;

    return `${dia}/${mes}/${año} ${hora}:${minutos}:${segundos}`;
}


// Exporta una tabla HTML a excel
function exportTableToExcel(tableID, filename = ''){
    var downloadLink;
    var dataType = 'application/vnd.ms-excel';
    var tableSelect = document.getElementById(tableID);
    var tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');
    
    // Specify file name
    filename = filename?filename+'.xls':'excel_data.xls';
    
    // Create download link element
    downloadLink = document.createElement("a");
    
    document.body.appendChild(downloadLink);
    
    if(navigator.msSaveOrOpenBlob){
        var blob = new Blob(['ufeff', tableHTML], {
            type: dataType
        });
        navigator.msSaveOrOpenBlob( blob, filename);
    }else{
        // Create a link to the file
        downloadLink.href = 'data:' + dataType + ', ' + tableHTML;
    
        // Setting the file name
        downloadLink.download = filename;
        
        //triggering the function
        downloadLink.click();
    }
}

function showModal() {
    var modal = document.getElementById("myModal");
    modal.style.display = "flex";
}

function reloadPage() {
    var modal = document.getElementById("myModal");
    modal.style.display = "none";
}


document.addEventListener('DOMContentLoaded', function() {
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('diaIni').value = hoy;
    cargarLockers();
   
});

document.getElementById('filtroFechas').addEventListener('submit', function(event) {
    event.preventDefault();
    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;
    window.location.href = `/mostrar?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
});

function quitarFiltro() {
    window.location.href = '/mostrar?page=1&limit=100'; // Quitar parámetros de fecha
}

