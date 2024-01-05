let croppingArea;
let cropper;

let canvas;
let ctx;
let imageFileInput;

let previewCanvas;
let ctxPreview;

let cPosX;
let cPosY;

let imageLoaded = false;
let inDrag = false;

let lastMousePosX = 0;
let lastMousePosY = 0;

let imgWidth;
let imgHeight;

let zoom = 1;

let zoomInput;

let image;

let cropperWidth, cropperHeight;

let test;

let fileSelectBtn;
let uploadBtn;

window.onload = function()
{
    cropperWidth = 150;
    cropperHeight = 150;

    croppingArea = document.getElementById("croppingArea-ID");
    cropper = document.getElementById("cropper-ID");

    test = document.getElementById("test-ID");

    zoomInput = document.getElementById("zoomLevel-ID");
    zoomInput.addEventListener("input", changeZoom);

    canvas = document.getElementById("imageCroppingArea-ID");
    ctx = canvas.getContext("2d");

    cropper.addEventListener("mousedown", mouseDown);
    cropper.addEventListener("mousemove", mouseMove);
    cropper.addEventListener("mouseup", mouseUp);
    cropper.addEventListener("mouseleave", mouseUp);

    cropper.addEventListener("touchstart", touchStart);
    cropper.addEventListener("touchend", touchEnd);
    cropper.addEventListener("touchmove", touchMove);

    previewCanvas = document.getElementById("preview-ID");
    ctxPreview = previewCanvas.getContext("2d");

    imageFileInput = document.getElementById("imageFileInput-ID");

    fileSelectBtn = document.getElementById("selectFile-ID");
    fileSelectBtn.addEventListener("click", function(){imageFileInput.click();})

    imageFileInput.addEventListener("change", loadImage);

    uploadBtn = document.getElementById("upload-ID");
    uploadBtn.addEventListener("click", uploadPicture);
}

function touchStart(e)
{
    e.preventDefault();
    if(imageLoaded)
    {
        inDrag = true;
    }
}

function mouseDown(e)
{
    if(imageLoaded)
    {
        inDrag = true;
    }
}

function touchMove(e)
{
    e.preventDefault();
    if(inDrag)
    {
        let pos = getTouchPos(e);

        cPosX = pos.x - cropperWidth/2;
        cPosY = pos.y - cropperHeight/2;

        checkCropperBounds();

        updateCropper();
        updatePreview();
        return;
    }
}

function mouseMove(e)
{
    if(inDrag)
    {
        let pos = getMousePos(e);

        cPosX = pos.x - cropperWidth/2;
        cPosY = pos.y - cropperHeight/2;

        checkCropperBounds();

        updateCropper();
        updatePreview();
        return;
    }
}

function touchEnd(e)
{
    e.preventDefault();
    if(inDrag)
    {
        inDrag = false;
    }
}

function mouseUp(e)
{
    if(inDrag)
    {
        inDrag = false;
    }
}

function getTouchPos(evt){
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.changedTouches[0].clientX - rect.left,
      y: evt.changedTouches[0].clientY - rect.top
    };
}

function getMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

function loadImage(e)
{
    let files = imageFileInput.files;
    if(files.length != 1)
    {
        console.log("Please select only one file");
        imageFileInput.value = "";
        return;
    }

    let selectedFile = files[0];

    if(FileReader)
    {
        let extension = selectedFile.name.split('.').pop().toLowerCase();
        if(extension != "jpg" && extension != "png" && extension != "jpeg")
        {
            console.log("Extension: " + extension + " not supported. Please select a PNG, JPEG or JPG format");
            return;
        }

        if((selectedFile.size / 1024)/1024 > 15)
        {
            console.log("Files larger than 15MB are not supported. And btw wtf.")
            return;
        }

        let fr = new FileReader();

        fr.onload = function()
        {
            image = new Image();
            image.onload = function()
            {
                imgWidth = image.width*zoom;
                imgHeight = image.height*zoom;

                cPosX = 0;
                cPosY = 0;
                updateCanvas();

                ctx.scale(zoom,zoom);
                ctx.drawImage(image, 0,0);
                imageLoaded = true;

                updateCropper();
                updatePreview();
            }
            image.src = fr.result;
        }

        fr.readAsDataURL(selectedFile);
    }
    else
    {
        console.log("File reader not supported");
    }
}

function changeZoom(e)
{
    let oldZoom = zoom;
    zoom = zoomInput.value;

    let newWidth = image.width*zoom;
    let newHeight = image.height*zoom;

    if((newWidth < cropperWidth || newHeight < cropperHeight) & zoom < oldZoom)
    {
        zoom = oldZoom;
        zoomInput.value = oldZoom;
        return;
    }

    ctx.clearRect(0,0, imgWidth, imgHeight);

    imgWidth = newWidth;
    imgHeight = newHeight;

    updateCanvas();

    ctx.scale(zoom,zoom);
    ctx.drawImage(image, 0,0);

    checkCropperBounds();
    updateCropper();
    updatePreview();
}

function checkCropperBounds()
{
    if(cPosX < -1)
    {
        cPosX = -1;
    }

    if(cPosY < -1)
    {
        cPosY = -1;
    }

    if(cPosX+cropperWidth > imgWidth)
    {
        cPosX = imgWidth-cropperWidth;
    }

    if((cPosY+cropperHeight) > imgHeight)
    {
        cPosY = imgHeight-cropperHeight;
    }
}

function updateCanvas()
{
    let tempWidth = 700;
    let tempHeight = 400;
    if(imgWidth < 700)
    {
        tempWidth = imgWidth;
    }

    if(imgHeight < 400)
    {
        tempHeight = imgHeight;
        croppingArea.setAttribute("style", "height:"+imgHeight+"px;");
    }

    croppingArea.setAttribute("style", "width:"+tempWidth+"px;height:"+tempHeight+"px;");
    test.setAttribute("style","width:"+ imgWidth+"px;height:"+imgHeight+"px;");
    canvas.width = imgWidth;
    canvas.height = imgHeight;
}

function updateCropper()
{
    cropper.setAttribute("style", "left:"+parseFloat(cPosX)+"px; top:"+parseFloat(cPosY)+"px;")
}

function updatePreview()
{
    ctxPreview.putImageData(ctx.getImageData(cPosX, cPosY, cropperWidth, cropperHeight), 0, 0);
}

function uploadPicture()
{
    let dataURL = previewCanvas.toDataURL("image/png");
    var newTab = window.open('about:blank','image from canvas');
    newTab.document.write("<img src='" + dataURL + "' alt='from canvas'/>");
}