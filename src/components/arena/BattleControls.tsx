'use client';

import { useState } from 'react';
import { Sword, Shield, Zap, RotateCcw, Play, Pause } from 'lucide-react';

interface BattleControlsProps {
  onAttack: () => void;
  onDefend: () => void;
  onSpecial: () => void;
  onReset: () => void;
  onTogglePause: () => void;
  isPaused: boolean;
  round: number;
  maxRounds: number;
  fighter1Health: number;
  fighter2Health: number;
}

export default function BattleControls({
  onAttack,
  onDefend,
  onSpecial,
  onReset,
  onTogglePause,
  isPaused,
  round,
  maxRounds,
  fighter1Health,
  fighter2Health,
}: BattleControlsProps) {
  const [selectedFighter, setSelectedFighter] = useState<
    'fighter1' | 'fighter2'
  >('fighter1');

  return (
    <div className="absolute bottom-4 left-4 right-4 bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
      {/* Battle Info */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-center">
          <div className="text-sm text-gray-400">Round</div>
          <div className="text-xl font-bold text-red-400">
            {round}/{maxRounds}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Fighter 1 Health */}
          <div className="text-center">
            <div className="text-sm text-gray-400">Bitcoin</div>
            <div className="text-lg font-bold text-orange-400">
              {fighter1Health}%
            </div>
            <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-400 transition-all duration-300"
                style={{ width: `${fighter1Health}%` }}
              />
            </div>
          </div>

          <div className="text-2xl text-red-500">VS</div>

          {/* Fighter 2 Health */}
          <div className="text-center">
            <div className="text-sm text-gray-400">Ethereum</div>
            <div className="text-lg font-bold text-blue-400">
              {fighter2Health}%
            </div>
            <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-400 transition-all duration-300"
                style={{ width: `${fighter2Health}%` }}
              />
            </div>
          </div>
        </div>

        <button
          onClick={onTogglePause}
          className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {isPaused ? (
            <Play className="w-4 h-4" />
          ) : (
            <Pause className="w-4 h-4" />
          )}
          <span className="text-sm font-bold">
            {isPaused ? 'Resume' : 'Pause'}
          </span>
        </button>
      </div>

      {/* Battle Controls */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={onAttack}
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors font-bold"
        >
          <Sword className="w-5 h-5" />
          <span>Attack</span>
        </button>

        <button
          onClick={onDefend}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-bold"
        >
          <Shield className="w-5 h-5" />
          <span>Defend</span>
        </button>

        <button
          onClick={onSpecial}
          className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors font-bold"
        >
          <Zap className="w-5 h-5" />
          <span>Special</span>
        </button>

        <button
          onClick={onReset}
          className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors font-bold"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Fighter Selection */}
      <div className="flex justify-center mt-4">
        <div className="flex space-x-2 bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setSelectedFighter('fighter1')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${
              selectedFighter === 'fighter1'
                ? 'bg-orange-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Bitcoin Brawler
          </button>
          <button
            onClick={() => setSelectedFighter('fighter2')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${
              selectedFighter === 'fighter2'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Ethereum Elite
          </button>
        </div>
      </div>

      {/* Battle Status */}
      <div className="text-center mt-4">
        <div className="text-sm text-gray-400">
          Controlling:{' '}
          <span className="text-white font-bold">
            {selectedFighter === 'fighter1'
              ? 'Bitcoin Brawler'
              : 'Ethereum Elite'}
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Use controls to influence the battle outcome
        </div>
      </div>
    </div>
  );
}
