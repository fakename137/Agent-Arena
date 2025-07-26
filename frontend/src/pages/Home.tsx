import React from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Sword,
  Users,
  Eye,
  TrendingUp,
  Shield,
  Target,
} from 'lucide-react';

const Home: React.FC = () => {
  const features = [
    {
      icon: <Sword className="w-8 h-8" />,
      title: 'AI Battle System',
      description:
        'Autonomous fighting agents with evolving strategies and real-time decision making.',
      color: 'text-red-400',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Market Integration',
      description:
        'Live crypto market data influences battle dynamics and agent performance.',
      color: 'text-green-400',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'NFT Agents',
      description:
        'Unique, tradeable fighter NFTs that evolve and improve through battles.',
      color: 'text-blue-400',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Fair Judging',
      description:
        '5 AI judges determine winners with transparent and unbiased decision making.',
      color: 'text-purple-400',
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: 'Spectator Economy',
      description:
        'Bet on battles, watch live fights, and participate in the underground economy.',
      color: 'text-yellow-400',
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Training System',
      description:
        'Train your agents, unlock new abilities, and climb the underground ranks.',
      color: 'text-orange-400',
    },
  ];

  const stats = [
    { label: 'Active Fighters', value: '1,247', color: 'text-red-400' },
    { label: 'Battles Fought', value: '15,892', color: 'text-green-400' },
    { label: 'Total Bets', value: '$2.4M', color: 'text-blue-400' },
    { label: 'Spectators', value: '8,456', color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-shadow">
            <span className="fight-club-logo">AGENT ARENA</span>
          </h1>
          <p className="text-2xl text-gray-300 underground-text">
            The Underground Fight Club of the Digital Age
          </p>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Where AI agents representing cryptocurrencies battle autonomously in
            real-time. The first rule of Agent Arena: you do not talk about
            Agent Arena. The second rule of Agent Arena: you DO NOT talk about
            Agent Arena.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/arena" className="btn-primary text-lg px-8 py-3">
            Enter the Arena
          </Link>
          <Link to="/spectator" className="btn-secondary text-lg px-8 py-3">
            Watch Battles
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-800 rounded-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-8">
          Underground Statistics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`text-4xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-gray-400 text-sm uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-center">
          Welcome to the Underground
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="fight-card text-center space-y-4">
              <div className={`${feature.color} flex justify-center`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Rules Section */}
      <section className="bg-gray-800 rounded-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-8">
          The Rules of the Underground
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <span className="text-red-400 font-bold">1.</span>
              <p className="text-gray-300">You do not talk about Agent Arena</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-red-400 font-bold">2.</span>
              <p className="text-gray-300">You DO NOT talk about Agent Arena</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-red-400 font-bold">3.</span>
              <p className="text-gray-300">
                If someone says stop, goes limp, taps out, the fight is over
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-red-400 font-bold">4.</span>
              <p className="text-gray-300">Only two agents to a fight</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <span className="text-red-400 font-bold">5.</span>
              <p className="text-gray-300">One fight at a time, agents</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-red-400 font-bold">6.</span>
              <p className="text-gray-300">No shirts, no shoes, no mercy</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-red-400 font-bold">7.</span>
              <p className="text-gray-300">
                Fights will go on as long as they have to
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-red-400 font-bold">8.</span>
              <p className="text-gray-300">
                If this is your first night at Agent Arena, you have to fight
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-6">
        <h2 className="text-3xl font-bold">Ready to Enter the Underground?</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Join thousands of fighters in the most revolutionary crypto battle
          game ever created. Create your agents, train them, and dominate the
          underground.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register" className="btn-primary text-lg px-8 py-3">
            Join the Fight
          </Link>
          <Link to="/agents" className="btn-secondary text-lg px-8 py-3">
            Create Agent
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
