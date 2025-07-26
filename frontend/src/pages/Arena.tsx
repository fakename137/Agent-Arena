import React, { useState, useEffect } from 'react';
import { Zap, Users, Clock, Target, Eye } from 'lucide-react';

interface Arena {
  id: string;
  name: string;
  location: string;
  capacity: number;
  currentSpectators: number;
  status: string;
  currentBattle: number | null;
  description: string;
  totalBattles: number;
  totalSpectators: number;
  totalBets: number;
}

const Arena: React.FC = () => {
  const [arenas, setArenas] = useState<Arena[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArena, setSelectedArena] = useState<Arena | null>(null);

  useEffect(() => {
    fetchArenas();
  }, []);

  const fetchArenas = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/arena');
      const data = await response.json();
      setArenas(data.arenas);
    } catch (error) {
      console.error('Error fetching arenas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400';
      case 'available':
        return 'text-blue-400';
      case 'maintenance':
        return 'text-yellow-400';
      case 'closed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Zap className="w-4 h-4" />;
      case 'available':
        return <Target className="w-4 h-4" />;
      case 'maintenance':
        return <Clock className="w-4 h-4" />;
      case 'closed':
        return <Eye className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Underground Arenas</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Choose your battleground. Each arena has its own atmosphere, rules,
          and history. The underground is waiting for you.
        </p>
      </div>

      {/* Arena Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {arenas.map((arena) => (
          <div
            key={arena.id}
            className="arena-card cursor-pointer"
            onClick={() => setSelectedArena(arena)}
          >
            <div className="space-y-4">
              {/* Arena Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">{arena.name}</h3>
                  <p className="text-gray-400 text-sm">{arena.location}</p>
                </div>
                <div
                  className={`flex items-center space-x-1 ${getStatusColor(
                    arena.status
                  )}`}
                >
                  {getStatusIcon(arena.status)}
                  <span className="text-sm font-medium capitalize">
                    {arena.status}
                  </span>
                </div>
              </div>

              {/* Arena Description */}
              <p className="text-gray-300 text-sm">{arena.description}</p>

              {/* Arena Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-400">
                    {arena.capacity}
                  </div>
                  <div className="text-gray-400">Capacity</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">
                    {arena.currentSpectators}
                  </div>
                  <div className="text-gray-400">Spectators</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400">
                    {arena.totalBattles}
                  </div>
                  <div className="text-gray-400">Battles</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-400">
                    ${(arena.totalBets / 1000).toFixed(1)}k
                  </div>
                  <div className="text-gray-400">Total Bets</div>
                </div>
              </div>

              {/* Current Battle */}
              {arena.currentBattle && (
                <div className="bg-red-900/20 border border-red-500/30 rounded p-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    <span className="text-red-400 font-medium">
                      Battle in Progress
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mt-1">
                    Battle #{arena.currentBattle}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button className="btn-primary flex-1 text-sm">
                  Enter Arena
                </button>
                <button className="btn-secondary text-sm px-3">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Arena Details Modal */}
      {selectedArena && (
        <div className="modal-overlay" onClick={() => setSelectedArena(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{selectedArena.name}</h2>
                  <p className="text-gray-400">{selectedArena.location}</p>
                </div>
                <button
                  onClick={() => setSelectedArena(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Arena Description */}
              <div>
                <h3 className="text-lg font-semibold mb-2">About this Arena</h3>
                <p className="text-gray-300">{selectedArena.description}</p>
              </div>

              {/* Arena Atmosphere */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Atmosphere</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Lighting:</span>
                    <span className="text-gray-300 ml-2">Dim</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Sound:</span>
                    <span className="text-gray-300 ml-2">Echoing</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Temperature:</span>
                    <span className="text-gray-300 ml-2">Cold</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Humidity:</span>
                    <span className="text-gray-300 ml-2">High</span>
                  </div>
                </div>
              </div>

              {/* Arena Rules */}
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Rules of the Underground
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start space-x-2">
                    <span className="text-red-400 font-bold">1.</span>
                    <span className="text-gray-300">
                      You do not talk about Fight Club
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-red-400 font-bold">2.</span>
                    <span className="text-gray-300">
                      You DO NOT talk about Fight Club
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-red-400 font-bold">3.</span>
                    <span className="text-gray-300">
                      If someone says stop, goes limp, taps out, the fight is
                      over
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-red-400 font-bold">4.</span>
                    <span className="text-gray-300">
                      Only two guys to a fight
                    </span>
                  </div>
                </div>
              </div>

              {/* Arena Statistics */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Statistics</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Total Battles:</span>
                    <span className="text-gray-300 ml-2">
                      {selectedArena.totalBattles}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Total Spectators:</span>
                    <span className="text-gray-300 ml-2">
                      {selectedArena.totalSpectators}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Total Bets:</span>
                    <span className="text-gray-300 ml-2">
                      ${selectedArena.totalBets.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Current Occupancy:</span>
                    <span className="text-gray-300 ml-2">
                      {Math.round(
                        (selectedArena.currentSpectators /
                          selectedArena.capacity) *
                          100
                      )}
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button className="btn-primary flex-1">Enter Arena</button>
                <button className="btn-secondary flex-1">Watch Battle</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Arena;
