/**
 * All About Olaf
 * Index view
 */

import React from 'react'
import {Navigator, BackAndroid} from 'react-native'

import AboutView from './views/about'
import CalendarView from './views/calendar'
import ContactsView from './views/contacts'
import DictionaryView from './views/dictionary/dictionary'
import DirectoryView from './views/directory'
import HomeView from './views/home'
import MapView from './views/map'
import StreamingView from './views/streaming'
import MenusView from './views/menus'
import NewsView from './views/news'
import SISView from './views/sis'
import BuildingHoursView from './views/building-hours'
import TransportationView from './views/transportation'
import OlevilleView from './views/oleville'
import SettingsView from './views/settings'
import CreditsView from './views/settings/credits'
import PrivacyView from './views/settings/privacy'
import LegalView from './views/settings/legal'

import NoRoute from './views/components/no-route'

// Render a given scene
function renderScene(route, navigator) {
  switch (route.id) {
    case 'HomeView':
      return <HomeView navigator={navigator} />
    case 'MenusView':
      return <MenusView navigator={navigator} />
    case 'DirectoryView':
      return <DirectoryView navigator={navigator} />
    case 'AboutView':
      return <AboutView navigator={navigator} />
    case 'CalendarView':
      return <CalendarView navigator={navigator} />
    case 'ContactsView':
      return <ContactsView navigator={navigator} />
    case 'DictionaryView':
      return <DictionaryView navigator={navigator} />
    case 'MapView':
      return <MapView navigator={navigator} />
    case 'StreamingView':
      return <StreamingView navigator={navigator} />
    case 'NewsView':
      return <NewsView navigator={navigator} />
    case 'NewsItemView':
      return route.component
    case 'BuildingHoursView':
      return <BuildingHoursView navigator={navigator} />
    case 'SISView':
      return <SISView navigator={navigator} />
    case 'TransportationView':
      return <TransportationView navigator={navigator} />
    case 'OlevilleView':
      return <OlevilleView navigator={navigator} />
    case 'LatestView':
      return route.component
    case 'SettingsView':
      return <SettingsView navigator={navigator} />
    case 'CreditsView':
      return <CreditsView navigator={navigator} />
    case 'PrivacyView':
      return <PrivacyView navigator={navigator} />
    case 'LegalView':
      return <LegalView navigator={navigator} />
    default:
      return <NoRoute navigator={navigator} />
  }
}

export default class App extends React.Component {
  componentDidMount() {
    BackAndroid.addEventListener('hardwareBackPress', () => {
      if (this._navigator && this._navigator.getCurrentRoutes().length > 1) {
        this._navigator.pop()
        return true
      }
      return false
    })
  }

  render() {
    return (
      <Navigator
        ref={nav => this._navigator = nav}
        initialRoute={{
          id: 'HomeView',
          name: 'Home',
        }}
        renderScene={renderScene}
        configureScene={route => {
          if (route.sceneConfig) {
            return route.sceneConfig
          }
          return Navigator.SceneConfigs.PushFromRight
        }}
      />
    )
  }
}
