import { useAppStore } from './store/useStore';
import { Layout } from './components/layout/Layout';
import { PastSimulationScreen } from './features/past/PastSimulationScreen';
import { CurrentTradingScreen } from './features/current/CurrentTradingScreen';

function App() {
  const { mode } = useAppStore();

  return (
    <Layout>
      {mode === 'PAST' ? <PastSimulationScreen /> : <CurrentTradingScreen />}
    </Layout>
  );
}

export default App;
