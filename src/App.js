import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Car } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Door = ({ number, isSelected, isRevealed, hasPrize, onClick }) => (
  <div
    className={`w-32 h-48 border-4 rounded-t-lg cursor-pointer transition-all duration-300 ${
      isSelected ? 'border-blue-500' : 'border-yellow-700'
    } ${
      isRevealed
        ? hasPrize
          ? 'bg-green-200'
          : 'bg-red-200'
        : 'bg-yellow-600'
    }`}
    onClick={onClick}
  >
    {!isRevealed && (
      <div className="h-full flex items-center justify-center">
        <span className="text-4xl font-bold text-yellow-100">{number}</span>
      </div>
    )}
    {isRevealed && hasPrize && (
      <div className="h-full flex items-center justify-center">
        <Car size={48} className="text-green-600" />
      </div>
    )}
  </div>
);

const MontyHallGame = () => {
  const [simulations, setSimulations] = useState(1000);
  const [switchWins, setSwitchWins] = useState(0);
  const [stayWins, setStayWins] = useState(0);
  const [switchLosses, setSwitchLosses] = useState(0);
  const [stayLosses, setStayLosses] = useState(0);
  const [doors, setDoors] = useState([0, 0, 0]);
  const [selectedDoor, setSelectedDoor] = useState(null);
  const [revealedDoor, setRevealedDoor] = useState(null);
  const [gameState, setGameState] = useState('initial');
  const [result, setResult] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentSimulation, setCurrentSimulation] = useState(0);
  const [lastSimulationResult, setLastSimulationResult] = useState('');

  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    const prizeDoor = Math.floor(Math.random() * 3);
    setDoors([...Array(3)].map((_, i) => i === prizeDoor ? 1 : 0));
    setSelectedDoor(null);
    setRevealedDoor(null);
    setGameState('initial');
    setResult('');
  };

  const selectDoor = (index) => {
    if (gameState !== 'initial') return;
    setSelectedDoor(index);
    revealGoatDoor(index);
    setGameState('doorSelected');
  };

  const revealGoatDoor = (selectedIndex) => {
    let revealIndex;
    do {
      revealIndex = Math.floor(Math.random() * 3);
    } while (revealIndex === selectedIndex || doors[revealIndex] === 1);
    setRevealedDoor(revealIndex);
  };

  const makeDecision = (switchDoor) => {
    if (gameState !== 'doorSelected') return;
    const finalDoor = switchDoor ? doors.findIndex((door, i) => i !== selectedDoor && i !== revealedDoor) : selectedDoor;
    setSelectedDoor(finalDoor);
    setResult(doors[finalDoor] === 1 ? '恭喜你贏了！' : '很遺憾，你輸了。');
    setGameState('gameOver');
  };

  const runSimulation = async () => {
    setIsSimulating(true);
    let switchWinCount = 0;
    let stayWinCount = 0;
    let switchLossCount = 0;
    let stayLossCount = 0;
    setCurrentSimulation(0);

    for (let i = 0; i < simulations; i++) {
      const doors = [0, 0, 0];
      doors[Math.floor(Math.random() * 3)] = 1;
      const initialChoice = Math.floor(Math.random() * 3);
      const revealedDoor = doors.findIndex((door, index) => door === 0 && index !== initialChoice);
      const switchChoice = doors.findIndex((door, index) => index !== initialChoice && index !== revealedDoor);

      if (doors[switchChoice] === 1) {
        switchWinCount++;
        setLastSimulationResult('換門中獎');
      } else {
        switchLossCount++;
        setLastSimulationResult('換門沒中獎');
      }

      if (doors[initialChoice] === 1) {
        stayWinCount++;
      } else {
        stayLossCount++;
      }

      let delay;
      if (i < 20) {
        delay = 500;
      } else if (i < 100) {
        delay = Math.max(10, 500 - (i - 20) * (490 / 80));
      } else {
        delay = 10;
      }
      await new Promise(resolve => setTimeout(resolve, delay));

      setSwitchWins(switchWinCount);
      setStayWins(stayWinCount);
      setSwitchLosses(switchLossCount);
      setStayLosses(stayLossCount);
      setCurrentSimulation(i + 1);
    }

    setIsSimulating(false);
    resetGame();
  };

  const barChartData = [
    { name: '換門', 獲勝: switchWins, 失敗: switchLosses },
    { name: '不換門', 獲勝: stayWins, 失敗: stayLosses },
  ];

  const switchPieChartData = [
    { name: '換門中獎', value: switchWins },
    { name: '換門沒中獎', value: switchLosses },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">三門問題</h1>
      
      <div className="lg:flex lg:space-x-8">
        <div className="lg:w-1/3 mb-8">
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="flex justify-between mb-4">
              {[0, 1, 2].map((doorIndex) => (
                <Door
                  key={doorIndex}
                  number={doorIndex + 1}
                  isSelected={selectedDoor === doorIndex}
                  isRevealed={revealedDoor === doorIndex || gameState === 'gameOver'}
                  hasPrize={doors[doorIndex] === 1}
                  onClick={() => selectDoor(doorIndex)}
                />
              ))}
            </div>
            <div className="mt-4">
              {gameState === 'initial' && <p className="text-lg">請選擇一扇門</p>}
              {gameState === 'doorSelected' && (
                <div>
                  <p className="text-lg mb-2">主持人開啟了一扇沒有獎品的門。你要換門嗎？</p>
                  <Button onClick={() => makeDecision(true)} className="mr-2">換門</Button>
                  <Button onClick={() => makeDecision(false)}>不換</Button>
                </div>
              )}
              {gameState === 'gameOver' && (
                <div>
                  <p className="text-xl font-bold mb-2">{result}</p>
                  <Button onClick={resetGame}>再玩一次</Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:w-2/3">
          <div className="bg-gray-100 p-4 rounded-lg mb-8">
            <h2 className="text-2xl font-semibold mb-4">模擬器</h2>
            <div className="mb-4 flex items-center">
              <Input
                type="number"
                value={simulations}
                onChange={(e) => setSimulations(parseInt(e.target.value))}
                className="mr-2"
                placeholder="模擬次數"
              />
              <Button onClick={runSimulation} disabled={isSimulating}>
                {isSimulating ? '模擬中...' : '執行模擬'}
              </Button>
            </div>
            {isSimulating && (
              <div className="mb-4">
                <p>進度: {currentSimulation} / {simulations}</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${(currentSimulation / simulations) * 100}%`}}></div>
                </div>
                <p className="mt-2">上次模擬結果: {lastSimulationResult}</p>
              </div>
            )}
            <div>
              <p>換門獲勝: {switchWins} ({((switchWins / Math.max(currentSimulation, 1)) * 100).toFixed(2)}%)</p>
              <p>不換獲勝: {stayWins} ({((stayWins / Math.max(currentSimulation, 1)) * 100).toFixed(2)}%)</p>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg mb-8">
            <h2 className="text-2xl font-semibold mb-4">模擬結果統計</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="獲勝" fill="#8884d8" />
                <Bar dataKey="失敗" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg mb-8">
            <h2 className="text-2xl font-semibold mb-4">換門的獲獎可能性</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={switchPieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(2)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {switchPieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MontyHallGame;