import React, { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Car } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Door = ({ number, isSelected, isRevealed, hasPrize, onClick }) => (
  <div
    className={`w-24 h-36 lg:w-32 lg:h-48 border-4 rounded-t-lg cursor-pointer transition-all duration-300 ${
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
        <span className="text-3xl lg:text-4xl font-bold text-yellow-100">{number}</span>
      </div>
    )}
    {isRevealed && hasPrize && (
      <div className="h-full flex items-center justify-center">
        <Car size={32} className="lg:w-12 lg:h-12 text-green-600" />
      </div>
    )}
  </div>
);

const MontyHallGame = () => {
  const [simulations, setSimulations] = useState(1000);
  const [switchWins, setSwitchWins] = useState(0);
  const [switchLosses, setSwitchLosses] = useState(0);
  const [stayWins, setStayWins] = useState(0);
  const [stayLosses, setStayLosses] = useState(0);
  const [doors, setDoors] = useState([0, 0, 0]);
  const [selectedDoor, setSelectedDoor] = useState(null);
  const [revealedDoor, setRevealedDoor] = useState(null);
  const [gameState, setGameState] = useState('initial');
  const [result, setResult] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentSimulation, setCurrentSimulation] = useState(0);
  
  // 玩家統計數據
  const [playerSwitchWins, setPlayerSwitchWins] = useState(0);
  const [playerStayWins, setPlayerStayWins] = useState(0);
  const [playerLosses, setPlayerLosses] = useState(0);
  const [totalSwitchGames, setTotalSwitchGames] = useState(0);
  const [totalStayGames, setTotalStayGames] = useState(0);

  useEffect(() => {
    resetGame();
  }, []);

  const calculatePercentage = (wins, total) => {
    if (total === 0) return '0.00';
    return ((wins / total) * 100).toFixed(2);
  };

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
    const win = doors[finalDoor] === 1;
    setSelectedDoor(finalDoor);
    setResult(win ? '恭喜你贏了！' : '很遺憾，你輸了。');
    setGameState('gameOver');

    // 更新玩家統計數據
    if (win) {
      if (switchDoor) {
        setPlayerSwitchWins(prev => prev + 1);
      } else {
        setPlayerStayWins(prev => prev + 1);
      }
    } else {
      setPlayerLosses(prev => prev + 1);
    }
    if (switchDoor) {
      setTotalSwitchGames(prev => prev + 1);
    } else {
      setTotalStayGames(prev => prev + 1);
    }
  };

  const runSimulation = async () => {
    setIsSimulating(true);
    let switchWinCount = 0;
    let switchLossCount = 0;
    let stayWinCount = 0;
    let stayLossCount = 0;
    setCurrentSimulation(0);

    for (let i = 0; i < simulations; i++) {
      const doors = [0, 0, 0];
      doors[Math.floor(Math.random() * 3)] = 1;
      const initialChoice = Math.floor(Math.random() * 3);
      const revealedDoor = doors.findIndex((door, index) => door === 0 && index !== initialChoice);
      const switchChoice = doors.findIndex((door, index) => index !== initialChoice && index !== revealedDoor);

      // 模擬換門策略
      if (doors[switchChoice] === 1) {
        switchWinCount++;
      } else {
        switchLossCount++;
      }

      // 模擬不換門策略
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
      setSwitchLosses(switchLossCount);
      setStayWins(stayWinCount);
      setStayLosses(stayLossCount);
      setCurrentSimulation(i + 1);
    }

    setIsSimulating(false);
  };

  const resetSimulationRecords = () => {
    setSwitchWins(0);
    setSwitchLosses(0);
    setStayWins(0);
    setStayLosses(0);
    setCurrentSimulation(0);
  };

  const resetPlayerRecords = () => {
    setPlayerSwitchWins(0);
    setPlayerStayWins(0);
    setPlayerLosses(0);
    setTotalSwitchGames(0);
    setTotalStayGames(0);
  };

  const playerWinLossChartData = [
    { name: '中獎', value: playerSwitchWins + playerStayWins },
    { name: '沒中獎', value: playerLosses },
  ];

  const switchStrategyChartData = [
    { name: '中獎', value: playerSwitchWins },
    { name: '沒中獎', value: totalSwitchGames - playerSwitchWins },
  ];

  const stayStrategyChartData = [
    { name: '中獎', value: playerStayWins },
    { name: '沒中獎', value: totalStayGames - playerStayWins },
  ];

  const simulationBarChartData = [
    { name: '換門', 獲勝: switchWins, 失敗: switchLosses },
    { name: '不換門', 獲勝: stayWins, 失敗: stayLosses },
  ];

  const simulationSwitchPieChartData = [
    { name: '換門中獎', value: switchWins },
    { name: '換門沒中獎', value: switchLosses },
  ];

  const simulationStayPieChartData = [
    { name: '不換中獎', value: stayWins },
    { name: '不換沒中獎', value: stayLosses },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">三門問題</h1>
      
      <div className="lg:flex lg:space-x-8 mb-8">
        <div className="lg:w-2/3 bg-gray-100 p-6 rounded-lg">
          <div className="flex justify-center space-x-8 mb-4">
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
          <div className="mt-4 text-center">
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

        <div className="lg:w-1/3 bg-gray-100 p-4 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">玩家統計</h2>
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">真實遊玩數據</h3>
            <p>換門中獎次數: {playerSwitchWins}</p>
            <p>不換門中獎次數: {playerStayWins}</p>
            <p>純粹沒中獎: {playerLosses}</p>
          </div>
          <div className="mb-4">
            <h4 className="text-lg font-semibold mb-2">中獎 vs 沒中獎</h4>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={playerWinLossChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(2)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {playerWinLossChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">策略分析</h3>
            <p>如果每次都換門:</p>
            <p>中獎機率: {calculatePercentage(playerSwitchWins, totalSwitchGames)}%</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={switchStrategyChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(2)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {switchStrategyChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <p>如果每次都不換門:</p>
            <p>中獎機率: {calculatePercentage(playerStayWins, totalStayGames)}%</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stayStrategyChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(2)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stayStrategyChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4">
            <Button onClick={resetPlayerRecords}>重置玩家記錄</Button>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4">模擬器</h2>
        <div className="mb-4 flex items-center justify-center">
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
          </div>
        )}
        <div className="text-center">
          <p>換門獲勝: {switchWins} ({calculatePercentage(switchWins, switchWins + switchLosses)}%)</p>
          <p>不換獲勝: {stayWins} ({calculatePercentage(stayWins, stayWins + stayLosses)}%)</p>
        </div>
        <div className="mt-4 text-center">
          <Button onClick={resetSimulationRecords}>重置模擬記錄</Button>
        </div>
      </div>

      <div className="lg:flex lg:space-x-8 mb-8">
        <div className="lg:w-1/2 bg-gray-100 p-4 rounded-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">模擬結果統計 (長條圖)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={simulationBarChartData}>
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

        <div className="lg:w-1/2 bg-gray-100 p-4 rounded-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">換門策略結果 (圓餅圖)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={simulationSwitchPieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(2)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {simulationSwitchPieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4">不換門策略結果 (圓餅圖)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={simulationStayPieChartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(2)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {simulationStayPieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MontyHallGame;