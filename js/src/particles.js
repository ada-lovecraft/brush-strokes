
var proton;
      var canvas;
      var drawCanvas;
      var context;
      var drawContext;
      var renderer;
      var stats;
      var logoZone;
      var emitter, stars;
      var rect, rect2;
      var imageData;
      var attractionBehaviour, repulsionBehaviour, crossZoneBehaviour;
      var mouseObj;
      var rootIndex = 1;
      var colors = [];
      var particleImage = 'img/particle.png';;

      var colorThief = new ColorThief();

      var ColorSchemes = {
        BlueJayFeather: {
          threeColorBlack: '#1F1F20',
          blueJayBlue: '#2B4C7E',
          blueJayAccent: '#567EBB',
          blueJayGray: '#606D80',
          blueJayWhite: '#DCE0E6'
        }
      };

      Main();
      function Main() {
        canvas = document.createElement('canvas');
        canvas.width = 1280;
        canvas.height = 852;
        context = canvas.getContext('2d');
        drawCanvas = document.getElementById('testCanvas');
        drawCanvas.width = 1280;
        drawCanvas.height = 852;
        drawContext = drawCanvas.getContext('2d');

        mouseObj = {
          x: canvas.width / 2,
          y: canvas.height / 2
        };

        drawCanvas.addEventListener('mousedown', mousedownHandler, false);
        drawCanvas.addEventListener('mouseup', mouseupHandler, false);
        drawCanvas.addEventListener('mousemove', mousemoveHandler, false);
        //addStats();


        initBehaviours();
        loadImage();
      }

      function addStats() {
        stats = new Stats();
        stats.setMode(2);
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';
        document.getElementById('container').appendChild(stats.domElement);
      }

      function loadImage() {
        logoZones = [];

        var loader = new PxLoader();
        var painting = loader.addImage('img/painting.jpg');

        loader.addCompletionListener(function() {
            imagedata = Proton.Util.getImageData(context, painting, rect);
            logoZones.push(new Proton.ImageZone(imagedata, rect.x, rect.y));
            createProton(rect);
            tick();
        });
        loader.start();
      }

      function initBehaviours() {
        var imageWidth = 1280;
        var imageHeight = 852;
        console.log('canvas.height', canvas.height);
        rect = new Proton.Rectangle(0,0, imageWidth, imageHeight);
        rect2 = new Proton.Rectangle(0, 0, 1280, 852);
        var rectZone = new Proton.RectZone(rect2.x, rect2.y, rect2.width, rect2.height);

        randomBehaviour = new Proton.RandomDrift(3, 3, 0.5);
        repulsionBehaviour = new Proton.Repulsion(mouseObj, 50, 50);

      }

      function createProton() {
        proton = new Proton;
        emitter = new Proton.Emitter();
        emitter.damping = 0.0075;
        emitter.rate = new Proton.Rate(400);
        emitter.addInitialize(new Proton.Mass(5), new Proton.Radius(Proton.getSpan(5, 10)));
        emitter.addInitialize(new Proton.Velocity(new Proton.Span(1, 3), new Proton.Span(0, 360), 'polar'));

        mouseObj = {
          x : canvas.width / 2,
          y : canvas.height / 2
        };
        attractionBehaviour = new Proton.Attraction(mouseObj, 10, drawCanvas.width);
        repulsionBehaviour = new Proton.Repulsion(mouseObj, 20, 50);
        crossZoneBehaviour = new Proton.CrossZone(new Proton.RectZone(0, 0, drawCanvas.width, drawCanvas.height), 'bound');
        emitter.addBehaviour(attractionBehaviour, repulsionBehaviour, crossZoneBehaviour);
        emitter.addBehaviour(new Proton.Scale(Proton.getSpan(.05, .2)));
        emitter.addBehaviour(new Proton.Rotate(Proton.getSpan(0, 180), Proton.getSpan(-5, 5), 'add'));
        emitter.addBehaviour(customColorBehaviour());
        emitter.p.x = canvas.width / 2;
        emitter.p.y = canvas.height / 2;
        emitter.emit('once');
        proton.addEmitter(emitter);

        createRenderer();
      }
      function createRenderer() {
        renderer = new Proton.Renderer('canvas', proton, drawCanvas);
        renderer.createImageData(rect2);

        renderer.onProtonUpdate = function() {
          //boxBlurCanvasRGB('testCanvas',0,0,drawCanvas.width, drawCanvas.height, 5,1);
          drawContext.fillStyle = "rgba(255, 255, 255, 0.001)";
          drawContext.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
        };
        renderer.start();
      }

      function customToZoneBehaviour(zones) {
        return {
          initialize : function(particle) {
            particle.R = Math.random() * 10;
            particle.Angle = Math.random() * Math.PI * 2;
            particle.speed = Math.random() * (-1.5) + 0.75;
            particle.zones = zones.map(function(zone) { return zone.getPosition().clone(); });
          },

          applyBehaviour : function(particle) {
              if (rootIndex % 2 != 0) {
               // particle.v.clear();
                particle.Angle += particle.speed;
                var index = (rootIndex % 6 + 1) / 2 - 1;
                var x = particle.zones[0].x + particle.R * Math.cos(particle.Angle);
                var y = particle.zones[0].y + particle.R * Math.sin(particle.Angle);
                particle.p.x += (x - particle.p.x) * 0.01;
                particle.p.y += (y - particle.p.y) * 0.01;
              }
          }
        }
      }

      function customColorBehaviour() {
        return {
          initialize: function(particle) {
          },
          applyBehaviour: function(particle) {
            var i = (Math.floor(particle.p.x) + Math.floor(particle.p.y) * imagedata.width) * 4;
            particle.transform.rgb.r = imagedata.data[i];
            particle.transform.rgb.g = imagedata.data[i+1];
            particle.transform.rgb.b = imagedata.data[i+2];
          }
        }
      }

      function mousedownHandler(e) {
        attractionBehaviour.reset(mouseObj, 20, 50);
        repulsionBehaviour.reset(mouseObj, 10, drawCanvas.width);
      }

      function mouseupHandler(e) {
        attractionBehaviour.reset(mouseObj, 10, drawCanvas.width);
        repulsionBehaviour.reset(mouseObj, 20, 50);
      }

      function mousemoveHandler(e) {
        if (e.layerX || e.layerX == 0) {
          mouseObj.x = e.layerX;
          mouseObj.y = e.layerY;
        } else if (e.offsetX || e.offsetX == 0) {
          mouseObj.x = e.offsetX;
          mouseObj.y = e.offsetY;
        }
      }



      function tick() {
        requestAnimationFrame(tick);

        //stats.begin();
        proton.update();
        //stats.end();
      }

