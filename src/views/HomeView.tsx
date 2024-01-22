/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/HomeView.tsx
import React, { useEffect, useRef, useState } from 'react';
import Client, { Agent, IPoint, IStep, MapData } from "../Client";

import Terrain from "../assets/maps/terrain_upscaled.png";
import CoinIcon from "../assets/icons/coin.png";

import AkiIcon from "../assets/icons/Aki.png";
import UkiIcon from "../assets/icons/Uki.png";
import JockeIcon from "../assets/icons/Jocke.png";
import MickoIcon from "../assets/icons/Micko.png";

import styles from './HomeView.module.css'; 

interface AgentInfo {
  name: Agent;
  icon: string;
}

const agents: AgentInfo[] = [
  { name: "Aki", icon: AkiIcon },
  { name: "Uki", icon: UkiIcon },
  { name: "Jocke", icon: JockeIcon },
  { name: "Micko", icon: MickoIcon },
];

const HomeView: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [mapsData, setMapsData] = useState<MapData[] | null>(null);
  const [selectedMap, setSelectedMap] = useState<MapData | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentInfo>(agents[0]);
  const [agentPosition, setAgentPosition] = useState<IPoint>({ x: 0, y: 0 });
  const [agentMoving, setAgentMoving] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [currentNode, setCurrentNode] = useState<number>(0);
  const [steps, setSteps] = useState<IStep[] | null>(null);
  const [count,setCount] = useState<number>(1);
  const [cost, setCost] = useState<number>(0);
  const [automaticMode, setAutomaticMode] = useState<boolean>(false);
  const [changingMap, setChangingMap] = useState<boolean>(false);
  const [currentMapIndex, setCurrentMapIndex] = useState<number>(0);


  const mapRef = useRef<HTMLDivElement | null>(null);

  const moveAgentForward = () => {
    if (!selectedMap) return;
    if (currentStep === selectedMap.coins.length) return;
    moveAgent(currentStep + 1);
  };

  const moveAgentBackward = () => {
    if (currentStep === 0) return;
    moveAgent(currentStep - 1);
  };

  const moveAgent = (step: number) => {
     if (agentMoving) return;
     if (!selectedMap) return;
     if (!steps) return;

    setCurrentStep(step);
    setCurrentNode(steps[step].to_node);

    setAgentPositionWithAnimation(selectedMap.coins[steps[step].to_node]);
  };

  const startAutomaticMode = () => {
    setAutomaticMode(true);
    moveAgentForward(); // Start the automatic movement immediately
  };

  const stopAutomaticMode = () => {
    setAutomaticMode(false);
  };

  const setupMaps = async () => {
    setLoading(true);

    try {
      const maps = await Client.getMapsData();
      setMapsData(maps);

      // Set initial map
      if (!selectedMap) {
        selectMap(maps[0]);
        await calculateSteps();
      }
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  const setupKeyboardShortcuts =  () => {
    window.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        moveAgentForward();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveAgentBackward();
      } else if (event.key === "Enter") {
        if (!selectedMap) return;
        event.preventDefault();
        moveAgent(selectedMap.coins.length);
      } else if (event.key === "s"){
        if(!selectedMap) return;
        event.preventDefault();
        if(automaticMode){
          stopAutomaticMode();
        } else{
          startAutomaticMode();
        }

      }
    });
  };


  useEffect(() => {
     setupKeyboardShortcuts();
     if(count == 1){
      setupMaps(); 
      setCount(0);
     }
    setCost(calculateTotalCost(currentStep));

    if (automaticMode) {
      const intervalId = setInterval(() => {
        moveAgentForward();
      }, 750);
  
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [moveAgent,steps,currentStep,automaticMode,selectedMap]);



  const calculateSteps = async () => {
    if (!selectedMap) return;

    setCurrentStep(0);
    setCurrentNode(0);
    

    setAgentPosition(selectedMap.coins[currentNode]);

    const calculatedSteps = await Client.calculateSteps(selectedMap.map_name, selectedAgent.name);
    setSteps(calculatedSteps);


  };

  const calculateTotalCost = (step : number) => {
    if (!steps) return 0;

    
    return steps.slice(1, step + 1).reduce((totalCost, step) => totalCost + step.cost, 0);
  };

  const scaleCoinX = (x: number) => {
    if (!mapRef.current) return 0;
    return (x / 1000) * mapRef.current.clientWidth;
  };

  const scaleCoinY = (y: number) => {
    if (!mapRef.current) return 0;
    return (y / 600) * mapRef.current.clientHeight;
  };

  const moveMapLeft = async () => {
    if (!mapsData || !selectedMap) return;

    setChangingMap(true);

    const currentIndex = mapsData.findIndex((map) => map.map_name === selectedMap.map_name);
    const newIndex = (currentIndex - 1 + mapsData.length) % mapsData.length;
    setCurrentMapIndex(currentIndex);

    await new Promise(resolve => setTimeout(resolve, 500));

    selectMap(mapsData[newIndex]);
    calculateSteps();
    setChangingMap(false);
  };

  const moveMapRight = async () => {
    if (!mapsData || !selectedMap) return;

    setChangingMap(true);

    const currentIndex = mapsData.findIndex((map) => map.map_name === selectedMap.map_name);
    const newIndex = (currentIndex + 1) % mapsData.length;

    await new Promise(resolve => setTimeout(resolve, 500));

    selectMap(mapsData[newIndex]);
    calculateSteps();
    setChangingMap(false);
  };


  function selectMap(map: MapData) {
    setAgentPosition(map.coins[0]);
    setTimeout(async () => {
    setSelectedMap(map);

    const index = mapsData?.findIndex((m) => m.map_name === map.map_name) || 0;
    setCurrentMapIndex(index);


    setAgentPositionWithAnimation(map.coins[0]);
  }, 10); 
    
}
  

  const setAgent = (agent: AgentInfo) => {
    setSelectedAgent(agent);
    setAutomaticMode(false);
    calculateSteps();
  };

  const setAgentPositionWithAnimation = (point: IPoint) => {
    setAgentMoving(true);
    setAgentPosition(point);

    setTimeout(() => {
      setAgentMoving(false);
    }, 750);
  };

  return (
    <div className={styles.home}>
      <div
        className={styles.map}
        ref={mapRef}
      >
        <img src={Terrain} alt="Terrain" />

        <div className={styles.overlay}>
          <div className={styles.header}>
            {agents.map((agent) => (
              <div
                key={agent.name}
                className={styles.agentSelector}
              >
                <img
                  onClick={() => setAgent(agent)}
                  src={agent.icon}
                  alt={agent.name}
                  className={styles.agentImage}
                  style={{width:'100%', height:'10vh'}}
                />
                <p className={styles.text}>{agent.name}</p>
              </div>
            ))}
          </div>
          <div className={styles.footer}></div>
        </div>

        {selectedMap?.coins.map((coin, index) => (
          <div
            key={`coin-${index}`}
            className={styles.coin}
            style={{
              left: `${scaleCoinX(coin.x)}px`,
              top: `${scaleCoinY(coin.y)}px`,
            }}
          >
            <img src={CoinIcon} alt="Coin" />
            <span>{index}</span>
          </div>
        ))}

        <div
          className={styles.agent}
          style={{
            left: `${scaleCoinX(agentPosition.x)}px`,
            top: `${scaleCoinY(agentPosition.y)}px`,
          }}
        >
          <img src={selectedAgent.icon} alt="Agent" />
        </div>
      </div>

      <div className={styles.stepBorder}>
        <p className={styles.text}>Console</p>
        <div className={styles.steps}>
          {Array.from({ length: currentStep}, (_, index) => (
            <div
              key={`step-${index}`}
              className={styles.step}
            >
              <p>{`Step: ${steps?.[index + 1].step} | ${steps?.[index + 1].from_node} -> ${steps?.[index + 1].to_node} | Cost: ${steps?.[index + 1].cost}`}</p>
            </div>
          ))}
          {steps && currentStep === steps.length - 1 && cost > 0 && (
            <p className={styles.text}>Total Cost: {cost}</p>
          )} 
          {currentStep < (steps?.length || 0) - 1 && cost > 0 && (
            <p className={styles.text}>Cost: {cost}</p>
          )}
        </div>
        <div className={styles.changeMap}>
          <p className={styles.text}>Choose a map</p>
          <div className={styles.mapButtons}>
            <button onClick={moveMapLeft}>{"<<<"}</button>
            <div className={styles.mapImageContainer }>
            <img src={Terrain}/>
            <span className={styles.mapNumber}>{currentMapIndex + 1}</span>
            </div>
            <button onClick={moveMapRight}>{">>>"}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeView;


