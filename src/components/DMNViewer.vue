<template>
  <div class="dmn-container">
    <div class="header">
      <span class="user-id">User ID: {{ userId }}</span>
      <span class="timestamp">Timestamp: {{ timestamp }}</span>
    </div>
    <button @click="createOrLoadDiagram" class="create-diagram-btn">Create New Diagram</button>
    <button @click="saveDiagram" class="save-diagram-btn">Save Diagram</button>
    <input type="file" @change="openDiagram" class="choose-file-btn" accept=".dmn, .xml, .json" />
    <div ref="dmnContainer" class="dmn-diagram"></div>
  </div>
</template>
 
<script>
import DmnModeler from 'dmn-js/lib/Modeler';
import 'dmn-js/dist/assets/diagram-js.css';
import 'dmn-js/dist/assets/dmn-font/css/dmn.css';
import 'dmn-js/dist/assets/dmn-js-shared.css';
import 'dmn-js/dist/assets/dmn-js-decision-table-controls.css';
import 'dmn-js/dist/assets/dmn-js-decision-table.css';
import 'dmn-js/dist/assets/dmn-js-literal-expression.css';
import { xml2json } from 'xml-js';

export default {
  name: 'DMNViewer',
  data() {
    return {
      dmnModeler: null,
      diagramLoaded: false,
      userId: this.generateUserId(),
      timestamp: this.getCurrentTimestamp(),
      showNotesForm: false,
      newNote: '',
      notes: [] // Array to store notes
    };
  },
  mounted() {
    this.initializeModeler();
  },
  beforeUnmount() {
    if (this.dmnModeler) {
      this.dmnModeler.destroy();
    }
  },
  methods: {
    generateUserId() {
      return `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    },
    getCurrentTimestamp() {
      const now = new Date();
      return `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    },
    initializeModeler() {
      this.dmnModeler = new DmnModeler({
        container: this.$refs.dmnContainer,
        keyboard: { bindTo: window },
      });

      setTimeout(() => {
        this.zoomFitViewport();
      }, 0);
    },
    zoomFitViewport() {
      if (this.dmnModeler && typeof this.dmnModeler.get === 'function') {
        const canvas = this.dmnModeler.get('canvas');
        if (canvas) {
          canvas.zoom('fit-viewport');
        }
      } else {
        console.error('dmnModeler is not properly initialized or does not support the get method.');
      }
    },
    async createOrLoadDiagram() {
      if (!this.diagramLoaded) {
        await this.loadInitialDiagram();
      } else {
        await this.createNewDiagram();
      }
    },
    async loadInitialDiagram() {
      this.diagramLoaded = true;
      const dmnXML = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" 
  xmlns:dmndi="https://www.omg.org/spec/DMN/20191111/DMNDI/" 
  xmlns:dc="http://www.omg.org/spec/DMN/20191111/DC/" 
  xmlns:di="http://www.omg.org/spec/DMN/20191111/DI/" 
  id="definitions" name="definitions" namespace="http://camunda.org/schema/1.0/dmn">
  <decision id="decision" name="Decision">
    <decisionTable id="decisionTable">
      <input id="input1">
        <inputExpression id="inputExpression1" typeRef="string">
          <text>Input Expression</text>
        </inputExpression>
      </input>
      <output id="output1" name="Output" typeRef="string" />
    </decisionTable>
  </decision>
  <!-- Add dmndi information here -->
  <dmndi:DMNDiagram id="DMNDiagram_1">
    <dmndi:DMNShape id="DMNShape_1" dmnElementRef="decision">
      <dc:Bounds x="100" y="100" width="150" height="100" />
    </dmndi:DMNShape>
  </dmndi:DMNDiagram>
</definitions>`;
      try {
        await this.dmnModeler.importXML(dmnXML);
        console.log('DMN XML imported successfully');
      } catch (err) {
        console.error('Failed to import DMN XML', err);
        alert('Failed to import initial DMN diagram: ' + err.message);
      }
    },
    async createNewDiagram() {
      const newDiagramXML = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" 
  xmlns:dmndi="https://www.omg.org/spec/DMN/20191111/DMNDI/" 
  xmlns:dc="http://www.omg.org/spec/DMN/20191111/DC/" 
  xmlns:di="http://www.omg.org/spec/DMN/20191111/DI/" 
  id="definitions" name="New Decision" namespace="http://camunda.org/schema/1.0/dmn">
  <decision id="decision" name="New Decision">
    <decisionTable id="decisionTable">
      <input id="input1">
        <inputExpression id="inputExpression1" typeRef="string">
          <text></text>
        </inputExpression>
      </input>
      <output id="output1" name="Output" typeRef="string" />
    </decisionTable>
  </decision>
  <!-- Add dmndi information here -->
  <dmndi:DMNDiagram id="DMNDiagram_1">
    <dmndi:DMNShape id="DMNShape_1" dmnElementRef="decision">
      <dc:Bounds x="100" y="100" width="150" height="100" />
    </dmndi:DMNShape>
  </dmndi:DMNDiagram>
</definitions>`;
      try {
        await this.dmnModeler.importXML(newDiagramXML);
        console.log('New DMN diagram created successfully');
        this.userId = this.generateUserId(); // Update user ID
        this.timestamp = this.getCurrentTimestamp(); // Update timestamp
        alert('New DMN diagram created successfully!');
      } catch (err) {
        console.error('Failed to create new DMN diagram', err);
        alert('Failed to create new DMN diagram: ' + err.message);
      }
    },
    async saveDiagram() {
      try {
        const { xml } = await this.dmnModeler.saveXML({ format: true });
        const json = xml2json(xml, { compact: true, spaces: 2 });

        // Add metadata and notes to JSON
        const metadata = {
          userId: this.userId,
          timestamp: this.timestamp,
          notes: this.notes // Include notes in the metadata
        };
        const jsonWithMetadata = { ...JSON.parse(json), metadata };

        const updatedJson = JSON.stringify(jsonWithMetadata, null, 2);

        // Save JSON file
        const jsonBlob = new Blob([updatedJson], { type: 'application/json' });
        const jsonUrl = URL.createObjectURL(jsonBlob);
        const jsonA = document.createElement('a');
        jsonA.href = jsonUrl;
        jsonA.download = 'diagram.json';
        document.body.appendChild(jsonA);
        jsonA.click();
        document.body.removeChild(jsonA);

        // Save XML file
        const xmlBlob = new Blob([xml], { type: 'application/xml' });
        const xmlUrl = URL.createObjectURL(xmlBlob);
        const xmlA = document.createElement('a');
        xmlA.href = xmlUrl;
        xmlA.download = 'diagram.xml';
        document.body.appendChild(xmlA);
        xmlA.click();
        document.body.removeChild(xmlA);

        console.log('DMN diagram saved as JSON and XML');
        alert('DMN diagram saved as JSON and XML!');
      } catch (err) {
        console.error('Failed to save DMN diagram', err);
        alert('Failed to save DMN diagram: ' + err.message);
      }
    },
    async openDiagram(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const content = e.target.result;
          let xml;

          try {
            // Attempt to parse as JSON
            const json = JSON.parse(content);
            console.log('Parsed JSON:', json);

            // Check if JSON has metadata and convert JSON to XML
            if (json.metadata) {
              this.userId = json.metadata.userId;
              this.timestamp = json.metadata.timestamp;
            }

            // Convert JSON to XML string
            xml = this.convertJSONToXML(json);
            console.log('Converted XML:', xml);
          } catch (err) {
            console.error('Error parsing JSON, assuming content is XML', err);
            xml = content;
          }

          try {
            await this.dmnModeler.importXML(xml);
            console.log('DMN diagram loaded successfully');
            this.zoomFitViewport(); // Ensure diagram fits viewport
          } catch (err) {
            console.error('Failed to load DMN diagram', err);
            alert('Failed to load DMN diagram: ' + err.message);
          }
        };
        reader.readAsText(file);
      }
    },
    convertJSONToXML(json) {
      const jsonToXML = (obj, rootElement = 'definitions') => {
        let xml = '';

        const processElement = (elementName, attributes, textContent) => {
          xml += `<${elementName}`;

          if (attributes) {
            Object.keys(attributes).forEach(attr => {
              xml += ` ${attr}="${attributes[attr]}"`;
            });
          }

          xml += '>';

          if (textContent) {
            xml += textContent;
          }

          xml += `</${elementName}>\n`;
        };

        const parseObject = (obj, parentElement) => {
          if (typeof obj === 'object') {
            if (obj._attributes) {
              processElement(parentElement, obj._attributes);
            } else {
              Object.keys(obj).forEach(key => {
                if (key.startsWith('_')) {
                  return; // Skip internal keys
                }
                if (typeof obj[key] === 'object') {
                  parseObject(obj[key], key);
                } else {
                  processElement(key, null, obj[key]);
                }
              });
            }
          }
        };

        parseObject(json, rootElement);

        return xml;
      };

      return `<?xml version="1.0" encoding="UTF-8"?>\n${jsonToXML(json, 'definitions')}`;
    }
  }
};
</script>

<style scoped>
.dmn-container {
  padding: 20px;
  font-family: Arial, Helvetica, sans-serif;
}

.header {
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.controls {
  margin-bottom: 20px;
}

.btn {
  padding: 10px 20px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
  transition: background-color 0.3s, color 0.3s;
}

.user-id, .timestamp {
  display: block;
  font-size: 14px;
  color: #333;
}

.create-diagram-btn, .save-diagram-btn, .choose-file-btn, .add-notes-btn {
  margin-right: 10px;
  background-color: #4caf50;
}

.create-diagram-btn:hover {
  background-color: #e7ee25;
}

.dmn-diagram {
  width: 100%;
  height: 600px;
  position: relative; /* Needed for overlay positioning */
}

.notes-form {
  margin: 20px 0;
}

.notes-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Allow interaction with the diagram below */
}

.note {
  position: absolute;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #ccc;
  padding: 5px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
}
</style>
