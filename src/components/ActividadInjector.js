export default {
  template: `
    <div class="card main-card p-4 shadow-lg">
      <div class="mb-4">
        <h4 class="text-white fw-bold"><i class="fa-solid fa-file-code text-success me-2"></i>Inyector Dinámico de Preguntas (Actividad.vue)</h4>
        <p class="text-white small m-0">Procesa el cuestionario formateado desde Word.</p>
      </div>

      <div class="row g-4">
        <div class="col-md-6">
          <div class="file-dropzone" @click="$refs.fileVueInput.click()">
            <h6 class="text-white">Archivo Base Actividad.vue</h6>
            <input type="file" ref="fileVueInput" class="d-none" accept=".vue" @change="cargarVue">
            <span class="badge" :class="ad.contenidoVue ? 'bg-success' : 'bg-secondary'">{{ ad.nombreVue || 'Sin cargar' }}</span>
          </div>
        </div>
        <div class="col-md-6">
          <div class="file-dropzone" @click="$refs.fileDocxInput.click()">
            <h6 class="text-white">Documento de Word (.docx)</h6>
            <input type="file" ref="fileDocxInput" class="d-none" accept=".docx" @change="cargarDocx">
            <span class="badge" :class="ad.datosDocx ? 'bg-success' : 'bg-secondary'">{{ ad.nombreDocx || 'Sin cargar' }}</span>
          </div>
        </div>
      </div>

      <div class="text-center mt-4">
        <button @click="procesarAD" class="btn btn-success btn-lg" :disabled="!ad.contenidoVue || !ad.datosDocx">
          Procesar y Sincronizar AD
        </button>
      </div>
    </div>
  `,
  setup() {
    const ad = Vue.reactive({
      contenidoVue: '', nombreVue: '', datosDocx: '', nombreDocx: '',
      txtResultado: '', resultadoGenerated: false
    });

    const cargarVue = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      ad.nombreVue = file.name;
      const reader = new FileReader();
      reader.onload = (evt) => { ad.contenidoVue = evt.target.result; };
      reader.readAsText(file);
    };

    // Función unificada para procesar el archivo
    const procesarArchivo = (buffer) => {
      if (window.mammoth) {
        window.mammoth.extractRawText({ arrayBuffer: buffer })
          .then((res) => { ad.datosDocx = res.value; })
          .catch((err) => { alert('Error en Mammoth: ' + err.message); });
      } else {
        alert("La librería Mammoth no ha cargado correctamente.");
      }
    };

    const cargarDocx = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      ad.nombreDocx = file.name;
      const reader = new FileReader();
      reader.onload = (evt) => {
        procesarArchivo(evt.target.result);
      };
      reader.readAsArrayBuffer(file);
    };

    const procesarAD = () => {
        // ... (Tu lógica de procesarAD sigue igual aquí) ...
        alert("Procesando...");
    };

    return { ad, cargarVue, cargarDocx, procesarAD };
  }
};