var mul_table = [ 1,57,41,21,203,34,97,73,227,91,149,62,105,45,39,137,241,107,3,173,39,71,65,238,219,101,187,87,81,151,141,133,249,117,221,209,197,187,177,169,5,153,73,139,133,127,243,233,223,107,103,99,191,23,177,171,165,159,77,149,9,139,135,131,253,245,119,231,224,109,211,103,25,195,189,23,45,175,171,83,81,79,155,151,147,9,141,137,67,131,129,251,123,30,235,115,113,221,217,53,13,51,50,49,193,189,185,91,179,175,43,169,83,163,5,79,155,19,75,147,145,143,35,69,17,67,33,65,255,251,247,243,239,59,29,229,113,111,219,27,213,105,207,51,201,199,49,193,191,47,93,183,181,179,11,87,43,85,167,165,163,161,159,157,155,77,19,75,37,73,145,143,141,35,138,137,135,67,33,131,129,255,63,250,247,61,121,239,237,117,29,229,227,225,111,55,109,216,213,211,209,207,205,203,201,199,197,195,193,48,190,47,93,185,183,181,179,178,176,175,173,171,85,21,167,165,41,163,161,5,79,157,78,154,153,19,75,149,74,147,73,144,143,71,141,140,139,137,17,135,134,133,66,131,65,129,1];
var shg_table = [0,9,10,10,14,12,14,14,16,15,16,15,16,15,15,17,18,17,12,18,16,17,17,19,19,18,19,18,18,19,19,19,20,19,20,20,20,20,20,20,15,20,19,20,20,20,21,21,21,20,20,20,21,18,21,21,21,21,20,21,17,21,21,21,22,22,21,22,22,21,22,21,19,22,22,19,20,22,22,21,21,21,22,22,22,18,22,22,21,22,22,23,22,20,23,22,22,23,23,21,19,21,21,21,23,23,23,22,23,23,21,23,22,23,18,22,23,20,22,23,23,23,21,22,20,22,21,22,24,24,24,24,24,22,21,24,23,23,24,21,24,23,24,22,24,24,22,24,24,22,23,24,24,24,20,23,22,23,24,24,24,24,24,24,24,23,21,23,22,23,24,24,24,22,24,24,24,23,22,24,24,25,23,25,25,23,24,25,25,24,22,25,25,25,24,23,24,25,25,25,25,25,25,25,25,25,25,25,25,23,25,23,24,25,25,25,25,25,25,25,25,25,24,22,25,25,23,25,25,20,24,25,24,25,25,22,24,25,24,25,24,25,25,24,25,25,25,25,22,25,25,25,24,25,24,25,18];

