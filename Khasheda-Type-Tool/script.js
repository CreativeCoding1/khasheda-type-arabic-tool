let coords = [];
let cutoff = 3000, drawing = false, txt = "اهلا ", textSizeSlider, bgcolor, textcolor, textbgcolor, layer, rectStrokeWeight = 1,
rectStrokeSlider, StrokeColor, sel;

function setup() {
    createCanvas(windowWidth - 200, windowHeight);
    layer = createGraphics(windowWidth - 200, windowHeight); // Initialize layer
    textSize(16);
    fill(255);
    let guiHolder = createDiv().class('guiholder');
    createDiv('أهلا!').parent(guiHolder).class('gui-title');

    // Text Controls
    createDiv('النص').parent(guiHolder).class('gui-label');
    let myInput = createInput(txt).parent(guiHolder).class('text-input');
    myInput.attribute('placeholder', 'اكتب النص هنا');
    myInput.input(function() {
        txt = this.value();
    });

    createDiv('لون خلفية النص').parent(guiHolder).class('gui-label');
    textbgcolor = createColorPicker('#0000ff').parent(guiHolder).class('colorpicker');
    
    createDiv('لون النص').parent(guiHolder).class('gui-label');
    textcolor = createColorPicker(255).parent(guiHolder).class('colorpicker');

    createDiv('حجم النص').parent(guiHolder).class('gui-label');
    textSizeSlider = createSlider(12, 80, 24, 1).parent(guiHolder).class('slider').input(updateTextSize);

    // Color Controls
    createDiv('لون الخلفية').parent(guiHolder).class('gui-label');
    bgcolor = createColorPicker(0).parent(guiHolder).class('colorpicker');

    // Rectangle Stroke Weight Slider
    createDiv('حدود الشكل').parent(guiHolder).class('gui-label');
    rectStrokeSlider = createSlider(0, 10, 1, 1).parent(guiHolder).class('slider').input(updateRectStrokeWeight);

    // Shape Selector
    createDiv('الشكل').parent(guiHolder).class('gui-label');
    sel = createSelect().parent(guiHolder).class('selector');
    sel.option('مستطيل');
    sel.option('دائرة');
    sel.option('نجمة');
    sel.changed(changeShapes);

    // Stroke Color Picker
    createDiv('لون الحدود').parent(guiHolder).class('gui-label');
    StrokeColor = createColorPicker(0).parent(guiHolder).class('colorpicker');

    createDiv('[R] لإعادة التعيين').parent(guiHolder).class('gui-label');
    createDiv('[S] للحفظ').parent(guiHolder).class('gui-label');

    createElement('style', `
        .guiholder {
            position: fixed;
            top: 0;
            right: 15px;
            background: white;
            border: 1px solid white;
            width: 200px;
            height: 100%;
            padding: 10px;
            overflow:hidden;
        }
        .gui-title {
            font-family: monospace;
            font-style: italic;
            color: white;
            background: black;
            text-align: center;
            font-size: 2rem;
            margin-bottom: 10px;
            overflow: hidden;
            white-space: nowrap;
            animation: marquee 3s linear infinite;
        }
        @keyframes marquee {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
        }
        .gui-label {
            font-family: monospace;
            margin-top: 10px;
            text-align: center;
            color: black;
        }
        .slider {
            -webkit-appearance: none;
            width: 100%;
            margin-top: 5px;
        }
        .colorpicker {
            -webkit-appearance: none;
            border: none;
            width: 100%;
            margin-top: 5px;
        }
        .text-input {
            width: 100%; /* Adjusted for padding */
            box-sizing: border-box;
            margin-top: 5px;
            
        }
        input[type="color"]::-webkit-color-swatch-wrapper {
            padding: 0;
        }
        input[type="color"]::-webkit-color-swatch {
            border: none;
        }
        .selector {
            border: none;
            width: 100%;
            margin-top: 5px;
        }
    `);

    window.addEventListener('keydown', handleKeyPress);
}

function draw() {
    background(bgcolor.color());
    
    let currentFrame = frameCount;

    image(layer, 0, 0);

    if(drawing) {
        layer.clear();

        let textWidth = layer.textWidth(txt);
        let textHeight = textSizeSlider.value();
        let strokeColor = StrokeColor.color();

        for(let i = 0; i < coords.length; i++) {
            layer.fill(textbgcolor.color());
            layer.stroke(strokeColor);
            layer.strokeWeight(rectStrokeWeight);

            switch(sel.value()) {
                case 'مستطيل':
                    drawRectangle(layer, coords[i].x, coords[i].y, textWidth, textHeight);
                    break;
                case 'دائرة':
                    drawCircle(layer, coords[i].x, coords[i].y, textWidth, textHeight);
                    break;
                case 'نجمة':
                    drawStar(layer, coords[i].x, coords[i].y, textWidth, textHeight);
                    break;
                default:
                    break;
            }

            // Set fill color for the text
            layer.fill(textcolor.color());

            // Draw text on the off-screen buffer with adjusted size
            layer.textSize(textSizeSlider.value());
            layer.text(txt, coords[i].x, coords[i].y);
        }

        // Store new coordinates based on mouse interaction
        if(mouseIsPressed) {
            coords.push(createVector(mouseX, mouseY));
        }

        // Remove the oldest coordinate if array size exceeds cutoff
        if(coords.length > cutoff) {
            coords.shift(); // Remove the first element from array
        }
    }
}

function drawRectangle(layer, x, y, width, height) {
    layer.rect(x, y - height, width, height);
}

function drawCircle(layer, x, y, width, height) {
    layer.ellipse(x+15, y-10, width, height+10);
}

function drawStar(layer, x, y, width, height) {
    let angle = TWO_PI / 30; // Using 5 points for a star
    let halfAngle = angle / 2.0;
    let outerRadius = width / 1.2;
    let innerRadius = height / 1.2;

    // Calculate star position
    let starX = x + width / 2-5;
    let starY = y + height / 2-20;

    layer.beginShape();
    for (let a = -PI / 2; a < TWO_PI - PI / 2; a += angle) {
        let sx = starX + cos(a) * outerRadius;
        let sy = starY + sin(a) * outerRadius;
        layer.vertex(sx, sy);
        
        let sx2 = starX + cos(a + halfAngle) * innerRadius;
        let sy2 = starY + sin(a + halfAngle) * innerRadius;
        layer.vertex(sx2, sy2);
    }
    layer.endShape(CLOSE);
}

function changeShapes() {
    // Update shape drawing based on selection
    let val = sel.value();
    if(val === 'مستطيل') {
        textbgcolor.value('#001bff');
    } else if(val === 'دائرة') {
        textbgcolor.value('#FF0000');
    } else if(val === 'نجمة') {
        textbgcolor.value('#00ff00');
    }
}
function keyPressed() {
    handleKeyPress(event);
}

function mousePressed() {
    drawing = true;
}

function mouseReleased() {
    drawing = false;
}

function updateTextSize() {
    layer.textSize(textSizeSlider.value());
}

function updateRectStrokeWeight() {
    rectStrokeWeight = rectStrokeSlider.value();
}

function handleKeyPress(event) {
    if (event.key === 'R' || event.key === 'r') {
        layer.clear();  
        coords = [];    
    } else if (event.key === 'S' || event.key === 's') {
        saveCanvas(layer, 'Khasheda', 'png');  
    }
}
