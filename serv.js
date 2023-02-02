const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const path = require("path");
const websocket = require('ws');
const http = require('http');
const faceapi = require('./face-api.min.js');
//const imageRecognice = require('./script.js');

const app = express();

app.use(cors());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(express.static(__dirname));

const server = http.createServer(app);
server.listen(3001, () => {
  console.log("Server running on port 3001");
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

const wss = new websocket.Server({ server: server, path: '/wss' });
wss.on('connection', (ws) => {
  ws.on('connection', function (connection) {
    console.log('WebSocket Client Connected');
  });
  ws.on('error', error => {
    console.log("Connection Error: " + error.toString());
  });
  ws.on('close', () => {
    console.log('Connection Closed');
  });
  ws.on('message', message => {
    var bitmap = new Buffer.from(message, 'base64');
    console.log("Foto " + bitmap);
    imageRecognice(bitmap);
    function imageRecognice(imageUpload){
      
      Promise.all([
        faceapi.nets.faceRecognitionNet.loadFromDisk(path.join(__dirname, '/models')),
        faceapi.nets.faceLandmark68Net.loadFromDisk(path.join(__dirname, '/models')),
        faceapi.nets.ssdMobilenetv1.loadFromDisk(path.join(__dirname, '/models'))
      ]).then(start)
      
      async function start() {
        // const container = document.createElement('div')
        // container.style.position = 'relative'
        //document.body.append(container)
        // Guaradamos los puntos de los usuarios en una variable
        console.log("PACOOOOOOOOOOOOOOOOOOOO");
        const faceDescriptors = await loadLabeledImages()
        const faceMatcher = new faceapi.FaceMatcher(faceDescriptors, 0.6)
        let image
        let canvas
        //document.body.append('Loaded')
        //Esta es la imagen que nos llega
        //Esto hay que cambiarlo a la foto que nos llegue
        //imageUpload.addEventListener('change', async () => {
          if (image) image.remove()
          if (canvas) canvas.remove()
          image = await faceapi.bufferToImage(imageUpload)
          //Image es el archivo que le pasamos ddesde la camara
          const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
          const results = detections.map(d => faceMatcher.findBestMatch(d.descriptor))
          return {
            matchResult: results
          }
        //})
      }
      
      function loadLabeledImages() {
        const labels = ['Black Widow', 'Captain America', 'Captain Marvel', 'Hawkeye', 'Jim Rhodes', 'Thor', 'Tony Stark'];
        return Promise.all(
          labels.map(async label => {
            const descriptions = []
            for (let i = 1; i <= 2; i++) {
              //Foto que nos llega
              const img = await faceapi.fetchImage((path.join(__dirname, '/labeled_images/${' + label + '}/${' + i + '}.jpg')));
              //Dtectamos las cara y las expresiones
              const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
              //Gurdamos en la base de datos los puntos del usuario con detections.descriptor
              return (detections.descriptor); 
            }
          })
        )
      }
    };
  });
});


