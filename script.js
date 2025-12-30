/******** CONFIG ********/
const GRID_SIZE = 5;
const KERNEL_SIZE = 3;

/******** DATA ********/
let image = [
  [1,2,3,0,1],
  [4,5,6,1,2],
  [7,8,9,0,1],
  [1,2,3,4,5],
  [0,1,2,3,4]
];

let kernels = [
  [
    [0,1,0],
    [1,-1,1],
    [0,1,0]
  ],
  [
    [1,0,-1],
    [1,0,-1],
    [1,0,-1]
  ],
  [
    [0,0,0],
    [0,1,0],
    [0,0,0]
  ]
];

let activeKernelIndex = 0;

/******** DOM ********/
const slideBox = document.getElementById("slide-box");
const imageGrid = document.getElementById("image-grid");
const kernelGrid = document.getElementById("kernel-grid");
const calcBox = document.getElementById("calculation-box");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const playBtn = document.getElementById("playBtn");
const stopBtn = document.getElementById("stopBtn");
const speedRange = document.getElementById("speedRange");
const stepInfo = document.getElementById("stepInfo");
const imageInputsDiv = document.getElementById("image-inputs");
const kernelInputsDiv = document.getElementById("kernel-inputs");
const strideSelect = document.getElementById("strideSelect");
const paddingToggle = document.getElementById("paddingToggle");
const filterSelect = document.getElementById("filterSelect");

/******** STATE ********/
let imageCells = [];
let positions = [];
let currentIndex = 0;
let playInterval = null;

/******** HELPERS ********/
function getPaddedImage(img, pad){
  if(!pad) return img;
  const s = img.length;
  const p = Array(s+2).fill(0).map(()=>Array(s+2).fill(0));
  for(let r=0;r<s;r++) for(let c=0;c<s;c++) p[r+1][c+1]=img[r][c];
  return p;
}

function buildPositions(){
  positions=[];
  const stride=Number(strideSelect.value);
  const pad=paddingToggle.checked;
  const base=getPaddedImage(image,pad);
  const limit=base.length-KERNEL_SIZE;
  for(let r=0;r<=limit;r+=stride)
    for(let c=0;c<=limit;c+=stride)
      positions.push([r,c]);
  currentIndex=0;
}

/******** RENDER IMAGE ********/
function renderImage(){
  imageGrid.innerHTML="";
  imageInputsDiv.innerHTML="";
  imageCells=[];
  image.forEach((row,r)=>{
    row.forEach((val,c)=>{
      const cell=document.createElement("div");
      cell.className="cell";
      cell.textContent=val;
      imageGrid.appendChild(cell);
      imageCells.push(cell);

      const input=document.createElement("input");
      input.type="number";
      input.value=val;
      input.className="image-input";
      input.oninput=()=>{
        image[r][c]=Number(input.value);
        cell.textContent=input.value;
        buildPositions();
        showConvolution(...positions[currentIndex]);
      };
      imageInputsDiv.appendChild(input);
    });
  });
}

/******** RENDER KERNEL ********/
function renderKernel(){
  kernelGrid.innerHTML="";
  kernelInputsDiv.innerHTML="";
  const k=kernels[activeKernelIndex];
  k.forEach((row,i)=>{
    row.forEach((val,j)=>{
      const cell=document.createElement("div");
      cell.className="cell";
      cell.textContent=val;
      kernelGrid.appendChild(cell);

      const input=document.createElement("input");
      input.type="number";
      input.value=val;
      input.className="kernel-input";
      input.oninput=()=>{
        kernels[activeKernelIndex][i][j]=Number(input.value);
        cell.textContent=input.value;
        showConvolution(...positions[currentIndex]);
      };
      kernelInputsDiv.appendChild(input);
    });
  });
}

/******** CONVOLUTION ********/
function showConvolution(r,c){
  imageCells.forEach(x=>x.classList.remove("highlight"));
  const pad=paddingToggle.checked;
  const base=getPaddedImage(image,pad);
  let sum=0,txt="";
  const k=kernels[activeKernelIndex];
  for(let i=0;i<3;i++){
    let line="";
    for(let j=0;j<3;j++){
      const img=base[r+i][c+j];
      const ker=k[i][j];
      sum+=img*ker;
      line+=`(${img}×${ker}) `;
      if(!pad){
        const idx=(r+i)*GRID_SIZE+(c+j);
        if(imageCells[idx]) imageCells[idx].classList.add("highlight");
      }
    }
    txt+=line+"\n";
  }
  txt+=`\n= ${sum}`;
  calcBox.textContent=txt;
  stepInfo.textContent=`Step: ${currentIndex+1} / ${positions.length}`;
}

/******** NAV ********/
function nextStep(){
  currentIndex=(currentIndex+1)%positions.length;
  showConvolution(...positions[currentIndex]);
}
function prevStep(){
  currentIndex=(currentIndex-1+positions.length)%positions.length;
  showConvolution(...positions[currentIndex]);
}

/******** PLAY ********/
function play(){
  stopPlay();
  playInterval=setInterval(nextStep,Number(speedRange.value));
}
function stopPlay(){
  if(playInterval){clearInterval(playInterval);playInterval=null;}
}

/******** EVENTS ********/
nextBtn.onclick=nextStep;
prevBtn.onclick=prevStep;
playBtn.onclick=play;
stopBtn.onclick=stopPlay;

strideSelect.onchange=()=>{buildPositions();showConvolution(...positions[currentIndex]);};
paddingToggle.onchange=()=>{buildPositions();showConvolution(...positions[currentIndex]);};
filterSelect.onchange=()=>{
  activeKernelIndex=Number(filterSelect.value);
  renderKernel();
  showConvolution(...positions[currentIndex]);
};

/******** INIT ********/
renderImage();
renderKernel();
buildPositions();
showConvolution(...positions[currentIndex]);

// smooth sliding box (visual)
const cellSize = 54; // 50 + gap


