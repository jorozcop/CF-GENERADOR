export default {
  template: `
    <div class="card main-card p-4 shadow-lg">
      <div class="mb-4">
        <h4 class="text-white fw-bold"><i class="fa-solid fa-cubes text-primary me-2"></i>Estructurador Global de Propiedades (config.js)</h4>
        <p class="text-muted small m-0">Ingresa los bloques de texto bruto para construir de forma organizada la configuración de tu componente.</p>
      </div>

      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label text-light small fw-bold"><i class="fa-solid fa-list-ol text-warning me-1"></i>1. Tabla de Contenido:</label>
          <textarea v-model="config.rawContenido" class="form-control font-monospace" rows="4" placeholder="Introducción&#10;1. Gestión de Carteras..."></textarea>
        </div>
        <div class="col-md-6">
          <label class="form-label text-light small fw-bold"><i class="fa-solid fa-spell-check text-info me-1"></i>2. Glosario de Términos:</label>
          <textarea v-model="config.rawGlosario" class="form-control font-monospace" rows="4" placeholder="Mora: Situación de retraso..."></textarea>
        </div>
        <div class="col-md-6">
          <label class="form-label text-light small fw-bold"><i class="fa-solid fa-book text-danger me-1"></i>3. Referencias Bibliográficas:</label>
          <textarea v-model="config.rawReferencias" class="form-control font-monospace" rows="4" placeholder="SENA. (2026)..."></textarea>
        </div>
        <div class="col-md-6">
          <label class="form-label text-light small fw-bold"><i class="fa-solid fa-users text-success me-1"></i>4. Equipo de Desarrollo / Créditos:</label>
          <textarea v-model="config.rawCreditos" class="form-control font-monospace" rows="4" placeholder="-- ECOSISTEMA DE RECURSOS DIGITALES..."></textarea>
        </div>
      </div>

      <div class="text-center mt-4">
        <button @click="procesarConfig" class="btn btn-gradient-blue btn-lg px-5 shadow">
          <i class="fa-solid fa-wand-magic-sparkles me-2"></i>Estructurar Objetos Separados
        </button>
      </div>

      <div v-if="config.mostrarResultados" class="mt-5">
        <hr class="border-secondary my-4">
        <h5 class="text-info mb-3"><i class="fa-solid fa-code me-2"></i>Propiedades JavaScript Generadas</h5>
        
        <ul class="nav nav-tabs sub-tabs mb-3">
          <li class="nav-item" v-for="tab in subTabs" :key="tab.id">
            <button class="nav-link" :class="{ active: configTab === tab.id }" @click="configTab = tab.id" type="button">
              {{ tab.nombre }}
            </button>
          </li>
        </ul>

        <div class="tab-content bg-black bg-opacity-40 p-3 rounded-bottom border border-top-0 border-secondary border-opacity-50">
          <div v-for="tab in subTabs" :key="tab.id">
            <div v-if="configTab === tab.id">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted small">{{ tab.descripcion }}</span>
                <button @click="copiarTexto(config.resultados[tab.id])" class="btn btn-success btn-sm"><i class="fa-regular fa-copy me-1"></i>Copiar {{ tab.nombre }}</button>
              </div>
              <textarea :value="config.resultados[tab.id]" class="form-control font-monospace" rows="12" readonly></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  setup() {
    const configTab = Vue.ref('menu');
    const config = Vue.reactive({
      rawContenido: '', rawGlosario: '', rawReferencias: '', rawCreditos: '',
      mostrarResultados: false,
      resultados: { menu: '', glosario: '', referencias: '', creditos: '' }
    });

    const subTabs = [
      { id: 'menu', nombre: 'Menú Principal', descripcion: 'Objeto menuPrincipal para config.js' },
      { id: 'glosario', nombre: 'Glosario', descripcion: 'Arreglo glosario para config.js' },
      { id: 'referencias', nombre: 'Referencias', descripcion: 'Arreglo referencias con itálicas HTML' },
      { id: 'creditos', nombre: 'Créditos', descripcion: 'Estructura creditos del equipo' }
    ];

    const convertirAsteriscosAItalicas = (t) => {
      let count = 0;
      return t.replace(/\*/g, () => { count++; return count % 2 !== 0 ? '<em>' : '</em>'; });
    };

    const procesarConfig = () => {
      // 1. Menú
      let outMenu = "menuPrincipal: {\n  menu: [\n";
      if (config.rawContenido.trim()) {
        const lineas = config.rawContenido.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        let subOpen = false;
        lineas.forEach(l => {
          if (l.toLowerCase().startsWith('introduccion') || l.toLowerCase().startsWith('introducción')) {
            outMenu += "    {\n      nombreRuta: 'introduccion',\n      icono: 'fas fa-info',\n      titulo: 'Introducción',\n    },\n";
            return;
          }
          let mUnidad = l.match(/^(\d+)\.\s*(.*)/);
          let mSub = l.match(/^(\d+\.\d+)\s*(.*)/);
          if (mSub) {
            outMenu += `        {\n          numero: '${mSub[1]}',\n          titulo: '${mSub[2].trim()}',\n          hash: 't_${mSub[1].replace(/\./g, '_')}',\n        },\n`;
          } else if (mUnidad) {
            if (subOpen) { outMenu += "      ],\n    },\n"; subOpen = false; }
            outMenu += "    {\n";
            outMenu += `      nombreRuta: 'tema${mUnidad[1]}',\n`;
            outMenu += `      numero: '${mUnidad[1]}',\n`;
            outMenu += `      titulo: '${mUnidad[2].trim()}',\n`;
            outMenu += "      desarrolloContenidos: true,\n";
            outMenu += "      subMenu: [\n";
            subOpen = true;
          }
        });
        if (subOpen) { outMenu += "      ],\n    },\n"; }
      }
      outMenu += "  ],\n},";
      config.resultados.menu = outMenu;

      // 2. Glosario
      let outGlos = "glosario: [\n";
      if (config.rawGlosario.trim()) {
        const linesG = config.rawGlosario.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        linesG.forEach(l => {
          let pts = l.split(/:\s*/);
          if (pts.length >= 2) {
            let term = pts[0].trim();
            let sig = pts.slice(1).join(':').trim();
            sig = sig.charAt(0).toUpperCase() + sig.slice(1);
            outGlos += "  {\n";
            outGlos += `    termino: '${term}',\n`;
            outGlos += `    significado:\n      '${sig.replace(/'/g, "\\'")}',\n  },\n`;
          }
        });
      }
      outGlos += "],";
      config.resultados.glosario = outGlos;

      // 3. Referencias
      let outRef = "referencias: [\n";
      if (config.rawReferencias.trim()) {
        const linesR = config.rawReferencias.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        linesR.forEach(l => {
          outRef += "  {\n";
          outRef += `    referencia:\n      '${convertirAsteriscosAItalicas(l).replace(/'/g, "\\'")}',\n  },\n`;
        });
      }
      outRef += "],";
      config.resultados.referencias = outRef;

      // 4. Créditos
      let outCred = "creditos: [\n";
      if (config.rawCreditos.trim()) {
        const bloques = config.rawCreditos.split(/\n(?=--)/);
        bloques.forEach(b => {
          const linesB = b.split('\n').map(l => l.trim()).filter(l => l.length > 0);
          if (linesB.length > 0) {
            let titleB = linesB[0].replace(/^--\s*/, '').toUpperCase();
            outCred += "  {\n";
            outCred += `      titulo: '${titleB}',\n`;
            outCred += "      autores: [\n";
            for (let k = 1; k < linesB.length; k++) {
              let ptsA = linesB[k].split('|');
              if (ptsA.length >= 2) {
                let nom = ptsA[0].trim();
                let carg = convertirAsteriscosAItalicas(ptsA[1].trim());
                let cent = ptsA[2] ? ptsA[2].trim() : 'Centro de Comercio y Servicios - Regional Tolima';
                outCred += "        {\n";
                outCred += `          nombre: '${nom}',\n`;
                outCred += `          cargo: '${carg}',\n`;
                outCred += `          centro: '${cent}',\n`;
                outCred += "        },\n";
              }
            }
            outCred += "    ],\n  },\n";
          }
        });
      }
      outCred += "],";
      config.resultados.creditos = outCred;

      config.mostrarResultados = true;
    };

    const copiarTexto = (txt) => {
      navigator.clipboard.writeText(txt);
      alert('📋 Copiado al portapapeles con éxito.');
    };

    return { configTab, config, subTabs, procesarConfig, copiarTexto };
  }
};