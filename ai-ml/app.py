from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import numpy as np
import random
import time
import json
import logging
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Mock AI models and data (replace with actual ML models)
class AgentAI:
    def __init__(self, agent_type, level=1):
        self.agent_type = agent_type
        self.level = level
        self.experience = 0
        self.personality = self._generate_personality()
        
    def _generate_personality(self):
        """Generate agent personality based on type"""
        personalities = {
            'bitcoin': {
                'aggression': 0.3,
                'defense': 0.8,
                'speed': 0.4,
                'intelligence': 0.7,
                'risk_tolerance': 0.2
            },
            'ethereum': {
                'aggression': 0.7,
                'defense': 0.5,
                'speed': 0.8,
                'intelligence': 0.9,
                'risk_tolerance': 0.6
            },
            'altcoin': {
                'aggression': 0.9,
                'defense': 0.2,
                'speed': 0.9,
                'intelligence': 0.4,
                'risk_tolerance': 0.9
            },
            'stablecoin': {
                'aggression': 0.4,
                'defense': 0.7,
                'speed': 0.5,
                'intelligence': 0.6,
                'risk_tolerance': 0.1
            }
        }
        return personalities.get(self.agent_type, personalities['bitcoin'])
    
    def decide_action(self, battle_state, opponent_state, market_data):
        """AI decision making for battle actions"""
        # Analyze current situation
        my_health = battle_state.get('health', 100)
        opponent_health = opponent_state.get('health', 100)
        my_stamina = battle_state.get('stamina', 100)
        
        # Market influence
        market_sentiment = market_data.get('sentiment', 'neutral')
        market_volatility = market_data.get('volatility', 0.5)
        
        # Decision logic based on personality and situation
        if my_health < 30:
            # Low health - defensive strategy
            if random.random() < self.personality['defense']:
                return 'block'
            else:
                return 'dodge'
        
        elif opponent_health < 30:
            # Opponent low health - aggressive strategy
            if random.random() < self.personality['aggression']:
                if my_stamina > 50 and random.random() < 0.3:
                    return 'special'
                else:
                    return 'attack'
            else:
                return 'attack'
        
        elif my_stamina > 70 and random.random() < 0.2:
            # Use special move occasionally
            return 'special'
        
        else:
            # Normal combat decision
            actions = ['attack', 'block', 'dodge']
            weights = [
                self.personality['aggression'],
                self.personality['defense'],
                self.personality['speed']
            ]
            return random.choices(actions, weights=weights)[0]

