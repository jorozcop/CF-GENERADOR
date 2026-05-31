export default {
  // Asegúrate de que el template esté bien cerrado
  template: `
    <div class="card main-card p-4 shadow-lg">
      <div class="row g-4">
        <div class="col-md-6">
          <div class="file-dropzone" @click="$refs.fileVueInput.click()">
            <input type="file" ref="fileVueInput" class="d-none" accept=".vue" @change="cargarVue">
            <span class="badge" :class="ad.contenidoVue ? 'bg-success' : 'bg-secondary'">{{ ad.nombreVue || 'Sin cargar' }}</span>
          </div>
        </div>
        <div class="col-md-6">
          <div class="file-dropzone" @click="$refs.fileDocxInput.click()">
            <input type="file" ref="fileDocxInput" class="d-none" accept=".docx" @change="cargarDocx">
            <span class="badge" :class="ad.datosDocx ? 'bg-success' : 'bg-secondary'">{{ ad.nombreDocx || 'Sin cargar' }}</span>
          </div>
        </div>
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

    // Esta es la función correcta que debes usar
    const cargarDocx = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      ad.nombreDocx = file.name;

      const reader = new FileReader();
      reader.onload = (evt) => {
        if (window.mammoth) {
          window.mammoth.extractRawText({ arrayBuffer: evt.target.result })
            .then((res) => { 
              ad.datosDocx = res.value; 
            })
            .catch((err) => { 
              alert('Error procesando el Word: ' + err.message); 
            });
        } else {
          alert('Error: La librería Mammoth no ha cargado.');
        }
      };
      reader.readAsArrayBuffer(file);
    };

    return { ad, cargarVue, cargarDocx };
  }
};
