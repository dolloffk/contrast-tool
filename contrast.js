// Convert a color into an object

function toColorObject(color) {
  var hex = "";
  var rgb = [];
  var srgb = [];
  var hsl = [];
  color = color.replace(/\s+/g, ""); // Remove whitespace
  color = color.toLowerCase();

  if (color.substring(0,1) == "r") { // Look for rgb input
    var first, second, third, redVal, greenVal, blueVal;
    color = color.replace(/;/g,",");

    first = color.indexOf(",");
    redVal = color.substring(4,first);
    
    second = (color.substring(first+1,color.length)).indexOf(",");
    greenVal = color.substring(first+1,first+second+1);

    blueVal = color.substring(first+second+2,color.length-1);

    rgb = [parseInt(redVal), parseInt(greenVal), parseInt(blueVal)];

    // Get hex
    hex = RGBToHex(rgb);

    // Get sRGB
    srgb = RGBToSRGB(rgb);

    // Get HSL
    hsl = RGBToHSL(srgb);

  } else if (color.substring(0,1) == "h") { // Look for hsl input
    var first, second, third, hueVal, satVal, lumVal;
    color = color.replace(/;/g,",");

    first = color.indexOf(",");
    hueVal = color.substring(4,first);
    
    second = (color.substring(first+1,color.length)).indexOf(",");
    satVal = color.substring(first+1,first+second+1);

    lumVal = color.substring(first+second+2,color.length-1);

    hsl = [parseInt(hueVal), parseInt(satVal)/100, parseInt(lumVal)/100];

    // Get sRGB
    srgb = HSLToRGB(hsl);

    // Get RGB
    rgb = sRGBToRGB(srgb);

    // Get hex
    hex = RGBToHex(rgb);

  } else { // Look for hex input
    hex = color;
    if (color.substring(0,1) == "#") {
      hex = color.substring(1,7);
    }
    if (hex.length == 3) {
      hex = hex + hex;
    }

    hex = hex.toLowerCase();

    // Get RGB
    rgb = hexToRGB(hex);

    // Get sRGB
    srgb = RGBToSRGB(rgb);

    // Get HSL
    hsl = RGBToHSL(srgb);
  } 

  const colorObject = {
    hex: hex,
    rgb: rgb,
    srgb: srgb,
    hsl: hsl
  }

  return colorObject;
}

// Convert hex to RGB

function hexToRGB(hex) {
  var result = [];
  result[0] = parseInt(hex.substring(0,2),16);
  result[1] = parseInt(hex.substring(2,4),16);
  result[2] = parseInt(hex.substring(4,6),16);
  return result;
}

// Convert RGB to hex

function RGBToHex(rgb) {
  var hex = componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);
  return hex;
}

function componentToHex(c) {
  var hex = c.toString(16);
  
  if (hex.length == 1) {
    hex = "0" + hex;
  }

  return hex;
}

// Convert RGB to sRGB

function RGBToSRGB(rgb) {
  var srgb = [];

  for (let i=0; i < 3; i++) {
   srgb[i] = rgb[i]/255;
  }

  return srgb;
}

// Convert sRGB to RGB

function sRGBToRGB(srgb) {
  var rgb = [];

  for (let i=0; i < 3; i++) {
   rgb[i] = Math.round(srgb[i] * 255);
  }

  return rgb;
}

// Convert sRGB to HSL

function RGBToHSL(srgb) {
  var hsl = [];
  var maxVal = Math.max(...srgb);
  var minVal = Math.min(...srgb);
  var chroma = maxVal - minVal;
  var lumi = (maxVal + minVal)/2;

  if (chroma == 0) {
    hsl[0] = 0;
  } else if (maxVal == srgb[0]) {
    hsl[0] = 60 * (((srgb[1]-srgb[2])/chroma) % 6);
  } else if (maxVal == srgb[1]) {
    hsl[0] = 60 * ((srgb[2]-srgb[0])/chroma + 2);
  } else if (maxVal == srgb[2]) {
    hsl[0] = 60 * ((srgb[0]-srgb[1])/chroma + 4);
  } 

  if (hsl[0] < 0) {
    hsl[0] = 360+hsl[0];
  }

  if (lumi == 0 || lumi == 1) {
    hsl[1] = 0;
  } else {
    hsl[1] = chroma/(1-Math.abs(2*lumi-1));
}

  hsl[2] = lumi;

  return hsl;
}

// Convert HSL to sRGB

function HSLToRGB(hsl) {
  var rgb = [];
  var rgb1 = [];
  var chroma = (1 - Math.abs(2*hsl[2]-1)) * hsl[1];
  var h = hsl[0]/60;
  var x = chroma * (1 - Math.abs((h % 2) - 1));
  var m = hsl[2] - chroma/2;
  if (h >= 0 && h < 1) {
    rgb1 = [chroma, x, 0];
  } else if (h >= 1 && h < 2) {
    rgb1 = [x, chroma, 0];
  } else if (h >= 2 && h < 3) {
    rgb1 = [0,chroma,x];
  } else if (h >=3 && h < 4) {
    rgb1 = [0,x,chroma];
  } else if (h >= 4 && h < 5) {
    rgb1 = [x,0,chroma];
  } else if (h >= 5 && h < 6) {
    rgb1 = [chroma,0,x];
  }

  for (let i=0; i < 3; i++) {
    rgb[i] = rgb1[i] + m;
  }

  return rgb;
}

// Calculate relative luminance

function relativeLuminance(srgb) {
  var lum = [];
  var L = 0;

  for (let i=0; i < 3; i++) {
    if (srgb[i] <= 0.03928) {
      lum[i] = srgb[i]/12.92;
    } else {
      lum[i] = ((srgb[i] + 0.055)/1.055)**2.4;
    }
  }

  L = 0.2126*lum[0] + 0.7152*lum[1] + 0.0722*lum[2];
  return L;
}

// Calculate contrast

function checkContrast(srgb1,srgb2) {
  const l1 = relativeLuminance(srgb1);
  const l2 = relativeLuminance(srgb2);

  var contrast = (l1 + 0.05) / (l2 + 0.05);

  if (contrast < 1) {
    contrast = 1/contrast;
  }

  contrast = +(contrast.toFixed(2));

  return contrast;
}

// Fix contrast

function fixContrast(color1,color2,thresh) {
  var contrast = checkContrast(color1.srgb,color2.srgb);
  var hslNew = color1.hsl;
  var hslString;
  var tempColor;
  const black = [0, 0, 0];
  const white = [0, 0, 1];
  
  if (relativeLuminance(color2.srgb) < 0.5) {
    var i = 0.01;
  } else {
    var i = -0.01;
  }

  while (contrast < thresh) {
    hslNew = shiftLumi(hslNew,i);
    tempColor = HSLToRGB(hslNew);
    contrast = checkContrast(tempColor,color2.srgb);
    i += Math.sign(i)*0.01;
  }

  // Check if we overshot on accident
  if (hslNew[2] > 1 || hslNew[2] < 0) {
    if (Math.sign(i) < 0 && checkContrast(black,color2.srgb) >= 4.5) {
      hslNew = black;
    } else if (Math.sign(i) > 0 && checkContrast(white,color2.srgb >= 4.5)) {
      hslNew = white;
    }
  }

  hslString = 'hsl('+Math.round(hslNew[0])+', '+ Math.round(hslNew[1] * 100)+'%, '+ Math.round(hslNew[2] * 100)+'%)';
  return hslString;
}

// Shift luminosity

function shiftLumi(hsl,i) {
  hslNew = hsl;
  hslNew[2] = hsl[2] + i;
  return hslNew;
}

function clearResults() {
  document.getElementById("aa").style.display = "none";
  document.getElementById("aaa").style.display = "none";
  document.getElementById("errorcontrast").innerHTML = "";
  
}

function stylePreview(color,background,div) {
  var target = document.getElementById(div);
  target.style.color = "#"+color.hex;
  target.style.background = "#"+background.hex;
}

function contrastError(level,color,background) {
  if (relativeLuminance(color.srgb) > relativeLuminance(background.srgb)) {
    document.getElementById("errorcontrast").innerHTML = '<p>It isn\'t possible to satisfy the ' + level + ' WCAG standards with lighter text on this background color. You should pick a darker background color if you want the text to be lighter.</p>';
  } else {
    document.getElementById("errorcontrast").innerHTML = '<p>It isn\'t possible to satisfy the ' + level + ' WCAG standards with darker text on this background color. You should pick a lighter background color if you want the text to be darker.</p>';
  }
}

function printColor(color, div) {
  document.getElementById(div).innerHTML = "<p><strong>Hex</strong>: #" + color.hex + "</p>"
  + "<p><strong>RGB</strong>: rgb(" + color.rgb[0] + ", " + color.rgb[1] + ", " + color.rgb[2] + ")</p>"
  + "<p><strong>HSL</strong>: hsl(" + Math.round(color.hsl[0]) + ", " + Math.round(color.hsl[1] * 100) + "%, " 
  + Math.round(color.hsl[2] * 100) + "%)</p>";
}