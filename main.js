function mainFunction() {
  
  clearResults();

  var color = toColorObject(document.getElementById("color").value); 
  var background = toColorObject(document.getElementById("background").value);
  var contrast;

  var hslAA, colorAA, hslAAA, colorAAA;

  document.getElementById("swatch-color").style.background = "#" + color.hex;
  printColor(color, "color-results");

  document.getElementById("swatch-bg").style.background = "#" + background.hex;
  printColor(background, "bg-results");
  stylePreview(color,background,"preview");


  contrast = checkContrast(color.srgb,background.srgb);
  document.getElementById("contrast").innerHTML = '<p><strong>Contrast</strong>: '+contrast+'</p>';

  if (+(contrast) < 4.5) {
  document.getElementById("contrast").innerHTML += '<p>Your contrast ratio doesn\'t satisfy the WCAG standards for accessible text.</p>';

  hslAA = fixContrast(color,background,4.5);
  colorAA = toColorObject(hslAA);

  if (colorAA.hsl[2] <= 1) {
    printColor(colorAA, "aacolor");
    stylePreview(colorAA,background,"aapreview");
    document.getElementById("aa").style.display = "block";

    hslAAA = fixContrast(color,background,7);
    colorAAA = toColorObject(hslAAA);

    if (colorAAA.hsl[2] <= 1) {
      printColor(colorAAA, "aaacolor");
      stylePreview(colorAAA,background,"aaapreview");
      document.getElementById("aaa").style.display = "block";
    } else {
      contrastError("AAA", color, background);
    }
  } else {
    contrastError("AA", color, background);
  }

  } else if (+(contrast) < 7)  {
  document.getElementById("contrast").innerHTML += '<p>Your contrast ratio satisfies the AA WCAG standards for accessible text.</p>';

  hslAAA = fixContrast(color,background,7);
  colorAAA = toColorObject(hslAAA);
  if (colorAAA.hsl[2] <= 1) {
    printColor(colorAAA, "aaacolor");
    stylePreview(colorAAA,background,"aaapreview");
    document.getElementById("aaa").style.display = "block";
  } else {
    contrastError("AAA", color, background);
  }
  } else {
  document.getElementById("contrast").innerHTML += '<p>Your contrast ratio satisfies the AAA WCAG standards for accessible text.</p>';
  }
}

mainFunction();