import "./App.css";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import { useRef, useState } from "react";
import { drawHand } from "./utilities";

 
//part 2 import

import * as fp from 'fingerpose'
import { Finger ,FingerCurl,FingerDirection} from "./fingerDescription";
import GestureDescription from "./gestureDescription";
//import the images if necessary


//new gesture 

const thumbsdown = new GestureDescription('thumbs_down');

// thumb:
// - not curled
// - vertical up (best) or diagonal up left / right

thumbsdown.addCurl(Finger.Thumb, fp.FingerCurl.NoCurl, 1.0);
thumbsdown.addDirection(Finger.Thumb, FingerDirection.VerticalDown, 1.0);
thumbsdown.addDirection(Finger.Thumb, FingerDirection.DiagonalDownLeft, 0.5);
thumbsdown.addDirection(Finger.Thumb, FingerDirection.DiagonalDownRight, 0.5);

// all other fingers:
// - curled
// - horizontal left or right
for(let finger of [Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
  thumbsdown.addCurl(finger, FingerCurl.FullCurl, 1.0);
  thumbsdown.addDirection(finger, FingerDirection.HorizontalLeft, 1.0);
  thumbsdown.addDirection(finger, FingerDirection.HorizontalRight, 1.0);
}

const oneFinger = new GestureDescription('one');

//added direction
oneFinger.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);



for(let finger of [  Finger.Ring, Finger.Pinky]) {
  oneFinger.addCurl(finger, FingerCurl.FullCurl, 1.0);
  oneFinger.addDirection(finger, FingerDirection.HorizontalLeft, 1.0);
  oneFinger.addDirection(finger, FingerDirection.HorizontalRight, 1.0);
}


const fiveFinger = new GestureDescription('five')


fiveFinger.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);
fiveFinger.addDirection(Finger.Middle, FingerDirection.VerticalUp, 1.0);
fiveFinger.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 1.0);
fiveFinger.addDirection(Finger.Ring, FingerDirection.VerticalUp, 1.0);
fiveFinger.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 1.0);
fiveFinger.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
fiveFinger.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
fiveFinger.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
fiveFinger.addCurl(Finger.Ring, FingerCurl.NoCurl, 1.0);
fiveFinger.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);







function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  //defined a state 
  const [emoji,setEmoji] = useState(null)
  
  const runHandpose = async ()=>{
    const net = await handpose.load()

    console.log('handpose Loaded')
    setInterval(()=>{
      detectHand(net)
    },100)
  }
  runHandpose()

const detectHand = async(net)=>{
  // if(typeof webcamRef.current !== 'undefined' &&
  // webcamRef.current !== null &&
  // webcamRef.current.video.readyState ===4){

  //   //geting webcam width and height
  //   const video = webcamRef.current.video  
  //   const videoHeight = webcamRef.current.videoHeight
  //   const videoWidth = webcamRef.current.videoWidth
    

  //   //setting video width and height

  //   webcamRef.current.video.width = videoWidth
  //   webcamRef.current.video.height = videoHeight

  //   //setting canvas height and width

  //   canvasRef.current.width = videoWidth
  //   canvasRef.current.height = videoHeight

  //   //making the detections

  //   const hand = await net.estimateHands(video);
  //   console.log(hand);
    
  //   //drawing hand

  //   const ctx = canvasRef.current.getContext('2d')
  //   drawHand(hand,ctx)

  // }

  if (
    typeof webcamRef.current !== "undefined" &&
    webcamRef.current !== null &&
    webcamRef.current.video.readyState === 4
  ) {
    // Get Video Properties
    const video = webcamRef.current.video;
    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;

    // Set video width
    webcamRef.current.video.width = videoWidth;
    webcamRef.current.video.height = videoHeight;

    // Set canvas height and width
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    // Make Detections
    const hand = await net.estimateHands(video);
    //console.log(hand);



    if(hand.length >0){
      const GE = new fp.GestureEstimator([
        fp.Gestures.VictoryGesture,
        fp.Gestures.ThumbsUpGesture,
        thumbsdown,
        oneFinger,
        fiveFinger
        
       
        //custom gestures here
        
      ])
      const gesture = await GE.estimate(hand[0].landmarks,8)
      //console.log(gesture)
      if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
        // console.log(gesture.gestures);

        const confidence = gesture.gestures.map(
          (prediction) => prediction.confidence
        );
        const maxConfidence = confidence.indexOf(
          Math.max.apply(null, confidence)
        );
        // console.log(gesture.gestures[maxConfidence].name);
        setEmoji(gesture.gestures[maxConfidence].name);
        console.log(emoji);
      }
    }

    // Draw mesh
    const ctx = canvasRef.current.getContext("2d");
    drawHand(hand, ctx);
  }
}

  return (

    <div className="App">
      <header className="App-header">

        
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
          }}
        />

      </header>
      {
        emoji=='thumbs_up'&&(<h1>Thumbs Up detected</h1>)
      }
      {
        emoji=='victory'&&(<h1>peace</h1>)
      }
      {
        emoji=='thumbs_down'&&(<h1>Thumbs down detected</h1>)
      }
      {
        emoji=='one'&&(<h1>One finger detected</h1>)
      }
      {
        emoji=='five'&&(<h1>Five finger detected</h1>)
      }
    </div>
  );
}




export default App;
