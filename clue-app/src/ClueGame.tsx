import React, { useState, useEffect, useRef } from 'react';
import { Camera, Check, X, AlertCircle, Home, QrCode, Settings, TrendingUp, Plus, Trash2, Edit2, Printer, Download } from 'lucide-react';

// Import QR code libraries
const loadExternalScripts = () => {
  return new Promise((resolve) => {
    // Check if scripts already loaded
    if (window.jsQR && window.QRCode) {
      resolve();
      return;
    }
    
    const scripts = [
      'https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.min.js',
      'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js'
    ];
    
    let loaded = 0;
    scripts.forEach(src => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        loaded++;
        if (loaded === scripts.length) {
          setTimeout(() => resolve(), 100);
        }
      };
      script.onerror = () => {
        console.error('Failed to load script:', src);
        loaded++;
        if (loaded === scripts.length) resolve();
      };
      document.head.appendChild(script);
    });
  });
};

// Default game pieces
const DEFAULT_GAME_PIECES = {
  suspects: [
    { id: 'col_deep_willow', name: 'Colonel Deep Willow', emoji: '👨‍✈️', active: true },
    { id: 'prof_fairweather', name: 'Professor Fairweather', emoji: '👨‍🏫', active: true },
    { id: 'baron_candalwood', name: 'Baron Candalwood', emoji: '👨‍💼', active: true },
    { id: 'miss_misty_autumn', name: 'Miss Misty Autumn', emoji: '👩‍🦳', active: true },
    { id: 'charles_h_martin', name: 'Charles H. Martin', emoji: '👨‍🎨', active: true },
    { id: 'lady_lynwood', name: 'Lady Lynwood', emoji: '👵', active: true }
  ],
  weapons: [
    { id: 'field_hockey_stick', name: 'Field Hockey Stick', emoji: '🏑', active: true },
    { id: 'garden_shears', name: 'Garden Shears', emoji: '✂️', active: true },
    { id: 'stroller', name: 'Stroller', emoji: '🚼', active: true },
    { id: 'bird_bath', name: 'Bird Bath', emoji: '🛁', active: true },
    { id: 'mailbox_post', name: 'Mailbox Post', emoji: '📮', active: true },
    { id: 'hedge_trimmer', name: 'Hedge Trimmer', emoji: '✂️', active: true }
  ],
  locations: [
    { id: 'laurel_moors_loop', name: 'Laurel Moors Loop', emoji: '🛣️', active: true },
    { id: 'playground', name: 'Playground', emoji: '🛝', active: true },
    { id: 'the_bridge', name: 'The Bridge', emoji: '🌉', active: true },
    { id: 'the_library', name: 'The Library', emoji: '📚', active: true },
    { id: 'the_winter_winds', name: 'The Winter Winds', emoji: '🌬️', active: true },
    { id: 'fairweather_median', name: 'Fairweather Median', emoji: '🌳', active: true },
    { id: 'turtle_pond', name: 'Turtle Pond', emoji: '🐢', active: true },
    { id: 'the_northern_wood', name: 'The Northern Wood', emoji: '🌲', active: true },
    { id: 'shallows_at_dawn', name: 'The Shallows at Dawn', emoji: '🌅', active: true }
  ]
};

