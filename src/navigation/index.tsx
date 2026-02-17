import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from '@react-navigation/elements';
import {
  createStaticNavigation,
  StaticParamList,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { FinanceScreen } from '../screens/FinanceScreen';
import { CrisisScreen } from '../screens/CrisisScreen';
import { AchievementsScreen } from '../screens/AchievementsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const HomeTabs = createBottomTabNavigator({
  screenOptions: {
    headerShown: false,
    tabBarStyle: {
      backgroundColor: '#1A1A2E',
      borderTopColor: '#2E2E48',
      borderTopWidth: 1,
      height: 65,
      paddingBottom: 8,
      paddingTop: 6,
    },
    tabBarActiveTintColor: '#00D9A6',
    tabBarInactiveTintColor: '#6B6B80',
    tabBarLabelStyle: {
      fontSize: 11,
      fontWeight: '600',
    },
  },
  screens: {
    Home: {
      screen: HomeScreen,
      options: {
        title: 'Ana Sayfa',
        tabBarIcon: ({ color }) => (
          <Text style={{ fontSize: 22, color }}>🏠</Text>
        ),
      },
    },
    Finance: {
      screen: FinanceScreen,
      options: {
        title: 'Finans',
        tabBarIcon: ({ color }) => (
          <Text style={{ fontSize: 22, color }}>💰</Text>
        ),
      },
    },
    Crisis: {
      screen: CrisisScreen,
      options: {
        title: 'Kriz',
        tabBarIcon: ({ color }) => (
          <Text style={{ fontSize: 26, color }}>🔥</Text>
        ),
      },
    },
    Achievements: {
      screen: AchievementsScreen,
      options: {
        title: 'Başarılar',
        tabBarIcon: ({ color }) => (
          <Text style={{ fontSize: 22, color }}>🏆</Text>
        ),
      },
    },
    Settings: {
      screen: SettingsScreen,
      options: {
        title: 'Ayarlar',
        tabBarIcon: ({ color }) => (
          <Text style={{ fontSize: 22, color }}>⚙️</Text>
        ),
      },
    },
  },
});

const RootStack = createNativeStackNavigator({
  screens: {
    HomeTabs: {
      screen: HomeTabs,
      options: {
        headerShown: false,
      },
    },
  },
});

export const Navigation = createStaticNavigation(RootStack);

type RootStackParamList = StaticParamList<typeof RootStack>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}
