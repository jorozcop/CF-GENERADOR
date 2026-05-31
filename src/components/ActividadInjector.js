export default {
  template: `
    <div class="card main-card p-4 shadow-lg">
      <div class="mb-4">
        <h4 class="text-white fw-bold"><i class="fa-solid fa-file-code text-success me-2"></i>Inyector Dinámico de Preguntas (Actividad.vue)</h4>
        <p class="text-white small m-0">Procesa el cuestionario formateado desde Word preservando secuencialmente las imágenes.</p>
      </div>

      <div class="row g-4">
        <div class="col-md-6">
          <div class="file-dropzone" @click="$refs.fileVueInput.click()">
            <i class="fa-solid fa-code-branch fa-2x text-info mb-2"></i>
            <h6 class="text-white mb-1">Archivo Base Actividad.vue</h6>
            <p class="text-white small mb-3">Haz clic para cargar el archivo original de la AD</p>
            <input type="file" ref="fileVueInput" class="d-none" accept=".vue" @change="cargarVue">
            <span class="badge" :class="ad.contenidoVue ? 'bg-success' : 'bg-secondary'">{{ ad.nombreVue || 'Sin cargar' }}</span>
          </div>
        </div>
        <div class="col-md-6">
          <div class="file-dropzone" @click="$refs.fileDocxInput.click()">
            <i class="fa-regular fa-file-word fa-2x text-primary mb-2"></i>
            <h6 class="text-white mb-1">Documento de Word (.docx)</h6>
            <p class="text-white small mb-3">Carga la guía técnica con la matriz del cuestionario</p>
            <input type="file" ref="fileDocxInput" class="d-none" accept=".docx" @change="cargarDocx">
            <span class="badge" :class="ad.datosDocx ? 'bg-success' : 'bg-secondary'">{{ ad.nombreDocx || 'Sin cargar' }}</span>
          </div>
        </div>
      </div>

      <div class="text-center mt-4">
        <button @click="procesarAD" class="btn btn-gradient-green btn-lg px-5 shadow" :disabled="!ad.contenidoVue || !ad.datosDocx">
          <i class="fa-solid fa-gear me-2"></i>Procesar y Sincronizar AD
        </button>
      </div>

      <div v-if="ad.resultadoGenerated" class="mt-4">
        <div class="d-flex justify-content-between align-items-center mb-2 bg-dark p-2 rounded-2 border border-secondary border-opacity-25">
          <span class="text-success fw-bold"><i class="fa-solid fa-circle-check me-2"></i>¡Compilación Exitosa!</span>
          <div>
            <button @click="copiarTexto(ad.txtResultado)" class="btn btn-outline-info btn-sm me-2"><i class="fa-regular fa-copy me-1"></i>Copiar Código</button>
            <button @click="descargarArchivo(ad.txtResultado, 'Actividad.vue')" class="btn btn-info btn-sm"><i class="fa-solid fa-download me-1"></i>Descargar Archivo</button>
          </div>
        </div>
        <textarea v-model="ad.txtResultado" class="form-control font-monospace" rows="15" readonly></textarea>
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

  const cargarDocx = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      ad.nombreDocx = file.name;
      const reader = new FileReader();
      reader.onload = (evt) => {
        // 🛠️ Cambiamos 'mammoth' por 'window.mammoth'
        window.mammoth.extractRawText({ arrayBuffer: evt.target.result })
          .then((res) => { 
            ad.datosDocx = res.value; 
            console.log("Word procesado correctamente");
          })
          .catch((err) => { 
            alert('Error leyendo Word: ' + err.message); 
            console.error(err);
          });
      };
      reader.readAsArrayBuffer(file);
    };

    const procesarAD = () => {
      try {
        const regexImg = /imagen:\s*(require\([^)]+\))/g;
        const listImgs = [];
        let match;
        while ((match = regexImg.exec(ad.contenidoVue)) !== null) { listImgs.push(match[1]); }

        const lineas = ad.datosDocx.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
        let tema = '', introduccion = '', preguntas = [], pregAct = null;
        let msgAp = '¡Excelente! Ha superado la actividad.', msgRep = 'Le recomendamos volver a revisar el componente formativo e intentar nuevamente la actividad didáctica.';

        for (let i = 0; i < lineas.length; i++) {
          const linea = lineas[i];
          if (linea.toLowerCase().startsWith('nombre de la actividad')) {
            tema = linea.includes(',') ? linea.substring(linea.indexOf(',') + 1).trim() : lineas[++i].trim();
            tema = tema.replace(/^"|"$/g, '');
            continue;
          }
          if (linea.toLowerCase().startsWith('objetivo de la actividad')) {
            introduccion = linea.includes(',') ? linea.substring(linea.indexOf(',') + 1).trim() : lineas[++i].trim();
            introduccion = introduccion.replace(/^"|"$/g, '');
            continue;
          }
          if (/^pregunta\s*\d+/i.test(linea)) {
            if (pregAct) preguntas.push(pregAct);
            let txt = linea.includes(',') ? linea.substring(linea.indexOf(',') + 1).trim() : lineas[++i].trim();
            pregAct = { texto: txt.replace(/^"|"$/g, ''), opciones: [] };
            continue;
          }
          if (pregAct && /^opción\s*[a-e]\)/i.test(linea)) {
            const esCor = /,x$/i.test(linea) || linea.toLowerCase().endsWith(',x"') || /,[xX]$/.test(linea) || linea.toLowerCase().endsWith('x') || linea.toLowerCase().endsWith('x"');
            let txtO = linea.replace(/^opción\s*[a-e]\)\s*,?/i, '').replace(/,x$/i, '').replace(/,x"$/i, '').replace(/,X$/i, '').replace('x','').replace('X','').replace(/^"|"$/g, '').trim();
            pregAct.opciones.push({ texto: txtO, esCorrecta: esCor });
            continue;
          }
          if (linea.toLowerCase().startsWith('mensaje cuando supera el 70 %')) {
            msgAp = linea.substring(linea.indexOf(',') + 1).trim().replace(/^"|"$/g, '');
            continue;
          }
          if (linea.toLowerCase().startsWith('mensaje cuando el porcentaje de respuestas correctas es inferior')) {
            msgRep = linea.substring(linea.indexOf(',') + 1).trim().replace(/^"|"$/g, '');
            continue;
          }
        }
        if (pregAct) preguntas.push(pregAct);

        if (introduccion && !introduccion.startsWith('<b> Objetivo:</b>')) { introduccion = `<b> Objetivo:</b> ${introduccion}`; }

        const letras = ['a', 'b', 'c', 'd', 'e'];
        const listPregsJS = preguntas.map((p, idx) => {
          const img = listImgs[idx] || "require('@/assets/actividad/imagen1.png')";
          const opcsJS = p.opciones.map((o, oIdx) => `            {\n              id: '${letras[oIdx] || oIdx}',\n              texto: '${o.texto.replace(/'/g, "\\'")}',\n              esCorrecta: ${o.esCorrecta},\n            }`).join(',\n');
          return `        {\n          id: ${idx + 1},\n          texto: '${p.texto.replace(/'/g, "\\'")}',\n          imagen: ${img},\n          barajarRespuestas: true,\n          opciones: [\n${opcsJS}\n          ],\n          mensaje_correcto: '¡Muy bien! Ha acertado la respuesta.',\n          mensaje_incorrecto: 'Lo sentimos, su respuesta no es la correcta.',\n        }`;
        }).join(',\n');

        const templateCuestionario = `cuestionario: {\n      tema: '${tema.replace(/'/g, "\\'")}',\n      titulo: 'Cuestionario',\n      introduccion:\n        '${introduccion.replace(/'/g, "\\'")}',\n      barajarPreguntas: true,\n      titulo_aprobado: '¡BUEN TRABAJO!',\n      titulo_reprobado: 'VUELVA A INTENTARLO.',\n      preguntas: [\n${listPregsJS}\n      ],\n      mensaje_final_aprobado: '${msgAp.replace(/'/g, "\\'")}',\n      mensaje_final_reprobado:\n        '${msgRep.replace(/'/g, "\\'")}',\n    },`;

        ad.txtResultado = ad.contenidoVue.replace(/(cuestionario:\s*\{)([\s\S]*?)(mensaje_final_reprobado:[\s\S]*?\n\s*\},)/, templateCuestionario);
        ad.resultadoGenerated = true;
      } catch (err) { alert('Error al sincronizar la Actividad Didáctica.'); console.error(err); }
    };

    const copiarTexto = (txt) => {
      navigator.clipboard.writeText(txt);
      alert('📋 Copiado al portapapeles con éxito.');
    };

    const descargarArchivo = (txt, filename) => {
      const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
      const element = document.createElement('a');
      element.href = URL.createObjectURL(blob);
      element.download = filename;
      element.click();
    };

    return { ad, cargarVue, cargarDocx, procesarAD, copiarTexto, descargarArchivo };
  }
};