class BattleEngine:
    def __init__(self):
        self.active_battles = {}
        
    def create_battle(self, agent1, agent2, arena_id):
        """Create a new battle"""
        battle_id = f"battle_{int(time.time())}"
        
        battle_state = {
            'id': battle_id,
            'arena_id': arena_id,
            'agent1': {
                'id': agent1['id'],
                'name': agent1['name'],
                'type': agent1['type'],
                'health': 100,
                'stamina': 100,
                'ai': AgentAI(agent1['type'], agent1.get('level', 1))
            },
            'agent2': {
                'id': agent2['id'],
                'name': agent2['name'],
                'type': agent2['type'],
                'health': 100,
                'stamina': 100,
                'ai': AgentAI(agent2['type'], agent2.get('level', 1))
            },
            'status': 'active',
            'round': 0,
            'events': [],
            'start_time': datetime.now().isoformat(),
            'market_data': self._get_market_data()
        }
        
        self.active_battles[battle_id] = battle_state
        return battle_state
    
    def _get_market_data(self):
        """Get current market data (mock)"""
        return {
            'bitcoin': {
                'price': 42000 + random.uniform(-1000, 1000),
                'sentiment': random.choice(['bullish', 'bearish', 'neutral']),
                'volatility': random.uniform(0.1, 0.9)
            },
            'ethereum': {
                'price': 2800 + random.uniform(-100, 100),
                'sentiment': random.choice(['bullish', 'bearish', 'neutral']),
                'volatility': random.uniform(0.1, 0.9)
            }
        }
    
    def execute_round(self, battle_id):
        """Execute one round of battle"""
        if battle_id not in self.active_battles:
            return None
            
        battle = self.active_battles[battle_id]
        
        # Get AI decisions
        agent1_action = battle['agent1']['ai'].decide_action(
            {'health': battle['agent1']['health'], 'stamina': battle['agent1']['stamina']},
            {'health': battle['agent2']['health']},
            battle['market_data']
        )
        
        agent2_action = battle['agent2']['ai'].decide_action(
            {'health': battle['agent2']['health'], 'stamina': battle['agent2']['stamina']},
            {'health': battle['agent1']['health']},
            battle['market_data']
        )
        
        # Resolve actions
        round_result = self._resolve_actions(agent1_action, agent2_action, battle)
        
        # Update battle state
        battle['round'] += 1
        battle['events'].append(round_result)
        
        # Check for battle end
        if battle['agent1']['health'] <= 0 or battle['agent2']['health'] <= 0:
            battle['status'] = 'completed'
            battle['winner'] = 'agent1' if battle['agent2']['health'] <= 0 else 'agent2'
            battle['end_time'] = datetime.now().isoformat()
        
        return round_result
    
    def _resolve_actions(self, action1, action2, battle):
        """Resolve the actions of both agents"""
        agent1 = battle['agent1']
        agent2 = battle['agent2']
        
        # Calculate damage based on actions
        damage1 = self._calculate_damage(action1, agent1, agent2)
        damage2 = self._calculate_damage(action2, agent2, agent1)
        
        # Apply damage
        agent1['health'] = max(0, agent1['health'] - damage2)
        agent2['health'] = max(0, agent2['health'] - damage1)
        
        # Update stamina
        agent1['stamina'] = max(0, agent1['stamina'] - self._get_stamina_cost(action1))
        agent2['stamina'] = max(0, agent2['stamina'] - self._get_stamina_cost(action2))
        
        return {
            'round': battle['round'] + 1,
            'agent1_action': action1,
            'agent2_action': action2,
            'agent1_damage': damage1,
            'agent2_damage': damage2,
            'agent1_health': agent1['health'],
            'agent2_health': agent2['health'],
            'timestamp': datetime.now().isoformat()
        }
    
    def _calculate_damage(self, action, attacker, defender):
        """Calculate damage for an action"""
        base_damage = {
            'attack': 15,
            'special': 25,
            'block': 0,
            'dodge': 0
        }
        
        # Apply personality modifiers
        personality = attacker['ai'].personality
        damage_multiplier = 1.0
        
        if action == 'attack':
            damage_multiplier *= (0.8 + personality['aggression'] * 0.4)
        elif action == 'special':
            damage_multiplier *= (1.2 + personality['aggression'] * 0.6)
        
        # Add randomness
        damage_multiplier *= random.uniform(0.8, 1.2)
        
        return int(base_damage[action] * damage_multiplier)
    
    def _get_stamina_cost(self, action):
        """Get stamina cost for an action"""
        costs = {
            'attack': 10,
            'special': 25,
            'block': 5,
            'dodge': 8
        }
        return costs.get(action, 10)

# Initialize battle engine
battle_engine = BattleEngine()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'OK',
        'message': 'Agent Arena AI Service - Underground Intelligence Active',
        'timestamp': datetime.now().isoformat(),
        'active_battles': len(battle_engine.active_battles)
    })

