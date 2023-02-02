let camera_button = document.querySelector("#start-camera");
let video = document.querySelector("#video");
let click_button = document.querySelector("#click-photo");
let canvas = document.querySelector("#canvas");

camera_button.addEventListener('click', async function() {
   	let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
	video.srcObject = stream;
});

click_button.addEventListener('click', function() {
   	canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
   	let image_data_url = canvas.toDataURL('image/jpeg');
    request(image_data_url);
   	// data url of the image
   	console.log(image_data_url);
}); 


function request(image_data_url) {

  const socket = new WebSocket('ws://localhost:3001/wss');

      socket.onopen = function (e) {
        console.log("WS opened");
        //var image = new Image();
        //image.src = image_data_url;
        socket.send(image_data_url);
      };

      socket.onmessage = function (event) {
        
          // let resultado = event.data.toString().split("\n");
          // let answer = "";
          // resultado.forEach(element => {
          //     answer += element + "<br>";
          // });

          // if (count > 0) {
          //     count--;
          //     document.getElementById("requestR").innerHTML = count;
          //     setTimeout(() => {

          //         result.innerHTML = answer;
          //     }, Math.random() * (3000 - 1000) + 1000);
          // };
      };
      socket.onclose = function (event) {
          
      };
      socket.onerror = function (error) {
          
      
  };
};