const http = require('http');
const child_process = require('child_process');

const server = http.createServer((req, res) => {
  // Iniciar el proceso de transmisión con ffmpeg
  const ffmpeg = child_process.spawn('ffmpeg', [
    '-i', 'tcp://127.0.0.1:8888',
    '-f', 'mp4',
    '-codec:v', 'libx264',
    '-preset', 'ultrafast',
    '-tune', 'zerolatency',
    '-movflags', '+frag_keyframe+empty_moov',
    '-an',
    '-'
  ]);

  // Establecer la cabecera de la respuesta para indicar que se enviará un flujo de video
  res.writeHead(200, {
    'Content-Type': 'video/mp4',
    'Connection': 'keep-alive',
    'Transfer-Encoding': 'chunked'
  });

  // Transmite el flujo de video al navegador del cliente
  ffmpeg.stdout.pipe(res);

  // Captura los errores del proceso de ffmpeg
  ffmpeg.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  // Captura los eventos de cierre del proceso de ffmpeg
  ffmpeg.on('close', (code) => {
    console.log(`ffmpeg proceso cerrado con el código ${code}`);
  });
});

// Iniciar el servidor en el puerto 80
server.listen(8080, () => {
  console.log('Servidor iniciado en el puerto 80');
});