@app.route('/api/ai/create-battle', methods=['POST'])
def create_battle():
    """Create a new AI battle"""
    try:
        data = request.get_json()
        agent1 = data.get('agent1')
        agent2 = data.get('agent2')
        arena_id = data.get('arena_id', 'basement-1')
        
        if not agent1 or not agent2:
            return jsonify({'error': 'Both agents are required'}), 400
        
        battle = battle_engine.create_battle(agent1, agent2, arena_id)
        
        logger.info(f"🥊 New battle created: {battle['id']}")
        
        return jsonify({
            'message': 'Battle created in the underground!',
            'battle': battle
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating battle: {e}")
        return jsonify({'error': 'Something went wrong in the basement'}), 500

@app.route('/api/ai/battle/<battle_id>/round', methods=['POST'])
def execute_round(battle_id):
    """Execute a round of battle"""
    try:
        result = battle_engine.execute_round(battle_id)
        
        if not result:
            return jsonify({'error': 'Battle not found'}), 404
        
        # Emit real-time update
        socketio.emit('battle_update', {
            'battle_id': battle_id,
            'round_result': result
        })
        
        return jsonify({
            'message': 'Round executed in the underground!',
            'result': result
        })
        
    except Exception as e:
        logger.error(f"Error executing round: {e}")
        return jsonify({'error': 'Something went wrong in the basement'}), 500

@app.route('/api/ai/battle/<battle_id>', methods=['GET'])
def get_battle(battle_id):
    """Get battle status"""
    try:
        if battle_id not in battle_engine.active_battles:
            return jsonify({'error': 'Battle not found'}), 404
        
        battle = battle_engine.active_battles[battle_id]
        return jsonify({
            'message': 'Battle status from the underground',
            'battle': battle
        })
        
    except Exception as e:
        logger.error(f"Error getting battle: {e}")
        return jsonify({'error': 'Something went wrong in the basement'}), 500

@app.route('/api/ai/train-agent', methods=['POST'])
def train_agent():
    """Train an agent with AI"""
    try:
        data = request.get_json()
        agent_type = data.get('type')
        training_type = data.get('training_type', 'strength')
        duration = data.get('duration', 1)
        
        if not agent_type:
            return jsonify({'error': 'Agent type is required'}), 400
        
        # Simulate training process
        training_results = {
            'agent_type': agent_type,
            'training_type': training_type,
            'duration': duration,
            'improvements': {
                'attack': random.randint(1, 5) * duration,
                'defense': random.randint(1, 3) * duration,
                'speed': random.randint(1, 4) * duration,
                'health': random.randint(1, 2) * duration
            },
            'experience_gained': duration * 100,
            'training_complete': True
        }
        
        logger.info(f"🥊 Agent training completed: {agent_type} - {training_type}")
        
        return jsonify({
            'message': 'Agent training completed in the underground!',
            'results': training_results
        })
        
    except Exception as e:
        logger.error(f"Error training agent: {e}")
        return jsonify({'error': 'Something went wrong in the basement'}), 500

@app.route('/api/ai/market-analysis', methods=['GET'])
def market_analysis():
    """Get AI market analysis"""
    try:
        # Simulate market analysis
        analysis = {
            'sentiment': random.choice(['bullish', 'bearish', 'neutral']),
            'confidence': random.uniform(0.6, 0.95),
            'predictions': {
                'bitcoin': {
                    'trend': random.choice(['up', 'down', 'sideways']),
                    'confidence': random.uniform(0.5, 0.9),
                    'volatility': random.uniform(0.1, 0.8)
                },
                'ethereum': {
                    'trend': random.choice(['up', 'down', 'sideways']),
                    'confidence': random.uniform(0.5, 0.9),
                    'volatility': random.uniform(0.1, 0.8)
                }
            },
            'battle_effects': {
                'bitcoin_agents': {
                    'attack_bonus': random.randint(-5, 10),
                    'defense_bonus': random.randint(-3, 8),
                    'special_chance': random.uniform(0.1, 0.3)
                },
                'ethereum_agents': {
                    'attack_bonus': random.randint(-5, 10),
                    'defense_bonus': random.randint(-3, 8),
                    'special_chance': random.uniform(0.1, 0.3)
                }
            }
        }
        
        return jsonify({
            'message': 'Market analysis from the underground AI',
            'analysis': analysis
        })
        
    except Exception as e:
        logger.error(f"Error analyzing market: {e}")
        return jsonify({'error': 'Something went wrong in the basement'}), 500

# WebSocket events
@socketio.on('connect')
def handle_connect():
    logger.info('🥊 AI Service: New connection established')

@socketio.on('disconnect')
def handle_disconnect():
    logger.info('🥊 AI Service: Connection lost')

@socketio.on('join_battle')
def handle_join_battle(data):
    battle_id = data.get('battle_id')
    logger.info(f'🥊 AI Service: Client joined battle {battle_id}')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    logger.info(f"""
🥊 AGENT ARENA AI SERVICE 🥊
================================
🚀 AI Service starting on port {port}
🌍 Environment: {os.environ.get('FLASK_ENV', 'production')}
⏰ Started at: {datetime.now().isoformat()}
================================
    """)
    
    socketio.run(app, host='0.0.0.0', port=port, debug=debug) 