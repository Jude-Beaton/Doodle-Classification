const len = 784;
const total_data = 10000;

const CAT = 0;
const RAINBOW = 1;
const TRAIN = 2;

let cats_data;
let trains_data;
let rainbows_data;

let cats = {};
let trains = {};
let rainbows = {};

let nn;






function preload() {
  cats_data = loadBytes('data/cats10000.bin');
  trains_data = loadBytes('data/trains10000.bin');
  rainbows_data = loadBytes('data/rainbows10000.bin');
}

function prepareData(category, data, label) {
  category.training = [];
  category.testing = [];
  for (let i = 0; i < total_data; i++) {
    let offset = i * len;
    let threshold = floor(0.8 * total_data);
    if(i < threshold) {    
      category.training[i] = data.bytes.subarray(offset, offset + len);
      category.training[i].label = label;
    }else{
      category.testing[i - threshold] = data.bytes.subarray(offset, offset + len);
      category.testing[i - threshold].label = label;
    }
  }
}

function trainEpoch(training) {
  shuffle(training, true);
  for (let i = 0; i < training.length; i++){
    let data = training[i];
    let inputs = Array.from(data).map(x => x / 255);
    
    let label = training[i].label;
    let targets = [0,0,0];
    targets[label] = 1;
    // console.log(inputs);
    // console.log(targets);

    nn.train(inputs, targets);
  }
}

function testAll(testing) {

  let correct = 0;

  for (let i = 0; i < testing.length; i++){
    let data = testing[i];
    let inputs = Array.from(data).map(x => x / 255);
    let label = testing[i].label;
    let guess = nn.predict(inputs);
    

    let m = max(guess);
    let classification = guess.indexOf(m);
    // console.log(guess);
    // console.log(classification);
    // console.log(label);

    if (classification === label) {
      correct++;
    }    
  }
  let percent = 100 * correct / testing.length;
  return percent;
}

function draw() {
  strokeWeight(8);
  stroke(0);
  if (mouseIsPressed){
    line(pmouseX, pmouseY, mouseX, mouseY);
  }
}

function setup() {
  createCanvas(280, 280);
  background(255);

  //prepping data

  prepareData(cats, cats_data, CAT);
  prepareData(rainbows, rainbows_data, RAINBOW);
  prepareData(trains, trains_data, TRAIN);


  //making nn

  nn = new NeuralNetwork(784, 64, 3);



  let training = [];
  training = training.concat(cats.training);
  training = training.concat(rainbows.training);
  training = training.concat(trains.training);


  let testing = [];
  testing = testing.concat(cats.testing);
  testing = testing.concat(rainbows.testing);
  testing = testing.concat(trains.testing);

  let trainButton = select('#train');
  let epochCounter = 0;
  trainButton.mousePressed(function(){
    trainEpoch(training);
    epochCounter++;
    console.log("Epoch: " + epochCounter);
  });

  let testButton = select('#test');
  testButton.mousePressed(function(){
    let percent = testAll(testing);
    console.log("Percent: " + nf(percent, 2, 2) + "%");
  });

  let guessButton = select('#guess');
  guessButton.mousePressed(function(){
    let inputs = [];
    let img = get();
    img.resize(28, 28);

    img.loadPixels();
    for (let i = 0; i < len; i++) {
      let bright = img.pixels[i*4];
      inputs[i] = (255 - bright )/ 255.0;
    }
    //console.log(inputs);

    let guess = nn.predict(inputs);
    let m = max(guess);
    let classification = guess.indexOf(m);
    if (classification === CAT) {
      console.log("cat");
    } else if (classification === RAINBOW) {
      console.log("rainbow");
    } else if (classification === TRAIN) {
      console.log("train")
    }
  });

  let clearButton = select('#clearbtn');
  clearButton.mousePressed(function(){
    clear();
    background(255);
  });
  // for (let i = 1; i < 6; i++) {
  //   trainEpoch(training);
  //   console.log("Epoch:" + i);
  //   let percent = testAll(testing);
  //   console.log("Correct: " + (percent*100) + "%");
  // }

  // let total = 100;
  // for (let n = 0; n < total; n++) {
  //   let img = createImage(28, 28);
  //   img.loadPixels();
  //   let offset = n * 784;
  //   for (let i = 0; i < 784; i++) {
  //     let val = cats_data.bytes[i + offset];
  //     img.pixels[i * 4 + 0] =  val;
  //     img.pixels[i * 4 + 1] =  val;
  //     img.pixels[i * 4 + 2] =  val;
  //     img.pixels[i * 4 + 3] =  255;
  //   }
  //   img.updatePixels();
  //   let x = (n % 10) * 28;
  //   let y = floor(n / 10) * 28;
  //   image(img, x, y);
  // }
}