const ClueGame = () => {
  const [screen, setScreen] = useState('welcome');
  const [currentGame, setCurrentGame] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [playerFindings, setPlayerFindings] = useState({});
  const [activeTab, setActiveTab] = useState('suspects');
  const [showAccusation, setShowAccusation] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [message, setMessage] = useState(null);
  const [gamePieces, setGamePieces] = useState(DEFAULT_GAME_PIECES);
  const [playerStats, setPlayerStats] = useState(null);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  useEffect(() => {
    loadExternalScripts().then(() => setScriptsLoaded(true));
    loadGameState();
    loadGamePieces();
    loadPlayerStats();
  }, []);

  const loadGameState = async () => {
    try {
      const playerResult = await window.storage.get('current_player');
      if (playerResult) {
        const player = JSON.parse(playerResult.value);
        setCurrentPlayer(player);
        
        const gameResult = await window.storage.get(`game:${player.gameId}`, true);
        if (gameResult) {
          setCurrentGame(JSON.parse(gameResult.value));
        }
        
        const findingsResult = await window.storage.get(`findings:${player.playerId}`);
        if (findingsResult) {
          setPlayerFindings(JSON.parse(findingsResult.value));
        }
      }
    } catch (error) {
      console.log('No existing game state');
    }
  };

  const loadGamePieces = async () => {
    try {
      const piecesResult = await window.storage.get('custom_game_pieces');
      if (piecesResult) {
        setGamePieces(JSON.parse(piecesResult.value));
      }
    } catch (error) {
      console.log('Using default game pieces');
    }
  };

  const saveGamePieces = async (pieces) => {
    try {
      await window.storage.set('custom_game_pieces', JSON.stringify(pieces));
      setGamePieces(pieces);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save game pieces' });
    }
  };

  const loadPlayerStats = async () => {
    if (currentPlayer) {
      try {
        const statsResult = await window.storage.get(`stats:${currentPlayer.playerName.toLowerCase()}`);
        if (statsResult) {
          setPlayerStats(JSON.parse(statsResult.value));
        } else {
          setPlayerStats({ wins: 0, losses: 0, gamesPlayed: 0 });
        }
      } catch (error) {
        setPlayerStats({ wins: 0, losses: 0, gamesPlayed: 0 });
      }
    }
  };

  const updatePlayerStats = async (won) => {
    if (!currentPlayer) return;
    
    try {
      let stats = playerStats || { wins: 0, losses: 0, gamesPlayed: 0 };
      stats.gamesPlayed++;
      if (won) {
        stats.wins++;
      } else {
        stats.losses++;
      }
      
      await window.storage.set(`stats:${currentPlayer.playerName.toLowerCase()}`, JSON.stringify(stats));
      setPlayerStats(stats);
    } catch (error) {
      console.error('Failed to update stats');
    }
  };

  const generateId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const getRandomItem = (array) => {
    const activeItems = array.filter(item => item.active);
    return activeItems[Math.floor(Math.random() * activeItems.length)];
  };

  const createNewGame = async () => {
    if (!playerName.trim()) {
      setMessage({ type: 'error', text: 'Please enter your name' });
      return;
    }

    const gameId = generateId();
    const playerId = generateId();
    
    const game = {
      gameId,
      winningSuspect: getRandomItem(gamePieces.suspects).id,
      winningWeapon: getRandomItem(gamePieces.weapons).id,
      winningLocation: getRandomItem(gamePieces.locations).id,
      accusationsRemaining: 2,
      active: true,
      createdAt: new Date().toISOString()
    };

    const player = {
      playerId,
      playerName: playerName.trim(),
      gameId
    };

    try {
      await window.storage.set(`game:${gameId}`, JSON.stringify(game), true);
      await window.storage.set('current_player', JSON.stringify(player));
      await window.storage.set(`findings:${playerId}`, JSON.stringify({}));
      
      setCurrentGame(game);
      setCurrentPlayer(player);
      setPlayerFindings({});
      await loadPlayerStats();
      setScreen('game');
      setMessage({ type: 'success', text: 'Game created successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create game' });
    }
  };

  const resumeGame = () => {
    if (currentGame && currentPlayer) {
      setScreen('game');
    }
  };

  const abandonGame = async () => {
    if (window.confirm('Are you sure you want to abandon this game?')) {
      try {
        await updatePlayerStats(false);
        await window.storage.delete('current_player');
        if (currentPlayer) {
          await window.storage.delete(`findings:${currentPlayer.playerId}`);
        }
        setCurrentGame(null);
        setCurrentPlayer(null);
        setPlayerFindings({});
        setScreen('welcome');
        setMessage({ type: 'success', text: 'Game abandoned' });
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to abandon game' });
      }
    }
  };

  const scanQRCode = (qrData) => {
    const parts = qrData.toUpperCase().split(':');
    if (parts.length !== 3 || parts[0] !== 'CLUE') {
      setMessage({ type: 'error', text: 'Invalid QR code' });
      return;
    }

    const [, type, id] = parts;
    const pieceKey = `${type.toLowerCase()}:${id.toLowerCase()}`;
    
    if (playerFindings[pieceKey]) {
      setMessage({ type: 'info', text: 'You already found this piece!' });
      return;
    }

    const newFindings = { ...playerFindings, [pieceKey]: true };
    setPlayerFindings(newFindings);
    
    try {
      window.storage.set(`findings:${currentPlayer.playerId}`, JSON.stringify(newFindings));
      setMessage({ type: 'success', text: 'Piece found!' });
      setShowScanner(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save finding' });
    }
  };

  const makeAccusation = async (suspect, weapon, location) => {
    if (!suspect || !weapon || !location) {
      setMessage({ type: 'error', text: 'Please select all three items' });
      return;
    }

    const isCorrect = 
      suspect === currentGame.winningSuspect &&
      weapon === currentGame.winningWeapon &&
      location === currentGame.winningLocation;

    if (isCorrect) {
      const updatedGame = { ...currentGame, active: false };
      await window.storage.set(`game:${currentGame.gameId}`, JSON.stringify(updatedGame), true);
      await updatePlayerStats(true);
      await window.storage.delete('current_player');
      await window.storage.delete(`findings:${currentPlayer.playerId}`);
      
      alert(`🎉 Congratulations ${currentPlayer.playerName}! You solved the mystery!\n\nIt was ${gamePieces.suspects.find(s => s.id === suspect)?.name} with the ${gamePieces.weapons.find(w => w.id === weapon)?.name} in the ${gamePieces.locations.find(l => l.id === location)?.name}!`);
      
      setCurrentGame(null);
      setCurrentPlayer(null);
      setPlayerFindings({});
      setScreen('welcome');
    } else {
      const updatedGame = { 
        ...currentGame, 
        accusationsRemaining: currentGame.accusationsRemaining - 1 
      };
      
      if (updatedGame.accusationsRemaining <= 0) {
        updatedGame.active = false;
        await window.storage.set(`game:${currentGame.gameId}`, JSON.stringify(updatedGame), true);
        await updatePlayerStats(false);
        await window.storage.delete('current_player');
        await window.storage.delete(`findings:${currentPlayer.playerId}`);
        
        alert('Game Over! No accusations remaining. The mystery remains unsolved.');
        
        setCurrentGame(null);
        setCurrentPlayer(null);
        setPlayerFindings({});
        setScreen('welcome');
      } else {
        await window.storage.set(`game:${currentGame.gameId}`, JSON.stringify(updatedGame), true);
        setCurrentGame(updatedGame);
        setMessage({ type: 'error', text: `Wrong! ${updatedGame.accusationsRemaining} accusations remaining` });
        setShowAccusation(false);
      }
    }
  };

  const getPieceStatus = (type, pieceId) => {
    const pieceKey = `${type}:${pieceId}`;
    const isFound = playerFindings[pieceKey];
    
    if (!isFound) return null;
    
    const winningId = type === 'suspects' ? currentGame.winningSuspect :
                     type === 'weapons' ? currentGame.winningWeapon :
                     currentGame.winningLocation;
    
    return pieceId === winningId ? 'correct' : 'incorrect';
  };

  // Welcome Screen
  if (screen === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white p-6">
        <div className="max-w-md mx-auto pt-12">
          <h1 className="text-5xl font-bold text-center mb-2">🔍 CLUE</h1>
          <p className="text-center text-purple-200 mb-12">Neighborhood Mystery Game</p>
          
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${message.type === 'error' ? 'bg-red-500' : message.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}>
              {message.text}
            </div>
          )}

          {currentGame && currentPlayer && (
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-6">
              <div className="text-sm text-purple-200 mb-1">Active Game</div>
              <div className="font-bold text-xl">{currentPlayer.playerName}</div>
              <div className="text-purple-200">{currentGame.accusationsRemaining} accusations remaining</div>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => setScreen('newGame')}
              className="w-full bg-white text-purple-900 py-4 rounded-lg font-bold text-lg hover:bg-purple-100 transition"
            >
              🎮 New Game
            </button>
            
            {currentGame && currentPlayer && (
              <button
                onClick={resumeGame}
                className="w-full bg-green-600 py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition"
              >
                ▶️ Resume Game
              </button>
            )}
            
            {currentGame && currentPlayer && (
              <button
                onClick={abandonGame}
                className="w-full bg-red-600 py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition"
              >
                ❌ Abandon Game
              </button>
            )}

            <div className="grid grid-cols-3 gap-3 pt-4">
              <button
                onClick={() => setScreen('admin')}
                className="bg-purple-600 py-3 rounded-lg hover:bg-purple-700 transition flex flex-col items-center"
              >
                <Settings size={24} />
                <span className="text-xs mt-1">Admin</span>
              </button>
              <button
                onClick={() => setScreen('qrGenerator')}
                className="bg-purple-600 py-3 rounded-lg hover:bg-purple-700 transition flex flex-col items-center"
              >
                <Printer size={24} />
                <span className="text-xs mt-1">Print QR</span>
              </button>
              <button
                onClick={() => setScreen('stats')}
                className="bg-purple-600 py-3 rounded-lg hover:bg-purple-700 transition flex flex-col items-center"
              >
                <TrendingUp size={24} />
                <span className="text-xs mt-1">Stats</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // New Game Screen
  if (screen === 'newGame') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white p-6">
        <div className="max-w-md mx-auto pt-12">
          <button onClick={() => setScreen('welcome')} className="mb-6 flex items-center text-purple-200 hover:text-white">
            <Home size={20} className="mr-2" /> Back
          </button>
          
          <h1 className="text-4xl font-bold mb-8">Create New Game</h1>
          
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${message.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
              {message.text}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-medium">Your Name</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-purple-300"
                placeholder="Enter your name"
              />
            </div>

            <button
              onClick={createNewGame}
              className="w-full bg-green-600 py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition"
            >
              Create Game
            </button>
          </div>

          <div className="mt-8 p-4 bg-white/10 rounded-lg text-sm">
            <p className="mb-2">ℹ️ A new game will be created with:</p>
            <ul className="list-disc list-inside space-y-1 text-purple-200">
              <li>Random winning combination</li>
              <li>2 accusations allowed</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Admin Screen
  if (screen === 'admin') {
    return (
      <AdminScreen
        gamePieces={gamePieces}
        onSave={saveGamePieces}
        onBack={() => setScreen('welcome')}
      />
    );
  }

  // QR Generator Screen
  if (screen === 'qrGenerator') {
    return (
      <QRGeneratorScreen
        gamePieces={gamePieces}
        onBack={() => setScreen('welcome')}
        scriptsLoaded={scriptsLoaded}
      />
    );
  }

  // Stats Screen
  if (screen === 'stats') {
    return (
      <StatsScreen
        onBack={() => setScreen('welcome')}
      />
    );
  }

  // Game Screen
  if (screen === 'game') {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-purple-900 text-white p-4 sticky top-0 z-10 shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <div>
              <div className="font-bold text-xl">{currentPlayer.playerName}</div>
            </div>
            <button
              onClick={() => setScreen('welcome')}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
            >
              <Home size={20} />
            </button>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowScanner(true)}
              className="flex-1 bg-green-600 py-3 rounded-lg font-bold hover:bg-green-700 transition flex items-center justify-center"
            >
              <QrCode size={20} className="mr-2" /> Scan Piece
            </button>
            <button
              onClick={() => setShowAccusation(true)}
              className="flex-1 bg-red-600 py-3 rounded-lg font-bold hover:bg-red-700 transition"
            >
              🎯 Accuse ({currentGame.accusationsRemaining})
            </button>
          </div>
        </div>

        {message && (
          <div className={`mx-4 mt-4 p-3 rounded-lg ${message.type === 'error' ? 'bg-red-500 text-white' : message.type === 'success' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}>
            {message.text}
          </div>
        )}

        <div className="bg-white border-b sticky top-[120px] z-10">
          <div className="flex">
            {['suspects', 'weapons', 'locations'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 font-medium capitalize ${activeTab === tab ? 'bg-purple-100 text-purple-900 border-b-2 border-purple-900' : 'text-gray-600'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          {activeTab === 'suspects' && (
            <div className="space-y-3">
              {gamePieces.suspects.filter(s => s.active).map(suspect => {
                const status = getPieceStatus('suspects', suspect.id);
                return (
                  <div key={suspect.id} className="bg-white rounded-lg p-4 shadow flex items-center">
                    <div className="text-4xl mr-4">{suspect.emoji}</div>
                    <div className="flex-1">
                      <div className="font-bold">{suspect.name}</div>
                    </div>
                    {status === 'correct' && <Check className="text-green-600" size={24} />}
                    {status === 'incorrect' && <X className="text-red-600" size={24} />}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'weapons' && (
            <div className="space-y-3">
              {gamePieces.weapons.filter(w => w.active).map(weapon => {
                const status = getPieceStatus('weapons', weapon.id);
                return (
                  <div key={weapon.id} className="bg-white rounded-lg p-4 shadow flex items-center">
                    <div className="text-4xl mr-4">{weapon.emoji}</div>
                    <div className="flex-1">
                      <div className="font-bold">{weapon.name}</div>
                    </div>
                    {status === 'correct' && <Check className="text-green-600" size={24} />}
                    {status === 'incorrect' && <X className="text-red-600" size={24} />}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'locations' && (
            <div className="space-y-3">
              {gamePieces.locations.filter(l => l.active).map(location => {
                const status = getPieceStatus('locations', location.id);
                return (
                  <div key={location.id} className="bg-white rounded-lg p-4 shadow flex items-center">
                    <div className="text-4xl mr-4">{location.emoji}</div>
                    <div className="flex-1">
                      <div className="font-bold">{location.name}</div>
                    </div>
                    {status === 'correct' && <Check className="text-green-600" size={24} />}
                    {status === 'incorrect' && <X className="text-red-600" size={24} />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {showScanner && (
          <QRScanner 
            onScan={scanQRCode}
            onClose={() => setShowScanner(false)}
            scriptsLoaded={scriptsLoaded}
          />
        )}

        {showAccusation && (
          <AccusationModal
            gameState={currentGame}
            playerFindings={playerFindings}
            gamePieces={gamePieces}
            onSubmit={makeAccusation}
            onClose={() => setShowAccusation(false)}
          />
        )}
      </div>
    );
  }

  return null;
};

const QRScanner = ({ onScan, onClose, scriptsLoaded }) => {
  const [manualInput, setManualInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    if (!scriptsLoaded || !window.jsQR) {
      alert('QR scanning library not loaded yet. Please use manual input.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);
        requestAnimationFrame(scanFrame);
      }
    } catch (error) {
      alert('Camera access denied. Please use manual input or enable camera permissions.');
    }
  };

  const stopScanning = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setScanning(false);
  };

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = window.jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code) {
        stopScanning();
        onScan(code.data);
        return;
      }
    }
    
    animationRef.current = requestAnimationFrame(scanFrame);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Scan QR Code</h2>
        
        {!scanning ? (
          <>
            <div className="mb-6 p-8 bg-gray-100 rounded-lg text-center">
              <Camera size={48} className="mx-auto mb-4 text-gray-400" />
              <button
                onClick={startScanning}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700"
              >
                Start Camera
              </button>
            </div>
          </>
        ) : (
          <div className="mb-4 relative">
            <video
              ref={videoRef}
              className="w-full rounded-lg"
              playsInline
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 border-4 border-green-500 rounded-lg pointer-events-none" />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Or enter manually:</label>
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value.toUpperCase())}
            placeholder="CLUE:SUSPECTS:COL_MUSTARD"
            className="w-full p-3 border border-gray-300 rounded-lg uppercase"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              if (manualInput) {
                stopScanning();
                onScan(manualInput);
                setManualInput('');
              }
            }}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700"
          >
            Submit
          </button>
          <button
            onClick={() => {
              stopScanning();
              onClose();
            }}
            className="flex-1 bg-gray-300 py-3 rounded-lg font-bold hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const AccusationModal = ({ gameState, playerFindings, gamePieces, onSubmit, onClose }) => {
  const [suspect, setSuspect] = useState('');
  const [weapon, setWeapon] = useState('');
  const [location, setLocation] = useState('');

  const getAvailableOptions = (type, pieces) => {
    return pieces.filter(piece => {
      if (!piece.active) return false;
      
      const pieceKey = `${type}:${piece.id}`;
      const status = playerFindings[pieceKey];
      
      if (!status) return true;
      
      const winningId = type === 'suspects' ? gameState.winningSuspect :
                       type === 'weapons' ? gameState.winningWeapon :
                       gameState.winningLocation;
      
      return piece.id === winningId;
    });
  };

  const availableSuspects = getAvailableOptions('suspects', gamePieces.suspects);
  const availableWeapons = getAvailableOptions('weapons', gamePieces.weapons);
  const availableLocations = getAvailableOptions('locations', gamePieces.locations);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Make Your Accusation</h2>
        
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
          <AlertCircle className="text-yellow-600 mr-2 flex-shrink-0 mt-1" size={20} />
          <div className="text-sm">
            <strong>Warning:</strong> You have {gameState.accusationsRemaining} accusation(s) remaining. 
            Choose carefully!
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Suspect</label>
            <select
              value={suspect}
              onChange={(e) => setSuspect(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="">Select suspect...</option>
              {availableSuspects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.emoji} {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Weapon</label>
            <select
              value={weapon}
              onChange={(e) => setWeapon(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="">Select weapon...</option>
              {availableWeapons.map(w => (
                <option key={w.id} value={w.id}>
                  {w.emoji} {w.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="">Select location...</option>
              {availableLocations.map(l => (
                <option key={l.id} value={l.id}>
                  {l.emoji} {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {suspect && weapon && location && (
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="font-medium mb-2">Your accusation:</div>
            <div className="text-sm">
              {gamePieces.suspects.find(s => s.id === suspect)?.name} with the{' '}
              {gamePieces.weapons.find(w => w.id === weapon)?.name} in the{' '}
              {gamePieces.locations.find(l => l.id === location)?.name}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => onSubmit(suspect, weapon, location)}
            disabled={!suspect || !weapon || !location}
            className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Submit Accusation
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 py-3 rounded-lg font-bold hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminScreen = ({ gamePieces, onSave, onBack }) => {
  const [editedPieces, setEditedPieces] = useState(gamePieces);
  const [activeCategory, setActiveCategory] = useState('suspects');
  const [editingPiece, setEditingPiece] = useState(null);

  const addPiece = () => {
    const newPiece = {
      id: `custom_${Date.now()}`,
      name: 'New Item',
      emoji: '❓',
      active: true
    };
    
    setEditedPieces({
      ...editedPieces,
      [activeCategory]: [...editedPieces[activeCategory], newPiece]
    });
    setEditingPiece(newPiece);
  };

  const updatePiece = (id, updates) => {
    setEditedPieces({
      ...editedPieces,
      [activeCategory]: editedPieces[activeCategory].map(p => 
        p.id === id ? { ...p, ...updates } : p
      )
    });
  };

  const deletePiece = (id) => {
    if (window.confirm('Are you sure you want to delete this piece?')) {
      setEditedPieces({
        ...editedPieces,
        [activeCategory]: editedPieces[activeCategory].filter(p => p.id !== id)
      });
    }
  };

  const resetToDefaults = () => {
    if (window.confirm('Reset all pieces to defaults? This cannot be undone.')) {
      setEditedPieces(DEFAULT_GAME_PIECES);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-purple-900 text-white p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="flex items-center">
            <Home size={20} className="mr-2" /> Back
          </button>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <div className="w-20" />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onSave(editedPieces)}
            className="flex-1 bg-green-600 py-2 rounded-lg font-bold hover:bg-green-700"
          >
            Save Changes
          </button>
          <button
            onClick={resetToDefaults}
            className="bg-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-700"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="bg-white border-b sticky top-[104px] z-10">
        <div className="flex">
          {['suspects', 'weapons', 'locations'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-1 py-3 font-medium capitalize ${activeCategory === cat ? 'bg-purple-100 text-purple-900 border-b-2 border-purple-900' : 'text-gray-600'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        <button
          onClick={addPiece}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold mb-4 hover:bg-blue-700 flex items-center justify-center"
        >
          <Plus size={20} className="mr-2" /> Add New {activeCategory.slice(0, -1)}
        </button>

        <div className="space-y-3">
          {editedPieces[activeCategory].map(piece => (
            <div key={piece.id} className="bg-white rounded-lg p-4 shadow">
              {editingPiece?.id === piece.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={piece.name}
                    onChange={(e) => updatePiece(piece.id, { name: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="Name"
                  />
                  <input
                    type="text"
                    value={piece.emoji}
                    onChange={(e) => updatePiece(piece.id, { emoji: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="Emoji"
                    maxLength={2}
                  />
                  <button
                    onClick={() => setEditingPiece(null)}
                    className="w-full bg-green-600 text-white py-2 rounded font-bold"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="text-3xl mr-3">{piece.emoji}</div>
                  <div className="flex-1">
                    <div className="font-bold">{piece.name}</div>
                    <div className="text-sm text-gray-500">{piece.id}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={piece.active}
                        onChange={(e) => updatePiece(piece.id, { active: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm">Active</span>
                    </label>
                    <button
                      onClick={() => setEditingPiece(piece)}
                      className="p-2 bg-blue-100 rounded hover:bg-blue-200"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deletePiece(piece.id)}
                      className="p-2 bg-red-100 rounded hover:bg-red-200"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const QRGeneratorScreen = ({ gamePieces, onBack, scriptsLoaded }) => {
  const [selectedType, setSelectedType] = useState('suspects');
  const [qrGenerated, setQrGenerated] = useState(false);
  const qrRefs = useRef({});

  useEffect(() => {
    if (scriptsLoaded && window.QRCode) {
      // Small delay to ensure DOM is ready
      setQrGenerated(false);
      setTimeout(() => {
        generateQRCodes();
        setQrGenerated(true);
      }, 100);
    }
  }, [selectedType, scriptsLoaded]);

  const generateQRCodes = () => {
    const pieces = gamePieces[selectedType].filter(p => p.active);
    
    pieces.forEach(piece => {
      const elementId = `qr-${piece.id}`;
      const element = document.getElementById(elementId);
      
      if (element && window.QRCode) {
        element.innerHTML = '';
        try {
          new window.QRCode(element, {
            text: `CLUE:${selectedType.toUpperCase()}:${piece.id.toUpperCase()}`,
            width: 200,
            height: 200
          });
        } catch (error) {
          console.error('QR generation error:', error);
          element.innerHTML = '<div class="text-red-500 text-sm">Error generating QR</div>';
        }
      }
    });
  };

  const downloadAllQRCodes = async () => {
    const pieces = gamePieces[selectedType].filter(p => p.active);
    
    for (let i = 0; i < pieces.length; i++) {
      const piece = pieces[i];
      const elementId = `qr-${piece.id}`;
      const element = document.getElementById(elementId);
      const canvas = element.querySelector('canvas');
      
      if (canvas) {
        const link = document.createElement('a');
        link.download = `${piece.name.replace(/\s+/g, '_')}_QR.png`;
        link.href = canvas.toDataURL();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Wait 500ms between downloads to avoid browser blocking
        if (i < pieces.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
    
    alert(`Downloaded ${pieces.length} QR codes!`);
  };

  if (!scriptsLoaded || !window.QRCode) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-2xl font-bold mb-2">Loading QR Generator...</div>
          <div className="text-gray-600 mb-4">Please wait a moment</div>
          {!window.QRCode && scriptsLoaded && (
            <button
              onClick={() => window.location.reload()}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
            >
              Reload Page
            </button>
          )}
        </div>
      </div>
    );
  }

  const activePieces = gamePieces[selectedType].filter(p => p.active);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-purple-900 text-white p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="flex items-center">
            <Home size={20} className="mr-2" /> Back
          </button>
          <h1 className="text-2xl font-bold">QR Code Generator</h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="bg-white border-b sticky top-[72px] z-10">
        <div className="flex">
          {['suspects', 'weapons', 'locations'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedType(cat)}
              className={`flex-1 py-3 font-medium capitalize ${selectedType === cat ? 'bg-purple-100 text-purple-900 border-b-2 border-purple-900' : 'text-gray-600'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 flex items-center justify-center"
          >
            <Printer size={20} className="mr-2" /> Print Page
          </button>
          <button
            onClick={downloadAllQRCodes}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 flex items-center justify-center"
          >
            <Download size={20} className="mr-2" /> Download All
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {activePieces.map(piece => (
            <div key={piece.id} className="bg-white rounded-lg p-4 shadow text-center">
              <div className="text-3xl mb-2">{piece.emoji}</div>
              <div className="font-bold mb-3">{piece.name}</div>
              <div id={`qr-${piece.id}`} className="flex justify-center mb-2"></div>
              <div className="text-xs text-gray-500 break-all">
                CLUE:{selectedType.toUpperCase()}:{piece.id.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatsScreen = ({ onBack }) => {
  const [allStats, setAllStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllStats();
  }, []);

  const loadAllStats = async () => {
    try {
      const result = await window.storage.list('stats:');
      if (result && result.keys) {
        const statsPromises = result.keys.map(async (key) => {
          const data = await window.storage.get(key);
          if (data) {
            const stats = JSON.parse(data.value);
            const playerName = key.replace('stats:', '');
            return { playerName, ...stats };
          }
          return null;
        });
        
        const stats = await Promise.all(statsPromises);
        const validStats = stats.filter(s => s !== null);
        validStats.sort((a, b) => b.wins - a.wins);
        setAllStats(validStats);
      }
    } catch (error) {
      console.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-purple-900 text-white p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center">
            <Home size={20} className="mr-2" /> Back
          </button>
          <h1 className="text-2xl font-bold">Player Statistics</h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl font-bold">Loading stats...</div>
          </div>
        ) : allStats.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <TrendingUp size={48} className="mx-auto mb-4 text-gray-400" />
            <div className="text-xl font-bold mb-2">No Stats Yet</div>
            <div className="text-gray-600">Play some games to see your statistics!</div>
          </div>
        ) : (
          <div className="space-y-3">
            {allStats.map((stats, index) => (
              <div key={stats.playerName} className="bg-white rounded-lg p-4 shadow">
                <div className="flex items-center mb-3">
                  <div className="text-2xl font-bold mr-3 text-purple-900">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-lg capitalize">{stats.playerName}</div>
                    <div className="text-sm text-gray-600">
                      {stats.gamesPlayed} game{stats.gamesPlayed !== 1 ? 's' : ''} played
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{stats.wins}</div>
                    <div className="text-xs text-gray-600">Wins</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-center text-sm">
                  <div className="bg-green-50 rounded p-2">
                    <div className="font-bold text-green-700">{stats.wins}</div>
                    <div className="text-gray-600">Wins</div>
                  </div>
                  <div className="bg-red-50 rounded p-2">
                    <div className="font-bold text-red-700">{stats.losses}</div>
                    <div className="text-gray-600">Losses</div>
                  </div>
                  <div className="bg-blue-50 rounded p-2">
                    <div className="font-bold text-blue-700">
                      {stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0}%
                    </div>
                    <div className="text-gray-600">Win Rate</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClueGame;