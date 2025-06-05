
import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Trophy, Star, Users, Award } from 'lucide-react';
import type { Employee, LeaderboardEntry } from '../../server/src/schema';

// Spinner wheel component
function SpinnerWheel({ employees, onSpin, isSpinning }: {
  employees: Employee[];
  onSpin: (winner: Employee) => void;
  isSpinning: boolean;
}) {
  const [rotation, setRotation] = useState(0);

  const handleSpin = useCallback(() => {
    if (isSpinning || employees.length === 0) return;

    // Generate random rotation (multiple full spins + random position)
    const spins = 5 + Math.random() * 5; // 5-10 full rotations
    const finalRotation = rotation + (spins * 360);
    
    setRotation(finalRotation);

    // Simulate spinner physics with delay
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * employees.length);
      const winner = employees[randomIndex];
      onSpin(winner);
    }, 3000); // 3 second spin duration
  }, [employees, rotation, onSpin, isSpinning]);

  const segmentAngle = employees.length > 0 ? 360 / employees.length : 0;

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative">
        <div
          className={`w-80 h-80 rounded-full border-8 border-yellow-400 shadow-2xl relative overflow-hidden ${
            isSpinning ? 'animate-pulse' : ''
          }`}
          style={{
            background: `conic-gradient(${employees.map((_, index) => {
              const hue = (index * 360) / employees.length;
              return `hsl(${hue}, 70%, 60%) ${index * segmentAngle}deg ${(index + 1) * segmentAngle}deg`;
            }).join(', ')})`,
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
          }}
        >
          {employees.map((employee: Employee, index: number) => {
            const segmentRotation = index * segmentAngle + segmentAngle / 2;
            return (
              <div
                key={employee.id}
                className="absolute text-xs font-bold text-white text-center flex items-center justify-center"
                style={{
                  top: '50%',
                  left: '50%',
                  width: '140px',
                  height: '20px',
                  transformOrigin: '0 0',
                  transform: `rotate(${segmentRotation}deg) translate(60px, -10px) rotate(${-segmentRotation}deg)`,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                }}
              >
                {employee.name.length > 12 ? `${employee.name.slice(0, 12)}...` : employee.name}
              </div>
            );
          })}
        </div>
        
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-500"></div>
        </div>
      </div>

      <Button
        onClick={handleSpin}
        disabled={isSpinning || employees.length === 0}
        size="lg"
        className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-4 px-8 rounded-full text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
      >
        {isSpinning ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Spinning...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5" />
            <span>🎰 SPIN THE WHEEL! 🎰</span>
            <Star className="w-5 h-5" />
          </div>
        )}
      </Button>
    </div>
  );
}

// Leaderboard component
function Leaderboard({ leaderboard }: { leaderboard: LeaderboardEntry[] }) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
        <CardTitle className="flex items-center justify-center space-x-2">
          <Trophy className="w-6 h-6" />
          <span>🏆 LEADERBOARD 🏆</span>
          <Trophy className="w-6 h-6" />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {leaderboard.length === 0 ? (
          <p className="text-center text-gray-500">No wins recorded yet!</p>
        ) : (
          <div className="space-y-3">
            {leaderboard.slice(0, 10).map((entry: LeaderboardEntry, index: number) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  index === 0
                    ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400'
                    : index === 1
                    ? 'bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-400'
                    : index === 2
                    ? 'bg-gradient-to-r from-orange-100 to-orange-200 border-2 border-orange-400'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm">
                    {index === 0 && <span className="text-lg">🥇</span>}
                    {index === 1 && <span className="text-lg">🥈</span>}
                    {index === 2 && <span className="text-lg">🥉</span>}
                    {index > 2 && <span className="text-sm font-bold text-gray-600">#{index + 1}</span>}
                  </div>
                  <span className="font-medium text-gray-800">{entry.name}</span>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Award className="w-3 h-3 mr-1" />
                  {entry.wins}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Main App component
function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Employee | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [employeesData, leaderboardData] = await Promise.all([
        trpc.getEmployees.query(),
        trpc.getLeaderboard.query()
      ]);
      setEmployees(employeesData);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Daily data re-fetching with periodic interval
  useEffect(() => {
    // Set interval to 5 seconds for testing (would be 24 * 60 * 60 * 1000 for 24 hours in production)
    const interval = setInterval(() => {
      console.log('Refreshing data periodically...');
      loadData();
    }, 5000); // 5 seconds for testing

    // Cleanup interval on component unmount
    return () => {
      clearInterval(interval);
    };
  }, [loadData]);

  const handleSpin = useCallback(async (selectedEmployee: Employee) => {
    setIsSpinning(true);
    setWinner(selectedEmployee);
    
    try {
      // Increment wins for the selected employee
      await trpc.incrementEmployeeWins.mutate({ employeeId: selectedEmployee.id });
      
      // Refresh leaderboard
      const updatedLeaderboard = await trpc.getLeaderboard.query();
      setLeaderboard(updatedLeaderboard);
      
      // Show congratulations modal
      setShowCongrats(true);
    } catch (error) {
      console.error('Failed to update wins:', error);
    } finally {
      setIsSpinning(false);
    }
  }, []);

  const closeCongrats = useCallback(() => {
    setShowCongrats(false);
    setWinner(null);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl font-semibold">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
            🎪 THE PRICE IS RIGHT WHEEL 🎪
          </h1>
          <p className="text-xl text-white/90 flex items-center justify-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Spin to win! May the odds be in your favor!</span>
            <Users className="w-5 h-5" />
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-start justify-center gap-8">
          {/* Spinner Section */}
          <div className="flex-1 flex justify-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
              <SpinnerWheel 
                employees={employees} 
                onSpin={handleSpin} 
                isSpinning={isSpinning}
              />
              
              {employees.length === 0 && (
                <p className="text-center text-white mt-4">
                  No employees available. Please add some employees to the database.
                </p>
              )}
            </div>
          </div>

          {/* Leaderboard Section */}
          <div className="flex-shrink-0">
            <Leaderboard leaderboard={leaderboard} />
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center justify-center space-x-6 bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
            <div className="text-white">
              <span className="block text-2xl font-bold">{employees.length}</span>
              <span className="text-sm">Total Employees</span>
            </div>
            <div className="w-px h-8 bg-white/30"></div>
            <div className="text-white">
              <span className="block text-2xl font-bold">
                {leaderboard.reduce((sum: number, entry: LeaderboardEntry) => sum + entry.wins, 0)}
              </span>
              <span className="text-sm">Total Spins</span>
            </div>
          </div>
        </div>
      </div>

      {/* Congratulations Modal */}
      <AlertDialog open={showCongrats} onOpenChange={setShowCongrats}>
        <AlertDialogContent className="max-w-md mx-auto bg-gradient-to-br from-yellow-100 to-orange-100 border-4 border-yellow-400">
          <AlertDialogHeader className="text-center">
            <AlertDialogTitle className="text-3xl font-bold text-orange-800 flex items-center justify-center space-x-2">
              <span>🎉</span>
              <span>CONGRATULATIONS!</span>
              <span>🎉</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center space-y-4">
              <div className="text-6xl">🏆</div>
              <div className="text-xl font-bold text-orange-700">
                {winner?.name}
              </div>
              <div className="text-lg text-orange-600">
                You're our lucky winner! 🌟
              </div>
              <div className="text-sm text-orange-500">
                Your win has been recorded on the leaderboard!
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="justify-center">
            <Button 
              onClick={closeCongrats}
              className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold px-8 py-2"
            >
              🎊 Awesome! 🎊
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default App;
