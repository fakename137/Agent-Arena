'use client';

import { useState, useEffect } from 'react';

interface Fighter {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
  level: number;
  experience: number;
  wins: number;
  losses: number;
  status: 'ready' | 'fighting' | 'defeated';
}

interface Battle {
  id: string;
  fighter1: Fighter;
  fighter2: Fighter;
  status: 'waiting' | 'active' | 'finished';
  winner?: string;
  round: number;
  maxRounds: number;
  startTime: Date;
  endTime?: Date;
}

export default function BattlesPage() {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [selectedBattle, setSelectedBattle] = useState<Battle | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock fighters data
  const mockFighters: Fighter[] = [
    {
      id: 'bitcoin',
      name: 'Bitcoin Brawler',
      health: 100,
      maxHealth: 100,
      attack: 85,
      defense: 75,
      speed: 70,
      level: 15,
      experience: 1250,
      wins: 12,
      losses: 3,
      status: 'ready',
    },
    {
      id: 'ethereum',
      name: 'Ethereum Elite',
      health: 100,
      maxHealth: 100,
      attack: 80,
      defense: 80,
      speed: 75,
      level: 14,
      experience: 1100,
      wins: 10,
      losses: 4,
      status: 'ready',
    },
    {
      id: 'cardano',
      name: 'Cardano Crusher',
      health: 100,
      maxHealth: 100,
      attack: 75,
      defense: 85,
      speed: 80,
      level: 13,
      experience: 950,
      wins: 8,
      losses: 5,
      status: 'ready',
    },
  ];

  // Mock battles data
  const mockBattles: Battle[] = [
    {
      id: 'battle-1',
      fighter1: mockFighters[0],
      fighter2: mockFighters[1],
      status: 'active',
      round: 3,
      maxRounds: 5,
      startTime: new Date(Date.now() - 300000),
    },
    {
      id: 'battle-2',
      fighter1: mockFighters[1],
      fighter2: mockFighters[2],
      status: 'waiting',
      round: 0,
      maxRounds: 5,
      startTime: new Date(),
    },
    {
      id: 'battle-3',
      fighter1: mockFighters[0],
      fighter2: mockFighters[2],
      status: 'finished',
      winner: 'bitcoin',
      round: 5,
      maxRounds: 5,
      startTime: new Date(Date.now() - 600000),
      endTime: new Date(Date.now() - 300000),
    },
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setBattles(mockBattles);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const startBattle = (battleId: string) => {
    setBattles((prev) =>
      prev.map((battle) =>
        battle.id === battleId
          ? { ...battle, status: 'active' as const }
          : battle
      )
    );
    alert('🥊 Battle started! Let the underground fighting begin!');
  };

  const joinBattle = (battleId: string) => {
    const battle = battles.find((b) => b.id === battleId);
    if (battle && battle.status === 'waiting') {
      setSelectedBattle(battle);
      alert("🥊 You've entered the arena!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-xl">Loading the underground arena...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-red-400 mb-2">
            🥊 Underground Battles
          </h1>
          <p className="text-gray-400">
            Where AI agents fight for crypto supremacy in the underground arena
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Battle List */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold mb-4 text-red-400">
                Active Battles
              </h2>

              <div className="space-y-4">
                {battles.map((battle) => (
                  <div
                    key={battle.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedBattle?.id === battle.id
                        ? 'border-red-500 bg-red-900/20'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                    onClick={() => setSelectedBattle(battle)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-white">
                          {battle.fighter1.name} vs {battle.fighter2.name}
                        </h3>
                        <p className="text-sm text-gray-400">
                          Round {battle.round}/{battle.maxRounds}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          battle.status === 'active'
                            ? 'bg-green-600 text-white'
                            : battle.status === 'waiting'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-gray-600 text-white'
                        }`}
                      >
                        {battle.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-red-400">❤️</span>
                        <span className="text-sm">
                          {battle.fighter1.health}/{battle.fighter1.maxHealth}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">
                          {battle.fighter2.health}/{battle.fighter2.maxHealth}
                        </span>
                        <span className="text-red-400">❤️</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {battle.status === 'waiting' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            joinBattle(battle.id);
                          }}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm font-bold transition-colors"
                        >
                          Join Battle
                        </button>
                      )}
                      {battle.status === 'active' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startBattle(battle.id);
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm font-bold transition-colors"
                        >
                          Watch Live
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3D Battle Arena */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-700">
                <h2 className="text-xl font-bold text-red-400">
                  {selectedBattle
                    ? `${selectedBattle.fighter1.name} vs ${selectedBattle.fighter2.name}`
                    : 'Select a battle to enter the arena'}
                </h2>
              </div>

              <div className="h-96 relative">
                {selectedBattle ? (
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    {/* 3D Arena Placeholder */}
                    <div className="text-center">
                      <div className="text-6xl mb-4">🥊</div>
                      <h3 className="text-2xl font-bold text-red-400 mb-2">
                        {selectedBattle.fighter1.name} vs{' '}
                        {selectedBattle.fighter2.name}
                      </h3>
                      <p className="text-gray-400 mb-4">3D Underground Arena</p>

                      {/* Fighter Health Bars */}
                      <div className="space-y-4 max-w-md mx-auto">
                        <div className="bg-gray-700 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-orange-400 font-bold">
                              {selectedBattle.fighter1.name}
                            </span>
                            <span className="text-white">
                              {selectedBattle.fighter1.health}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-orange-400 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${selectedBattle.fighter1.health}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="text-2xl text-red-500">VS</div>

                        <div className="bg-gray-700 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-blue-400 font-bold">
                              {selectedBattle.fighter2.name}
                            </span>
                            <span className="text-white">
                              {selectedBattle.fighter2.health}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${selectedBattle.fighter2.health}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Battle Controls */}
                      <div className="mt-6 flex justify-center space-x-4">
                        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold">
                          ⚔️ Attack
                        </button>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold">
                          🛡️ Defend
                        </button>
                        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-bold">
                          ⚡ Special
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <div className="text-6xl mb-4">⚔️</div>
                      <p className="text-lg">
                        Choose a battle from the list to enter the underground
                        arena
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Battle Statistics */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-red-400">
            Underground Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400 mb-2">247</div>
              <div className="text-gray-400 text-sm">Active Battles</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                1,892
              </div>
              <div className="text-gray-400 text-sm">Battles Fought</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">$2.4M</div>
              <div className="text-gray-400 text-sm">Total Bets</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                8,456
              </div>
              <div className="text-gray-400 text-sm">Spectators</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
