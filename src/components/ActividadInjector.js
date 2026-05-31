const cargarDocx = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  ad.nombreDocx = file.name;

  const reader = new FileReader();
  reader.onload = (evt) => {
    // Verificamos si window.mammoth existe antes de intentar usarlo
    if (window.mammoth) {
      window.mammoth.extractRawText({ arrayBuffer: evt.target.result })
        .then((res) => { 
          ad.datosDocx = res.value; 
        })
        .catch((err) => { 
          console.error("Error de Mammoth:", err);
          alert('Error procesando el Word: ' + err.message); 
        });
    } else {
      // Si llega aquí, es porque la librería no cargó en el navegador
      alert('Error: La librería Mammoth no ha cargado. Por favor, refresca la página (F5).');
    }
  };
  reader.readAsArrayBuffer(file);
};
