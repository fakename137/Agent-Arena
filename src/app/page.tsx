'use client';

import { useState, useEffect } from 'react';
import {
  Zap,
  Sword,
  Users,
  Eye,
  TrendingUp,
  DollarSign,
  Trophy,
  Target,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Agent {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
  level: number;
  wins: number;
  losses: number;
  status: 'ready' | 'fighting' | 'defeated';
  price: number;
  image: string;
}

interface Battle {
  id: string;
  agent1: Agent;
  agent2: Agent;
  status: 'waiting' | 'active' | 'finished';
  winner?: string;
  round: number;
  maxRounds: number;
  totalBets: number;
  spectators: number;
  startTime: Date;
  endTime?: Date;
}

export default function HomePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [battles, setBattles] = useState<Battle[]>([]);
  const [selectedBattle, setSelectedBattle] = useState<Battle | null>(null);
  const [userBalance, setUserBalance] = useState(10000);
  const [isLoading, setIsLoading] = useState(true);

  // Mock agents data
  const mockAgents: Agent[] = [
    {
      id: 'bitcoin',
      name: 'Bitcoin Brawler',
      health: 100,
      maxHealth: 100,
      attack: 85,
      defense: 75,
      speed: 70,
      level: 15,
      wins: 12,
      losses: 3,
      status: 'ready',
      price: 2500,
      image: '🥊',
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
      wins: 10,
      losses: 4,
      status: 'ready',
      price: 2200,
      image: '⚔️',
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
      wins: 8,
      losses: 5,
      status: 'ready',
      price: 1800,
      image: '🛡️',
    },
    {
      id: 'solana',
      name: 'Solana Slayer',
      health: 100,
      maxHealth: 100,
      attack: 90,
      defense: 70,
      speed: 85,
      level: 16,
      wins: 15,
      losses: 2,
      status: 'ready',
      price: 3000,
      image: '⚡',
    },
  ];

  // Mock battles data
  const mockBattles: Battle[] = [
    {
      id: 'battle-1',
      agent1: mockAgents[0],
      agent2: mockAgents[1],
      status: 'active',
      round: 3,
      maxRounds: 5,
      totalBets: 2500,
      spectators: 156,
      startTime: new Date(Date.now() - 300000),
    },
    {
      id: 'battle-2',
      agent1: mockAgents[1],
      agent2: mockAgents[2],
      status: 'waiting',
      round: 0,
      maxRounds: 5,
      totalBets: 1200,
      spectators: 89,
      startTime: new Date(),
    },
    {
      id: 'battle-3',
      agent1: mockAgents[0],
      agent2: mockAgents[3],
      status: 'finished',
      winner: 'bitcoin',
      round: 5,
      maxRounds: 5,
      totalBets: 3800,
      spectators: 234,
      startTime: new Date(Date.now() - 600000),
      endTime: new Date(Date.now() - 300000),
    },
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setAgents(mockAgents);
      setBattles(mockBattles);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const placeBet = (battleId: string, agentId: string, amount: number) => {
    if (amount > userBalance) {
      toast.error('Insufficient balance!');
      return;
    }

    setUserBalance((prev) => prev - amount);
    toast.success(
      `Bet placed on ${
        agents.find((a) => a.id === agentId)?.name
      } for $${amount}!`
    );
  };

  const joinBattle = (battleId: string) => {
    const battle = battles.find((b) => b.id === battleId);
    if (battle && battle.status === 'waiting') {
      setSelectedBattle(battle);
      toast.success("🥊 You've entered the underground arena!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-xl">Loading the underground arena...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen underground-bg">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">FC</span>
              </div>
              <h1 className="text-2xl font-bold text-red-400">Agent Arena</h1>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-sm text-gray-400">Balance</div>
                <div className="text-lg font-bold text-green-400">
                  ${userBalance.toLocaleString()}
                </div>
              </div>
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                Connect Wallet
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-4 fight-club-gradient bg-clip-text text-transparent">
            🥊 UNDERGROUND ARENA 🥊
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Where AI agents fight for crypto supremacy in the underground arena
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="text-3xl font-bold text-red-400 mb-2">247</div>
              <div className="text-gray-400">Active Battles</div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="text-3xl font-bold text-green-400 mb-2">
                $2.4M
              </div>
              <div className="text-gray-400">Total Bets</div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="text-3xl font-bold text-blue-400 mb-2">8,456</div>
              <div className="text-gray-400">Spectators</div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="text-3xl font-bold text-purple-400 mb-2">156</div>
              <div className="text-gray-400">Agents</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Live Battles */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-2xl font-bold mb-6 text-red-400 flex items-center">
                <Sword className="w-6 h-6 mr-2" />
                Live Battles
              </h3>

              <div className="space-y-4">
                {battles.map((battle) => (
                  <div
                    key={battle.id}
                    className={`p-6 rounded-lg border cursor-pointer transition-all hover:border-red-500 ${
                      selectedBattle?.id === battle.id
                        ? 'border-red-500 bg-red-900/20'
                        : 'border-gray-600'
                    }`}
                    onClick={() => setSelectedBattle(battle)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="text-4xl">{battle.agent1.image}</div>
                        <div>
                          <h4 className="font-bold text-lg">
                            {battle.agent1.name}
                          </h4>
                          <div className="text-sm text-gray-400">
                            Level {battle.agent1.level}
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-500">
                          VS
                        </div>
                        <div className="text-sm text-gray-400">
                          Round {battle.round}/{battle.maxRounds}
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-bold text-lg text-right">
                            {battle.agent2.name}
                          </h4>
                          <div className="text-sm text-gray-400 text-right">
                            Level {battle.agent2.level}
                          </div>
                        </div>
                        <div className="text-4xl">{battle.agent2.image}</div>
                      </div>
                    </div>

                    {/* Health Bars */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm w-20">
                          {battle.agent1.name}
                        </span>
                        <div className="flex-1 bg-gray-700 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all duration-300 ${
                              battle.agent1.health > 60
                                ? 'health-bar-high'
                                : battle.agent1.health > 30
                                ? 'health-bar-medium'
                                : 'health-bar-low'
                            }`}
                            style={{ width: `${battle.agent1.health}%` }}
                          />
                        </div>
                        <span className="text-sm w-12">
                          {battle.agent1.health}%
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-sm w-20">
                          {battle.agent2.name}
                        </span>
                        <div className="flex-1 bg-gray-700 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all duration-300 ${
                              battle.agent2.health > 60
                                ? 'health-bar-high'
                                : battle.agent2.health > 30
                                ? 'health-bar-medium'
                                : 'health-bar-low'
                            }`}
                            style={{ width: `${battle.agent2.health}%` }}
                          />
                        </div>
                        <span className="text-sm w-12">
                          {battle.agent2.health}%
                        </span>
                      </div>
                    </div>

                    {/* Battle Info */}
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-4 text-sm text-gray-400">
                        <span>💰 ${battle.totalBets.toLocaleString()}</span>
                        <span>👥 {battle.spectators}</span>
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

                      <div className="flex space-x-2">
                        {battle.status === 'waiting' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              joinBattle(battle.id);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-bold transition-colors"
                          >
                            Join Battle
                          </button>
                        )}
                        {battle.status === 'active' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBattle(battle);
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-bold transition-colors"
                          >
                            Watch Live
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-xl font-bold mb-4 text-red-400">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors font-bold">
                  <DollarSign className="w-5 h-5 inline mr-2" />
                  Place Bet
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors font-bold">
                  <Eye className="w-5 h-5 inline mr-2" />
                  Spectate
                </button>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg transition-colors font-bold">
                  <Trophy className="w-5 h-5 inline mr-2" />
                  Tournaments
                </button>
              </div>
            </div>

            {/* Top Agents */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-xl font-bold mb-4 text-red-400">
                Top Agents
              </h3>
              <div className="space-y-3">
                {agents.slice(0, 3).map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{agent.image}</div>
                      <div>
                        <div className="font-bold">{agent.name}</div>
                        <div className="text-sm text-gray-400">
                          Level {agent.level}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold">
                        ${agent.price}
                      </div>
                      <div className="text-sm text-gray-400">
                        {agent.wins}W-{agent.losses}L
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Trends */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-xl font-bold mb-4 text-red-400">
                Market Trends
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Bitcoin Brawler</span>
                  <span className="text-green-400">+15%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Ethereum Elite</span>
                  <span className="text-red-400">-8%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Cardano Crusher</span>
                  <span className="text-green-400">+22%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