function boxBlurCanvasRGB( id, top_x, top_y, width, height, radius, iterations ){
  if ( isNaN(radius) || radius < 1 ) return;

  radius |= 0;

  if ( isNaN(iterations) ) iterations = 1;
  iterations |= 0;
  if ( iterations > 3 ) iterations = 3;
  if ( iterations < 1 ) iterations = 1;

  var canvas  = document.getElementById( id );
  var context = canvas.getContext("2d");
  var imageData;

  try {
    try {
    imageData = context.getImageData( top_x, top_y, width, height );
    } catch(e) {

    // NOTE: this part is supposedly only needed if you want to work with local files
    // so it might be okay to remove the whole try/catch block and just use
    // imageData = context.getImageData( top_x, top_y, width, height );
    try {
      netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
      imageData = context.getImageData( top_x, top_y, width, height );
    } catch(e) {
      alert("Cannot access local image");
      throw new Error("unable to access local image data: " + e);
      return;
    }
    }
  } catch(e) {
    alert("Cannot access image");
    throw new Error("unable to access image data: " + e);
    return;
  }

  var pixels = imageData.data;

  var rsum,gsum,bsum,asum,x,y,i,p,p1,p2,yp,yi,yw,idx;
  var wm = width - 1;
    var hm = height - 1;
    var wh = width * height;
  var rad1 = radius + 1;

  var r = [];
    var g = [];
    var b = [];

  var mul_sum = mul_table[radius];
  var shg_sum = shg_table[radius];

  var vmin = [];
  var vmax = [];

  while ( iterations-- > 0 ){
    yw = yi = 0;

    for ( y=0; y < height; y++ ){
      rsum = pixels[yw]   * rad1;
      gsum = pixels[yw+1] * rad1;
      bsum = pixels[yw+2] * rad1;

      for( i = 1; i <= radius; i++ ){
        p = yw + (((i > wm ? wm : i )) << 2 );
        rsum += pixels[p++];
        gsum += pixels[p++];
        bsum += pixels[p++];
      }

      for ( x = 0; x < width; x++ ){
        r[yi] = rsum;
        g[yi] = gsum;
        b[yi] = bsum;

        if( y==0) {
          vmin[x] = ( ( p = x + rad1) < wm ? p : wm ) << 2;
          vmax[x] = ( ( p = x - radius) > 0 ? p << 2 : 0 );
        }

        p1 = yw + vmin[x];
        p2 = yw + vmax[x];

        rsum += pixels[p1++] - pixels[p2++];
        gsum += pixels[p1++] - pixels[p2++];
        bsum += pixels[p1++] - pixels[p2++];

        yi++;
      }
      yw += ( width << 2 );
    }

    for ( x = 0; x < width; x++ ){
      yp = x;
      rsum = r[yp] * rad1;
      gsum = g[yp] * rad1;
      bsum = b[yp] * rad1;

      for( i = 1; i <= radius; i++ ){
        yp += ( i > hm ? 0 : width );
        rsum += r[yp];
        gsum += g[yp];
        bsum += b[yp];
      }

      yi = x << 2;
      for ( y = 0; y < height; y++){
        pixels[yi]   = (rsum * mul_sum) >>> shg_sum;
        pixels[yi+1] = (gsum * mul_sum) >>> shg_sum;
        pixels[yi+2] = (bsum * mul_sum) >>> shg_sum;

        if( x == 0 ) {
          vmin[y] = ( ( p = y + rad1) < hm ? p : hm ) * width;
          vmax[y] = ( ( p = y - radius) > 0 ? p * width : 0 );
        }

        p1 = x + vmin[y];
        p2 = x + vmax[y];

        rsum += r[p1] - r[p2];
        gsum += g[p1] - g[p2];
        bsum += b[p1] - b[p2];

        yi += width << 2;
      }
    }
  }
  context.putImageData( imageData, top_x, top_y );

}
